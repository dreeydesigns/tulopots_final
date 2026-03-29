import { notFound } from 'next/navigation';
import { productBySlug } from '@/lib/products';
import { ProductPageClient } from '@/components/ProductPageClient';

export async function generateStaticParams() {
  return Object.keys(productBySlug).map((slug) => ({ slug }));
}

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

// 🔥 SEO GENERATOR
export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = productBySlug[slug];

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
  const product = productBySlug[slug];

  if (!product) notFound();

  return <ProductPageClient product={product} />;
}