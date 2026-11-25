import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { AnalyticsEvent } from '../models/AnalyticsEvent.js';

const MAX_SAMPLES = 500;
const recentSamples = [];
let totalTrackedRequests = 0;
let totalTrackedErrors = 0;

export function getSystemTelemetrySnapshot() {
  const count = recentSamples.length;
  const avgResponseMs =
    count > 0
      ? Math.round(
          recentSamples.reduce((sum, entry) => sum + entry.durationMs, 0) / count
        )
      : 0;
  const maxResponseMs =
    count > 0 ? Math.max(...recentSamples.map((entry) => entry.durationMs)) : 0;

  return {
    sampleWindowSize: count,
    totalTrackedRequests,
    totalTrackedErrors,
    avgResponseMs,
    maxResponseMs,
    recentErrors: recentSamples
      .filter((entry) => entry.statusCode >= 500)
      .slice(-10)
      .reverse(),
  };
}

export function telemetryMiddleware(req, res, next) {
  if (!req.path.startsWith('/api')) {
    return next();
  }

  const startNs = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Math.max(
      1,
      Math.round(Number(process.hrtime.bigint() - startNs) / 1e6)
    );
    const statusCode = res.statusCode;

    totalTrackedRequests += 1;
    if (statusCode >= 500) {
      totalTrackedErrors += 1;
    }

    recentSamples.push({
      path: req.originalUrl || req.path,
      method: req.method,
      statusCode,
      durationMs,
      recordedAt: new Date().toISOString(),
    });
    if (recentSamples.length > MAX_SAMPLES) {
      recentSamples.shift();
    }

    const skipDbLog =
      env.nodeEnv === 'test' ||
      mongoose.connection.readyState !== 1 ||
      req.path.includes('/health') ||
      req.path.includes('/analytics/events');

    if (!skipDbLog) {
      const eventType = statusCode >= 500 ? 'API_ERROR' : 'API_REQUEST';
      AnalyticsEvent.create({
        eventType,
        path: req.originalUrl || req.path,
        user: req.user ? req.user._id : null,
        responseTimeMs: durationMs,
        metadata: {
          method: req.method,
          statusCode,
        },
      }).catch(() => {});
    }
  });

  return next();
}
