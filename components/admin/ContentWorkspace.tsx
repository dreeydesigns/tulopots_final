'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, ImagePlus, Loader2, Plus, Trash2 } from 'lucide-react';
import { imageByKey } from '@/lib/site';

type ManagedPageRecord = {
  key: string;
  label: string;
  route: string;
  description: string;
  tips: string[];
  payload: Record<string, any>;
  defaultPayload: Record<string, any>;
  updatedAt: string | null;
};

type ManagedPageResponse = {
  ok: boolean;
  page?: ManagedPageRecord;
  error?: string;
};

function cloneDeep<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function humanizeKey(value: string) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^\w/, (char) => char.toUpperCase());
}

function isObject(value: unknown): value is Record<string, any> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isImageValue(value: unknown, template: unknown) {
  const candidate = isObject(value) ? value : isObject(template) ? template : null;
  if (!candidate) return false;
  return 'src' in candidate && 'alt' in candidate;
}

function mergeTemplates(a: any, b: any): any {
  if (Array.isArray(a) && Array.isArray(b)) {
    return [mergeTemplates(a[0], b[0])];
  }

  if (isObject(a) || isObject(b)) {
    const left = isObject(a) ? a : {};
    const right = isObject(b) ? b : {};
    const keys = Array.from(new Set([...Object.keys(left), ...Object.keys(right)]));

    return Object.fromEntries(
      keys.map((key) => [key, mergeTemplates(left[key], right[key])])
    );
  }

  return b ?? a ?? '';
}

function createEmptyValue(template: any): any {
  if (Array.isArray(template)) {
    return [];
  }

  if (isObject(template)) {
    return Object.fromEntries(
      Object.keys(template).map((key) => [key, createEmptyValue(template[key])])
    );
  }

  if (typeof template === 'number') return 0;
  if (typeof template === 'boolean') return false;
  return '';
}

function getArrayTemplate(value: any[], template: any) {
  const templateArray = Array.isArray(template) ? template : [];
  if (templateArray.length) {
    return templateArray.reduce((current, item) => mergeTemplates(current, item), templateArray[0]);
  }

  return value.length ? value[0] : '';
}

function shouldUseTextarea(fieldKey: string, value: string) {
  return (
    /intro|description|body|text|answer|message/i.test(fieldKey) ||
    value.length > 80 ||
    value.includes('\n')
  );
}

function previewImage(src: string) {
  const normalized = src.trim();
  if (!normalized) return '';
  return imageByKey[normalized as keyof typeof imageByKey] || normalized;
}

function FieldShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-[1.35rem] border px-4 py-4"
      style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)' }}
    >
      <div
        className="text-[11px] font-semibold uppercase tracking-[0.18em]"
        style={{ color: 'var(--tp-accent)' }}
      >
        {title}
      </div>
      {description ? <div className="mt-1 text-sm tp-text-soft">{description}</div> : null}
      <div className="mt-4">{children}</div>
    </div>
  );
}

