import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import {
  Category,
  Coupon,
  DeliveryZone,
  Inventory,
  Product,
  StoreSettings,
} from '../models/index.js';
import { DEFAULT_STORE_SETTINGS } from '../controllers/storeController.js';
import {
  SEED_CATEGORIES,
  SEED_COUPONS,
  SEED_DELIVERY_ZONES,
  SEED_PRODUCTS,
} from '../data/seedCatalogData.js';

async function seedDatabase() {
  await connectDatabase();
  console.log('Connected to MongoDB. Seeding official store settings & sample catalog...');

  await StoreSettings.findOneAndUpdate(
    { singletonKey: 'PRIMARY_STORE' },
    { $setOnInsert: { singletonKey: 'PRIMARY_STORE', ...DEFAULT_STORE_SETTINGS } },
    { upsert: true, new: true }
  );

  const categoryMap = new Map();
  for (const catData of SEED_CATEGORIES) {
    const category = await Category.findOneAndUpdate(
      { slug: catData.slug },
      { $setOnInsert: catData },
      { upsert: true, new: true }
    );
    categoryMap.set(category.slug, category);
  }

  let createdProducts = 0;
  for (const prodData of SEED_PRODUCTS) {
    const categoryDoc = categoryMap.get(prodData.categorySlug);
    if (!categoryDoc) continue;

    const existing = await Product.findOne({ slug: prodData.slug });
    if (existing) continue;

    const product = await Product.create({
      ...prodData,
      category: categoryDoc._id,
    });
    createdProducts += 1;

    for (const variant of product.variants) {
      await Inventory.create({
        product: product._id,
        variantId: variant._id,
        variantLabel: variant.label,
        changeType: 'INITIAL_SEED',
        delta: variant.stock,
        stockAfter: variant.stock,
        note: 'Initial sample seed inventory',
      });
    }
  }

  for (const zoneData of SEED_DELIVERY_ZONES) {
    await DeliveryZone.findOneAndUpdate(
      { pincode: zoneData.pincode },
      { $setOnInsert: zoneData },
      { upsert: true, new: true }
    );
  }

  for (const couponData of SEED_COUPONS) {
    await Coupon.findOneAndUpdate(
      { code: couponData.code },
      { $setOnInsert: couponData },
      { upsert: true, new: true }
    );
  }

  console.log(
    `Seed complete: ${categoryMap.size} categories, ${createdProducts} new sample products, ${SEED_DELIVERY_ZONES.length} delivery zones, ${SEED_COUPONS.length} sample coupon verified.`
  );
  await mongoose.disconnect();
}

seedDatabase().catch((err) => {
  console.error('Database seed failed:', err.message);
  process.exit(1);
});
