import { describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import {
  Address,
  DeliveryZone,
  Order,
  ORDER_STATUSES,
  Product,
  StoreSettings,
  User,
} from '../models/index.js';

describe('Mongoose Schema Validation & Business Invariants', () => {
  it('hashes and verifies user passwords via bcryptjs', async () => {
    const hash = await User.hashPassword('StrongPass!2026');
    const user = new User({
      name: 'Customer Test',
      email: 'customer@example.com',
      phone: '+91 9876543210',
      passwordHash: hash,
      role: 'customer',
    });

    await expect(user.validate()).resolves.toBeUndefined();
    expect(await user.comparePassword('StrongPass!2026')).toBe(true);
    expect(await user.comparePassword('WrongPassword')).toBe(false);
  });

  it('requires at least one product variant and valid stock/price numbers', async () => {
    const product = new Product({
      name: 'Test Ghee',
      slug: 'test-ghee',
      category: new mongoose.Types.ObjectId(),
      categorySlug: 'desi-ghee',
      categoryName: 'Desi Ghee',
      shortDescription: 'Short',
      description: 'Detailed description',
      variants: [],
    });

    await expect(product.validate()).rejects.toThrow(/At least one variant is required/i);

    product.variants.push({
      sku: 'SKU-1',
      label: '500g',
      weightGrams: 500,
      price: 600,
      mrp: 650,
      stock: 10,
    });
    await expect(product.validate()).resolves.toBeUndefined();
  });

  it('enforces valid 6-digit Indian pincodes on Address and DeliveryZone', async () => {
    const badAddress = new Address({
      user: new mongoose.Types.ObjectId(),
      recipientName: 'Anil Test',
      phone: '+91 89863 65592',
      houseNumber: '12',
      street: 'Math Road',
      pincode: '1234',
    });
    await expect(badAddress.validate()).rejects.toThrow();

    const goodZone = new DeliveryZone({
      pincode: '801503',
      areaName: 'Anand Bazar, Danapur',
      deliveryCharge: 30,
      minimumOrderValue: 200,
      estimatedDeliveryTime: '45-60 mins',
    });
    await expect(goodZone.validate()).resolves.toBeUndefined();
  });

  it('supports complete 9-state Order lifecycle and default StoreSettings', async () => {
    expect(ORDER_STATUSES).toEqual([
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'READY FOR DISPATCH',
      'SHIPPED',
      'OUT FOR DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'REFUNDED',
    ]);

    const order = new Order({
      orderNumber: 'GG-2026-0001',
      user: new mongoose.Types.ObjectId(),
      items: [
        {
          product: new mongoose.Types.ObjectId(),
          variantId: new mongoose.Types.ObjectId(),
          name: 'Sample Ghee',
          variantLabel: '500g',
          unitPrice: 620,
          quantity: 1,
          lineTotal: 620,
        },
      ],
      deliveryAddress: {
        recipientName: 'Customer',
        phone: '+91 9876543210',
        houseNumber: '4B',
        street: 'Anand Bazar',
        city: 'Patna',
        state: 'Bihar',
        pincode: '801503',
      },
      pricing: { subtotal: 620, deliveryCharge: 30, totalAmount: 650 },
      paymentMethod: 'COD',
      status: 'PREPARING',
    });
    await expect(order.validate()).resolves.toBeUndefined();

    const defaults = new StoreSettings();
    expect(defaults.businessName).toBe('Anil Ji Ka Gokul Ghee');
    expect(defaults.googleMapsPlaceId).toBe('ChIJ53Oz9XZX7TkRW_5zLDQrlaI');
  });
});
