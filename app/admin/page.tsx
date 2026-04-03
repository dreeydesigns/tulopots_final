import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import type { Tab } from '@/components/admin/AdminDashboard';
import { AdminLoginPanel } from '@/components/admin/AdminLoginPanel';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'Admin | TuloPots',
  description: 'Internal control layer for TuloPots operations.',
};

const validTabs = new Set([
  'overview',
  'products',
  'orders',
  'studio',
  'reviews',
  'contact',
  'newsletter',
  'content',
]);

export default async function AdminPage({
  searchParams,
}: {
  searchParams?: Promise<{ tab?: string }>;
}) {
  const user = await getCurrentUser();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const requestedTab = resolvedSearchParams?.tab;
  const initialTab =
    requestedTab && validTabs.has(requestedTab) ? (requestedTab as Tab) : 'overview';

  if (!user) {
    return <AdminLoginPanel />;
  }

  if (!user.isAdmin) {
    redirect('/');
  }

  return <AdminDashboard user={user} initialTab={initialTab} />;
}
