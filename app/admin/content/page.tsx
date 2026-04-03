import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminLoginPanel } from '@/components/admin/AdminLoginPanel';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'Admin Content | TuloPots',
  description: 'Page content management for the TuloPots storefront.',
};

export default async function AdminContentPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <AdminLoginPanel />;
  }

  if (!user.isAdmin) {
    redirect('/');
  }

  return <AdminDashboard user={user} initialTab="content" />;
}
