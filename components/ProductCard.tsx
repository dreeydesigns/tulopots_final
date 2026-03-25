'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart, Eye } from 'lucide-react';
import type { Product } from '@/lib/products';
import { money } from '@/lib/utils';
import { useStore } from '@/components/Providers';

type ProductCardProps = {
  product: Product;
  collection?: boolean;
};

export function ProductCard({ product, collection = false }: ProductCardProps) {
  const {
    wishlist,
    toggleWishlist,
    addToCart,
    isLoggedIn,
    setShowAuthModal,
  } = useStore();

  const isWishlisted = wishlist.includes(product.slug);

  const badgeTone =
    product.badge === 'New'
      ? 'bg-[#4b2d1f] text-white'
      : product.badge === 'Bestseller'
      ? 'bg-[#d77c49] text-white'
      : product.badge === 'Pot Only'
      ? 'bg-[#f4efe8] text-[#8a644b]'
      : 'bg-[#e9f3ea] text-[#5b6f60]';

  const handleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }

    toggleWishlist(product.slug);
  };

  const handleQuickAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    addToCart(product, {
      mode: product.forcePotOnly || product.decorative ? 'pot' : 'plant',
      quantity: 1,
    });
  };

  const subtitle =
    product.short ||
    (product.forcePotOnly || product.decorative
      ? 'Pot only'
      : 'with curated plant pairing');

  return (
    <article
      data-cursor
      className="group relative rounded-[2rem] border border-[#eadfd3] bg-white shadow-[0_10px_30px_rgba(61,42,32,0.05)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_28px_70px_rgba(61,42,32,0.14)]"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative overflow-hidden rounded-t-[2rem] bg-[#efe3d6]">
          {product.badge ? (
            <span
              className={`absolute left-4 top-4 z-20 rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] ${badgeTone}`}
            >
              {product.badge}
            </span>
          ) : null}

          <button
            type="button"
            onClick={handleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-white/92 text-[#9b8575] shadow-md backdrop-blur transition hover:scale-105 hover:bg-white"
          >
            <Heart
              className={`h-5 w-5 transition ${
                isWishlisted ? 'fill-[#B66A3C] text-[#B66A3C]' : 'text-[#9b8575]'
              }`}
            />
          </button>

          <div className="relative">
            <Image
              src={product.image}
              alt={product.name}
              width={900}
              height={1100}
              className={`w-full object-cover transition-transform duration-700 group-hover:scale-[1.06] ${
                collection ? 'h-[28rem] md:h-[30rem]' : 'h-[22rem] md:h-[24rem]'
              }`}
            />

            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#2b1b13]/70 via-[#2b1b13]/10 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover:opacity-100">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5A3422] shadow-xl">
                <Eye className="h-3.5 w-3.5" />
                Quick View
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-b-[2rem] bg-[#fbf8f4] px-5 pb-5 pt-5 md:px-6 md:pb-6">
          <div className="min-h-[5.2rem]">
            <h3 className="serif-display text-[2rem] leading-[0.95] text-[#4b3428]">
              {product.name}
            </h3>

            <p className="mt-2 text-sm italic text-[#cf7d4a]">{subtitle}</p>

            {product.description ? (
              <p className="mt-3 line-clamp-2 text-sm leading-7 text-[#8f7f71]">
                {product.description}
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex items-center gap-1 text-[#f0b400]">
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = i < Math.floor(product.rating || 4);
              return (
                <span
                  key={i}
                  className={`text-sm ${filled ? 'opacity-100' : 'opacity-30'}`}
                >
                  ★
                </span>
              );
            })}
            <span className="ml-2 text-xs text-[#8f7f71]">
              ({product.reviews ?? 0})
            </span>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <div className="serif-display text-4xl leading-none text-[#4b3428]">
                {money(product.price)}
              </div>
              {product.potOnly &&
              !product.forcePotOnly &&
              !product.decorative ? (
                <div className="mt-1 text-xs text-[#9b8575]">
                  Pot only {money(product.potOnly)}
                </div>
              ) : null}
            </div>

            <button
              type="button"
              onClick={handleQuickAdd}
              className="rounded-full bg-[#5A3422] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#6a402c] hover:shadow-lg"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
}