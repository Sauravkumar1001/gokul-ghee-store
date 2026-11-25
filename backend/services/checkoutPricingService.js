import mongoose from 'mongoose';
import { Coupon } from '../models/Coupon.js';
import { DeliveryZone } from '../models/DeliveryZone.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';

export async function resolveValidatedCartItems(rawItems = [], session = null) {
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    throw new ApiError(400, 'Your cart is empty.');
  }

  const objectIds = [];
  const slugs = [];

  for (const item of rawItems) {
    if (item.productId && mongoose.isValidObjectId(item.productId)) {
      objectIds.push(new mongoose.Types.ObjectId(item.productId));
    }
    if (item.slug) {
      slugs.push(String(item.slug).toLowerCase().trim());
    }
  }

  const queryFilter = {
    isActive: true,
    $or: [],
  };
  if (objectIds.length > 0) queryFilter.$or.push({ _id: { $in: objectIds } });
  if (slugs.length > 0) queryFilter.$or.push({ slug: { $in: slugs } });

  if (queryFilter.$or.length === 0) {
    throw new ApiError(400, 'Cart items must specify valid product identifiers.');
  }

  let query = Product.find(queryFilter);
  if (session) {
    query = query.session(session);
  }
  const products = await query.lean();

  const mergedByVariantKey = new Map();

  for (const rawItem of rawItems) {
    const qty = Math.max(1, Number(rawItem.quantity) || 1);
    const matchedProduct = products.find(
      (prod) =>
        (rawItem.productId && String(prod._id) === String(rawItem.productId)) ||
        (rawItem.slug && prod.slug === String(rawItem.slug).toLowerCase().trim())
    );

    if (!matchedProduct) {
      throw new ApiError(
        404,
        `A selected product (${rawItem.slug || rawItem.productId}) is no longer available in our catalog.`
      );
    }

    const matchedVariant = (matchedProduct.variants || []).find(
      (v) =>
        v.isActive !== false &&
        ((rawItem.variantId && String(v._id) === String(rawItem.variantId)) ||
          (rawItem.sku && v.sku === rawItem.sku))
    );

    if (!matchedVariant) {
      throw new ApiError(
        404,
        `Requested pack variant for "${matchedProduct.name}" is currently unavailable.`
      );
    }

    const compositeKey = `${String(matchedProduct._id)}:${String(matchedVariant._id)}`;
    const existing = mergedByVariantKey.get(compositeKey);
    const totalRequestedQty = (existing ? existing.quantity : 0) + qty;

    if (matchedVariant.stock < totalRequestedQty) {
      throw new ApiError(
        409,
        `Only ${matchedVariant.stock} unit(s) available for ${matchedProduct.name} (${matchedVariant.label}).`
      );
    }

    mergedByVariantKey.set(compositeKey, {
      product: matchedProduct._id,
      slug: matchedProduct.slug,
      variantId: matchedVariant._id,
      sku: matchedVariant.sku,
      name: matchedProduct.name,
      variantLabel: matchedVariant.label,
      image: matchedProduct.images?.[0] || '',
      unitPrice: matchedVariant.price,
      mrp: matchedVariant.mrp,
      availableStock: matchedVariant.stock,
      lowStockThreshold: matchedVariant.lowStockThreshold ?? 5,
      quantity: totalRequestedQty,
      lineTotal: matchedVariant.price * totalRequestedQty,
      isSampleData: Boolean(matchedProduct.isSampleData),
    });
  }

  const resolvedItems = Array.from(mergedByVariantKey.values());
  const subtotal = resolvedItems.reduce((sum, item) => sum + item.lineTotal, 0);

  return { resolvedItems, subtotal };
}

