import { Address } from '../models/Address.js';
import { Product } from '../models/Product.js';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id })
    .sort({ isDefault: -1, updatedAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    addresses,
  });
});

export const createAddress = asyncHandler(async (req, res) => {
  const payload = req.body;

  const existingCount = await Address.countDocuments({ user: req.user._id });
  const shouldBeDefault = payload.isDefault || existingCount === 0;

  if (shouldBeDefault) {
    await Address.updateMany({ user: req.user._id }, { $set: { isDefault: false } });
  }

  const address = await Address.create({
    ...payload,
    user: req.user._id,
    isDefault: shouldBeDefault,
  });

  res.status(201).json({
    success: true,
    address,
  });
});

export const updateAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }

  const payload = req.body;
  if (payload.isDefault) {
    await Address.updateMany({ user: req.user._id }, { $set: { isDefault: false } });
  }

  Object.assign(address, payload);
  await address.save();

  res.status(200).json({
    success: true,
    address,
  });
});

export const setDefaultAddress = asyncHandler(async (req, res) => {
  const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
  if (!address) {
    throw new ApiError(404, 'Address not found.');
  }

  await Address.updateMany({ user: req.user._id }, { $set: { isDefault: false } });
  address.isDefault = true;
  await address.save();

  res.status(200).json({
    success: true,
    address,
  });
});

export const deleteAddress = asyncHandler(async (req, res) => {
  const deleted = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!deleted) {
    throw new ApiError(404, 'Address not found.');
  }

  if (deleted.isDefault) {
    const latest = await Address.findOne({ user: req.user._id }).sort({ updatedAt: -1 });
    if (latest) {
      latest.isDefault = true;
      await latest.save();
    }
  }

  res.status(200).json({
    success: true,
    message: 'Address deleted.',
  });
});

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist').lean();
  res.status(200).json({
    success: true,
    wishlist: (user?.wishlist || []).filter((p) => p && p.isActive),
  });
});

export const toggleWishlistItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  const user = await User.findById(req.user._id);
  const exists = user.wishlist.some((id) => String(id) === String(product._id));

  if (exists) {
    user.wishlist = user.wishlist.filter((id) => String(id) !== String(product._id));
  } else {
    user.wishlist.unshift(product._id);
  }
  await user.save();

  res.status(200).json({
    success: true,
    wishlisted: !exists,
    wishlistIds: user.wishlist.map(String),
  });
});
