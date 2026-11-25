import crypto from 'node:crypto';
import mongoose from 'mongoose';
import {
  getRazorpayClient,
  verifyRazorpayPaymentSignature,
} from '../config/razorpay.js';
import { emitOrderLifecycleEvent } from '../config/socket.js';
import { Address } from '../models/Address.js';
import { AnalyticsEvent } from '../models/AnalyticsEvent.js';
import { Coupon } from '../models/Coupon.js';
import { Inventory } from '../models/Inventory.js';
import { Notification } from '../models/Notification.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { buildCheckoutQuote } from './checkoutPricingService.js';

export function generateOrderNumber() {
  const now = new Date();
  const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}${String(now.getDate()).padStart(2, '0')}`;
  const randomHex = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `GG-${datePart}-${randomHex}`;
}

export function buildOrderLookupQuery(idOrNumber, userId = null) {
  const query = mongoose.isValidObjectId(idOrNumber)
    ? { _id: new mongoose.Types.ObjectId(idOrNumber) }
    : { orderNumber: String(idOrNumber).trim().toUpperCase() };

  if (userId) {
    query.user = userId;
  }
  return query;
}

export async function reserveStockAndLedger(resolvedItems, orderNumber, userId) {
  const reserved = [];

  try {
    for (const item of resolvedItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          isActive: true,
          variants: {
            $elemMatch: {
              _id: item.variantId,
              isActive: true,
              stock: { $gte: item.quantity },
            },
          },
        },
        {
          $inc: { 'variants.$.stock': -item.quantity },
        },
        { new: true }
      );

      if (!updatedProduct) {
        throw new ApiError(
          409,
          `Insufficient stock for ${item.name} (${item.variantLabel}). Please update your cart and try again.`
        );
      }

      const updatedVariant = (updatedProduct.variants || []).find(
        (v) => String(v._id) === String(item.variantId)
      );
      const stockAfter = updatedVariant ? updatedVariant.stock : 0;

      reserved.push({ ...item, stockAfter });

      await Inventory.create({
        product: item.product,
        variantId: item.variantId,
        variantLabel: item.variantLabel,
        changeType: 'ORDER_RESERVATION',
        delta: -item.quantity,
        stockAfter,
        referenceId: orderNumber,
        note: `Reserved for order ${orderNumber}`,
        actor: userId || null,
      });

      const threshold = updatedVariant?.lowStockThreshold ?? item.lowStockThreshold ?? 5;
      if (stockAfter <= threshold) {
        await Notification.create({
          recipientRole: 'admin',
          user: null,
          type: 'LOW_STOCK',
          title: `Low Stock Alert: ${item.name}`,
          message: `${item.name} (${item.variantLabel}) has ${stockAfter} unit(s) remaining after order ${orderNumber}.`,
          link: '/admin/inventory',
        });
      }
    }

    return reserved;
  } catch (error) {
    // Compensating rollback ensures zero overselling or partial stock leak even without multi-doc replica sets
    for (const prev of reserved) {
      await Product.findOneAndUpdate(
        { _id: prev.product, 'variants._id': prev.variantId },
        { $inc: { 'variants.$.stock': prev.quantity } }
      ).catch(() => {});

      await Inventory.create({
        product: prev.product,
        variantId: prev.variantId,
        variantLabel: prev.variantLabel,
        changeType: 'ORDER_CANCEL_RESTORE',
        delta: prev.quantity,
        stockAfter: prev.stockAfter + prev.quantity,
        referenceId: orderNumber,
        note: `Rollback reservation for failed order ${orderNumber}`,
        actor: userId || null,
      }).catch(() => {});
    }
    throw error;
  }
}

export async function restoreStockAndLedger(orderItems, orderNumber, userId, reasonNote) {
  for (const item of orderItems) {
    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: item.product,
        'variants._id': item.variantId,
      },
      {
        $inc: { 'variants.$.stock': item.quantity },
      },
      { new: true }
    );

    const updatedVariant = (updatedProduct?.variants || []).find(
      (v) => String(v._id) === String(item.variantId)
    );
    const stockAfter = updatedVariant ? updatedVariant.stock : item.quantity;

    await Inventory.create({
      product: item.product,
      variantId: item.variantId,
      variantLabel: item.variantLabel,
      changeType: 'ORDER_CANCEL_RESTORE',
      delta: item.quantity,
      stockAfter,
      referenceId: orderNumber,
      note: reasonNote || `Stock restored for order ${orderNumber}`,
      actor: userId || null,
    });
  }
}

async function resolveDeliveryAddress(user, { addressId, shippingAddress, saveAddress }) {
  if (addressId) {
    if (!mongoose.isValidObjectId(addressId)) {
      throw new ApiError(400, 'Selected delivery address is invalid.');
    }
    const saved = await Address.findOne({ _id: addressId, user: user._id }).lean();
    if (!saved) {
      throw new ApiError(404, 'Saved delivery address could not be found.');
    }
    return {
      recipientName: saved.recipientName,
      phone: saved.phone,
      houseNumber: saved.houseNumber,
      street: saved.street,
      landmark: saved.landmark || '',
      city: saved.city,
      state: saved.state,
      pincode: saved.pincode,
      coordinates: saved.coordinates || { lat: null, lng: null },
    };
  }

  if (!shippingAddress) {
    throw new ApiError(400, 'Complete shipping address is required.');
  }

  if (saveAddress) {
    const existingCount = await Address.countDocuments({ user: user._id });
    await Address.create({
      user: user._id,
      label: 'Delivery',
      recipientName: shippingAddress.recipientName,
      phone: shippingAddress.phone,
      houseNumber: shippingAddress.houseNumber,
      street: shippingAddress.street,
      landmark: shippingAddress.landmark || '',
      city: shippingAddress.city,
      state: shippingAddress.state,
      pincode: shippingAddress.pincode,
      coordinates: shippingAddress.coordinates || { lat: null, lng: null },
      isDefault: existingCount === 0,
    });
  }

  return {
    recipientName: shippingAddress.recipientName,
    phone: shippingAddress.phone,
    houseNumber: shippingAddress.houseNumber,
    street: shippingAddress.street,
    landmark: shippingAddress.landmark || '',
    city: shippingAddress.city,
    state: shippingAddress.state,
    pincode: shippingAddress.pincode,
    coordinates: shippingAddress.coordinates || { lat: null, lng: null },
  };
}

export async function placeCustomerOrder({ user, body }) {
  const deliveryAddress = await resolveDeliveryAddress(user, body);
  const quote = await buildCheckoutQuote({
    items: body.items,
    pincode: deliveryAddress.pincode,
    couponCode: body.couponCode || '',
    strict: true,
  });

  if (quote.pricing.totalAmount <= 0 && body.paymentMethod === 'RAZORPAY') {
    throw new ApiError(400, 'Online payment requires a positive payable total.');
  }

  let razorpayClient = null;
  if (body.paymentMethod === 'RAZORPAY') {
    razorpayClient = getRazorpayClient();
  }

  const orderNumber = generateOrderNumber();

  let reservedCouponCode = '';
  if (quote.coupon.applied && quote.coupon.code) {
    const updatedCoupon = await Coupon.findOneAndUpdate(
      {
        code: quote.coupon.code,
        isActive: true,
        expiresAt: { $gt: new Date() },
        $or: [
          { usageLimit: null },
          { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
        ],
      },
      { $inc: { usedCount: 1 } },
      { new: true }
    );
    if (!updatedCoupon) {
      throw new ApiError(
        409,
        `Coupon "${quote.coupon.code}" just reached its usage limit or expired.`
      );
    }
    reservedCouponCode = updatedCoupon.code;
  }

  let reservedItems = [];
  try {
    reservedItems = await reserveStockAndLedger(quote.items, orderNumber, user._id);

    let razorpayOrder = null;
    if (body.paymentMethod === 'RAZORPAY') {
      razorpayOrder = await razorpayClient.orders.create({
        amount: Math.round(quote.pricing.totalAmount * 100),
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          orderNumber,
          customerId: String(user._id),
          pincode: deliveryAddress.pincode,
        },
      });
    }

    const initialNote =
      body.paymentMethod === 'COD'
        ? 'Order placed with Cash on Delivery. Store confirmation pending.'
        : 'Order created. Awaiting verified Razorpay payment confirmation.';

    const order = await Order.create({
      orderNumber,
      user: user._id,
      items: reservedItems.map((item) => ({
        product: item.product,
        variantId: item.variantId,
        name: item.name,
        variantLabel: item.variantLabel,
        image: item.image,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })),
      deliveryAddress,
      deliveryMeta: {
        zoneName: quote.delivery.zone?.areaName || '',
        estimatedDeliveryTime: quote.delivery.estimatedDeliveryTime || '',
      },
      pricing: quote.pricing,
      paymentMethod: body.paymentMethod,
      paymentStatus: 'PENDING',
      paymentDetails: {
        razorpayOrderId: razorpayOrder?.id || '',
      },
      status: 'PLACED',
      statusHistory: [
        {
          status: 'PLACED',
          note: initialNote,
          changedBy: user._id,
        },
      ],
    });

    if (body.paymentMethod === 'COD') {
      await Notification.create([
        {
          recipientRole: 'customer',
          user: user._id,
          type: 'ORDER_STATUS',
          title: `Order Placed (#${order.orderNumber})`,
          message: `Your Cash on Delivery order #${order.orderNumber} for ₹${order.pricing.totalAmount} has been placed successfully.`,
          link: `/account/orders/${order._id}`,
        },
        {
          recipientRole: 'admin',
          user: null,
          type: 'NEW_ORDER',
          title: `New COD Order #${order.orderNumber}`,
          message: `${deliveryAddress.recipientName} (${deliveryAddress.pincode}) placed a COD order worth ₹${order.pricing.totalAmount}.`,
          link: '/admin/orders',
        },
      ]);

      await AnalyticsEvent.create({
        eventType: 'PURCHASE_COMPLETED',
        user: user._id,
        order: order._id,
        metadata: {
          paymentMethod: 'COD',
          totalAmount: order.pricing.totalAmount,
          pincode: deliveryAddress.pincode,
        },
      });

      emitOrderLifecycleEvent('order:created', order, { note: initialNote });
    }

    return {
      order,
      razorpayOrder: razorpayOrder
        ? {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            receipt: razorpayOrder.receipt,
          }
        : null,
    };
  } catch (error) {
    if (reservedItems.length > 0) {
      await restoreStockAndLedger(
        reservedItems,
        orderNumber,
        user._id,
        `Automatic stock rollback after order failure for ${orderNumber}`
      ).catch(() => {});
    }
    if (reservedCouponCode) {
      await Coupon.findOneAndUpdate(
        { code: reservedCouponCode, usedCount: { $gt: 0 } },
        { $inc: { usedCount: -1 } }
      ).catch(() => {});
    }
    throw error;
  }
}

