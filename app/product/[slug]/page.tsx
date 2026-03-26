import { notFound } from 'next/navigation';
import { productBySlug } from '@/lib/products';
import { ProductPageClient } from '@/components/ProductPageClient';

export async function generateStaticParams() {
  return Object.keys(productBySlug).map((slug) => ({ slug }));
}

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function Page({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = productBySlug[slug];

  if (!product) notFound();

  return <ProductPageClient product={product} />;
}