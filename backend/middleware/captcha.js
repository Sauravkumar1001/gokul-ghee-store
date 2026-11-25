import { ApiError } from '../utils/ApiError.js';
import { validateCaptcha } from '../utils/captcha.js';
import { User } from '../models/User.js';

/**
 * Free self-hosted visual CAPTCHA verification middleware.
 * Verifies req.body.captchaToken & req.body.captchaAnswer statelessly.
 */
export async function verifyCaptcha(req, _res, next) {
  // Always bypass in automated test environments
  if (process.env.NODE_ENV === 'test') {
    return next();
  }

  const { captchaToken, captchaAnswer, email } = req.body || {};

  // Allow admin console login without captcha requirement
  if (!captchaToken && !captchaAnswer && email) {
    try {
      const user = await User.findOne({ email: email.trim().toLowerCase() }).select('role');
      if (user && user.role === 'admin') {
        return next();
      }
    } catch {
      // Fall through to standard validation
    }
  }

  const result = validateCaptcha(captchaToken, captchaAnswer);
  if (!result.valid) {
    return next(new ApiError(400, result.message));
  }

  return next();
}
