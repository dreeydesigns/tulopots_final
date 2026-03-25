import Link from 'next/link';
export function Breadcrumbs({ items }:{items:[string,string][]}){return <div className="flex flex-wrap items-center gap-2 text-sm text-[#9b8a7d]">{items.map(([l,h],i)=><span key={h} className="flex items-center gap-2"><Link href={h} className="hover:text-[#8A4E2D]">{l}</Link>{i<items.length-1&&<span>/</span>}</span>)}</div>}
