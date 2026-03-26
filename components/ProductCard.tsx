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

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-[#e8dccf] bg-white shadow-[0_6px_24px_rgba(90,52,34,0.08)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_18px_50px_rgba(90,52,34,0.16)]">

      {/* IMAGE */}
      <div className="relative h-[380px] overflow-hidden bg-[#f5ede4]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-700 group-hover:scale-110"
        />

        {/* soft overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 transition duration-500 group-hover:opacity-100" />

        {/* bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/45 via-black/10 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />

        {/* quick view */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-500 group-hover:opacity-100">
          <Link
            href={`/product/${product.slug}`}
            className="cursor-hover rounded-full bg-white px-6 py-3 text-xs font-semibold tracking-[0.15em] uppercase text-[#3d2a20] shadow-lg transition hover:scale-105"
          >
            Quick View
          </Link>
        </div>

        {/* wishlist */}
        <button
          onClick={() => toggleWishlist(product.slug)}
          className="absolute top-4 right-4 z-20 rounded-full bg-white p-2.5 shadow-md transition hover:scale-110"
        >
          <Heart
            className={`h-4 w-4 ${
              wishlist.includes(product.slug)
                ? 'fill-[#B66A3C] text-[#B66A3C]'
                : 'text-gray-500'
            }`}
          />
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <h3 className="serif-display text-[1.2rem] leading-tight text-[#3d2a20]">
          {product.name}
        </h3>

        <p className="mt-2 text-sm italic text-[#B66A3C]">
          {product.short}
        </p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="serif-display text-[1.8rem] text-[#3d2a20]">
            {formatPrice(product.price)}
          </p>

          <button
            onClick={() => addToCart(product)}
            className="cursor-hover rounded-full bg-[#4b2d1f] px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-[#5A3422] hover:scale-105"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}