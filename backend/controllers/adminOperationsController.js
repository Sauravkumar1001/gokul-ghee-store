import mongoose from 'mongoose';
import { Address } from '../models/Address.js';
import { Coupon } from '../models/Coupon.js';
import { DeliveryZone } from '../models/DeliveryZone.js';
import { Notification } from '../models/Notification.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { StoreSettings } from '../models/StoreSettings.js';
import { User } from '../models/User.js';
import { emitOrderLifecycleEvent } from '../config/socket.js';
import { restoreStockAndLedger } from '../services/orderService.js';
import { DEFAULT_STORE_SETTINGS } from './storeController.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listAdminOrders = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status && req.query.status !== 'ALL') {
    filter.status = String(req.query.status).trim().toUpperCase();
  }
  if (req.query.paymentStatus && req.query.paymentStatus !== 'ALL') {
    filter.paymentStatus = String(req.query.paymentStatus).trim().toUpperCase();
  }
  if (req.query.q) {
    const safeRegex = new RegExp(
      String(req.query.q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'i'
    );
    filter.$or = [
      { orderNumber: safeRegex },
      { 'deliveryAddress.recipientName': safeRegex },
      { 'deliveryAddress.phone': safeRegex },
      { 'deliveryAddress.pincode': safeRegex },
    ];
  }

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    orders,
    pagination: {
      page,
      limit,
      total,
      pages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

export const getAdminOrderDetail = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .lean();

  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  res.status(200).json({ success: true, order });
});

export const updateAdminOrderStatus = asyncHandler(async (req, res) => {
  const { status, paymentStatus, note } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new ApiError(404, 'Order not found.');
  }

  const wasTerminated = ['CANCELLED', 'REFUNDED'].includes(order.status);
  const willTerminate = ['CANCELLED', 'REFUNDED'].includes(status);

  if (!wasTerminated && willTerminate) {
    await restoreStockAndLedger(
      order.items,
      order.orderNumber,
      req.user._id,
      note || `Admin marked order ${order.orderNumber} as ${status}`
    );

    if (order.pricing?.couponCode) {
      await Coupon.findOneAndUpdate(
        { code: order.pricing.couponCode, usedCount: { $gt: 0 } },
        { $inc: { usedCount: -1 } }
      );
    }

    if (status === 'CANCELLED') {
      order.cancellationReason = note || 'Cancelled by store administration';
    }
  }

  const previousStatus = order.status;
  order.status = status;

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'PAID' && !order.paymentDetails?.verifiedAt) {
      order.paymentDetails = {
        ...(order.paymentDetails?.toObject ? order.paymentDetails.toObject() : order.paymentDetails),
        verifiedAt: new Date(),
      };
    }
  } else if (status === 'REFUNDED' && order.paymentStatus === 'PAID') {
    order.paymentStatus = 'REFUNDED';
  }

  if (previousStatus !== status || note) {
    order.statusHistory.push({
      status,
      note: note || `Order status updated to ${status} by Admin.`,
      changedBy: req.user._id,
    });
  }

  await order.save();

  await Notification.create({
    recipientRole: 'customer',
    user: order.user,
    type: 'ORDER_STATUS',
    title: `Order #${order.orderNumber}: ${status}`,
    message:
      note ||
      `Your Gokul Ghee order #${order.orderNumber} is now "${status}".`,
    link: `/account/orders/${order._id}`,
  });

  emitOrderLifecycleEvent('order:updated', order, {
    note: note || `Order status updated to ${status} by Admin.`,
  });

  res.status(200).json({
    success: true,
    message: `Order #${order.orderNumber} updated cleanly.`,
    order,
  });
});

export const listAdminCustomers = asyncHandler(async (req, res) => {
  const filter = { role: 'customer' };
  if (req.query.q) {
    const safeRegex = new RegExp(
      String(req.query.q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'i'
    );
    filter.$or = [{ name: safeRegex }, { email: safeRegex }, { phone: safeRegex }];
  }

  const customers = await User.find(filter)
    .sort({ createdAt: -1 })
    .select('name email phone isActive createdAt lastLoginAt')
    .lean();

  const orderAgg = await Order.aggregate([
    {
      $group: {
        _id: '$user',
        orderCount: { $sum: 1 },
        totalSpent: {
          $sum: {
            $cond: [
              { $in: ['$status', ['CANCELLED', 'REFUNDED']] },
              0,
              '$pricing.totalAmount',
            ],
          },
        },
        lastOrderAt: { $max: '$createdAt' },
      },
    },
  ]);

  const statsMap = new Map(orderAgg.map((entry) => [String(entry._id), entry]));

  const enriched = customers.map((c) => {
    const stat = statsMap.get(String(c._id));
    return {
      ...c,
      orderCount: stat?.orderCount || 0,
      totalSpent: stat?.totalSpent || 0,
      lastOrderAt: stat?.lastOrderAt || null,
    };
  });

  res.status(200).json({
    success: true,
    customers: enriched,
  });
});

export const getAdminCustomerDetail = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new ApiError(400, 'Invalid customer ID.');
  }

  const [customer, addresses, orders] = await Promise.all([
    User.findById(req.params.id).select('-passwordHash').lean(),
    Address.find({ user: req.params.id }).sort({ isDefault: -1 }).lean(),
    Order.find({ user: req.params.id }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!customer) {
    throw new ApiError(404, 'Customer not found.');
  }

  res.status(200).json({
    success: true,
    customer,
    addresses,
    orders,
  });
});

