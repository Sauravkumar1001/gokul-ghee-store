import { Router } from 'express';
import { getCaptcha, getMe, login, logout, register } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { verifyCaptcha } from '../middleware/captcha.js';
import { validate } from '../middleware/validate.js';
import { loginSchema, registerSchema } from '../validators/authValidators.js';

const router = Router();

router.get('/captcha', getCaptcha);
router.post('/register', authRateLimiter, validate(registerSchema), verifyCaptcha, register);
router.post('/login', authRateLimiter, validate(loginSchema), verifyCaptcha, login);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);

export default router;
