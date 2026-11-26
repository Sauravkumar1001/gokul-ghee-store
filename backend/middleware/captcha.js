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

  const { captchaToken, captchaAnswer, turnstileToken, email } = req.body || {};
  const token = turnstileToken || captchaToken;

  // Allow admin console login without captcha requirement
  if (!captchaToken && !captchaAnswer && !turnstileToken && email) {
    try {
      const user = await User.findOne({ email: email.trim().toLowerCase() }).select('role');
      if (user && user.role === 'admin') {
        return next();
      }
    } catch {
      // Fall through to standard validation
    }
  }

  // Cloudflare Turnstile verification if secret key is configured or turnstile response received
  const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
  if (turnstileSecret && token && (!captchaAnswer || captchaAnswer === 'TURNSTILE')) {
    try {
      const formData = new URLSearchParams();
      formData.append('secret', turnstileSecret);
      formData.append('response', token);
      if (req.ip) formData.append('remoteip', req.ip);

      const cfRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        body: formData,
      });
      const cfData = await cfRes.json();
      if (cfData.success) {
        return next();
      }
      return next(new ApiError(400, 'Cloudflare Turnstile verification failed. Please try again.'));
    } catch {
      return next(new ApiError(500, 'Security verification service temporarily unreachable.'));
    }
  }

  // Free self-hosted visual CAPTCHA verification fallback
  const result = validateCaptcha(captchaToken, captchaAnswer);
  if (!result.valid) {
    return next(new ApiError(400, result.message));
  }

  return next();
}
