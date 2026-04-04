import { randomBytes } from 'node:crypto';
import sharp from 'sharp';

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_IMAGE_BYTES = 6 * 1024 * 1024;

export function assertSafeImageFile(file: File) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Only JPG, PNG, and WebP images are allowed.');
  }

  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('Each image must be 6MB or smaller.');
  }
}

export function createUploadToken(prefix = 'upload') {
  return `${prefix}-${Date.now()}-${randomBytes(4).toString('hex')}`;
}

export async function normalizeUploadedImage(file: File, options?: { width?: number; height?: number }) {
  assertSafeImageFile(file);

  const input = Buffer.from(await file.arrayBuffer());
  const output = await sharp(input)
    .rotate()
    .resize(options?.width || 1200, options?.height || 1500, {
      fit: 'cover',
      position: 'centre',
    })
    .webp({ quality: 82 })
    .toBuffer();

  return {
    fileName: `${createUploadToken('image')}.webp`,
    mimeType: 'image/webp',
    buffer: output,
  };
}
