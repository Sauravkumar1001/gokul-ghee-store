import { Router } from 'express';
import {
  getMyReviews,
  submitVerifiedReview,
} from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createReviewSchema } from '../validators/orderValidators.js';

const router = Router();

router.use(requireAuth);
router.get('/my', getMyReviews);
router.post('/', validate(createReviewSchema), submitVerifiedReview);

export default router;