export async function confirmVerifiedRazorpayOrder({
  order,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature = '',
  webhookEventId = '',
  actorUserId = null,
}) {
  if (!order) {
    throw new ApiError(404, 'Order not found for payment confirmation.');
  }

  if (order.paymentStatus === 'PAID') {
    return { order, alreadyVerified: true };
  }

  order.paymentStatus = 'PAID';
  order.paymentDetails = {
    ...(order.paymentDetails?.toObject ? order.paymentDetails.toObject() : order.paymentDetails),
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature: razorpaySignature || order.paymentDetails?.razorpaySignature || '',
    verifiedAt: new Date(),
    webhookEventId: webhookEventId || order.paymentDetails?.webhookEventId || '',
  };

  if (order.status === 'PLACED') {
    order.status = 'CONFIRMED';
    order.statusHistory.push({
      status: 'CONFIRMED',
      note: `Online payment verified (Payment ID: ${razorpayPaymentId}).`,
      changedBy: actorUserId,
    });
  }

  await order.save();

  await Notification.create([
    {
      recipientRole: 'customer',
      user: order.user,
      type: 'ORDER_STATUS',
      title: `Payment Verified & Order Confirmed (#${order.orderNumber})`,
      message: `Your payment of ₹${order.pricing.totalAmount} was verified and order #${order.orderNumber} is confirmed.`,
      link: `/account/orders/${order._id}`,
    },
    {
      recipientRole: 'admin',
      user: null,
      type: 'NEW_ORDER',
      title: `Paid Online Order #${order.orderNumber}`,
      message: `Razorpay payment ₹${order.pricing.totalAmount} confirmed for #${order.orderNumber} (${order.deliveryAddress.pincode}).`,
      link: '/admin/orders',
    },
  ]);

  await AnalyticsEvent.create({
    eventType: 'PURCHASE_COMPLETED',
    user: order.user,
    order: order._id,
    metadata: {
      paymentMethod: 'RAZORPAY',
      razorpayPaymentId,
      totalAmount: order.pricing.totalAmount,
      pincode: order.deliveryAddress.pincode,
    },
  });

  emitOrderLifecycleEvent('order:created', order, {
    note: `Online payment verified (${razorpayPaymentId}).`,
  });
  emitOrderLifecycleEvent('order:updated', order, {
    note: `Payment verified and order #${order.orderNumber} confirmed.`,
  });

  return { order, alreadyVerified: false };
}

