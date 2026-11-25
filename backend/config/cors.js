import { env } from './env.js';

export const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients (Postman, server health probes) when origin is absent
    if (!origin) return callback(null, true);
    if (env.clientOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (env.nodeEnv !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
