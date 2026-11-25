import { Router } from 'express';
import {
  createAddress,
  deleteAddress,
  getAddresses,
  getWishlist,
  setDefaultAddress,
  toggleWishlistItem,
  updateAddress,
} from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addressSchema } from '../validators/storeValidators.js';

const router = Router();

router.use(requireAuth);

router.get('/addresses', getAddresses);
router.post('/addresses', validate(addressSchema), createAddress);
router.patch('/addresses/:id', validate(addressSchema), updateAddress);
router.patch('/addresses/:id/default', setDefaultAddress);
router.delete('/addresses/:id', deleteAddress);

router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', toggleWishlistItem);

export default router;