export async function verifyAndConfirmRazorpayPayment({
  user,
  orderId,
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  const order = await Order.findOne(buildOrderLookupQuery(orderId, user._id));
  if (!order) {
    throw new ApiError(404, 'Order could not be found.');
  }
  if (order.paymentMethod !== 'RAZORPAY') {
    throw new ApiError(400, 'This order uses Cash on Delivery and cannot be verified via Razorpay.');
  }
  if (order.paymentDetails?.razorpayOrderId !== razorpay_order_id) {
    throw new ApiError(400, 'Mismatched Razorpay order ID.');
  }

  if (order.paymentStatus === 'PAID') {
    return { order, alreadyVerified: true };
  }

  const valid = verifyRazorpayPaymentSignature({
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
  });

  if (!valid) {
    throw new ApiError(
      400,
      'Payment signature verification failed. Order remains unpaid until valid gateway confirmation.'
    );
  }

  return confirmVerifiedRazorpayOrder({
    order,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    razorpaySignature: razorpay_signature,
    actorUserId: user._id,
  });
}

export async function failAndReleasePendingRazorpayOrder({
  order,
  reason = 'Payment cancelled or failed.',
  actorUserId = null,
}) {
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }
  if (order.paymentStatus === 'PAID') {
    throw new ApiError(409, 'Paid orders cannot be marked as failed.');
  }
  if (order.status === 'CANCELLED') {
    return order;
  }

  await restoreStockAndLedger(
    order.items,
    order.orderNumber,
    actorUserId || order.user,
    `Stock released after failed online payment for ${order.orderNumber}`
  );

  if (order.pricing?.couponCode) {
    await Coupon.findOneAndUpdate(
      { code: order.pricing.couponCode, usedCount: { $gt: 0 } },
      { $inc: { usedCount: -1 } }
    );
  }

  order.paymentStatus = 'FAILED';
  order.status = 'CANCELLED';
  order.cancellationReason = reason;
  order.statusHistory.push({
    status: 'CANCELLED',
    note: reason,
    changedBy: actorUserId,
  });
  await order.save();

  await Notification.create({
    recipientRole: 'customer',
    user: order.user,
    type: 'ORDER_STATUS',
    title: `Payment Failed for Order #${order.orderNumber}`,
    message: `Payment was not completed for #${order.orderNumber}. Reserved stock has been released and no charge was confirmed.`,
    link: `/account/orders/${order._id}`,
  });

  emitOrderLifecycleEvent('order:updated', order, { note: reason });

  return order;
}

