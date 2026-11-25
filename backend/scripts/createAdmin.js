import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { User } from '../models/User.js';

async function createAdmin() {
  const email = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || '';
  const name = (process.env.ADMIN_NAME || 'Store Owner').trim();
  const phone = (process.env.ADMIN_PHONE || '+91 89863 65592').trim();

  if (!email || password.length < 10) {
    console.error(
      'Usage: Set ADMIN_EMAIL and ADMIN_PASSWORD (min 10 characters) in environment before running create-admin.'
    );
    process.exit(1);
  }

  await connectDatabase();

  const passwordHash = await User.hashPassword(password);
  const existing = await User.findOne({ email });

  if (existing) {
    existing.name = name;
    existing.phone = phone;
    existing.passwordHash = passwordHash;
    existing.role = 'admin';
    existing.isActive = true;
    await existing.save();
    console.log(`Updated existing admin account for ${email}.`);
  } else {
    await User.create({
      name,
      email,
      phone,
      passwordHash,
      role: 'admin',
      isActive: true,
    });
    console.log(`Created new admin account for ${email}.`);
  }

  await mongoose.disconnect();
}

createAdmin().catch((err) => {
  console.error('Admin creation failed:', err.message);
  process.exit(1);
});
