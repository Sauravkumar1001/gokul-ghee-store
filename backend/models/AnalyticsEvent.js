import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema(
  {
    eventType: {
      type: String,
      enum: [
        'PAGE_VIEW',
        'PRODUCT_VIEW',
        'ADD_TO_CART',
        'CHECKOUT_START',
        'PURCHASE_COMPLETED',
        'API_REQUEST',
        'API_ERROR',
      ],
      required: true,
      index: true,
    },
    visitorId: {
      type: String,
      default: '',
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    path: {
      type: String,
      default: '',
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
    },
    responseTimeMs: {
      type: Number,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

analyticsEventSchema.index({ createdAt: -1, eventType: 1 });

export const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
