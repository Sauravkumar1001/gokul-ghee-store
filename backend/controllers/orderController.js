import { Order } from '../models/Order.js';
import { buildCheckoutQuote } from '../services/checkoutPricingService.js';
import {
  buildOrderLookupQuery,
  cancelCustomerOrder,
  placeCustomerOrder,
} from '../services/orderService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getCheckoutQuote = asyncHandler(async (req, res) => {
  const { items, pincode, couponCode } = req.body;
  const quote = await buildCheckoutQuote({
    items,
    pincode,
    couponCode,
    strict: false,
  });

  res.status(200).json({
    success: true,
    quote,
  });
});

export const createOrder = asyncHandler(async (req, res) => {
  const { order, razorpayOrder } = await placeCustomerOrder({
    user: req.user,
    body: req.body,
  });

  res.status(201).json({
    success: true,
    message:
      order.paymentMethod === 'COD'
        ? `Order #${order.orderNumber} placed successfully with Cash on Delivery.`
        : `Order #${order.orderNumber} created. Complete Razorpay payment verification to confirm.`,
    order,
    razorpayOrder,
  });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments({ user: req.user._id }),
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

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne(
    buildOrderLookupQuery(req.params.id, req.user._id)
  ).lean();

  if (!order) {
    throw new ApiError(404, 'Order could not be found.');
  }

  res.status(200).json({
    success: true,
    order,
  });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await cancelCustomerOrder({
    user: req.user,
    orderId: req.params.id,
    reason: req.body?.reason,
  });

  res.status(200).json({
    success: true,
    message: `Order #${order.orderNumber} cancelled cleanly and stock restored.`,
    order,
  });
});
