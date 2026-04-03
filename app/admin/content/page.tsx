import { redirect } from 'next/navigation';
import { ContentWorkspace } from '@/components/admin/ContentWorkspace';
import { AdminLoginPanel } from '@/components/admin/AdminLoginPanel';
import { getCurrentUser } from '@/lib/auth';
import { listManagedPages } from '@/lib/cms';

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

  const pages = await listManagedPages();

  return <ContentWorkspace initialPages={pages} />;
}
