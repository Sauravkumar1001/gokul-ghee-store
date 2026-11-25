import { Router } from 'express';
import {
  getAdminAnalytics,
  getAdminDashboard,
  getAdminUsageMeter,
} from '../controllers/adminAnalyticsController.js';
import {
  adjustInventoryStock,
  createAdminCategory,
  createAdminProduct,
  deleteAdminCategory,
  deleteAdminProduct,
  getAdminInventory,
  listAdminCategories,
  listAdminProducts,
  updateAdminCategory,
  updateAdminProduct,
  uploadAdminImages,
} from '../controllers/adminCatalogController.js';
import {
  createCoupon,
  createDeliveryZone,
  deleteCoupon,
  deleteDeliveryZone,
  getAdminCustomerDetail,
  getAdminOrderDetail,
  getAdminSettings,
  listAdminCustomers,
  listAdminOrders,
  listAdminReviews,
  listCoupons,
  listDeliveryZones,
  moderateReview,
  updateAdminOrderStatus,
  updateAdminSettings,
  updateCoupon,
  updateDeliveryZone,
} from '../controllers/adminOperationsController.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { uploadImage } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import {
  adminCategorySchema,
  adminCouponSchema,
  adminDeliveryZoneSchema,
  adminInventoryAdjustSchema,
  adminOrderStatusSchema,
  adminProductSchema,
  adminReviewModerateSchema,
  adminStoreSettingsSchema,
} from '../validators/adminValidators.js';

const router = Router();

router.use(requireAuth, requireAdmin);

router.get('/dashboard', getAdminDashboard);
router.get('/analytics', getAdminAnalytics);
router.get('/usage-meter', getAdminUsageMeter);

router.post('/upload', uploadImage.array('images', 6), uploadAdminImages);

router.get('/categories', listAdminCategories);
router.post('/categories', validate(adminCategorySchema), createAdminCategory);
router.patch('/categories/:id', validate(adminCategorySchema), updateAdminCategory);
router.delete('/categories/:id', deleteAdminCategory);

router.get('/products', listAdminProducts);
router.post('/products', validate(adminProductSchema), createAdminProduct);
router.patch('/products/:id', validate(adminProductSchema), updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);

router.get('/inventory', getAdminInventory);
router.post('/inventory/adjust', validate(adminInventoryAdjustSchema), adjustInventoryStock);

router.get('/orders', listAdminOrders);
router.get('/orders/:id', getAdminOrderDetail);
router.patch('/orders/:id/status', validate(adminOrderStatusSchema), updateAdminOrderStatus);

router.get('/customers', listAdminCustomers);
router.get('/customers/:id', getAdminCustomerDetail);

router.get('/delivery-zones', listDeliveryZones);
router.post('/delivery-zones', validate(adminDeliveryZoneSchema), createDeliveryZone);
router.patch('/delivery-zones/:id', validate(adminDeliveryZoneSchema), updateDeliveryZone);
router.delete('/delivery-zones/:id', deleteDeliveryZone);

router.get('/coupons', listCoupons);
router.post('/coupons', validate(adminCouponSchema), createCoupon);
router.patch('/coupons/:id', validate(adminCouponSchema), updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

router.get('/reviews', listAdminReviews);
router.patch('/reviews/:id', validate(adminReviewModerateSchema), moderateReview);

router.get('/settings', getAdminSettings);
router.put('/settings', validate(adminStoreSettingsSchema), updateAdminSettings);

export default router;
