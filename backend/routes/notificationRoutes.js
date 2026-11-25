import { Router } from 'express';
import {
  getMyNotifications,
  markNotificationRead,
} from '../controllers/notificationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);
router.get('/', getMyNotifications);
router.patch('/:id/read', markNotificationRead);

export default router;
