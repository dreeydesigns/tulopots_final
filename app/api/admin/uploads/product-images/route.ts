import { NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { requireAdminUser } from '@/lib/admin';

export const runtime = 'nodejs';
export const maxDuration = 60;

// This route handles two request types from @vercel/blob/client:
//   1. "generate-client-token" — called before upload, returns a short-lived token
//   2. "upload-completed"     — called after the file lands in Blob storage
//
// The client (ProductMediaField / GallerySlotEditor) calls upload() which
// drives both steps automatically. Files go browser → Blob directly, so
// there is no 4.5 MB serverless payload limit.

export async function POST(request: Request): Promise<Response> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Image storage is not configured. Add BLOB_READ_WRITE_TOKEN to your Vercel environment variables.',
      },
      { status: 503 }
    );
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request body.' }, { status: 400 });
  }

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (_pathname: string) => {
        // Verify admin auth before issuing a client token.
        const admin = await requireAdminUser('products.manage');
        if (!admin) throw new Error('Unauthorized');

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB — no serverless body limit
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Optional post-upload hook (logging, DB record, etc.)
        console.log('[product-images] uploaded:', blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed.';
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
