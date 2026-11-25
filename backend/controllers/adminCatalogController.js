import mongoose from 'mongoose';
import {
  isCloudinaryConfigured,
  uploadBufferToCloudinary,
} from '../config/cloudinary.js';
import { Category } from '../models/Category.js';
import { Inventory } from '../models/Inventory.js';
import { Product } from '../models/Product.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function slugifyText(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const uploadAdminImages = asyncHandler(async (req, res) => {
  if (!isCloudinaryConfigured()) {
    throw new ApiError(
      503,
      'Cloudinary credentials are not configured in backend/.env. You can still enter verified /images/... URLs or configure Cloudinary keys.'
    );
  }

  const files = req.files || [];
  if (!Array.isArray(files) || files.length === 0) {
    throw new ApiError(400, 'Please select at least one JPEG, PNG, or WebP image file.');
  }

  const uploaded = await Promise.all(
    files.map((file) => uploadBufferToCloudinary(file.buffer, 'gokul-ghee/products'))
  );

  res.status(201).json({
    success: true,
    images: uploaded,
  });
});

export const listAdminCategories = asyncHandler(async (_req, res) => {
  const [categories, counts] = await Promise.all([
    Category.find().sort({ displayOrder: 1, name: 1 }).lean(),
    Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
  ]);

  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  const enriched = categories.map((cat) => ({
    ...cat,
    productCount: countMap.get(String(cat._id)) || 0,
  }));

  res.status(200).json({
    success: true,
    categories: enriched,
  });
});

export const createAdminCategory = asyncHandler(async (req, res) => {
  const payload = { ...req.body };
  const slug = slugifyText(payload.slug || payload.name);
  if (!slug) {
    throw new ApiError(400, 'Valid category slug could not be derived from name.');
  }

  const existing = await Category.findOne({ $or: [{ slug }, { name: payload.name }] });
  if (existing) {
    throw new ApiError(409, `A category named "${existing.name}" already exists.`);
  }

  const category = await Category.create({ ...payload, slug });
  res.status(201).json({ success: true, category });
});

export const updateAdminCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }

  const payload = { ...req.body };
  const nextSlug = slugifyText(payload.slug || payload.name || category.slug);
  if (!nextSlug) {
    throw new ApiError(400, 'Category slug cannot be empty.');
  }

  const collision = await Category.findOne({
    slug: nextSlug,
    _id: { $ne: category._id },
  });
  if (collision) {
    throw new ApiError(409, `Slug "${nextSlug}" is already assigned to another category.`);
  }

  Object.assign(category, payload, { slug: nextSlug });
  await category.save();

  await Product.updateMany(
    { category: category._id },
    { $set: { categoryName: category.name, categorySlug: category.slug } }
  );

  res.status(200).json({ success: true, category });
});

export const deleteAdminCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, 'Category not found.');
  }

  const linkedProducts = await Product.countDocuments({ category: category._id });
  if (linkedProducts > 0) {
    throw new ApiError(
      409,
      `Cannot delete category "${category.name}" while ${linkedProducts} product(s) still belong to it. Reassign or deactivate them first.`
    );
  }

  await category.deleteOne();
  res.status(200).json({ success: true, message: 'Category deleted cleanly.' });
});

export const listAdminProducts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.q) {
    const safeRegex = new RegExp(
      String(req.query.q).trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'i'
    );
    filter.$or = [{ name: safeRegex }, { slug: safeRegex }, { 'variants.sku': safeRegex }];
  }
  if (req.query.category) {
    filter.categorySlug = String(req.query.category).trim().toLowerCase();
  }
  if (req.query.active === 'true') filter.isActive = true;
  if (req.query.active === 'false') filter.isActive = false;

  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();

  res.status(200).json({
    success: true,
    products,
  });
});

export const createAdminProduct = asyncHandler(async (req, res) => {
  const { categoryId, slug: rawSlug, ...rest } = req.body;
  if (!mongoose.isValidObjectId(categoryId)) {
    throw new ApiError(400, 'Invalid category ID.');
  }

  const category = await Category.findById(categoryId).lean();
  if (!category) {
    throw new ApiError(404, 'Selected category does not exist.');
  }

  const slug = slugifyText(rawSlug || rest.name);
  if (!slug) {
    throw new ApiError(400, 'Product slug cannot be empty.');
  }

  const existing = await Product.findOne({ slug });
  if (existing) {
    throw new ApiError(409, `A product with slug "${slug}" already exists.`);
  }

  const product = await Product.create({
    ...rest,
    slug,
    category: category._id,
    categorySlug: category.slug,
    categoryName: category.name,
  });

  for (const variant of product.variants) {
    if (variant.stock > 0) {
      await Inventory.create({
        product: product._id,
        variantId: variant._id,
        variantLabel: variant.label,
        changeType: 'ADMIN_ADJUSTMENT',
        delta: variant.stock,
        stockAfter: variant.stock,
        note: `Initial stock on product creation (${product.name})`,
        actor: req.user._id,
      });
    }
  }

  res.status(201).json({ success: true, product });
});

