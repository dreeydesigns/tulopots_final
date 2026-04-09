import { NextResponse } from 'next/server';
import {
  getAdminDashboardData,
  getFallbackAdminDashboardData,
  requireAdminUser,
} from '@/lib/admin';
import { syncCatalogToDatabase } from '@/lib/catalog';

export async function GET() {
  const adminUser = await requireAdminUser('admin.access');

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const dashboard = await getAdminDashboardData(adminUser);
    return NextResponse.json({ ok: true, dashboard });
  } catch (error) {
    console.error('[admin/dashboard] falling back to compatibility dashboard', error);
    const dashboard = await getFallbackAdminDashboardData(adminUser);
    return NextResponse.json({ ok: true, dashboard, fallback: true });
  }
}

export async function POST() {
  const adminUser = await requireAdminUser('products.manage');

  if (!adminUser) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await syncCatalogToDatabase();
    const dashboard = await getAdminDashboardData(adminUser);
    return NextResponse.json({ ok: true, dashboard });
  } catch (error) {
    console.error('[admin/dashboard] refresh fell back to compatibility dashboard', error);
    const dashboard = await getFallbackAdminDashboardData(adminUser);
    return NextResponse.json({ ok: true, dashboard, fallback: true });
  }
}
