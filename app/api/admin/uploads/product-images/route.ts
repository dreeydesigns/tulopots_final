import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin';

export const runtime = 'nodejs';

async function fileToDataUrl(file: File) {
  const input = Buffer.from(await file.arrayBuffer());
  const output = await sharp(input)
    .rotate()
    .resize(1200, 1500, {
      fit: 'cover',
      position: 'centre',
    })
    .webp({
      quality: 82,
    })
    .toBuffer();

  return `data:image/webp;base64,${output.toString('base64')}`;
}

export async function POST(request: NextRequest) {
  const adminUser = await requireAdminUser();

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData
      .getAll('files')
      .filter((entry): entry is File => entry instanceof File);

    if (!files.length) {
      return NextResponse.json(
        { ok: false, error: 'Select at least one image to upload.' },
        { status: 400 }
      );
    }

    if (files.length > 8) {
      return NextResponse.json(
        { ok: false, error: 'Upload up to 8 images at a time.' },
        { status: 400 }
      );
    }

    const images = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        url: await fileToDataUrl(file),
      }))
    );

    const response = NextResponse.json({
      ok: true,
      images,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unable to process the uploaded images.',
      },
      { status: 500 }
    );
  }
}
