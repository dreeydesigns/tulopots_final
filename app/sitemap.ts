import type { MetadataRoute } from 'next';
import { getCatalogSlugs } from '@/lib/catalog';
import { LEGAL_ROUTES } from '@/lib/policies';
import { SITE_URL } from '@/lib/site';

const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/care-guide',
  '/faq',
  '/indoor',
  '/outdoor',
  '/pots',
  LEGAL_ROUTES.terms,
  LEGAL_ROUTES.privacy,
  LEGAL_ROUTES.cookies,
  LEGAL_ROUTES.delivery,
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getCatalogSlugs();
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

  return [...publicEntries, ...productEntries];
}
