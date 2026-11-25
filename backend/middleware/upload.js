import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_IMAGE_SIZE_BYTES,
    files: 6,
  },
  fileFilter(_req, file, cb) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(new ApiError(400, 'Only JPEG, PNG, and WebP image files are permitted.'));
    }
    return cb(null, true);
  },
});
