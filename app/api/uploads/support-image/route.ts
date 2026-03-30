import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image');

    if (!(image instanceof File)) {
      return NextResponse.json(
        { ok: false, error: 'Select an image to upload.' },
        { status: 400 }
      );
    }

    const input = Buffer.from(await image.arrayBuffer());
    const output = await sharp(input)
      .rotate()
      .resize(1200, 1200, {
        fit: 'cover',
        position: 'centre',
      })
      .webp({
        quality: 82,
      })
      .toBuffer();

    const response = NextResponse.json({
      ok: true,
      imageUrl: `data:image/webp;base64,${output.toString('base64')}`,
    });
    response.headers.set('Cache-Control', 'no-store');
    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unable to upload this image right now.',
      },
      { status: 500 }
    );
  }
}
