import { getDatabaseStatus } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getHealth = asyncHandler(async (_req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: 'gokul-ghee-api',
    uptimeSeconds: Math.round(process.uptime()),
    database: getDatabaseStatus(),
    timestamp: new Date().toISOString(),
  });
});
