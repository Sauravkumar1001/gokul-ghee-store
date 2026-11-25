import mongoose from 'mongoose';

export const ORDER_STATUSES = [
  'PLACED',
  'CONFIRMED',
  'PREPARING',
  'READY FOR DISPATCH',
  'SHIPPED',
  'OUT FOR DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'REFUNDED',
];

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: { type: String, required: true },
    variantLabel: { type: String, required: true },
    image: { type: String, default: '' },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: [(v) => Array.isArray(v) && v.length > 0, 'Order must contain items'],
    },
    deliveryAddress: {
      recipientName: { type: String, required: true },
      phone: { type: String, required: true },
      houseNumber: { type: String, required: true },
      street: { type: String, required: true },
      landmark: { type: String, default: '' },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      coordinates: {
        lat: { type: Number, default: null },
        lng: { type: Number, default: null },
      },
    },
    deliveryMeta: {
      zoneName: { type: String, default: '' },
      estimatedDeliveryTime: { type: String, default: '' },
    },
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      discountAmount: { type: Number, default: 0, min: 0 },
      deliveryCharge: { type: Number, default: 0, min: 0 },
      totalAmount: { type: Number, required: true, min: 0 },
      couponCode: { type: String, default: '' },
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'RAZORPAY'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
      index: true,
    },
    paymentDetails: {
      razorpayOrderId: { type: String, default: '', index: true },
      razorpayPaymentId: { type: String, default: '' },
      razorpaySignature: { type: String, default: '' },
      verifiedAt: { type: Date, default: null },
      webhookEventId: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ORDER_STATUSES,
      default: 'PLACED',
      index: true,
    },
    statusHistory: [
      {
        status: { type: String, enum: ORDER_STATUSES, required: true },
        note: { type: String, default: '' },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
      },
    ],
    cancellationReason: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

orderSchema.index({ createdAt: -1 });

export const Order = mongoose.model('Order', orderSchema);
