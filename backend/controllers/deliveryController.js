import { DeliveryZone } from '../models/DeliveryZone.js';
import {
  evaluateCoupon,
  evaluateDeliveryZone,
} from '../services/checkoutPricingService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getActiveDeliveryZones = asyncHandler(async (_req, res) => {
  const zones = await DeliveryZone.find({ isActive: true })
    .sort({ pincode: 1 })
    .select('pincode areaName city deliveryCharge freeDeliveryAbove minimumOrderValue estimatedDeliveryTime notes')
    .lean();

  res.status(200).json({
    success: true,
    zones,
  });
});

export const checkPincodeAvailability = asyncHandler(async (req, res) => {
  const { pincode, subtotal } = req.body;
  const result = await evaluateDeliveryZone(pincode, subtotal);

  res.status(200).json({
    success: true,
    ...result,
  });
});

export const validateCouponCode = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;
  const result = await evaluateCoupon(code, subtotal);

  res.status(result.valid ? 200 : 400).json({
    success: result.valid,
    ...result,
  });
});
