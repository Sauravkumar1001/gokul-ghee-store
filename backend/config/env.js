import dotenv from 'dotenv';

dotenv.config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

function getRequiredInProd(name, devFallback = '') {
  const value = process.env[name];
  if (value) return value;
  if (isProduction) {
    throw new Error(`Missing required production environment variable: ${name}`);
  }
  return devFallback;
}

export const env = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT) || 5000,
  mongodbUri: process.env.MONGODB_URI || '',
  clientOrigins: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtAccessSecret: getRequiredInProd(
    'JWT_ACCESS_SECRET',
    'dev-only-insecure-access-secret-replace-before-prod'
  ),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
  cookieSecure: process.env.COOKIE_SECURE === 'true' || isProduction,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  googleMapsServerApiKey: process.env.GOOGLE_MAPS_SERVER_API_KEY || '',
};
