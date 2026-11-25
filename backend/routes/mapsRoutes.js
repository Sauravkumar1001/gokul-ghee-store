import { Router } from 'express';
import {
  geocodeCustomerAddress,
  getMapsConfig,
  getStorePlaceDetails,
} from '../controllers/mapsController.js';
import { validate } from '../middleware/validate.js';
import { geocodeQuerySchema } from '../validators/storeValidators.js';

const router = Router();

router.get('/config', getMapsConfig);
router.get('/store-place', getStorePlaceDetails);
router.post('/geocode', validate(geocodeQuerySchema), geocodeCustomerAddress);

export default router;
