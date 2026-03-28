'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useStore } from './Providers';

function formatPrice(price: number | string) {
  return `KSh ${Number(price).toLocaleString('en-KE')}`;
}

export function ProductCard({ product }: any) {
  const { addToCart, toggleWishlist, wishlist } = useStore();

  const inWishlist = wishlist.includes(product.slug);

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border tp-border tp-card tp-shadow-soft transition duration-500 hover:-translate-y-2 hover:tp-shadow">
      <div className="relative h-[380px] overflow-hidden tp-surface-soft">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-black/10 opacity-0 transition duration-500 group-hover:opacity-100" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-500 group-hover:opacity-100">
          <Link
            href={`/product/${product.slug}`}
            className="cursor-hover rounded-full px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em]"
            style={{
              background: 'var(--tp-surface)',
              color: 'var(--tp-heading)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.18)',
            }}
          >
            Quick View
          </Link>
        </div>

        <button
          onClick={() => toggleWishlist(product.slug)}
          className="absolute top-4 right-4 z-20 rounded-full p-2.5"
          style={{
            background: 'var(--tp-surface)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
          }}
        >
          <Heart
            className="h-4 w-4"
            style={{
              color: inWishlist ? 'var(--tp-accent)' : 'var(--tp-text-muted)',
              fill: inWishlist ? 'var(--tp-accent)' : 'none',
            }}
          />
        </button>
      </div>

      <div className="p-5">
        <h3 className="serif-display text-[1.2rem] leading-tight tp-heading">
          {product.name}
        </h3>

        {product.short && (
          <p className="mt-2 text-sm italic tp-accent">{product.short}</p>
        )}

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="serif-display text-[1.8rem] tp-heading">
            {formatPrice(product.price)}
          </p>

          <button
            onClick={() => addToCart(product)}
            className="btn-primary cursor-hover px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em]"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}