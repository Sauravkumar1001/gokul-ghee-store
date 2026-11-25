import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.VITE_API_BASE_URL
    ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/api\/v1\/?$/, '')
    : 'http://localhost:5000');

let socketInstance = null;

export function getOrderSocket() {
  if (typeof window === 'undefined' || import.meta.env.MODE === 'test') {
    return null;
  }

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    });
  }
  return socketInstance;
}

export function disconnectOrderSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export function subscribeToOrderEvents({
  enabled = true,
  orderId = null,
  onOrderUpdated,
  onOrderCreated,
  socketFactory = getOrderSocket,
} = {}) {
  if (!enabled) {
    return () => {};
  }

  const socket = socketFactory();
  if (!socket) {
    return () => {};
  }

  if (!socket.connected && typeof socket.connect === 'function') {
    socket.connect();
  }

  const handleConnect = () => {
    if (orderId) {
      socket.emit('order:subscribe', { orderId });
    }
  };

  if (orderId && socket.connected) {
    socket.emit('order:subscribe', { orderId });
  }

  socket.on('connect', handleConnect);
  if (onOrderUpdated) socket.on('order:updated', onOrderUpdated);
  if (onOrderCreated) socket.on('order:created', onOrderCreated);

  return () => {
    socket.off('connect', handleConnect);
    if (onOrderUpdated) socket.off('order:updated', onOrderUpdated);
    if (onOrderCreated) socket.off('order:created', onOrderCreated);
  };
}