export const updateAdminProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  const { categoryId, slug: rawSlug, variants: nextVariants, ...rest } = req.body;
  if (!mongoose.isValidObjectId(categoryId)) {
    throw new ApiError(400, 'Invalid category ID.');
  }

  const category = await Category.findById(categoryId).lean();
  if (!category) {
    throw new ApiError(404, 'Selected category does not exist.');
  }

  const slug = slugifyText(rawSlug || rest.name || product.slug);
  const slugConflict = await Product.findOne({ slug, _id: { $ne: product._id } });
  if (slugConflict) {
    throw new ApiError(409, `Slug "${slug}" is already used by another product.`);
  }

  const prevStockMap = new Map(
    (product.variants || []).map((v) => [String(v._id), v.stock])
  );

  Object.assign(product, {
    ...rest,
    slug,
    category: category._id,
    categorySlug: category.slug,
    categoryName: category.name,
    variants: nextVariants.map((v) =>
      v._id && mongoose.isValidObjectId(v._id)
        ? { ...v, _id: new mongoose.Types.ObjectId(v._id) }
        : v
    ),
  });

  await product.save();

  for (const variant of product.variants) {
    const prevStock = prevStockMap.get(String(variant._id));
    const delta =
      prevStock === undefined ? variant.stock : variant.stock - prevStock;
    if (delta !== 0) {
      await Inventory.create({
        product: product._id,
        variantId: variant._id,
        variantLabel: variant.label,
        changeType: 'ADMIN_ADJUSTMENT',
        delta,
        stockAfter: variant.stock,
        note: `Updated via product editor (${product.name})`,
        actor: req.user._id,
      });
    }
  }

  res.status(200).json({ success: true, product });
});

export const deleteAdminProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  res.status(200).json({
    success: true,
    message: `Product "${product.name}" removed from catalog.`,
  });
});

export const getAdminInventory = asyncHandler(async (_req, res) => {
  const [products, movements] = await Promise.all([
    Product.find()
      .sort({ name: 1 })
      .select('name slug categoryName isActive variants')
      .lean(),
    Inventory.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('product', 'name slug')
      .populate('actor', 'name role')
      .lean(),
  ]);

  const rows = [];
  const lowStockAlerts = [];

  for (const prod of products) {
    for (const v of prod.variants || []) {
      const threshold = v.lowStockThreshold ?? 5;
      const isLow = v.stock <= threshold;
      const row = {
        productId: String(prod._id),
        productName: prod.name,
        slug: prod.slug,
        categoryName: prod.categoryName,
        productActive: prod.isActive,
        variantId: String(v._id),
        sku: v.sku,
        variantLabel: v.label,
        price: v.price,
        stock: v.stock,
        lowStockThreshold: threshold,
        isLowStock: isLow,
        isOutOfStock: v.stock === 0,
      };
      rows.push(row);
      if (isLow) lowStockAlerts.push(row);
    }
  }

  res.status(200).json({
    success: true,
    inventoryRows: rows,
    lowStockAlerts,
    movements,
  });
});

export const adjustInventoryStock = asyncHandler(async (req, res) => {
  const { productId, variantId, delta, note } = req.body;
  if (!mongoose.isValidObjectId(productId) || !mongoose.isValidObjectId(variantId)) {
    throw new ApiError(400, 'Valid product and variant IDs are required.');
  }

  const filter = {
    _id: new mongoose.Types.ObjectId(productId),
    variants: {
      $elemMatch: {
        _id: new mongoose.Types.ObjectId(variantId),
        ...(delta < 0 ? { stock: { $gte: Math.abs(delta) } } : {}),
      },
    },
  };

  const updated = await Product.findOneAndUpdate(
    filter,
    { $inc: { 'variants.$.stock': delta } },
    { new: true }
  );

  if (!updated) {
    throw new ApiError(
      409,
      'Variant not found or adjustment would drop stock below zero.'
    );
  }

  const targetVariant = (updated.variants || []).find(
    (v) => String(v._id) === String(variantId)
  );

  const ledgerEntry = await Inventory.create({
    product: updated._id,
    variantId: targetVariant._id,
    variantLabel: targetVariant.label,
    changeType: 'ADMIN_ADJUSTMENT',
    delta,
    stockAfter: targetVariant.stock,
    note,
    actor: req.user._id,
  });

  res.status(200).json({
    success: true,
    message: `Stock updated to ${targetVariant.stock} for ${updated.name} (${targetVariant.label}).`,
    variant: targetVariant,
    movement: ledgerEntry,
  });
});
