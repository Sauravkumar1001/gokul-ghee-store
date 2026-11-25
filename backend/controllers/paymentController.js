import { env } from '../config/env.js';
import {
  isRazorpayConfigured,
  verifyRazorpayWebhookSignature,
} from '../config/razorpay.js';
import { Order } from '../models/Order.js';
import {
  buildOrderLookupQuery,
  confirmVerifiedRazorpayOrder,
  failAndReleasePendingRazorpayOrder,
  verifyAndConfirmRazorpayPayment,
} from '../services/orderService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPaymentConfig = asyncHandler(async (_req, res) => {
  const razorpayEnabled = isRazorpayConfigured();
  res.status(200).json({
    success: true,
    razorpayEnabled,
    keyId: razorpayEnabled ? env.razorpay.keyId : null,
    codEnabled: true,
  });
});

export const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { order, alreadyVerified } = await verifyAndConfirmRazorpayPayment({
    user: req.user,
    ...req.body,
  });

  res.status(200).json({
    success: true,
    alreadyVerified,
    message: `Payment verified and order #${order.orderNumber} confirmed.`,
    order,
  });
});

export const reportRazorpayFailure = asyncHandler(async (req, res) => {
  const { orderId, reason } = req.body;
  const order = await Order.findOne(buildOrderLookupQuery(orderId, req.user._id));
  if (!order) {
    throw new ApiError(404, 'Order could not be found.');
  }
  if (order.paymentMethod !== 'RAZORPAY') {
    throw new ApiError(400, 'Invalid payment failure report for a Cash on Delivery order.');
  }

  const updated = await failAndReleasePendingRazorpayOrder({
    order,
    reason,
    actorUserId: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: 'Unpaid order cancelled and reserved inventory restored.',
    order: updated,
  });
});

export const handleRazorpayWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawPayload = req.rawBody || JSON.stringify(req.body || {});
  const valid = verifyRazorpayWebhookSignature(rawPayload, signature);

  if (!valid) {
    throw new ApiError(400, 'Invalid Razorpay webhook signature.');
  }

  const eventName = req.body?.event;
  const paymentEntity = req.body?.payload?.payment?.entity;
  const razorpayOrderId = paymentEntity?.order_id;
  const razorpayPaymentId = paymentEntity?.id;
  const webhookEventId = String(req.headers['x-razorpay-event-id'] || razorpayPaymentId || '');

  if (!razorpayOrderId) {
    return res.status(200).json({ success: true, ignored: true });
  }

  const order = await Order.findOne({ 'paymentDetails.razorpayOrderId': razorpayOrderId });
  if (!order) {
    return res.status(200).json({ success: true, ignored: true });
  }

  if (
    webhookEventId &&
    order.paymentDetails?.webhookEventId === webhookEventId
  ) {
    return res.status(200).json({ success: true, deduplicated: true });
  }

  if (eventName === 'payment.captured') {
    await confirmVerifiedRazorpayOrder({
      order,
      razorpayOrderId,
      razorpayPaymentId,
      webhookEventId,
      actorUserId: null,
    });
  } else if (eventName === 'payment.failed' && order.paymentStatus !== 'PAID') {
    await failAndReleasePendingRazorpayOrder({
      order,
      reason:
        paymentEntity?.error_description || 'Razorpay webhook reported payment failure.',
      actorUserId: null,
    });
  }

  res.status(200).json({ success: true, received: true });
});
