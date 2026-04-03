import type { MetadataRoute } from 'next';
import { getCatalogSlugs } from '@/lib/catalog';
import { getEditorialArticles } from '@/lib/editorial-articles';
import { LEGAL_ROUTES } from '@/lib/policies';
import { SITE_URL } from '@/lib/site';
import { getCatalogProducts } from '@/lib/catalog';

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/care-guide',
  '/faq',
  '/journal',
  '/indoor',
  '/outdoor',
  '/pots',
  LEGAL_ROUTES.terms,
  LEGAL_ROUTES.privacy,
  LEGAL_ROUTES.cookies,
  LEGAL_ROUTES.delivery,
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, products] = await Promise.all([
    getCatalogSlugs(),
    getCatalogProducts({ visibleOnly: true }),
  ]);
  const articles = await getEditorialArticles(products);
  const now = new Date();
  const publicEntries: MetadataRoute.Sitemap = PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '/' ? 'daily' : 'weekly',
    priority: route === '/' ? 1 : 0.7,
  }));
  const productEntries: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/product/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));
  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/journal/${article.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...publicEntries, ...productEntries, ...articleEntries];
}
