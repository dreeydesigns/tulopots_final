import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const adminUser = await requireAdminUser('newsletter.read');

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const format = request.nextUrl.searchParams.get('format');
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: 'desc' },
  });

  if (format === 'csv') {
    const csv = [
      'name,email,preferredChannel,interests,source,createdAt',
      ...subscribers.map(
        (subscriber) =>
          [
            subscriber.name || '',
            subscriber.email,
            subscriber.preferredChannel || '',
            Array.isArray(subscriber.interests)
              ? subscriber.interests.map((item) => String(item)).join(' | ')
              : '',
            subscriber.source || '',
            subscriber.createdAt.toISOString(),
          ]
            .map((value) => `"${String(value).replace(/"/g, '""')}"`)
            .join(',')
      ),
    ].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="tulopots-newsletter.csv"',
      },
    });
  }

  return NextResponse.json({
    ok: true,
    subscribers: subscribers.map((subscriber) => ({
      id: subscriber.id,
      name: subscriber.name,
      email: subscriber.email,
      preferredChannel: subscriber.preferredChannel,
      interests: Array.isArray(subscriber.interests)
        ? subscriber.interests.map((item) => String(item))
        : [],
      source: subscriber.source,
      createdAt: subscriber.createdAt.toISOString(),
    })),
  });
}
