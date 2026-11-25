import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },
    weightGrams: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    categorySlug: {
      type: String,
      required: true,
      index: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    variants: {
      type: [variantSchema],
      validate: [(v) => Array.isArray(v) && v.length > 0, 'At least one variant is required'],
    },
    tags: {
      type: [String],
      default: [],
    },
    highlights: {
      type: [String],
      default: [],
    },
    storageNote: {
      type: String,
      default: '',
    },
    isBestseller: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeaturedGhee: {
      type: Boolean,
      default: false,
      index: true,
    },
    isSpecialOffer: {
      type: Boolean,
      default: false,
    },
    offerBadge: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isSampleData: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', shortDescription: 'text', description: 'text', tags: 'text' });

export const Product = mongoose.model('Product', productSchema);
