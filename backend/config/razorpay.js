import crypto from 'node:crypto';
import Razorpay from 'razorpay';
import { env } from './env.js';
import { ApiError } from '../utils/ApiError.js';

let cachedClient = null;

export function isRazorpayConfigured() {
  return Boolean(env.razorpay.keyId && env.razorpay.keySecret);
}

export function getRazorpayClient() {
  if (!isRazorpayConfigured()) {
    throw new ApiError(
      503,
      'Online payments via Razorpay are not configured yet. Please select Cash on Delivery or configure Razorpay API keys on the server.'
    );
  }
  if (!cachedClient) {
    cachedClient = new Razorpay({
      key_id: env.razorpay.keyId,
      key_secret: env.razorpay.keySecret,
    });
  }
  return cachedClient;
}

function safeHexCompare(expectedHex, providedHex) {
  if (!expectedHex || !providedHex || expectedHex.length !== providedHex.length) {
    return false;
  }
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedHex, 'hex'),
      Buffer.from(providedHex, 'hex')
    );
  } catch {
    return false;
  }
}

export function verifyRazorpayPaymentSignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}) {
  if (!env.razorpay.keySecret) {
    throw new ApiError(503, 'Razorpay key secret is not configured on this server.');
  }
  const expected = crypto
    .createHmac('sha256', env.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  return safeHexCompare(expected, String(razorpaySignature || '').trim().toLowerCase());
}

export function verifyRazorpayWebhookSignature(rawBody, providedSignature) {
  if (!env.razorpay.webhookSecret || !rawBody || !providedSignature) {
    return false;
  }
  const expected = crypto
    .createHmac('sha256', env.razorpay.webhookSecret)
    .update(rawBody)
    .digest('hex');

  return safeHexCompare(expected, String(providedSignature || '').trim().toLowerCase());
}
