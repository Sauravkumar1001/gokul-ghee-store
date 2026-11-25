import { Server } from 'socket.io';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';
import { AUTH_COOKIE_NAME, verifyAccessToken } from '../utils/jwt.js';
import { env } from './env.js';

let ioInstance = null;

function parseCookieHeader(cookieHeader = '') {
  const cookies = {};
  if (!cookieHeader) return cookies;

  for (const part of String(cookieHeader).split(';')) {
    const idx = part.indexOf('=');
    if (idx <= 0) continue;
    const key = part.slice(0, idx).trim();
    const val = part.slice(idx + 1).trim();
    try {
      cookies[key] = decodeURIComponent(val);
    } catch {
      cookies[key] = val;
    }
  }
  return cookies;
}

function extractSocketToken(handshake) {
  if (handshake?.auth?.token) {
    return String(handshake.auth.token).trim();
  }
  const authHeader = handshake?.headers?.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookies = parseCookieHeader(handshake?.headers?.cookie || '');
  return cookies[AUTH_COOKIE_NAME] || null;
}

export function initSocketServer(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: env.clientOrigins,
      credentials: true,
    },
  });

  ioInstance.use(async (socket, next) => {
    try {
      const token = extractSocketToken(socket.handshake);
      if (!token) {
        return next(new Error('Authentication required for real-time order stream.'));
      }
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.sub).select('role isActive name email');
      if (!user || !user.isActive) {
        return next(new Error('Account unavailable for real-time order updates.'));
      }
      socket.user = user;
      return next();
    } catch {
      return next(new Error('Invalid authentication token for Socket.IO connection.'));
    }
  });

  ioInstance.on('connection', (socket) => {
    const userId = String(socket.user._id);
    socket.join(`user:${userId}`);

    if (socket.user.role === 'admin') {
      socket.join('admin:orders');
    }

    socket.on('order:subscribe', async (payload = {}, callback) => {
      try {
        const orderId = String(payload.orderId || '').trim();
        if (!orderId) {
          if (typeof callback === 'function') callback({ ok: false, message: 'Order ID missing.' });
          return;
        }
        const order = await Order.findById(orderId).select('user').lean();
        if (!order) {
          if (typeof callback === 'function') callback({ ok: false, message: 'Order not found.' });
          return;
        }
        const isOwner = String(order.user) === userId;
        if (socket.user.role !== 'admin' && !isOwner) {
          if (typeof callback === 'function') callback({ ok: false, message: 'Access denied.' });
          return;
        }
        socket.join(`order:${orderId}`);
        if (typeof callback === 'function') callback({ ok: true, room: `order:${orderId}` });
      } catch {
        if (typeof callback === 'function') callback({ ok: false, message: 'Subscription failed.' });
      }
    });
  });

  return ioInstance;
}

export function getSocketServer() {
  return ioInstance;
}

export function emitOrderLifecycleEvent(eventName, order, extra = {}) {
  if (!ioInstance || !order) return;

  const ownerId = order.user?._id ? String(order.user._id) : String(order.user || '');
  const orderId = String(order._id || '');

  const payload = {
    event: eventName,
    orderId,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    totalAmount: order.pricing?.totalAmount ?? 0,
    statusHistory: order.statusHistory || [],
    updatedAt: order.updatedAt || new Date().toISOString(),
    note: extra.note || '',
  };

  if (ownerId) {
    ioInstance.to(`user:${ownerId}`).emit(eventName, payload);
  }
  if (orderId) {
    ioInstance.to(`order:${orderId}`).emit(eventName, payload);
  }
  ioInstance.to('admin:orders').emit(eventName, payload);
}
