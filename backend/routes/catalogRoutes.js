import { Router } from 'express';
import {
  getProductBySlug,
  listCategories,
  listProducts,
} from '../controllers/catalogController.js';

const router = Router();

router.get('/categories', listCategories);
router.get('/products', listProducts);
router.get('/products/:slug', getProductBySlug);

export default router;
