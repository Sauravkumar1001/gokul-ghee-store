import crypto from 'node:crypto';
import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { clearAuthCookie, setAuthCookie, signAccessToken } from '../utils/jwt.js';
import { createCaptcha } from '../utils/captcha.js';

function sanitizeUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    wishlist: user.wishlist || [],
    createdAt: user.createdAt,
  };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email address already exists.');
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    name,
    email,
    phone,
    passwordHash,
    role: 'customer',
  });

  const token = signAccessToken(user);
  setAuthCookie(res, token);

  res.status(201).json({
    success: true,
    user: sanitizeUser(user),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  const passwordMatches = await user.comparePassword(password);
  if (!passwordMatches) {
    throw new ApiError(401, 'Invalid email or password.');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const token = signAccessToken(user);
  setAuthCookie(res, token);

  res.status(200).json({
    success: true,
    user: sanitizeUser(user),
  });
});

export const googleAuth = asyncHandler(async (req, res) => {
  const { credential, email, name } = req.body;

  let resolvedEmail = email;
  let resolvedName = name;

  // Extract email & name if a standard Google ID token (credential) was provided
  if (credential && typeof credential === 'string') {
    try {
      const parts = credential.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
        if (payload.email) {
          resolvedEmail = payload.email.toLowerCase().trim();
          resolvedName = payload.name || payload.given_name || resolvedEmail.split('@')[0];
        }
      }
    } catch {
      // Fallback to explicit fields
    }
  }

  if (!resolvedEmail || typeof resolvedEmail !== 'string') {
    throw new ApiError(400, 'Please provide a valid Google email address.');
  }

  const cleanEmail = resolvedEmail.toLowerCase().trim();

  let user = await User.findOne({ email: cleanEmail });
  if (!user) {
    // Automatically register a new customer account
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await User.hashPassword(randomPassword);

    let finalName = (resolvedName ? resolvedName.trim() : cleanEmail.split('@')[0]) || 'Gokul Customer';
    if (finalName.length < 2) {
      finalName = `${finalName} Customer`;
    }

    user = await User.create({
      name: finalName,
      email: cleanEmail,
      phone: '',
      passwordHash,
      role: 'customer',
      isActive: true,
      lastLoginAt: new Date(),
    });
  } else {
    if (!user.isActive) {
      throw new ApiError(403, 'This account has been deactivated.');
    }
    user.lastLoginAt = new Date();
    await user.save();
  }

  const token = signAccessToken(user);
  setAuthCookie(res, token);

  res.status(200).json({
    success: true,
    user: sanitizeUser(user),
  });
});

export const logout = asyncHandler(async (_req, res) => {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    message: 'Signed out successfully.',
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: sanitizeUser(req.user),
  });
});

export const getCaptcha = asyncHandler(async (_req, res) => {
  const challenge = createCaptcha();
  res.status(200).json({
    success: true,
    ...challenge,
  });
});
