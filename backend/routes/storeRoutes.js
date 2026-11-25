import { Router } from 'express';
import {
  getStoreSettings,
  submitContactEnquiry,
  subscribeNewsletter,
  trackAnalyticsEvent,
} from '../controllers/storeController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  analyticsEventSchema,
  contactEnquirySchema,
  newsletterSchema,
} from '../validators/storeValidators.js';

const router = Router();

router.get('/store/settings', getStoreSettings);
router.post('/contact', validate(contactEnquirySchema), submitContactEnquiry);
router.post('/newsletter', validate(newsletterSchema), subscribeNewsletter);
router.post('/analytics/events', optionalAuth, validate(analyticsEventSchema), trackAnalyticsEvent);

export default router;
