import { Router } from 'express';
import {
  cancelOrder,
  createOrder,
  getCheckoutQuote,
  getMyOrders,
  getOrderById,
} from '../controllers/orderController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  cancelOrderSchema,
  checkoutQuoteSchema,
  placeOrderSchema,
} from '../validators/orderValidators.js';

const router = Router();

router.post('/quote', validate(checkoutQuoteSchema), getCheckoutQuote);

router.use(requireAuth);
router.get('/my', getMyOrders);
router.get('/', getMyOrders);
router.post('/', validate(placeOrderSchema), createOrder);
router.get('/:id', getOrderById);
router.post('/:id/cancel', validate(cancelOrderSchema), cancelOrder);

export default router;
