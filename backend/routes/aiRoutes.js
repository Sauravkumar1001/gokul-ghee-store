import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { chatWithGokulAi, getGokulAiHistory } from '../controllers/aiController.js';
import { optionalAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { aiChatSchema } from '../validators/aiValidators.js';

const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.nodeEnv === 'test' ? 100 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many GOKUL AI requests right now. Please wait a minute before asking again.',
  },
});

const router = Router();

router.post('/chat', aiRateLimiter, optionalAuth, validate(aiChatSchema), chatWithGokulAi);
router.get('/history/:sessionId', optionalAuth, getGokulAiHistory);

export default router;
