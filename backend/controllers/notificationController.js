import { Notification } from '../models/Notification.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMyNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    recipientRole: 'customer',
    user: req.user._id,
  })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean();

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  res.status(200).json({
    success: true,
    notifications,
    unreadCount,
  });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const updated = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipientRole: 'customer', user: req.user._id },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!updated) {
    throw new ApiError(404, 'Notification not found.');
  }

  res.status(200).json({
    success: true,
    notification: updated,
  });
});
