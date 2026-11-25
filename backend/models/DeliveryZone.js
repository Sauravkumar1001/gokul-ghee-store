import mongoose from 'mongoose';

const deliveryZoneSchema = new mongoose.Schema(
  {
    pincode: {
      type: String,
      required: true,
      unique: true,
      match: /^[1-9][0-9]{5}$/,
    },
    areaName: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
      default: 'Patna',
    },
    deliveryCharge: {
      type: Number,
      required: true,
      min: 0,
    },
    freeDeliveryAbove: {
      type: Number,
      default: null,
      min: 0,
    },
    minimumOrderValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    estimatedDeliveryTime: {
      type: String,
      required: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const DeliveryZone = mongoose.model('DeliveryZone', deliveryZoneSchema);
