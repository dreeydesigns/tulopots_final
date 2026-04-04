import { NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin';
import { syncNewsletterSubscriberToHubSpot } from '@/lib/hubspot';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const adminUser = await requireAdminUser('newsletter.manage');

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    const results = [];

    for (const subscriber of subscribers) {
      try {
        const result = await syncNewsletterSubscriberToHubSpot({
          email: subscriber.email,
          name: subscriber.name || '',
          preferredChannel: subscriber.preferredChannel || 'email',
          interests: Array.isArray(subscriber.interests)
            ? subscriber.interests.map((item) => String(item))
            : [],
          source: subscriber.source || 'footer',
        });

        results.push({
          email: subscriber.email,
          ok: true,
          synced: result.synced,
          addedToList: result.addedToList,
          skipped: result.skipped || false,
        });
      } catch (error: any) {
        results.push({
          email: subscriber.email,
          ok: false,
          error: error?.message || 'Sync failed.',
        });
      }
    }

    const synced = results.filter((entry) => entry.ok && !entry.skipped).length;
    const failed = results.filter((entry) => !entry.ok).length;

    return NextResponse.json({
      ok: true,
      summary: {
        total: results.length,
        synced,
        failed,
      },
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unable to sync newsletter subscribers.',
      },
      { status: 500 }
    );
  }
}
