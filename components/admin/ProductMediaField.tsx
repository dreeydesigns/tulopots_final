'use client';

import { ImagePlus, Loader2, Star, Trash2, UploadCloud } from 'lucide-react';
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
    if (!files.length || disabled) {
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => formData.append('files', file));

      const response = await fetch('/api/admin/uploads/product-images', {
        method: 'POST',
        body: formData,
      });
      const data = (await response.json()) as {
        ok?: boolean;
        error?: string;
        images?: Array<{ url: string }>;
      };

      if (!response.ok || !data.ok || !data.images?.length) {
        throw new Error(data.error || 'Unable to upload the selected images.');
      }

      const nextGallery = [...gallery, ...data.images.map((image) => image.url)].slice(0, 12);
      onChange({
        gallery: nextGallery,
        mainImage: mainImage || nextGallery[0] || '',
      });
    } catch (error: any) {
      setUploadError(error?.message || 'Unable to upload the selected images.');
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  function removeImage(image: string) {
    const nextGallery = gallery.filter((item) => item !== image);
    onChange({
      gallery: nextGallery,
      mainImage: mainImage === image ? nextGallery[0] || '' : mainImage,
    });
  }

  function setCover(image: string) {
    onChange({
      gallery,
      mainImage: image,
    });
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] tp-text-muted">
          Product gallery
        </div>
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            event.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            void uploadFiles(event.dataTransfer.files);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
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
            onChange={(event) => {
              if (event.target.files) {
                void uploadFiles(event.target.files);
              }
            }}
            disabled={disabled}
          />

          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-6 w-6 animate-spin tp-accent" />
              <div className="text-sm tp-heading">
                Cropping and preparing your gallery...
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tp-accent-soft)]">
                <UploadCloud className="h-6 w-6 tp-accent" />
              </div>
              <div className="text-sm font-medium tp-heading">
                Drag and drop images here
              </div>
              <div className="max-w-md text-xs leading-6 tp-text-muted">
                Upload multiple images at once. Each one is automatically cropped to the
                storefront aspect ratio so nothing appears stretched or distorted.
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] tp-border tp-card tp-heading">
                <ImagePlus className="h-4 w-4 tp-accent" />
                Choose images
              </div>
            </div>
          )}
        </div>
        {uploadError ? <div className="text-sm tp-accent">{uploadError}</div> : null}
      </div>

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
              />
              <div className="grid gap-2 p-3">
                <button
                  type="button"
                  onClick={() => setCover(image)}
                  className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{
                    background:
                      mainImage === image ? 'var(--tp-accent)' : 'var(--tp-surface)',
                    color:
                      mainImage === image
                        ? 'var(--tp-btn-primary-text)'
                        : 'var(--tp-heading)',
                    border:
                      mainImage === image ? 'none' : '1px solid var(--tp-border)',
                  }}
                >
                  <Star className="h-3.5 w-3.5" />
                  {mainImage === image ? 'Main image' : 'Set as main'}
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(image)}
                  className="inline-flex items-center justify-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em]"
                  style={{
                    borderColor: 'var(--tp-border)',
                    background: 'var(--tp-card)',
                    color: 'var(--tp-heading)',
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
