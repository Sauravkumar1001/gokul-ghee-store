import { Router } from 'express';
import {
  getPaymentConfig,
  handleRazorpayWebhook,
  reportRazorpayFailure,
  verifyRazorpayPayment,
} from '../controllers/paymentController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  razorpayFailureSchema,
  razorpayVerifySchema,
} from '../validators/orderValidators.js';

const router = Router();

router.get('/config', getPaymentConfig);
router.post('/razorpay/webhook', handleRazorpayWebhook);

router.use(requireAuth);
router.post('/razorpay/verify', validate(razorpayVerifySchema), verifyRazorpayPayment);
router.post('/razorpay/failure', validate(razorpayFailureSchema), reportRazorpayFailure);

export default router;
