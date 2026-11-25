import mongoose from 'mongoose';
import { Order } from '../models/Order.js';
import { Review } from '../models/Review.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const submitVerifiedReview = asyncHandler(async (req, res) => {
  const { productId, orderId, rating, title, comment } = req.body;

  if (!mongoose.isValidObjectId(productId) || !mongoose.isValidObjectId(orderId)) {
    throw new ApiError(400, 'Valid product and delivered order identifiers are required.');
  }

  const order = await Order.findOne({
    _id: orderId,
    user: req.user._id,
    status: 'DELIVERED',
  }).lean();

  if (!order) {
    throw new ApiError(
      403,
      'Only delivered orders belonging to your account qualify for verified product reviews.'
    );
  }

  const purchasedProduct = (order.items || []).some(
    (item) => String(item.product) === String(productId)
  );
  if (!purchasedProduct) {
    throw new ApiError(400, 'This product was not part of the selected delivered order.');
  }

  const existing = await Review.findOne({
    product: productId,
    user: req.user._id,
    order: order._id,
  });
  if (existing) {
    throw new ApiError(409, 'You have already submitted a review for this product on this order.');
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    order: order._id,
    rating,
    title,
    comment,
    isVerifiedPurchase: true,
    status: 'pending',
  });

  res.status(201).json({
    success: true,
    message:
      'Thank you! Your verified delivery review has been submitted for store moderation.',
    review,
  });
});

export const getMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate('product', 'name slug images')
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    reviews,
  });
});
