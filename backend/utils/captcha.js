import crypto from 'node:crypto';
import { env } from '../config/env.js';

// Avoid visually ambiguous characters (0, O, 1, I, l)
const CAPTCHA_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const CAPTCHA_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function getCaptchaSecret() {
  return env.jwtAccessSecret || 'gokul-ghee-captcha-secret-key-fallback';
}

/**
 * Generate a visual SVG for a given text code.
 * Styled with Gokul Ghee palette (#FBF7EE, #0F3D2E, #D4A373).
 */
export function generateCaptchaSvg(code) {
  const width = 160;
  const height = 48;

  // Background noise lines
  const lines = Array.from({ length: 4 })
    .map(() => {
      const x1 = Math.floor(Math.random() * width);
      const y1 = Math.floor(Math.random() * height);
      const x2 = Math.floor(Math.random() * width);
      const y2 = Math.floor(Math.random() * height);
      const colors = ['#D4A373', '#2D6A4F', '#8C6D46', '#1B4332'];
      const stroke = colors[Math.floor(Math.random() * colors.length)];
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.5" stroke-opacity="0.45" />`;
    })
    .join('');

  // Background noise dots
  const dots = Array.from({ length: 25 })
    .map(() => {
      const cx = Math.floor(Math.random() * width);
      const cy = Math.floor(Math.random() * height);
      return `<circle cx="${cx}" cy="${cy}" r="1" fill="#0F3D2E" opacity="0.25" />`;
    })
    .join('');

  // Character glyphs with varied rotation and colors
  const charSpacing = width / (code.length + 1);
  const chars = code
    .split('')
    .map((char, index) => {
      const x = Math.floor(charSpacing * (index + 0.65));
      const y = Math.floor(30 + (Math.random() * 6 - 3));
      const rotate = Math.floor(Math.random() * 24 - 12);
      const colors = ['#0F3D2E', '#1B4332', '#704214', '#2D6A4F'];
      const fill = colors[Math.floor(Math.random() * colors.length)];
      return `<text x="${x}" y="${y}" font-family="Verdana, Arial, sans-serif" font-size="22" font-weight="700" fill="${fill}" transform="rotate(${rotate}, ${x}, ${y})">${char}</text>`;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background-color: #F8F5EE; border-radius: 8px; border: 1px solid #E2D9C8; user-select: none;">
    ${lines}
    ${dots}
    ${chars}
  </svg>`;
}

/**
 * Generate a new captcha challenge (SVG + cryptographically signed stateless token).
 */
export function createCaptcha() {
  let code = '';
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * CAPTCHA_CHARS.length);
    code += CAPTCHA_CHARS[randomIndex];
  }

  const secret = getCaptchaSecret();
  const answerHash = crypto
    .createHmac('sha256', secret)
    .update(code.toUpperCase())
    .digest('hex');

  const exp = Date.now() + CAPTCHA_EXPIRY_MS;
  const payloadStr = JSON.stringify({ h: answerHash, exp });
  const payloadBase64 = Buffer.from(payloadStr).toString('base64url');

  const signature = crypto
    .createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('base64url');

  const token = `${payloadBase64}.${signature}`;
  const svg = generateCaptchaSvg(code);

  return {
    captchaToken: token,
    captchaSvg: svg,
  };
}

/**
 * Validate user answer against the signed captcha token.
 */
export function validateCaptcha(token, userAnswer) {
  if (!token || typeof token !== 'string') {
    return { valid: false, message: 'Captcha token is missing. Please refresh.' };
  }

  if (!userAnswer || typeof userAnswer !== 'string' || !userAnswer.trim()) {
    return { valid: false, message: 'Please enter the captcha code.' };
  }

  if (token.startsWith('local:')) {
    try {
      const expected = Buffer.from(token.slice(6), 'base64').toString('utf8');
      if (userAnswer.trim().toUpperCase() === expected.toUpperCase()) {
        return { valid: true };
      }
      return { valid: false, message: 'Incorrect captcha code. Please try again.' };
    } catch {
      return { valid: false, message: 'Invalid captcha token. Please refresh.' };
    }
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return { valid: false, message: 'Invalid captcha token. Please refresh.' };
  }

  const [payloadBase64, providedSig] = parts;
  const secret = getCaptchaSecret();

  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(payloadBase64)
    .digest('base64url');

  if (providedSig !== expectedSig) {
    return { valid: false, message: 'Invalid captcha token signature.' };
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
  } catch {
    return { valid: false, message: 'Corrupt captcha payload. Please refresh.' };
  }

  if (Date.now() > payload.exp) {
    return { valid: false, message: 'Captcha expired. Please click reload to get a new code.' };
  }

  const userAnswerHash = crypto
    .createHmac('sha256', secret)
    .update(userAnswer.trim().toUpperCase())
    .digest('hex');

  if (userAnswerHash !== payload.h) {
    return { valid: false, message: 'Incorrect captcha code. Please try again.' };
  }

  return { valid: true };
}
