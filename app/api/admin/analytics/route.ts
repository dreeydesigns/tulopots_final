import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

function toCsvCell(value: unknown) {
  const normalized = String(value ?? '').replace(/"/g, '""');
  return `"${normalized}"`;
}

export async function GET(request: NextRequest) {
  const adminUser = await requireAdminUser();

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const format = request.nextUrl.searchParams.get('format');
  const events = await prisma.analyticsEvent.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1000,
  });

  if (format === 'csv') {
    const headers = [
      'eventName',
      'path',
      'source',
      'consentLevel',
      'sessionKey',
      'payload',
      'createdAt',
    ];

    const csv = [
      headers.join(','),
      ...events.map((event) =>
        [
          event.eventName,
          event.path || '',
          event.source || '',
          event.consentLevel,
          event.sessionKey || '',
          JSON.stringify(event.payload || {}),
          event.createdAt.toISOString(),
        ]
          .map(toCsvCell)
          .join(',')
      ),
    ].join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'content-type': 'text/csv; charset=utf-8',
        'content-disposition': 'attachment; filename="tulopots-analytics.csv"',
        'cache-control': 'no-store',
      },
    });
  }

  const response = NextResponse.json({
    ok: true,
    events: events.map((event) => ({
      id: event.id,
      eventName: event.eventName,
      path: event.path,
      source: event.source,
      consentLevel: event.consentLevel,
      sessionKey: event.sessionKey,
      payload: event.payload,
      createdAt: event.createdAt.toISOString(),
    })),
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
