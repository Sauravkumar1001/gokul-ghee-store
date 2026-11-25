import mongoose from 'mongoose';

const aiUsageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      default: '',
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    model: {
      type: String,
      required: true,
    },
    promptSnippet: {
      type: String,
      default: '',
    },
    inputTokens: {
      type: Number,
      default: 0,
      min: 0,
    },
    outputTokens: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedCostUsd: {
      type: Number,
      default: 0,
      min: 0,
    },
    latencyMs: {
      type: Number,
      default: 0,
      min: 0,
    },
    success: {
      type: Boolean,
      required: true,
      index: true,
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

aiUsageSchema.index({ createdAt: -1 });

export const AIUsage = mongoose.model('AIUsage', aiUsageSchema);
