import { Router } from 'express';
import {
  checkPincodeAvailability,
  getActiveDeliveryZones,
  validateCouponCode,
} from '../controllers/deliveryController.js';
import { validate } from '../middleware/validate.js';
import {
  couponValidateSchema,
  pincodeCheckSchema,
} from '../validators/orderValidators.js';

const router = Router();

router.get('/delivery/zones', getActiveDeliveryZones);
router.post('/delivery/check-pincode', validate(pincodeCheckSchema), checkPincodeAvailability);
router.post('/coupons/validate', validate(couponValidateSchema), validateCouponCode);

export default router;
