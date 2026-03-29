import { notFound } from 'next/navigation';
import { ProductPageClient } from '@/components/ProductPageClient';
import {
  getCatalogProductBySlug,
  getCatalogProducts,
  getCatalogSlugs,
} from '@/lib/catalog';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getCatalogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) return {};

  const title = `${product.name} | Handcrafted Terracotta | TuloPots Kenya`;
  const description = `${product.name} — handcrafted terracotta piece designed for interior spaces, patios, balconies, and modern home styling. Shop premium clay forms in Kenya.`;
  const image = product.image;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://tulopots.com/product/${slug}`,
      siteName: 'TuloPots',
      images: [
        {
          url: image,
          width: 1200,
          height: 1200,
          alt: `${product.name} handcrafted terracotta pot for interior and outdoor spaces`,
        },
      ],
      locale: 'en_KE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    keywords: [
      'terracotta pots Kenya',
      'handcrafted clay pots Nairobi',
      'indoor plant pots Kenya',
      'outdoor planters Kenya',
      'clay decor pieces',
      'terracotta planters for patio',
      'balcony planters Kenya',
      'home decor Kenya',
      'artisan pottery Kenya',
      'landscape clay planters',
      product.name.toLowerCase(),
    ],
  };
}

export default async function Page({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) notFound();

  const relatedProducts = (await getCatalogProducts({ category: product.category }))
    .filter((item) => item.slug !== product.slug)
    .slice(0, 2);

  return <ProductPageClient product={product} relatedProducts={relatedProducts} />;
}
