'use client';
import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { Product } from '@/lib/products';
import { money } from '@/lib/utils';
import { useStore } from './Providers';

/* Star row — renders filled / half / empty based on rating */
function Stars({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = rating >= i;
        const half   = !filled && rating >= i - 0.5;
        return (
          <svg key={i} width="14" height="14" viewBox="0 0 24 24" className="flex-shrink-0">
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="#f0b400" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <polygon
              points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
              fill={filled ? '#f0b400' : half ? `url(#half-${i})` : 'none'}
              stroke={filled || half ? '#f0b400' : '#d1c5bb'}
              strokeWidth="1.5"
            />
          </svg>
        );
      })}
      <span className="ml-1.5 text-xs text-[#8a7a6d]">({reviews})</span>
    </div>
  );
}

/* Badge color based on badge value */
function badgeStyle(badge: string): string {
  const b = badge.toLowerCase();
  if (b === 'bestseller') return 'bg-[#fef0e6] text-[#b05d2a]';
  if (b === 'new')        return 'bg-[#fdf5e8] text-[#a07030]';
  if (b === 'pot only')   return 'bg-[#eef3fb] text-[#4a6090]';
  return 'bg-[#ecf5ed] text-[#3d7050]'; /* indoor / outdoor / default */
}

export function ProductCard({ product, collection }: { product: Product; collection?: boolean }) {
  const { addToCart, toggleWishlist, wishlist, isLoggedIn, setIsLoggedIn } = useStore();

  return (
    <div className="group overflow-hidden rounded-[1.5rem] border border-[#ede5db] bg-white shadow-[0_4px_24px_rgba(90,52,34,0.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(90,52,34,0.13)]">
      {/* Image */}
      <div className="relative h-[22rem] overflow-hidden bg-[#f5ede4]">
        {product.badge && (
          <span className={`absolute left-4 top-4 z-10 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeStyle(product.badge)}`}>
            {product.badge}
          </span>
        )}
        <button
          onClick={() => isLoggedIn ? toggleWishlist(product.slug) : setIsLoggedIn(true)}
          className="absolute right-4 top-4 z-10 rounded-full bg-white p-2.5 shadow-sm transition hover:scale-105"
        >
          <Heart className={`h-4 w-4 ${wishlist.includes(product.slug) ? 'fill-[#B66A3C] text-[#B66A3C]' : 'text-[#9a8677]'}`} />
        </button>
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </div>

      {/* Content */}
      <div className="p-5">
        <Link
          href={`/product/${product.slug}`}
          className="serif-display block text-[1.45rem] leading-tight text-[#3d2a1e] transition hover:text-[#8A4E2D]"
        >
          {product.name}
        </Link>

        <div className="mt-1 text-sm italic text-[#B66A3C]">{product.short}</div>

        <p className="mt-3 min-h-[4rem] text-[13px] leading-[1.75] text-[#7a6f65]">
          {product.cardDescription}
        </p>

        <div className="mt-3">
          <Stars rating={product.rating} reviews={product.reviews} />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="serif-display text-[1.6rem] text-[#3d2a1e]">{money(product.price)}</div>
          <button
            onClick={() => addToCart(product, { mode: product.forcePotOnly || product.decorative ? 'pot' : 'plant' })}
            className="cursor-hover rounded-full bg-[#3d2a1e] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#5A3422]"
          >
            Add to Cart
          </button>
        </div>

        {collection && (
          <div className="mt-3 border-t border-[#f0e8e0] pt-3">
            <Link
              href={`/product/${product.slug}`}
              className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A4E2D] transition hover:text-[#5A3422]"
            >
              Quick View →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