function ImageField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: { src: string; alt: string };
  onChange: (next: { src: string; alt: string }) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  async function uploadFiles(files: FileList | File[]) {
    if (!files.length) return;

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
        throw new Error(data.error || 'Unable to upload the selected image.');
      }

      onChange({
        ...value,
        src: data.images[0].url,
      });
    } catch (error: any) {
      setUploadError(error?.message || 'Unable to upload the selected image.');
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  return (
    <FieldShell title={label} description="Replace, remove, or update the image and its alt text.">
      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          <div
            className="overflow-hidden rounded-[1rem] border"
            style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)' }}
          >
            {value.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewImage(value.src)}
                alt={value.alt || label}
                className="h-56 w-full object-cover"
              />
            ) : (
              <div className="flex h-56 items-center justify-center text-sm tp-text-muted">
                No image selected
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {isUploading ? 'Uploading...' : 'Upload image'}
            </button>

            <button
              type="button"
              onClick={() => onChange({ ...value, src: '' })}
              className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{
                borderColor: 'var(--tp-border)',
                background: 'var(--tp-card)',
                color: 'var(--tp-heading)',
              }}
            >
              <Trash2 className="h-4 w-4" />
              Remove image
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              if (event.target.files) {
                void uploadFiles(event.target.files);
              }
            }}
          />

          {uploadError ? <div className="text-sm tp-accent">{uploadError}</div> : null}
        </div>

        <div className="grid gap-4">
          <label className="grid gap-2 text-sm">
            <span className="tp-heading">Image source</span>
            <input
              value={value.src || ''}
              onChange={(event) => onChange({ ...value, src: event.target.value })}
              placeholder="Upload an image or use an image key like hero or workshop"
              className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
              style={{
                borderColor: 'var(--tp-border)',
                background: 'var(--tp-surface)',
                color: 'var(--tp-heading)',
              }}
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="tp-heading">Alt text</span>
            <textarea
              value={value.alt || ''}
              onChange={(event) => onChange({ ...value, alt: event.target.value })}
              rows={4}
              className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
              style={{
                borderColor: 'var(--tp-border)',
                background: 'var(--tp-surface)',
                color: 'var(--tp-heading)',
              }}
            />
          </label>
        </div>
      </div>
    </FieldShell>
  );
}

