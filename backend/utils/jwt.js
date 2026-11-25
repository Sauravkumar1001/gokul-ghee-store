import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const AUTH_COOKIE_NAME = 'gokul_access_token';

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      role: user.role,
    },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn }
  );
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function setAuthCookie(res, token) {
  res.cookie(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.isProduction ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: '/',
  });
}
