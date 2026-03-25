import { products } from '@/lib/products';
import { CollectionTemplate } from '@/components/Templates';
export const metadata = { title:'Indoor Plants | TuloPots', description:'Handcrafted indoor terracotta pots with curated plant pairings from Nairobi.' };
export default function Page(){return <CollectionTemplate route="indoor" title="Indoor Plants" intro="Handcrafted terracotta pots paired with curated indoor plants. Each combination is chosen to thrive together in your home." facts={['12 Products','3 Sizes','Free delivery over KSh 5,000']} filters={['all','small','medium','large','new arrivals']} products={products.filter(p=>p.category==='indoor')} showing="Showing 12 of 12 products" />}
