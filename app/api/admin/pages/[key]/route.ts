import { ZodError } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/admin';
import {
  asManagedPageKey,
  getManagedPageContent,
  getDefaultManagedPageContent,
  saveManagedPageContent,
} from '@/lib/cms';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const adminUser = await requireAdminUser();

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { key } = await params;

  try {
    const managedKey = asManagedPageKey(key);
    const payload = await getManagedPageContent(managedKey);
    const defaultPayload = getDefaultManagedPageContent(managedKey);

    return NextResponse.json({
      ok: true,
      page: {
        key,
        payload,
        defaultPayload,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'Unable to load that page.',
      },
      { status: 400 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const adminUser = await requireAdminUser();

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { key } = await params;

  try {
    const body = (await request.json()) as { payload?: unknown };
    const page = await saveManagedPageContent(key, body.payload);

    return NextResponse.json({
      ok: true,
      page,
    });
  } catch (error: any) {
    const message =
      error instanceof ZodError
        ? error.issues.map((issue) => `${issue.path.join('.')} ${issue.message}`).join('; ')
        : error?.message || 'Unable to save that page.';

    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 400 }
    );
  }
}
