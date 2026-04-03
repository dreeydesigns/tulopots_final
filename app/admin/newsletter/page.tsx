import { redirect } from 'next/navigation';
import { AdminLoginPanel } from '@/components/admin/AdminLoginPanel';
import { NewsletterWorkspace } from '@/components/admin/NewsletterWorkspace';
import {
  buildNewsletterDraftHtml,
  buildNewsletterDraftText,
  getEditorialArticles,
} from '@/lib/editorial-articles';
import { getCurrentUser } from '@/lib/auth';
import { getCatalogProducts } from '@/lib/catalog';
import { getHubSpotConfig } from '@/lib/hubspot';

export const metadata = {
  title: 'Admin Newsletter | TuloPots',
  description: 'Article-led newsletter builder workspace for TuloPots.',
};

export default async function AdminNewsletterPage() {
  const user = await getCurrentUser();

  if (!user) {
    return <AdminLoginPanel />;
  }

  if (!user.isAdmin) {
    redirect('/');
  }

  const products = await getCatalogProducts({ visibleOnly: true });
  const articles = await getEditorialArticles(products);
  const hubspot = getHubSpotConfig();

  return (
    <NewsletterWorkspace
      hubspot={{
        enabled: hubspot.enabled,
        hasListId: hubspot.hasListId,
        portalId: hubspot.portalId,
        listId: hubspot.listId,
        manageUrl: hubspot.manageUrl,
        listsUrl: hubspot.listsUrl,
        contactsUrl: hubspot.contactsUrl,
      }}
      articles={articles.map((article) => {
        const textDraft = buildNewsletterDraftText(article);

        return {
          id: article.id,
          slug: article.slug,
          title: article.title,
          summary: article.summary,
          href: `/journal/${article.slug}`,
          subject: textDraft.subject,
          preheader: textDraft.preheader,
          textBody: textDraft.body,
          htmlBody: buildNewsletterDraftHtml(article),
        };
      })}
    />
  );
}
