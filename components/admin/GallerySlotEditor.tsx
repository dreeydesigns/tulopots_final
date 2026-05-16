'use client';

import { upload } from '@vercel/blob/client';
import { ImagePlus, Loader2, Trash2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import {
  ALL_SLOTS,
  SLOT_DESCRIPTION,
  SLOT_LABEL,
  type GallerySlots,
} from '@/lib/gallery-slots';

type Props = {
  potId: string;
  slots: GallerySlots;
  onChange: (next: GallerySlots) => void;
  disabled?: boolean;
};

const helperStyle = {
  color: 'color-mix(in srgb, var(--tp-text) 62%, transparent 38%)',
} as const;

export function GallerySlotEditor({ potId, slots, onChange, disabled }: Props) {
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pendingSlotRef = useRef<number | null>(null);

  function openFilePicker(slot: number) {
    if (disabled) return;
    pendingSlotRef.current = slot;
    inputRef.current?.click();
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    const slot = pendingSlotRef.current;
    if (!files?.length || slot === null) return;

    setUploadingSlot(slot);
    setUploadError('');

    try {
      const file = files[0];
      const ext =
        file.type === 'image/png'
          ? 'png'
          : file.type === 'image/webp'
            ? 'webp'
            : file.type === 'image/gif'
              ? 'gif'
              : 'jpg';

      // Client-side upload: file goes browser → Vercel Blob directly.
      const blob = await upload(
        `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`,
        file,
        {
          access: 'public',
          handleUploadUrl: '/api/admin/uploads/product-images',
        }
      );

      onChange({ ...slots, [slot]: blob.url });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Upload failed.';
      setUploadError(msg);
    } finally {
      setUploadingSlot(null);
      pendingSlotRef.current = null;
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function clearSlot(slot: number) {
    const next = { ...slots };
    delete next[slot];
    onChange(next);
  }

  function pasteUrl(slot: number) {
    const url = window.prompt(
      `Paste a Vercel Blob URL for slot ${slot} — ${SLOT_LABEL[slot]}:`
    );
    if (url?.trim()) {
      onChange({ ...slots, [slot]: url.trim() });
    }
  }

  const filled = ALL_SLOTS.filter((s) => slots[s]).length;

  return (
    <div className="grid gap-5">
      {/* hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled}
      />

      {/* header */}
      <div>
        <div
          className="text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: 'var(--tp-accent)' }}
        >
          Gallery slots (1–13)
        </div>
        <div className="mt-2 flex items-center gap-3">
          <div className="text-sm leading-7" style={helperStyle}>
            Each slot maps to a specific image variant. Missing slots are hidden on the storefront.
          </div>
          <div
            className="shrink-0 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]"
            style={{ background: 'var(--tp-accent-soft)', color: 'var(--tp-accent)' }}
          >
            {filled} / {ALL_SLOTS.length} filled
          </div>
        </div>
      </div>

      {uploadError ? (
        <div className="rounded-[1rem] border px-4 py-3 text-sm" style={{ borderColor: 'var(--tp-border)', color: 'var(--tp-accent)' }}>
          {uploadError}
        </div>
      ) : null}

      {/* slot grid */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ALL_SLOTS.map((slot) => {
          const url = slots[slot];
          const isLoading = uploadingSlot === slot;
          return (
            <div
              key={slot}
              className="overflow-hidden rounded-[1.25rem] border"
              style={{
                borderColor: url ? 'var(--tp-border-strong)' : 'var(--tp-border)',
                background: 'var(--tp-card)',
              }}
            >
              {/* slot image or placeholder */}
              <div
                className="relative flex items-center justify-center"
                style={{
                  height: 160,
                  background: url ? 'transparent' : 'var(--tp-surface)',
                }}
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin tp-accent" />
                ) : url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Slot ${slot} – ${SLOT_LABEL[slot]}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => clearSlot(slot)}
                      disabled={disabled}
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full"
                      style={{ background: 'rgba(0,0,0,0.55)', color: '#fff' }}
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-full"
                      style={{ background: 'var(--tp-accent-soft)' }}
                    >
                      <ImagePlus className="h-5 w-5 tp-accent" />
                    </div>
                    <div className="text-[10px] leading-4" style={helperStyle}>
                      No image
                    </div>
                  </div>
                )}
              </div>

              {/* slot meta + actions */}
              <div className="grid gap-2 p-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold"
                      style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}
                    >
                      {slot}
                    </span>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.14em] tp-heading truncate">
                      {SLOT_LABEL[slot]}
                    </span>
                  </div>
                  <div className="mt-1 text-[10px] leading-[1.5] pl-7" style={helperStyle}>
                    {SLOT_DESCRIPTION[slot]}
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => openFilePicker(slot)}
                    disabled={disabled || isLoading}
                    className="flex-1 rounded-full py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition"
                    style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => pasteUrl(slot)}
                    disabled={disabled || isLoading}
                    className="flex-1 rounded-full border py-2 text-[10px] font-semibold uppercase tracking-[0.14em] transition"
                    style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}
                  >
                    Paste URL
                  </button>
                </div>

                {url ? (
                  <div
                    className="truncate rounded-[0.75rem] border px-2 py-1.5 font-mono text-[9px]"
                    style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)', color: 'var(--tp-text-muted)' }}
                    title={url}
                  >
                    {url.split('/').pop()}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* naming convention reference */}
      <div
        className="rounded-[1.25rem] border p-4"
        style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)' }}
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] tp-heading mb-2">
          Naming convention for auto-detection
        </div>
        <div className="grid gap-1 font-mono text-[10px]" style={helperStyle}>
          <div>{potId}_standard_soil_plant.jpg → Slot 1</div>
          <div>{potId}_standard_pot_only.jpg → Slot 2</div>
          <div>{potId}_standard_soil_only.jpg → Slot 3</div>
          <div>{potId}_standard_soil_plant_2.jpg → Slot 4</div>
          <div>{potId}_small_soil_plant.jpg → Slot 10</div>
          <div>{potId}_medium_soil_plant.jpg → Slot 11</div>
          <div>{potId}_large_soil_plant.jpg → Slot 12</div>
          <div>{potId}_large_soil_plant_2.jpg → Slot 13</div>
        </div>
        <div className="mt-2 text-[10px]" style={helperStyle}>
          After uploading with the correct name, re-run{' '}
          <code className="font-mono">npx tsx scripts/generate-image-manifest.ts</code>{' '}
          to auto-populate these slots.
        </div>
      </div>
    </div>
  );
}
