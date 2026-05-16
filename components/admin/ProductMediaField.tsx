'use client';

import { upload } from '@vercel/blob/client';
import { ImagePlus, Link, Loader2, Star, Trash2, UploadCloud } from 'lucide-react';
import { useRef, useState } from 'react';

type Props = {
  gallery: string[];
  mainImage: string;
  onChange: (next: { gallery: string[]; mainImage: string }) => void;
  disabled?: boolean;
};

export function ProductMediaField({ gallery, mainImage, onChange, disabled }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  async function uploadFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    if (!fileArray.length || disabled) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const urls: string[] = [];

      for (const file of fileArray) {
        const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
        if (!ALLOWED.has(file.type)) {
          throw new Error(
            `"${file.name}" is not a supported image type. Use JPEG, PNG, WebP, or GIF.`
          );
        }

        const ext =
          file.type === 'image/png'
            ? 'png'
            : file.type === 'image/webp'
              ? 'webp'
              : file.type === 'image/gif'
                ? 'gif'
                : 'jpg';
        // Client-side upload: file goes browser → Vercel Blob directly.
        // No serverless 4.5 MB limit applies.
        const blob = await upload(
          `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`,
          file,
          {
            access: 'public',
            handleUploadUrl: '/api/admin/uploads/product-images',
          }
        );
        urls.push(blob.url);
      }

      const nextGallery = [...gallery, ...urls].slice(0, 20);
      onChange({
        gallery: nextGallery,
        mainImage: mainImage || nextGallery[0] || '',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to upload the selected images.';
      setUploadError(msg);
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  function pasteUrl() {
    const url = window.prompt('Paste a Vercel Blob URL (or any public image URL):');
    if (!url?.trim()) return;
    const trimmed = url.trim();
    if (gallery.includes(trimmed)) return; // already added
    const nextGallery = [...gallery, trimmed].slice(0, 20);
    onChange({
      gallery: nextGallery,
      mainImage: mainImage || nextGallery[0] || '',
    });
  }

  function removeImage(image: string) {
    const nextGallery = gallery.filter((item) => item !== image);
    onChange({
      gallery: nextGallery,
      mainImage: mainImage === image ? nextGallery[0] || '' : mainImage,
    });
  }

  function setCover(image: string) {
    onChange({ gallery, mainImage: image });
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
          Product gallery
        </div>

        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            void uploadFiles(e.dataTransfer.files);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
          className="rounded-[1.5rem] border border-dashed p-6 text-center transition"
          style={{
            borderColor: dragActive ? 'var(--tp-accent)' : 'var(--tp-border)',
            background: dragActive ? 'var(--tp-accent-soft)' : 'var(--tp-surface)',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => { if (e.target.files) void uploadFiles(e.target.files); }}
            disabled={disabled}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin tp-accent" />
              <div className="text-sm tp-heading">Uploading to Blob storage…</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tp-accent-soft)]">
                <UploadCloud className="h-6 w-6 tp-accent" />
              </div>
              <div className="text-sm font-medium tp-heading">Drag and drop images here</div>
              <div className="max-w-md text-xs leading-6 tp-text-muted">
                Upload multiple images at once. Files go directly to Blob storage — no size limit.
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] tp-border tp-card tp-heading">
                  <ImagePlus className="h-4 w-4 tp-accent" />
                  Choose images
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Paste URL button */}
        <button
          type="button"
          onClick={pasteUrl}
          disabled={disabled}
          className="inline-flex items-center gap-2 self-start rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition disabled:opacity-60"
          style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}
        >
          <Link className="h-3.5 w-3.5 tp-accent" />
          Paste image URL
        </button>

        {uploadError ? (
          <div className="rounded-[1rem] border px-4 py-3 text-sm" style={{ borderColor: 'var(--tp-border)', color: 'var(--tp-accent)' }}>
            {uploadError}
          </div>
        ) : null}
      </div>

      {/* Gallery grid */}
      {gallery.length ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {gallery.map((image, index) => (
            <div
              key={`${image.slice(0, 40)}-${index}`}
              className="overflow-hidden rounded-[1.25rem] border"
              style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt={`Product gallery ${index + 1}`}
                className="h-56 w-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="grid gap-2 p-3">
                <button
                  type="button"
                  onClick={() => setCover(image)}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{
                    background: mainImage === image ? 'var(--tp-accent)' : 'var(--tp-surface)',
                    color: mainImage === image ? 'var(--tp-btn-primary-text)' : 'var(--tp-heading)',
                    border: mainImage === image ? 'none' : '1px solid var(--tp-border)',
                  }}
                >
                  <Star className="h-3.5 w-3.5" />
                  {mainImage === image ? 'Main image' : 'Set as main'}
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(image)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
                <div
                  className="truncate rounded-[0.75rem] border px-2 py-1.5 font-mono text-[9px]"
                  style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)', color: 'var(--tp-text-muted)' }}
                  title={image}
                >
                  {image.startsWith('http') ? image.split('/').pop() : image}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
