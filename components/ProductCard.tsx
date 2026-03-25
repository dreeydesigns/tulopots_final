'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useStore } from './Providers';

export function ProductCard({ product }: any) {
  const { addToCart, toggleWishlist, wishlist } = useStore();

  return (
    <div className="group relative overflow-hidden rounded-[2rem] border border-[#e8dccf] bg-white">

      {/* IMAGE */}
      <div className="relative h-[380px] overflow-hidden bg-[#f5ede4]">

        {/* Hover Image Zoom */}
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-700 group-hover:scale-110"
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 transition duration-500 group-hover:opacity-100" />

        {/* QUICK VIEW BUTTON */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-500 group-hover:opacity-100">
          <Link
            href={`/product/${product.slug}`}
            className="cursor-hover rounded-full bg-white px-6 py-3 text-xs font-semibold tracking-[0.15em] uppercase shadow-lg hover:scale-105 transition"
          >
            Quick View
          </Link>
        </div>

        {/* Wishlist */}
        <button
          onClick={() => toggleWishlist(product.slug)}
          className="absolute top-4 right-4 bg-white p-2 rounded-full shadow-md"
        >
          <Heart
            className={`w-4 h-4 ${
              wishlist.includes(product.slug)
                ? 'fill-[#B66A3C] text-[#B66A3C]'
                : 'text-gray-500'
            }`}
          />
        </button>
      </div>

      {/* CONTENT */}
      <div className="p-5">
        <h3 className="serif-display text-lg text-[#3d2a20]">
          {product.name}
        </h3>

        <p className="text-sm text-[#8a7a6d] mt-1">
          {product.short}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-semibold text-[#3d2a20]">
            KSh {product.price}
          </p>

          <button
            onClick={() => addToCart(product)}
            className="cursor-hover text-xs uppercase tracking-[0.15em] bg-[#3d2a20] text-white px-4 py-2 rounded-full hover:bg-[#5A3422] transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}