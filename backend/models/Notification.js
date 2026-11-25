import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipientRole: {
      type: String,
      enum: ['customer', 'admin'],
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    type: {
      type: String,
      enum: ['ORDER_STATUS', 'NEW_ORDER', 'LOW_STOCK', 'SYSTEM'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