export function ContentWorkspace({ initialPages }: { initialPages: ManagedPageRecord[] }) {
  const [pages, setPages] = useState(initialPages);
  const [selectedKey, setSelectedKey] = useState(initialPages[0]?.key || null);
  const [draft, setDraft] = useState<Record<string, any> | null>(
    initialPages[0] ? cloneDeep(initialPages[0].payload) : null
  );
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedPage = useMemo(
    () => pages.find((page) => page.key === selectedKey) || null,
    [pages, selectedKey]
  );

  useEffect(() => {
    if (selectedPage) {
      setDraft(cloneDeep(selectedPage.payload));
      setMessage('');
      setError('');
    }
  }, [selectedPage]);

  async function savePage() {
    if (!selectedPage || !draft) return;

    setPending(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`/api/admin/pages/${selectedPage.key}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload: draft }),
      });
      const data = (await response.json()) as ManagedPageResponse;

      if (!response.ok || !data.ok || !data.page) {
        throw new Error(data.error || 'Unable to save that page.');
      }

      setPages((current) =>
        current.map((page) => (page.key === data.page!.key ? data.page! : page))
      );
      setDraft(cloneDeep(data.page.payload));
      setMessage('Page content saved.');
    } catch (saveError: any) {
      setError(saveError?.message || 'Unable to save that page.');
    } finally {
      setPending(false);
    }
  }

  function renderEditorNode({
    fieldKey,
    value,
    template,
    onChange,
    depth = 0,
  }: {
    fieldKey: string;
    value: any;
    template: any;
    onChange: (next: any) => void;
    depth?: number;
  }): React.ReactNode {
    if (isImageValue(value, template)) {
      const imageValue = isObject(value) ? value : isObject(template) ? createEmptyValue(template) : { src: '', alt: '' };
      return (
        <ImageField
          label={humanizeKey(fieldKey)}
          value={{ src: imageValue.src || '', alt: imageValue.alt || '' }}
          onChange={onChange}
        />
      );
    }

    if (Array.isArray(value) || Array.isArray(template)) {
      const arrayValue = Array.isArray(value) ? value : [];
      const itemTemplate = getArrayTemplate(arrayValue, template);

      return (
        <FieldShell
          title={humanizeKey(fieldKey)}
          description="Add, remove, or reorder the repeated items in this section."
        >
          <div className="space-y-3">
            {arrayValue.map((item, index) => (
              <div
                key={`${fieldKey}-${index}`}
                className="rounded-[1rem] border px-4 py-4"
                style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)' }}
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold tp-heading">
                    {humanizeKey(fieldKey)} {index + 1}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (index === 0) return;
                        const next = [...arrayValue];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        onChange(next);
                      }}
                      className="rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                      style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}
                    >
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (index === arrayValue.length - 1) return;
                        const next = [...arrayValue];
                        [next[index], next[index + 1]] = [next[index + 1], next[index]];
                        onChange(next);
                      }}
                      className="rounded-full border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                      style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}
                    >
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onChange(arrayValue.filter((_, itemIndex) => itemIndex !== index))}
                      className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                      style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {renderEditorNode({
                  fieldKey: `${fieldKey}-${index}`,
                  value: item,
                  template: itemTemplate,
                  onChange: (nextItem) => {
                    const next = [...arrayValue];
                    next[index] = nextItem;
                    onChange(next);
                  },
                  depth: depth + 1,
                })}
              </div>
            ))}

            <button
              type="button"
              onClick={() => onChange([...arrayValue, createEmptyValue(itemTemplate)])}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
              style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}
            >
              <Plus className="h-4 w-4" />
              Add item
            </button>
          </div>
        </FieldShell>
      );
    }

    if (isObject(value) || isObject(template)) {
      const objectValue = isObject(value) ? value : {};
      const templateValue = isObject(template) ? template : {};
      const keys = Array.from(
        new Set([...Object.keys(templateValue), ...Object.keys(objectValue)])
      );

      return (
        <FieldShell title={humanizeKey(fieldKey)}>
          <div className="grid gap-4 md:grid-cols-2">
            {keys.map((key) => (
              <div
                key={key}
                className={isImageValue(objectValue[key], templateValue[key]) ? 'md:col-span-2' : ''}
              >
                {renderEditorNode({
                  fieldKey: key,
                  value: objectValue[key],
                  template: templateValue[key],
                  onChange: (nextChild) => onChange({ ...objectValue, [key]: nextChild }),
                  depth: depth + 1,
                })}
              </div>
            ))}
          </div>
        </FieldShell>
      );
    }

    if (typeof value === 'boolean' || typeof template === 'boolean') {
      const checked = Boolean(value);
      return (
        <FieldShell title={humanizeKey(fieldKey)}>
          <div className="flex gap-3">
            {[
              { label: 'Off', checked: false },
              { label: 'On', checked: true },
            ].map((option) => (
              <button
                key={option.label}
                type="button"
                onClick={() => onChange(option.checked)}
                className="min-h-[44px] flex-1 rounded-full border px-4 py-3 text-sm font-semibold transition"
                style={{
                  borderColor: checked === option.checked ? 'var(--tp-accent)' : 'var(--tp-border)',
                  background:
                    checked === option.checked ? 'var(--tp-accent)' : 'var(--tp-surface)',
                  color:
                    checked === option.checked
                      ? 'var(--tp-btn-primary-text)'
                      : 'var(--tp-heading)',
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </FieldShell>
      );
    }

    if (typeof value === 'number' || typeof template === 'number') {
      return (
        <FieldShell title={humanizeKey(fieldKey)}>
          <input
            type="number"
            value={value ?? 0}
            onChange={(event) => onChange(Number(event.target.value))}
            className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
            style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)', color: 'var(--tp-heading)' }}
          />
        </FieldShell>
      );
    }

    const stringValue = String(value ?? '');
    const multiline = shouldUseTextarea(fieldKey, stringValue);

    return (
      <FieldShell title={humanizeKey(fieldKey)}>
        {multiline ? (
          <textarea
            value={stringValue}
            onChange={(event) => onChange(event.target.value)}
            rows={5}
            className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
            style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)', color: 'var(--tp-heading)' }}
          />
        ) : (
          <input
            value={stringValue}
            onChange={(event) => onChange(event.target.value)}
            className="w-full rounded-[1rem] border px-4 py-3 text-sm outline-none"
            style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)', color: 'var(--tp-heading)' }}
          />
        )}
      </FieldShell>
    );
  }

  return (
    <main className="tp-page pb-16 pt-24">
      <div className="container-shell">
        <div className="mb-10">
          <div className="text-xs font-semibold uppercase tracking-[0.22em] tp-accent">
            Content Management
          </div>
          <h1 className="mt-2 serif-display text-5xl tp-heading">Managed Pages</h1>
          <p className="mt-2 max-w-3xl text-sm leading-7 tp-text-soft">
            Edit every managed page section by section. Change text in normal fields,
            replace images with uploads, and add or remove repeated sections without touching code.
          </p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
          <div
            className="rounded-[2rem] border p-6"
            style={{ background: 'var(--tp-card)', borderColor: 'var(--tp-border)' }}
          >
            <div className="mb-4 flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)', color: 'var(--tp-heading)' }}
              >
                Back to admin
              </Link>
              <Link
                href="/admin/newsletter"
                className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}
              >
                Newsletter workspace
              </Link>
            </div>

            <div className="space-y-3">
              {pages.map((page) => {
                const active = page.key === selectedKey;

                return (
                  <button
                    key={page.key}
                    type="button"
                    onClick={() => setSelectedKey(page.key)}
                    className="w-full rounded-[1.25rem] border px-4 py-4 text-left"
                    style={{
                      borderColor: active ? 'var(--tp-accent)' : 'var(--tp-border)',
                      background: active
                        ? 'color-mix(in srgb, var(--tp-accent) 10%, var(--tp-card) 90%)'
                        : 'var(--tp-surface)',
                    }}
                  >
                    <div className="tp-heading">{page.label}</div>
                    <div className="mt-1 text-sm tp-text-soft">{page.route}</div>
                    <div className="mt-2 text-xs tp-text-muted">
                      {page.updatedAt ? `Updated ${new Date(page.updatedAt).toLocaleString()}` : 'Using default content'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="rounded-[2rem] border p-6"
            style={{ background: 'var(--tp-card)', borderColor: 'var(--tp-border)' }}
          >
            {selectedPage && draft ? (
              <div className="space-y-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="serif-display text-4xl tp-heading">{selectedPage.label}</div>
                    <div className="mt-2 text-sm leading-7 tp-text-soft">
                      {selectedPage.description}
                    </div>
                    <div className="mt-2 text-xs tp-text-muted">{selectedPage.route}</div>
                  </div>
                  <a
                    href={selectedPage.route}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                    style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)', color: 'var(--tp-heading)' }}
                  >
                    Preview page
                  </a>
                </div>

                <div className="rounded-[1.35rem] border px-4 py-4" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)' }}>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.18em] tp-accent">
                    Editing tips
                  </div>
                  <div className="mt-3 space-y-2 text-sm leading-7 tp-text-soft">
                    {selectedPage.tips.map((tip) => (
                      <div key={tip}>{tip}</div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  {Object.keys({ ...selectedPage.defaultPayload, ...draft }).map((key) => (
                    <div key={key}>
                      {renderEditorNode({
                        fieldKey: key,
                        value: draft[key],
                        template: selectedPage.defaultPayload[key],
                        onChange: (nextValue) =>
                          setDraft((current) => (current ? { ...current, [key]: nextValue } : current)),
                      })}
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => void savePage()}
                    disabled={pending}
                    className="rounded-full px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] disabled:opacity-60"
                    style={{ background: 'var(--tp-accent)', color: 'var(--tp-btn-primary-text)' }}
                  >
                    {pending ? 'Saving...' : 'Save page'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(cloneDeep(selectedPage.payload));
                      setMessage('Reverted to the last saved version.');
                      setError('');
                    }}
                    className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                    style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}
                  >
                    Revert changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft(cloneDeep(selectedPage.defaultPayload));
                      setMessage('Loaded the original template for this page.');
                      setError('');
                    }}
                    className="rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em]"
                    style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-card)', color: 'var(--tp-heading)' }}
                  >
                    Load default template
                  </button>
                </div>

                {message ? (
                  <div className="rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4 text-sm tp-heading">
                    {message}
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-[1.25rem] bg-[var(--tp-surface)] px-4 py-4 text-sm tp-accent">
                    {error}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-[1.25rem] border px-4 py-4 text-sm tp-text-soft" style={{ borderColor: 'var(--tp-border)', background: 'var(--tp-surface)' }}>
                Choose a page from the list to start editing.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
