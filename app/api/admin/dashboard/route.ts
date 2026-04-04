import { NextResponse } from 'next/server';
import { getAdminDashboardData, requireAdminUser } from '@/lib/admin';
import { syncCatalogToDatabase } from '@/lib/catalog';

export async function GET() {
  const adminUser = await requireAdminUser('admin.access');

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const dashboard = await getAdminDashboardData(adminUser);
  return NextResponse.json({ ok: true, dashboard });
}

export async function POST() {
  const adminUser = await requireAdminUser('products.manage');

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  await syncCatalogToDatabase();
  const dashboard = await getAdminDashboardData(adminUser);
  return NextResponse.json({ ok: true, dashboard });
}
