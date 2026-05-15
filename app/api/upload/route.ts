import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json(
      { error: 'Filename required' },
      { status: 400 }
    );
  }

  const blob = await put(filename, request.body!, {
    access: 'public',
    contentType: request.headers.get('content-type') || 'image/jpeg',
  });

  return NextResponse.json(blob);
}