import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    label: {
      type: String,
      trim: true,
      default: 'Home',
    },
    recipientName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    houseNumber: {
      type: String,
      required: true,
      trim: true,
    },
    street: {
      type: String,
      required: true,
      trim: true,
    },
    landmark: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      required: true,
      trim: true,
      default: 'Patna',
    },
    state: {
      type: String,
      required: true,
      trim: true,
      default: 'Bihar',
    },
    pincode: {
      type: String,
      required: true,
      match: /^[1-9][0-9]{5}$/,
      index: true,
    },
    coordinates: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
    formattedAddress: {
      type: String,
      trim: true,
      default: '',
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Address = mongoose.model('Address', addressSchema);