export async function evaluateDeliveryZone(pincode, subtotal = 0) {
  const cleanPin = String(pincode || '').trim();
  const zone = await DeliveryZone.findOne({ pincode: cleanPin }).lean();

  if (!zone || !zone.isActive) {
    return {
      pincode: cleanPin,
      serviceable: false,
      zone: null,
      deliveryCharge: null,
      minimumOrderValue: null,
      meetsMinimumOrder: false,
      freeDeliveryAbove: null,
      freeDeliveryApplied: false,
      estimatedDeliveryTime: null,
      message: `Delivery is currently not active for pincode ${cleanPin}. We serve configured local Bihar zones only — please call +91 89863 65592 for Anand Bazar pickup or special dispatch.`,
    };
  }

  const numericSubtotal = Math.max(0, Number(subtotal) || 0);
  const meetsMinimumOrder = numericSubtotal >= (zone.minimumOrderValue || 0);
  const freeDeliveryApplied =
    zone.freeDeliveryAbove !== null &&
    zone.freeDeliveryAbove !== undefined &&
    numericSubtotal >= zone.freeDeliveryAbove;
  const deliveryCharge = freeDeliveryApplied ? 0 : zone.deliveryCharge;

  return {
    pincode: cleanPin,
    serviceable: true,
    zone: {
      _id: String(zone._id),
      pincode: zone.pincode,
      areaName: zone.areaName,
      city: zone.city,
      notes: zone.notes || '',
    },
    deliveryCharge,
    baseDeliveryCharge: zone.deliveryCharge,
    minimumOrderValue: zone.minimumOrderValue || 0,
    meetsMinimumOrder,
    shortfallForMinimum: meetsMinimumOrder
      ? 0
      : Math.max(0, (zone.minimumOrderValue || 0) - numericSubtotal),
    freeDeliveryAbove: zone.freeDeliveryAbove ?? null,
    freeDeliveryApplied,
    shortfallForFreeDelivery:
      zone.freeDeliveryAbove !== null && zone.freeDeliveryAbove !== undefined && !freeDeliveryApplied
        ? Math.max(0, zone.freeDeliveryAbove - numericSubtotal)
        : 0,
    estimatedDeliveryTime: zone.estimatedDeliveryTime,
    message: meetsMinimumOrder
      ? `Delivery available to ${zone.areaName}, ${zone.city} (${zone.estimatedDeliveryTime}).`
      : `Delivery available to ${zone.areaName}, ${zone.city}. Add ₹${Math.max(
          0,
          (zone.minimumOrderValue || 0) - numericSubtotal
        )} more to meet the ₹${zone.minimumOrderValue} minimum order value.`,
  };
}

export async function evaluateCoupon(rawCode, subtotal = 0) {
  const code = String(rawCode || '').trim().toUpperCase();
  if (!code) {
    return {
      applied: false,
      valid: true,
      code: '',
      discountAmount: 0,
      coupon: null,
      message: '',
    };
  }

  const coupon = await Coupon.findOne({ code }).lean();
  if (!coupon || !coupon.isActive) {
    return {
      applied: false,
      valid: false,
      code,
      discountAmount: 0,
      coupon: null,
      message: `Coupon "${code}" is invalid or inactive.`,
    };
  }

  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() <= Date.now()) {
    return {
      applied: false,
      valid: false,
      code,
      discountAmount: 0,
      coupon: null,
      message: `Coupon "${code}" has expired.`,
    };
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return {
      applied: false,
      valid: false,
      code,
      discountAmount: 0,
      coupon: null,
      message: `Coupon "${code}" has reached its maximum usage limit.`,
    };
  }

  const numericSubtotal = Math.max(0, Number(subtotal) || 0);
  if (numericSubtotal < (coupon.minOrderAmount || 0)) {
    return {
      applied: false,
      valid: false,
      code,
      discountAmount: 0,
      coupon: null,
      message: `Coupon "${code}" requires a minimum order subtotal of ₹${coupon.minOrderAmount}.`,
    };
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = Math.round((numericSubtotal * coupon.discountValue) / 100);
    if (coupon.maxDiscountAmount !== null && coupon.maxDiscountAmount !== undefined) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  discountAmount = Math.max(0, Math.min(discountAmount, numericSubtotal));

  return {
    applied: true,
    valid: true,
    code: coupon.code,
    discountAmount,
    coupon: {
      _id: String(coupon._id),
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
    },
    message: `Coupon "${coupon.code}" applied — you save ₹${discountAmount}.`,
  };
}

export async function buildCheckoutQuote({
  items,
  pincode,
  couponCode = '',
  strict = false,
}) {
  const { resolvedItems, subtotal } = await resolveValidatedCartItems(items);
  const delivery = await evaluateDeliveryZone(pincode, subtotal);

  if (strict && !delivery.serviceable) {
    throw new ApiError(400, delivery.message);
  }
  if (strict && !delivery.meetsMinimumOrder) {
    throw new ApiError(400, delivery.message);
  }

  const couponResult = await evaluateCoupon(couponCode, subtotal);
  if (strict && couponCode.trim() && !couponResult.valid) {
    throw new ApiError(400, couponResult.message);
  }

  const discountAmount = couponResult.applied ? couponResult.discountAmount : 0;
  const deliveryCharge = delivery.serviceable ? delivery.deliveryCharge : 0;
  const totalAmount = Math.max(0, subtotal - discountAmount + deliveryCharge);

  return {
    items: resolvedItems,
    delivery,
    coupon: couponResult,
    pricing: {
      subtotal,
      discountAmount,
      deliveryCharge,
      totalAmount,
      couponCode: couponResult.applied ? couponResult.code : '',
    },
  };
}
