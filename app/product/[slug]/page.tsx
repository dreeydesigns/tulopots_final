import { notFound } from 'next/navigation';
import { productBySlug } from '@/lib/products';
import { ProductPageClient } from '@/components/ProductPageClient';
export async function generateStaticParams(){ return Object.keys(productBySlug).map((slug)=>({ slug })); }
export default function Page({ params }:{params:{slug:string}}){ const product = productBySlug[params.slug]; if(!product) notFound(); return <ProductPageClient product={product} />; }
