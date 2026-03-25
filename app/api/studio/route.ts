import { NextResponse } from 'next/server';

type StudioImage = {
  id: string;
  title: string;
  url: string;
  createdAt: string;
};

const imagesStore: StudioImage[] = [
  {
    id: '1',
    title: 'Clay Studio Inspiration',
    url: 'https://images.unsplash.com/photo-1610705267928-1b9f2fa7f1c8?auto=format&fit=crop&w=1200&q=80',
    createdAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({ ok: true, images: imagesStore });
}

export async function POST(req: Request) {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    const body = await req.json();
    const title = String(body?.title || '').trim();
    const url = String(body?.url || '').trim();

    if (!title || !url) {
      return NextResponse.json(
        { ok: false, error: 'title and url are required' },
        { status: 400 }
      );
    }

    const image: StudioImage = {
      id: crypto.randomUUID(),
      title,
      url,
      createdAt: new Date().toISOString(),
    };

    imagesStore.unshift(image);
    return NextResponse.json({ ok: true, image }, { status: 201 });
  }

  const data = await req.formData();
  return NextResponse.json({
    ok: true,
    summary: `Studio brief saved for ${data.get('contact')}`,
  });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const id = String(body?.id || '');
  const title = String(body?.title || '').trim();
  const url = String(body?.url || '').trim();

  const idx = imagesStore.findIndex((img) => img.id === id);
  if (idx < 0) {
    return NextResponse.json({ ok: false, error: 'Image not found' }, { status: 404 });
  }

  if (!title || !url) {
    return NextResponse.json(
      { ok: false, error: 'title and url are required' },
      { status: 400 }
    );
  }

  imagesStore[idx] = { ...imagesStore[idx], title, url };
  return NextResponse.json({ ok: true, image: imagesStore[idx] });
}

export async function DELETE(req: Request) {
  const body = await req.json();
  const id = String(body?.id || '');

  const idx = imagesStore.findIndex((img) => img.id === id);
  if (idx < 0) {
    return NextResponse.json({ ok: false, error: 'Image not found' }, { status: 404 });
  }

  imagesStore.splice(idx, 1);
  return NextResponse.json({ ok: true });
}
