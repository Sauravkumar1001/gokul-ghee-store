import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    variantLabel: {
      type: String,
      required: true,
    },
    changeType: {
      type: String,
      enum: [
        'INITIAL_SEED',
        'ORDER_RESERVATION',
        'ORDER_CANCEL_RESTORE',
        'ADMIN_ADJUSTMENT',
      ],
      required: true,
    },
    delta: {
      type: Number,
      required: true,
    },
    stockAfter: {
      type: Number,
      required: true,
      min: 0,
    },
    referenceId: {
      type: String,
      default: '',
    },
    note: {
      type: String,
      default: '',
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

inventorySchema.index({ createdAt: -1 });

export const Inventory = mongoose.model('Inventory', inventorySchema);
