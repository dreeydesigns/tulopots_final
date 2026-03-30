'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Heart,
  Minus,
  Plus,
  Star,
  ChevronDown,
  ChevronLeft,
  Link2,
  Leaf,
  MessageCircle,
  Shield,
  Truck,
  Check,
} from 'lucide-react';
import { resolveProductPresentation, type ProductMode } from '@/lib/product-variants';
import { Product } from '@/lib/products';
import { trackEvent } from '@/lib/tracking';
import { money } from '@/lib/utils';
import { Breadcrumbs } from './Breadcrumbs';
import { ProductCard } from './ProductCard';
import { useStore } from './Providers';

type ReviewItem = {
  id: string;
  name: string;
  rating: number;
  body: string;
  featured: boolean;
  createdAt: string;
};

function getPlacementCue(input: { name: string; short?: string; category: Product['category'] }) {
  const text = `${input.name} ${input.short || ''}`.toLowerCase();

  if (text.includes('peace lily')) return 'Best for desks, shelves, and calm corners.';
  if (text.includes('snake plant')) return 'Made for clean corners, entries, and office spaces.';
  if (text.includes('succulent')) return 'Easy on shelves, tables, and gifting moments.';
  if (text.includes('pothos')) return 'A soft choice for shelves, ledges, and home styling.';
  if (text.includes('bougainvillea')) return 'Strong for patios, balconies, and open outdoor spaces.';
  if (text.includes('palm')) return 'A bold piece for patios, lounges, and larger corners.';
  if (text.includes('hut')) return 'A strong outdoor piece with sculptural presence.';
  if (input.category === 'outdoor') return 'Well placed on patios, balconies, and open spaces.';
  if (input.category === 'pots') return 'Choose the form first, then style it your way.';
  return 'A refined clay piece for spaces that need warmth and presence.';
}

function getReasonBlocks(product: Product, mode: ProductMode) {
  if (mode === 'plant') {
    return [
      'Complete look from the start',
      'Easy to place at home or gift',
      'Balanced pot and plant pairing',
    ];
  }

  if (product.category === 'outdoor') {
    return [
      'Strong shape for open spaces',
      'Easy to style later with your own plant',
      'A lasting clay form with presence',
    ];
  }

  return [
    'A clean form you can style your way',
    'Easy to pair with your own plant later',
    'Works for gifting, shelves, desks, or corners',
  ];
}

function getCategoryLabel(category: Product['category']) {
  if (category === 'indoor') return 'For Interior Spaces';
  if (category === 'outdoor') return 'For Open Spaces';
  return 'Clay Forms';
}

