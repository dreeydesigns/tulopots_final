import { products, studioCard } from '@/lib/products';
import { CollectionTemplate } from '@/components/Templates';
export const metadata = { title:'Pots Only | TuloPots', description:'Just the terracotta. No plant included. Handcrafted pot-only collection from Nairobi.' };
export default function Page(){return <CollectionTemplate route="pots" title="Pots Only" intro="Just the terracotta. No plant included. Choose your pot, add your own plant. All pots are made from 100% natural Kenyan clay." facts={['10 Products','All Shapes','100% Natural Clay']} filters={['all shapes','small','medium','large','decorative','sets']} products={products.filter(p=>p.category==='pots')} showing="Showing 10 of 10 products" studioCard={studioCard} />}
