import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { AUTH_COOKIE_NAME, verifyAccessToken } from '../utils/jwt.js';

function extractToken(req) {
  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
    return req.cookies[AUTH_COOKIE_NAME];
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  return null;
}

export async function requireAuth(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return next(new ApiError(401, 'Authentication required. Please sign in.'));
    }

    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);
    if (!user || !user.isActive) {
      return next(new ApiError(401, 'Account is unavailable or session expired.'));
    }

    req.user = user;
    return next();
  } catch {
    return next(new ApiError(401, 'Invalid or expired authentication token.'));
  }
}

export async function optionalAuth(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) return next();
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);
    if (user && user.isActive) {
      req.user = user;
    }
  } catch {
    // Proceed cleanly as guest
  }
  return next();
}

export function requireAdmin(req, _res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'Administrator privileges are required for this action.'));
  }
  return next();
}