export async function cancelCustomerOrder({ user, orderId, reason }) {
  const order = await Order.findOne(buildOrderLookupQuery(orderId, user._id));
  if (!order) {
    throw new ApiError(404, 'Order could not be found.');
  }

  if (order.status === 'CANCELLED' || order.status === 'REFUNDED') {
    throw new ApiError(409, `Order #${order.orderNumber} is already ${order.status.toLowerCase()}.`);
  }

  const cancellableStatuses = ['PLACED', 'CONFIRMED'];
  if (!cancellableStatuses.includes(order.status)) {
    throw new ApiError(
      409,
      `Order #${order.orderNumber} is currently "${order.status}" and can no longer be cancelled online. Please call +91 89863 65592 for assistance.`
    );
  }

  await restoreStockAndLedger(
    order.items,
    order.orderNumber,
    user._id,
    `Customer cancellation of order ${order.orderNumber}`
  );

  if (order.pricing?.couponCode) {
    await Coupon.findOneAndUpdate(
      { code: order.pricing.couponCode, usedCount: { $gt: 0 } },
      { $inc: { usedCount: -1 } }
    );
  }

  order.status = 'CANCELLED';
  order.cancellationReason = reason || 'Cancelled by customer';
  order.statusHistory.push({
    status: 'CANCELLED',
    note: order.cancellationReason,
    changedBy: user._id,
  });
  await order.save();

  await Notification.create([
    {
      recipientRole: 'customer',
      user: user._id,
      type: 'ORDER_STATUS',
      title: `Order Cancelled (#${order.orderNumber})`,
      message: `Your order #${order.orderNumber} has been cancelled cleanly.`,
      link: `/account/orders/${order._id}`,
    },
    {
      recipientRole: 'admin',
      user: null,
      type: 'ORDER_STATUS',
      title: `Customer Cancelled #${order.orderNumber}`,
      message: `Customer cancelled order #${order.orderNumber}. Stock has been restored automatically.`,
      link: '/admin/orders',
    },
  ]);

  emitOrderLifecycleEvent('order:updated', order, {
    note: order.cancellationReason,
  });

  return order;
}
