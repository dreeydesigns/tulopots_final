import { redirect } from 'next/navigation';
import { ContentWorkspace } from '@/components/admin/ContentWorkspace';
import { AdminLoginPanel } from '@/components/admin/AdminLoginPanel';
import { getCurrentUser } from '@/lib/auth';
import { listManagedPages } from '@/lib/cms';

export const metadata = {
  title: 'Admin Content | TuloPots',
  description: 'Page content management for the TuloPots storefront.',
};

export default async function AdminContentPage({
  searchParams,
}: {
  searchParams?: Promise<{ key?: string }>;
}) {
  const user = await getCurrentUser();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  if (!user) {
    return <AdminLoginPanel />;
  }

  if (!user.isAdmin) {
    redirect('/');
  }

  const pages = await listManagedPages();

  return (
    <ContentWorkspace
      initialPages={pages}
      initialSelectedKey={resolvedSearchParams?.key || null}
    />
  );
}
