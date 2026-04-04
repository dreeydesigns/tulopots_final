import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin';
import { getSafeErrorMessage, jsonError } from '@/lib/security/errors';
import { enforceRateLimit, getRequestIp } from '@/lib/security/rate-limit';
import { normalizeUploadedImage } from '@/lib/security/uploads';
import { recordSecurityEvent } from '@/lib/security/audit';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const adminUser = await requireAdminUser('products.manage');

  if (!adminUser) {
    return jsonError('Unauthorized', 401);
  }

  const ip = getRequestIp(request);

  try {
    const rateLimit = await enforceRateLimit({
      key: `${adminUser.id}:${ip}`,
      route: '/api/admin/uploads/product-images',
      limit: 12,
      windowMs: 60 * 1000,
      userId: adminUser.id,
      ip,
    });

    if (!rateLimit.allowed) {
      return jsonError(
        'Too many image uploads were attempted. Please wait a moment and try again.',
        429,
        { retryAfter: rateLimit.retryAfterSeconds }
      );
    }

    const formData = await request.formData();
    const files = formData
      .getAll('files')
      .filter((entry): entry is File => entry instanceof File);

    if (!files.length) {
      return jsonError('Select at least one image to upload.', 400);
    }

    if (files.length > 8) {
      return jsonError('Upload up to 8 images at a time.', 400);
    }

    const images = await Promise.all(
      files.map(async (file) => {
        const normalized = await normalizeUploadedImage(file, {
          width: 1200,
          height: 1500,
        });

        return {
          name: normalized.fileName,
          url: `data:${normalized.mimeType};base64,${normalized.buffer.toString('base64')}`,
        };
      })
    );

    const response = NextResponse.json({
      ok: true,
      images,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error) {
    await recordSecurityEvent({
      type: 'SUSPICIOUS_UPLOAD',
      severity: 'WARNING',
      route: '/api/admin/uploads/product-images',
      userId: adminUser.id,
      ip,
      metadata: {
        error: getSafeErrorMessage(error, 'Unable to process the upload.'),
      },
    }).catch(() => undefined);

    return jsonError(
      getSafeErrorMessage(error, 'Unable to process the uploaded images.'),
      500
    );
  }
}