export const listDeliveryZones = asyncHandler(async (_req, res) => {
  const zones = await DeliveryZone.find().sort({ pincode: 1 }).lean();
  res.status(200).json({ success: true, zones });
});

export const createDeliveryZone = asyncHandler(async (req, res) => {
  const existing = await DeliveryZone.findOne({ pincode: req.body.pincode });
  if (existing) {
    throw new ApiError(409, `Delivery zone for pincode ${req.body.pincode} already exists.`);
  }
  const zone = await DeliveryZone.create(req.body);
  res.status(201).json({ success: true, zone });
});

export const updateDeliveryZone = asyncHandler(async (req, res) => {
  const conflict = await DeliveryZone.findOne({
    pincode: req.body.pincode,
    _id: { $ne: req.params.id },
  });
  if (conflict) {
    throw new ApiError(409, `Pincode ${req.body.pincode} is assigned to another zone.`);
  }

  const zone = await DeliveryZone.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!zone) {
    throw new ApiError(404, 'Delivery zone not found.');
  }

  res.status(200).json({ success: true, zone });
});

export const deleteDeliveryZone = asyncHandler(async (req, res) => {
  const zone = await DeliveryZone.findByIdAndDelete(req.params.id);
  if (!zone) {
    throw new ApiError(404, 'Delivery zone not found.');
  }
  res.status(200).json({ success: true, message: 'Delivery zone deleted.' });
});

export const listCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  res.status(200).json({ success: true, coupons });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const existing = await Coupon.findOne({ code: req.body.code });
  if (existing) {
    throw new ApiError(409, `Coupon code "${req.body.code}" already exists.`);
  }
  const coupon = await Coupon.create({
    ...req.body,
    expiresAt: new Date(req.body.expiresAt),
  });
  res.status(201).json({ success: true, coupon });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const conflict = await Coupon.findOne({
    code: req.body.code,
    _id: { $ne: req.params.id },
  });
  if (conflict) {
    throw new ApiError(409, `Coupon code "${req.body.code}" belongs to another record.`);
  }

  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    { $set: { ...req.body, expiresAt: new Date(req.body.expiresAt) } },
    { new: true, runValidators: true }
  );
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found.');
  }
  res.status(200).json({ success: true, coupon });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) {
    throw new ApiError(404, 'Coupon not found.');
  }
  res.status(200).json({ success: true, message: 'Coupon deleted.' });
});

export const listAdminReviews = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status && req.query.status !== 'all') {
    filter.status = String(req.query.status).trim().toLowerCase();
  }

  const reviews = await Review.find(filter)
    .populate('product', 'name slug')
    .populate('user', 'name email')
    .populate('order', 'orderNumber')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({ success: true, reviews });
});

export const moderateReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $set: { status: req.body.status } },
    { new: true }
  );
  if (!review) {
    throw new ApiError(404, 'Review not found.');
  }

  const stats = await Review.aggregate([
    { $match: { product: review.product, status: 'approved' } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  const agg = stats[0];
  await Product.findByIdAndUpdate(review.product, {
    $set: {
      averageRating: agg ? Math.round(agg.avgRating * 10) / 10 : 0,
      reviewCount: agg ? agg.count : 0,
    },
  });

  res.status(200).json({
    success: true,
    message: `Review marked ${review.status}.`,
    review,
  });
});

export const getAdminSettings = asyncHandler(async (_req, res) => {
  const settings = await StoreSettings.findOne({ singletonKey: 'PRIMARY_STORE' }).lean();
  res.status(200).json({
    success: true,
    settings: settings || DEFAULT_STORE_SETTINGS,
  });
});

export const updateAdminSettings = asyncHandler(async (req, res) => {
  const settings = await StoreSettings.findOneAndUpdate(
    { singletonKey: 'PRIMARY_STORE' },
    { $set: { singletonKey: 'PRIMARY_STORE', ...req.body } },
    { upsert: true, new: true, runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: 'Store settings updated cleanly.',
    settings,
  });
});
