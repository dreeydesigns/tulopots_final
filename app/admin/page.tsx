import { redirect } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { AdminLoginPanel } from '@/components/admin/AdminLoginPanel';
import { getCurrentUser } from '@/lib/auth';

export const metadata = {
  title: 'Admin | TuloPots',
  description: 'Internal control layer for TuloPots operations.',
};

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <AdminLoginPanel />;
  }

  if (!user.isAdmin) {
    redirect('/');
  }

  return <AdminDashboard user={user} />;
}
