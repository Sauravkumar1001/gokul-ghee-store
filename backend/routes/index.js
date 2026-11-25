import { Router } from 'express';
import adminRoutes from './adminRoutes.js';
import aiRoutes from './aiRoutes.js';
import authRoutes from './authRoutes.js';
import catalogRoutes from './catalogRoutes.js';
import deliveryRoutes from './deliveryRoutes.js';
import healthRoutes from './healthRoutes.js';
import mapsRoutes from './mapsRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import orderRoutes from './orderRoutes.js';
import paymentRoutes from './paymentRoutes.js';
import reviewRoutes from './reviewRoutes.js';
import storeRoutes from './storeRoutes.js';
import userRoutes from './userRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/ai', aiRoutes);
router.use('/maps', mapsRoutes);
router.use('/users', userRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/notifications', notificationRoutes);
router.use('/', catalogRoutes);
router.use('/', deliveryRoutes);
router.use('/', storeRoutes);

export default router;
