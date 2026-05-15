import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductPageClient } from '@/components/ProductPageClient';
import {
  getCatalogProductBySlug,
  getCatalogProducts,
  getCatalogSlugs,
} from '@/lib/catalog';
import { BRAND, SITE_URL } from '@/lib/site';

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

function getCategoryLabel(category: 'indoor' | 'outdoor' | 'pots') {
  if (category === 'indoor') return 'For Interior Spaces';
  if (category === 'outdoor') return 'For Open Spaces';
  return 'Clay Forms';
}

/** Extract the primary plant from the slug or description */
function extractPrimaryPlant(product: { slug: string; description: string }): string {
  const s = product.slug;
  if (s.includes('snake-plant')) return 'Snake Plant';
  if (s.includes('peace-lily'))  return 'Peace Lily';
  if (s.includes('zz-plant'))    return 'ZZ Plant';
  if (s.includes('pothos'))      return 'Pothos';
  if (s.includes('aloe'))        return 'Aloe Vera';
  if (s.includes('fiddle'))      return 'Fiddle Leaf Fig';
  if (s.includes('monstera'))    return 'Monstera';
  if (s.includes('palm'))        return 'Areca Palm';
  if (s.includes('succulents'))  return 'Succulents';
  if (s.includes('bamboo'))      return 'Bamboo';
  const d = product.description.toLowerCase();
  if (d.includes('snake plant')) return 'Snake Plant';
  if (d.includes('peace lily'))  return 'Peace Lily';
  if (d.includes('zz plant'))    return 'ZZ Plant';
  if (d.includes('pothos'))      return 'Pothos';
  return '';
}

export async function generateStaticParams() {
  const slugs = await getCatalogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) return {};

  const plant        = extractPrimaryPlant(product);
  const plantSuffix  = plant ? ` + ${plant}` : '';
  const sizeLine     = product.details?.dimensions ? ` (${product.details.dimensions})` : '';
  const origin       = product.details?.origin || 'Nairobi, Kenya';
  const family       = product.details?.family || '';

  // SEO title: "Kito + Snake Plant – Handcrafted Terracotta Pot | TuloPots"
  const title = `${product.name}${plantSuffix} – Handcrafted Terracotta Pot | TuloPots`;

  // Meta description: 150–160 chars, always include Nairobi
  const rawDesc = `${product.name}${plantSuffix} — handcrafted terracotta pot${sizeLine}. ${product.short} Made in ${origin}.`;
  const description = rawDesc.length > 160 ? rawDesc.slice(0, 157) + '...' : rawDesc;

  const image    = product.image;
  const gallery  = product.gallery?.length ? product.gallery : [product.image];
  const allImages = [image, ...gallery.filter((g) => g !== image)];

  const keywords = [
    'terracotta pot Kenya',
    'handcrafted clay pot Nairobi',
    'terracotta planter Nairobi',
    'clay forms Kenya',
    'interior plants Kenya',
    'handmade terracotta Kenya',
    product.name.toLowerCase(),
    ...(plant ? [plant.toLowerCase(), `${plant.toLowerCase()} pot Kenya`] : []),
    ...(family ? [`${family.toLowerCase()} terracotta`] : []),
  ];

  return {
    title,
    description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/product/${slug}`,
      siteName: BRAND.name,
      images: allImages.slice(0, 3).map((url, i) => ({
        url,
        width: 1080,
        height: 1350,
        alt: i === 0
          ? `${product.name}${plantSuffix} – handcrafted terracotta pot, ${origin}`
          : `${product.name} – view ${i + 1}, ${product.details?.finish || 'terracotta'}`,
      })),
      locale: 'en_KE',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    keywords,
  };
}

export default async function Page({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) notFound();

  const plant   = extractPrimaryPlant(product);
  const origin  = product.details?.origin || 'Nairobi, Kenya';
  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const allImages = [product.image, ...gallery.filter((g) => g !== product.image)];

  // Related by family first, then fall back to same category
  const family = product.details?.family || '';
  const allSameCategory = await getCatalogProducts({ category: product.category });
  const relatedProducts = (
    family
      ? allSameCategory.filter(
          (item) => item.slug !== product.slug && item.details?.family === family
        )
      : allSameCategory.filter((item) => item.slug !== product.slug)
  ).slice(0, 3);

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: plant ? `${product.name} + ${plant}` : product.name,
    description: product.description,
    image: allImages,
    sku: product.sku,
    material: 'Terracotta',
    countryOfOrigin: 'Kenya',
    brand: {
      '@type': 'Brand',
      name: BRAND.name,
      url: SITE_URL,
    },
    manufacturer: {
      '@type': 'Organization',
      name: BRAND.name,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Nairobi',
        addressCountry: 'KE',
      },
    },
    category: getCategoryLabel(product.category),
    url: `${SITE_URL}/product/${product.slug}`,
    ...(product.reviews > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: Number(product.rating.toFixed(1)),
        reviewCount: product.reviews,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'KES',
      price: product.price,
      url: `${SITE_URL}/product/${product.slug}`,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: BRAND.name,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'KE',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          businessDays: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 3 },
        },
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ProductPageClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
