import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminLoginPanel } from '@/components/admin/AdminLoginPanel';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'Admin Newsletter | TuloPots',
  description: 'Newsletter builder access and subscriber management for TuloPots.',
};

export default async function AdminNewsletterPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <AdminLoginPanel />;
  }

  if (!user.isAdmin) {
    redirect('/');
  }

  return <AdminDashboard user={user} initialTab="newsletter" />;
}
