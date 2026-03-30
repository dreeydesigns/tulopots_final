'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  adminAvailableSizeOptions,
  type ProductMode,
  type ProductModeContent,
  type ProductModeContentMap,
  type ProductSizeKey,
} from '@/lib/product-variants';
import { ProductMediaField } from './ProductMediaField';

type Props = {
  category: string;
  forcePotOnly?: boolean;
  modeContent: ProductModeContentMap;
  availableSizes: ProductSizeKey[];
  onChange: (nextValue: ProductModeContentMap) => void;
  disabled?: boolean;
};

const inputStyle = {
  borderColor: 'var(--tp-border)',
  background: 'var(--tp-card)',
  color: 'var(--tp-heading)',
} as const;

const helperStyle = {
  color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)',
} as const;

function emptyModeContent(): ProductModeContent {
  return {
    name: '',
    short: '',
    description: '',
    cardDescription: '',
    price: 0,
    image: '',
    gallery: [],
    sizeMedia: {},
  };
}

function modeLabel(mode: ProductMode) {
  return mode === 'plant' ? 'Placed with Plant' : 'Clay Form';
}

export function ProductVariantEditor({
  category,
  forcePotOnly,
  modeContent,
  availableSizes,
  onChange,
  disabled,
}: Props) {
  const modeTabs = useMemo<ProductMode[]>(
    () => (category === 'pots' || forcePotOnly ? ['pot'] : ['plant', 'pot']),
    [category, forcePotOnly]
  );
  const [activeMode, setActiveMode] = useState<ProductMode>(modeTabs[0]);
  const [activeSize, setActiveSize] = useState<ProductSizeKey>(availableSizes[0] || 'medium');

  useEffect(() => {
    if (!modeTabs.includes(activeMode)) {
      setActiveMode(modeTabs[0]);
    }
  }, [activeMode, modeTabs]);

  useEffect(() => {
    if (!availableSizes.includes(activeSize)) {
      setActiveSize(availableSizes[0] || 'medium');
    }
  }, [activeSize, availableSizes]);

  const currentMode = modeContent[activeMode] || emptyModeContent();
  const currentSizeLabel =
    adminAvailableSizeOptions.find((option) => option.key === activeSize)?.label || 'Selected size';
  const currentSizeMedia = currentMode.sizeMedia?.[activeSize] || {
    image: '',
    gallery: [],
  };

  function patchModeContent(
    mode: ProductMode,
    updater: (current: ProductModeContent) => ProductModeContent
  ) {
    onChange({
      ...modeContent,
      [mode]: updater(modeContent[mode] || emptyModeContent()),
    });
  }

  function clearSizeOverride(mode: ProductMode, sizeKey: ProductSizeKey) {
    patchModeContent(mode, (current) => {
      const nextSizeMedia = { ...(current.sizeMedia || {}) };
      delete nextSizeMedia[sizeKey];

      return {
        ...current,
        sizeMedia: nextSizeMedia,
      };
    });
  }

  return (
    <div className="grid gap-5 rounded-[1.5rem] border p-5" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)' }}>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--tp-accent)' }}>
          Product presentation
        </div>
        <div className="mt-2 text-sm leading-7" style={helperStyle}>
          Set the exact name, price, description, and gallery customers should see for each order mode. Size overrides only need to be added where the imagery should change.
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {modeTabs.map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setActiveMode(mode)}
            className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
            style={{
              background: activeMode === mode ? 'var(--tp-accent)' : 'var(--tp-card)',
              color: activeMode === mode ? 'var(--tp-btn-primary-text)' : 'var(--tp-heading)',
              border: activeMode === mode ? 'none' : '1px solid var(--tp-border)',
            }}
          >
            {modeLabel(mode)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em]" style={helperStyle}>
            Display name
          </span>
          <input
            value={currentMode.name}
            onChange={(event) =>
              patchModeContent(activeMode, (current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
            style={inputStyle}
            disabled={disabled}
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em]" style={helperStyle}>
            Price
          </span>
          <input
            value={currentMode.price ? String(currentMode.price) : ''}
            onChange={(event) =>
              patchModeContent(activeMode, (current) => ({
                ...current,
                price: Number(event.target.value || 0),
              }))
            }
            inputMode="numeric"
            className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
            style={inputStyle}
            disabled={disabled}
            placeholder="KES"
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em]" style={helperStyle}>
          Short line
        </span>
        <input
          value={currentMode.short}
          onChange={(event) =>
            patchModeContent(activeMode, (current) => ({
              ...current,
              short: event.target.value,
            }))
          }
          className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
          style={inputStyle}
          disabled={disabled}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em]" style={helperStyle}>
          Description
        </span>
        <textarea
          value={currentMode.description}
          onChange={(event) =>
            patchModeContent(activeMode, (current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          rows={4}
          className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
          style={inputStyle}
          disabled={disabled}
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.18em]" style={helperStyle}>
          Card description
        </span>
        <textarea
          value={currentMode.cardDescription}
          onChange={(event) =>
            patchModeContent(activeMode, (current) => ({
              ...current,
              cardDescription: event.target.value,
            }))
          }
          rows={3}
          className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
          style={inputStyle}
          disabled={disabled}
        />
      </label>

      <ProductMediaField
        gallery={currentMode.gallery || []}
        mainImage={currentMode.image || ''}
        onChange={({ gallery, mainImage }) =>
          patchModeContent(activeMode, (current) => ({
            ...current,
            gallery,
            image: mainImage,
          }))
        }
        disabled={disabled}
      />

      {availableSizes.length ? (
        <div className="grid gap-4 rounded-[1.25rem] border p-4" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--tp-accent)' }}>
              Size image swaps
            </div>
            <div className="mt-2 text-sm leading-7" style={helperStyle}>
              Add optional galleries for each size. If a size has no custom images, the main {modeLabel(activeMode).toLowerCase()} gallery is reused automatically.
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {availableSizes.map((sizeKey) => {
              const option = adminAvailableSizeOptions.find((entry) => entry.key === sizeKey);
              const hasOverride = !!currentMode.sizeMedia?.[sizeKey]?.image;

              return (
                <button
                  key={sizeKey}
                  type="button"
                  onClick={() => setActiveSize(sizeKey)}
                  className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                  style={{
                    background:
                      activeSize === sizeKey
                        ? 'var(--tp-accent)'
                        : hasOverride
                          ? 'var(--tp-accent-soft)'
                          : 'var(--tp-surface)',
                    color:
                      activeSize === sizeKey
                        ? 'var(--tp-btn-primary-text)'
                        : hasOverride
                          ? 'var(--tp-accent)'
                          : 'var(--tp-heading)',
                    border:
                      activeSize === sizeKey ? 'none' : '1px solid var(--tp-border)',
                  }}
                >
                  {option?.label || sizeKey}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-sm" style={helperStyle}>
              Editing {currentSizeLabel} imagery for {modeLabel(activeMode).toLowerCase()}.
            </div>
            {currentSizeMedia.image || currentSizeMedia.gallery.length ? (
              <button
                type="button"
                onClick={() => clearSizeOverride(activeMode, activeSize)}
                className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{
                  borderColor: 'var(--tp-border)',
                  background: 'var(--tp-card)',
                  color: 'var(--tp-heading)',
                }}
              >
                Use main gallery instead
              </button>
            ) : null}
          </div>

          <ProductMediaField
            gallery={currentSizeMedia.gallery || []}
            mainImage={currentSizeMedia.image || ''}
            onChange={({ gallery, mainImage }) =>
              patchModeContent(activeMode, (current) => ({
                ...current,
                sizeMedia: {
                  ...(current.sizeMedia || {}),
                  [activeSize]: {
                    image: mainImage,
                    gallery,
                  },
                },
              }))
            }
            disabled={disabled}
          />
        </div>
      ) : null}
    </div>
  );
}