function formatReviewDate(value: string) {
  return new Date(value).toLocaleDateString('en-KE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ProductPageClient({
  product,
  relatedProducts,
}: {
  product: Product;
  relatedProducts: Product[];
}) {
  const { addToCart, toggleWishlist, wishlist, isLoggedIn, setIsLoggedIn } = useStore();

  const defaultMode: ProductMode = product.forcePotOnly || product.decorative ? 'pot' : 'plant';
  const [mode, setMode] = useState<ProductMode>(defaultMode);
  const [selected, setSelected] = useState('');

  const [qty, setQty] = useState(1);
  const [detailsOpen, setDetailsOpen] = useState(true);
  const [careOpen, setCareOpen] = useState(!!product.plantGuide);
  const [justAdded, setJustAdded] = useState(false);

  const presentation = resolveProductPresentation(product, mode, selected);
  const potPresentation = resolveProductPresentation(product, 'pot', selected);
  const activeMode = presentation.mode;
  const sizes = presentation.sizes;
  const size = presentation.currentSize;
  const display = presentation.currentContent;
  const gallery = display.gallery?.length ? display.gallery : [display.image];
  const galleryKey = gallery.join('||');
  const [activeImage, setActiveImage] = useState(display.image || gallery[0] || product.image);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [reviewCount, setReviewCount] = useState(product.reviews);
  const [reviewAverage, setReviewAverage] = useState(product.rating);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');

  const unit = presentation.unitPrice;
  const total = unit * qty;

  const canToggleModes = presentation.availableModes.length > 1;

  const placementCue = getPlacementCue({
    name: display.name,
    short: display.short,
    category: product.category,
  });
  const reasonBlocks = getReasonBlocks(product, activeMode);
  const categoryLabel = getCategoryLabel(product.category);
  const trustSignals = [
    {
      label: 'Material',
      value: product.details.material || '100% Natural Kenyan Clay',
    },
    {
      label: 'Finish',
      value: product.details.finish || 'Natural Terracotta',
    },
    {
      label: 'Care',
      value: product.plantGuide ? 'Plant care guide included' : 'Easy to pair with your own plant',
    },
  ];

  const modeLabel =
    activeMode === 'plant'
      ? 'Pot + Plant'
      : product.forcePotOnly || product.decorative
      ? 'Clay Form'
      : 'Clay Form';

  const modeSupport =
    display.cardDescription ||
    (activeMode === 'plant'
      ? 'A complete piece, ready for the space you have in mind.'
      : 'Choose the clay form now and style it with your own plant later.');

  useEffect(() => {
    setSelected('');
  }, [product.slug]);

  useEffect(() => {
    setActiveImage(display.image || gallery[0] || product.image);
  }, [activeMode, display.image, galleryKey, product.image, product.slug, size.key]);

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      setReviewLoading(true);

      try {
        const response = await fetch(
          `/api/reviews?slug=${encodeURIComponent(product.slug)}`,
          { cache: 'no-store' }
        );
        const data = (await response.json()) as {
          ok: boolean;
          summary?: {
            rating: number;
            reviewCount: number;
          };
          reviews?: ReviewItem[];
        };

        if (!response.ok || !data.ok) {
          throw new Error('Unable to load reviews.');
        }

        if (active) {
          setReviews(data.reviews || []);
          setReviewAverage(data.summary?.rating ?? product.rating);
          setReviewCount(data.summary?.reviewCount ?? product.reviews);
        }
      } catch {
        if (active) {
          setReviews([]);
          setReviewAverage(product.rating);
          setReviewCount(product.reviews);
        }
      } finally {
        if (active) {
          setReviewLoading(false);
        }
      }
    }

    void loadReviews();

    return () => {
      active = false;
    };
  }, [product.rating, product.reviews, product.slug]);

  function handleAddToCart() {
    addToCart(product, {
      mode: activeMode,
      quantity: qty,
      unitPrice: unit,
      sizeLabel: size.label,
      name: display.name,
      image: display.image,
    });
    void trackEvent(
      'add_to_cart',
      {
        slug: product.slug,
        mode: activeMode,
        quantity: qty,
        size: size.label,
        value: total,
      },
      'analytics'
    );

    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2200);
  }

  async function handleReviewSubmit() {
    if (!isLoggedIn) {
      setIsLoggedIn(true);
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');
    setReviewFeedback('');

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slug: product.slug,
          rating: reviewRating,
          review: reviewText,
        }),
      });
      const data = (await response.json()) as {
        ok: boolean;
        error?: string;
        message?: string;
      };

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Unable to submit your review.');
      }

      setReviewText('');
      setReviewRating(5);
      setReviewFeedback(
        data.message || 'Your review has been received and is waiting for approval.'
      );
      void trackEvent(
        'review_submit',
        {
          slug: product.slug,
          rating: reviewRating,
        },
        'analytics'
      );
    } catch (error: any) {
      setReviewError(error?.message || 'Unable to submit your review.');
    } finally {
      setReviewSubmitting(false);
    }
  }

  async function handleCopyLink() {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareFeedback('Link copied. You can share this piece anywhere.');
      void trackEvent(
        'product_share',
        {
          slug: product.slug,
          method: 'copy_link',
        },
        'analytics'
      );
    } catch {
      setShareFeedback('Copy was blocked on this browser. Use the WhatsApp share instead.');
    }
  }

  function handleWhatsappShare() {
    if (typeof window === 'undefined') {
      return;
    }

    const message = `Take a look at ${display.name} from TuloPots: ${window.location.href}`;
    void trackEvent(
      'product_share',
      {
        slug: product.slug,
        method: 'whatsapp',
      },
      'analytics'
    );
    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
  }

  return (
    <main className="container-shell py-10 md:py-16">
      <Breadcrumbs
        items={[
          ['Home', '/'],
          [
            categoryLabel,
            `/${product.category}`,
          ],
          [product.name, `/product/${product.slug}`],
        ]}
      />

      <Link
        href={`/${product.category}`}
        className="mt-8 inline-flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-[var(--tp-text)]/65 transition hover:text-[var(--tp-heading)]"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to collection
      </Link>

      <section className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_1fr]">
        <div>
          <div className="relative overflow-hidden rounded-[2rem] border border-[var(--tp-border)] bg-[var(--tp-surface)] shadow-[0_18px_50px_rgba(90,52,34,0.08)]">
            {product.badge && (
              <span className="absolute left-4 top-4 z-10 rounded-full bg-[var(--tp-accent-soft)] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-accent-strong)]">
                {product.badge}
              </span>
            )}

            <button
              onClick={() => (isLoggedIn ? toggleWishlist(product.slug) : setIsLoggedIn(true))}
              className="absolute right-4 top-4 z-10 rounded-full bg-white/95 p-3 shadow-md transition hover:scale-110"
              aria-label="Add to wishlist"
            >
              <Heart
                className={`h-5 w-5 ${
                  wishlist.includes(product.slug)
                    ? 'fill-[var(--tp-accent)] text-[var(--tp-accent)]'
                    : 'text-[var(--tp-text-muted)]'
                }`}
              />
            </button>

            <div className="relative">
              <Image
                src={activeImage}
                alt={display.name}
                width={1000}
                height={1200}
                sizes="(max-width: 1024px) 100vw, 52vw"
                className="h-[32rem] w-full object-cover transition duration-500 md:h-[40rem]"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-4 gap-4">
            {gallery.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(img)}
                className={`overflow-hidden rounded-[1.25rem] border transition ${
                  activeImage === img
                    ? 'border-[var(--tp-accent)] shadow-[var(--tp-shadow-soft)]'
                    : 'border-[var(--tp-border)] hover:border-[var(--tp-border-strong)]'
                }`}
              >
                <Image
                  src={img}
                  alt={`${display.name} view ${index + 1}`}
                  width={400}
                  height={400}
                  sizes="(max-width: 640px) 22vw, 12vw"
                  className="h-24 w-full object-cover transition duration-500 hover:scale-105"
                />
              </button>
            ))}
          </div>
        </div>

        <div className="h-fit lg:sticky lg:top-28">
          <div className="text-[11px] uppercase tracking-[0.18em] text-[var(--tp-text)]/60">
            {product.sku}
          </div>

          <h1 className="mt-4 serif-display text-5xl leading-[0.95] text-[var(--tp-heading)] md:text-6xl">
            {display.name}
          </h1>

          <div className="mt-4 max-w-xl text-base italic text-[var(--tp-accent)]">
            {display.short}
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(reviewAverage || product.rating)
                      ? 'fill-[var(--tp-accent-strong)] text-[var(--tp-accent-strong)]'
                      : 'text-[var(--tp-border-strong)]'
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-[var(--tp-text)]/65">
              {(reviewAverage || product.rating).toFixed(1)} ({reviewCount} reviews)
            </div>
            <div className="rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tp-text)]/70">
              Handcrafted in Kenya
            </div>
          </div>

          <div className="mt-7 flex items-end gap-3">
            <div className="serif-display text-5xl text-[var(--tp-heading)]">{money(unit)}</div>
            {canToggleModes && activeMode === 'plant' && potPresentation.unitPrice > 0 && (
              <div className="pb-1 text-sm text-[var(--tp-text)]/60">
                Clay form: {money(potPresentation.unitPrice)}
              </div>
            )}
          </div>

          <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--tp-text)]/72">{placementCue}</p>

          <p className="mt-7 max-w-xl text-sm leading-8 text-[var(--tp-text)]/75">
            {display.description}
          </p>

          {canToggleModes && (
            <div className="mt-8">
              <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-text)]/60">
                Choose your order
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMode('plant')}
                    className={`rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                      activeMode === 'plant'
                      ? 'bg-[var(--tp-accent)] text-[var(--tp-btn-primary-text)]'
                      : 'border border-[var(--tp-border)] bg-[var(--tp-card)] text-[var(--tp-text)]/75'
                    }`}
                  >
                  Pot + Plant
                </button>
                <button
                  onClick={() => setMode('pot')}
                    className={`rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                      activeMode === 'pot'
                      ? 'bg-[var(--tp-accent)] text-[var(--tp-btn-primary-text)]'
                      : 'border border-[var(--tp-border)] bg-[var(--tp-card)] text-[var(--tp-text)]/75'
                    }`}
                  >
                  Clay Form
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-5">
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-text)]/55">
              Selected option
            </div>
            <div className="mt-2 text-xl font-semibold text-[var(--tp-heading)]">{modeLabel}</div>
            <p className="mt-2 text-sm leading-7 text-[var(--tp-text)]/72">{modeSupport}</p>
          </div>

          <div className="mt-8">
            <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-text)]/60">
              Select size
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {sizes.map((option) => {
                const previewPrice = resolveProductPresentation(product, activeMode, option.key)
                  .unitPrice;

                return (
                  <button
                    key={option.key}
                    onClick={() => setSelected(option.key)}
                    className={`rounded-[1rem] border px-4 py-3 text-left transition ${
                      size.key === option.key
                        ? 'border-[var(--tp-accent)] bg-[var(--tp-accent-soft)] shadow-[var(--tp-shadow-soft)]'
                        : 'border-[var(--tp-border)] bg-[var(--tp-card)] hover:border-[var(--tp-border-strong)]'
                    }`}
                  >
                    <div className="text-sm font-semibold text-[var(--tp-heading)]">{option.label}</div>
                    <div className="mt-1 text-xs text-[var(--tp-text)]/55">{option.helper}</div>
                    <div className="mt-2 text-xs font-semibold text-[var(--tp-accent)]">
                      {money(previewPrice)}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]">
              Why this works
            </div>
            <div className="mt-4 grid gap-3 text-sm text-[var(--tp-text)]/75 sm:grid-cols-3">
              {reasonBlocks.map((reason) => (
                <div key={reason} className="rounded-2xl bg-[var(--tp-surface)] px-4 py-4">
                  {reason}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]">
              Rooted in Craft
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              {trustSignals.map((signal) => (
                <div key={signal.label} className="rounded-2xl bg-[var(--tp-surface)] px-4 py-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-text)]/55">
                    {signal.label}
                  </div>
                  <div className="mt-2 leading-6 text-[var(--tp-heading)]">{signal.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-5">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]">
              Share This Piece
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]"
              >
                <Link2 className="h-4 w-4 text-[var(--tp-accent)]" />
                Copy Link
              </button>
              <button
                type="button"
                onClick={handleWhatsappShare}
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white"
                style={{ background: 'var(--tp-accent)' }}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Share
              </button>
            </div>
            {shareFeedback ? (
              <div className="mt-3 text-sm text-[var(--tp-text)]/68">{shareFeedback}</div>
            ) : null}
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-5 shadow-[0_10px_28px_rgba(90,52,34,0.06)]">
            <div className="flex flex-col gap-5 md:flex-row md:items-center">
              <div className="inline-flex items-center self-start rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)]">
                <button
                  onClick={() => setQty((value) => Math.max(1, value - 1))}
                  className="px-4 py-3 text-[var(--tp-text)]/70 transition hover:text-[var(--tp-heading)]"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="min-w-[3rem] text-center text-sm font-medium text-[var(--tp-heading)]">
                  {qty}
                </div>
                <button
                  onClick={() => setQty((value) => value + 1)}
                  className="px-4 py-3 text-[var(--tp-text)]/70 transition hover:text-[var(--tp-heading)]"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1">
                <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-text)]/55">
                  Total
                </div>
                <div className="mt-1 serif-display text-3xl text-[var(--tp-heading)]">
                  {money(total)}
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
              <button
                onClick={handleAddToCart}
                className="rounded-full px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] transition hover:scale-[1.01] hover:opacity-92"
                style={{
                  background: 'var(--tp-accent-strong)',
                  color: 'var(--tp-btn-primary-text)',
                }}
              >
                {justAdded ? 'Added to Cart' : `Add to Cart — ${money(total)}`}
              </button>

              <Link
                href="/cart"
                className="inline-flex items-center justify-center rounded-full border border-[var(--tp-border)] bg-[var(--tp-surface)] px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--tp-heading)] transition hover:border-[var(--tp-border-strong)] hover:bg-[var(--tp-card)]"
              >
                View Cart
              </Link>
            </div>

            {justAdded && (
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-[var(--tp-accent-soft)] px-4 py-3 text-sm text-[var(--tp-heading)]">
                <Check className="h-4 w-4 text-[var(--tp-accent)]" />
                Added successfully. You can review or checkout from cart.
              </div>
            )}
          </div>

          <div className="mt-7 flex flex-wrap gap-6 border-t border-[var(--tp-border)] pt-6 text-sm text-[var(--tp-text)]/72">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-[var(--tp-accent)]" />
              Free delivery in Nairobi over KES 5,000
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-[var(--tp-accent)]" />
              Secure checkout
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="h-4 w-4 text-[var(--tp-accent)]" />
              Crafted terracotta
            </div>
          </div>

          <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-card)]">
            <button
              onClick={() => setDetailsOpen((state) => !state)}
              className="flex w-full items-center justify-between px-5 py-4 text-left"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]">
                Product Details
              </span>
              <ChevronDown
                className={`h-4 w-4 text-[var(--tp-text)]/65 transition ${
                  detailsOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {detailsOpen && (
              <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-[var(--tp-border)] px-5 py-5 text-sm">
                <div className="text-[var(--tp-text)]/55">Material</div>
                <div className="text-[var(--tp-heading)]">
                  {product.details.material || '100% Natural Kenyan Clay'}
                </div>

                <div className="text-[var(--tp-text)]/55">Selected size</div>
                <div className="text-[var(--tp-heading)]">{size.label}</div>

                <div className="text-[var(--tp-text)]/55">SKU</div>
                <div className="text-[var(--tp-heading)]">{product.sku}</div>

                <div className="text-[var(--tp-text)]/55">Finish</div>
                <div className="text-[var(--tp-heading)]">
                  {product.details.finish || 'Natural Terracotta'}
                </div>
              </div>
            )}
          </div>

          {!!product.plantGuide && (
            <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-[var(--tp-border)] bg-[var(--tp-card)]">
              <button
                onClick={() => setCareOpen((state) => !state)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-heading)]">
                  Plant Care Guide
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-[var(--tp-text)]/65 transition ${
                    careOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {careOpen && (
                <div className="grid grid-cols-2 gap-x-5 gap-y-3 border-t border-[var(--tp-border)] px-5 py-5 text-sm">
                  {Object.entries(product.plantGuide).map(([key, value]) => (
                    <div key={key} className="contents">
                      <div className="capitalize text-[var(--tp-text)]/55">{key}</div>
                      <div className="text-[var(--tp-heading)]">{String(value)}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="mt-8 rounded-[1.75rem] border border-[var(--tp-border)] bg-[var(--tp-card)] p-6">
            <div className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--tp-text)]/60">
              Reviews
            </div>

            {reviewLoading ? (
              <div className="text-sm leading-7 text-[var(--tp-text)]/72">
                Loading reviews...
              </div>
            ) : reviews.length ? (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-2xl bg-[var(--tp-surface)] p-4 text-sm leading-7 text-[var(--tp-text)]/75"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="font-semibold text-[var(--tp-heading)]">{review.name}</div>
                        <div className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[var(--tp-text)]/50">
                          {formatReviewDate(review.createdAt)}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {review.featured ? (
                          <div className="rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--tp-accent)]">
                            Featured
                          </div>
                        ) : null}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={`${review.id}-${star}`}
                              className={`h-3.5 w-3.5 ${
                                star <= review.rating
                                  ? 'fill-[var(--tp-accent-strong)] text-[var(--tp-accent-strong)]'
                                  : 'text-[var(--tp-border-strong)]'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="mt-2">{review.body}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl bg-[var(--tp-surface)] p-4 text-sm leading-7 text-[var(--tp-text)]/72">
                No approved reviews yet. Be the first to share how this piece
                lives in your space.
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-[var(--tp-border)] bg-[var(--tp-surface)] p-4">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--tp-text)]/55">
                Share your experience
              </div>
              <div className="mt-3 flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="rounded-full border border-[var(--tp-border)] bg-[var(--tp-card)] p-2 transition hover:border-[var(--tp-border-strong)]"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`h-4 w-4 ${
                        star <= reviewRating
                          ? 'fill-[var(--tp-accent-strong)] text-[var(--tp-accent-strong)]'
                          : 'text-[var(--tp-border-strong)]'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                className="mt-3 min-h-[110px] w-full rounded-3xl border border-[var(--tp-border)] bg-[var(--tp-card)] p-4 text-[var(--tp-heading)] outline-none transition focus:border-[var(--tp-accent)]"
                placeholder={
                  isLoggedIn
                    ? 'Share how the piece arrived, how it feels, or where it now lives.'
                    : 'Sign in to leave a review.'
                }
              />
              {reviewError ? (
                <div className="mt-3 rounded-2xl bg-[var(--tp-card)] px-4 py-3 text-sm text-[var(--tp-accent)]">
                  {reviewError}
                </div>
              ) : null}
              {reviewFeedback ? (
                <div className="mt-3 rounded-2xl bg-[var(--tp-card)] px-4 py-3 text-sm text-[var(--tp-heading)]">
                  {reviewFeedback}
                </div>
              ) : null}
              <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-[var(--tp-text)]/60">
                  Reviews are published after moderation.
                </div>
                <button
                  type="button"
                  onClick={handleReviewSubmit}
                  disabled={reviewSubmitting}
                  className="rounded-full px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] disabled:opacity-60"
                  style={{
                    background: 'var(--tp-accent-strong)',
                    color: 'var(--tp-btn-primary-text)',
                  }}
                >
                  {reviewSubmitting ? 'Sending...' : isLoggedIn ? 'Post Review' : 'Sign In to Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-20">
        <div className="text-center">
          <h2 className="serif-display text-5xl text-[var(--tp-heading)]">You May Also Like</h2>
          <p className="mt-3 text-sm text-[var(--tp-text)]/65">
            More clay pieces selected to complement this choice
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {relatedProducts.map((item) => (
            <ProductCard key={item.slug} product={item} collection />
          ))}
        </div>
      </section>
    </main>
  );
}
