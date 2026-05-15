import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { requireAdminUser } from '@/lib/admin';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: Request) {
  const admin = await requireAdminUser('products.manage');
  if (!admin) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'Image storage is not configured yet. Go to Vercel Dashboard → Storage → Create Blob Store → copy BLOB_READ_WRITE_TOKEN to environment variables, then redeploy.',
      },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid form data.' }, { status: 400 });
  }

  const files = formData.getAll('files') as File[];
  if (!files.length) {
    return NextResponse.json({ ok: false, error: 'No files received.' }, { status: 400 });
  }

  const MAX_SIZE = 20 * 1024 * 1024;
  const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

  const uploaded: { url: string }[] = [];

  for (const file of files) {
    if (!ALLOWED.has(file.type)) {
      return NextResponse.json(
        { ok: false, error: `"${file.name}" is not a supported image type. Use JPEG, PNG, or WebP.` },
        { status: 400 }
      );
    }
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { ok: false, error: `"${file.name}" is too large (max 20 MB per file).` },
        { status: 400 }
      );
    }

    const ext = file.type === 'image/png' ? 'png'
      : file.type === 'image/webp' ? 'webp'
      : file.type === 'image/gif' ? 'gif'
      : 'jpg';
    const safeName = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const blob = await put(safeName, file, {
      access: 'public',
      contentType: file.type,
    });

    uploaded.push({ url: blob.url });
  }

  return NextResponse.json({ ok: true, images: uploaded });
}
