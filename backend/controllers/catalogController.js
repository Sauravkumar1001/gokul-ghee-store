import { Category } from '../models/Category.js';
import { Product } from '../models/Product.js';
import { Review } from '../models/Review.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find({ isActive: true })
    .sort({ displayOrder: 1, name: 1 })
    .lean();

  res.status(200).json({
    success: true,
    categories,
  });
});

export const listProducts = asyncHandler(async (req, res) => {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    sort = 'featured',
    bestseller,
    page = '1',
    limit = '12',
  } = req.query;

  const filter = { isActive: true };

  if (category && category !== 'all') {
    filter.categorySlug = String(category).toLowerCase();
  }

  if (bestseller === 'true') {
    filter.isBestseller = true;
  }

  if (search && String(search).trim()) {
    const escaped = String(search)
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'i');
    filter.$or = [
      { name: regex },
      { shortDescription: regex },
      { description: regex },
      { categoryName: regex },
      { tags: regex },
    ];
  }

  const parsedMin = minPrice !== undefined ? Number(minPrice) : null;
  const parsedMax = maxPrice !== undefined ? Number(maxPrice) : null;
  if ((parsedMin !== null && !Number.isNaN(parsedMin)) || (parsedMax !== null && !Number.isNaN(parsedMax))) {
    filter['variants.0.price'] = {};
    if (parsedMin !== null && !Number.isNaN(parsedMin)) {
      filter['variants.0.price'].$gte = parsedMin;
    }
    if (parsedMax !== null && !Number.isNaN(parsedMax)) {
      filter['variants.0.price'].$lte = parsedMax;
    }
  }

  let sortStage = { isBestseller: -1, createdAt: -1 };
  if (sort === 'price-asc') {
    sortStage = { 'variants.0.price': 1 };
  } else if (sort === 'price-desc') {
    sortStage = { 'variants.0.price': -1 };
  } else if (sort === 'name-asc') {
    sortStage = { name: 1 };
  }

  const pageNum = Math.max(1, Number.parseInt(page, 10) || 1);
  const limitNum = Math.min(48, Math.max(1, Number.parseInt(limit, 10) || 12));
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortStage).skip(skip).limit(limitNum).lean(),
    Product.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.max(1, Math.ceil(total / limitNum)),
    },
  });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    slug: String(req.params.slug).toLowerCase(),
    isActive: true,
  }).lean();

  if (!product) {
    throw new ApiError(404, 'Product not found.');
  }

  const [reviews, relatedProducts] = await Promise.all([
    Review.find({ product: product._id, status: 'approved' })
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean(),
    Product.find({
      _id: { $ne: product._id },
      categorySlug: product.categorySlug,
      isActive: true,
    })
      .limit(3)
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    product,
    reviews,
    relatedProducts,
  });
});
