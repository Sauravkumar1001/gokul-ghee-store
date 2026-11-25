import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

export function isCloudinaryConfigured() {
  return Boolean(
    env.cloudinary.cloudName && env.cloudinary.apiKey && env.cloudinary.apiSecret
  );
}

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

export function uploadBufferToCloudinary(buffer, folder = 'gokul-ghee/products') {
  if (!isCloudinaryConfigured()) {
    return Promise.reject(
      new Error('Cloudinary credentials are not configured in backend environment.')
    );
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) return reject(error);
        return resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format,
        });
      }
    );

    stream.end(buffer);
  });
}

export { cloudinary };
