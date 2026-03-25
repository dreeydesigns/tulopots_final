import { products } from '@/lib/products';
import { CollectionTemplate } from '@/components/Templates';
export const metadata = { title:'Outdoor Plants | TuloPots', description:'Weather-ready outdoor terracotta pots with curated hardy plant pairings.' };
export default function Page(){return <CollectionTemplate route="outdoor" title="Outdoor Plants" intro="Robust terracotta pots built for sun, rain and wind. Paired with weather-hardy plants for your garden, patio or balcony." facts={['12 Products','Weather-resistant','Double-fired clay']} filters={['all','medium','large','decorative','new arrivals']} products={products.filter(p=>p.category==='outdoor')} showing="Showing 12 of 12 products" />}
