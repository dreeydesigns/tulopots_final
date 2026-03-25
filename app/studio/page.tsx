'use client';

import Image from 'next/image';
import { imageByKey } from '@/lib/site';
import { useEffect, useState } from 'react';
import { useStore } from '@/components/Providers';

type StudioImage = {
  id: string;
  title: string;
  url: string;
  createdAt: string;
};

export default function Page() {
  const { isLoggedIn, setIsLoggedIn } = useStore();

  const [saved, setSaved] = useState<string>('');
  const [images, setImages] = useState<StudioImage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const [editingId, setEditingId] = useState<string>('');
  const [editTitle, setEditTitle] = useState('');
  const [editUrl, setEditUrl] = useState('');

  async function loadImages() {
    const res = await fetch('/api/studio');
    const data = await res.json();
    setImages(data.images || []);
  }

  useEffect(() => {
    if (isLoggedIn) {
      loadImages();
    }
  }, [isLoggedIn]);

  async function addImage(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSaved('');

    const res = await fetch('/api/studio', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, url }),
    });
    const data = await res.json();

    if (res.ok) {
      setTitle('');
      setUrl('');
      setSaved('Image added successfully.');
      setImages((prev) => [data.image, ...prev]);
    } else {
      setSaved(data.error || 'Failed to add image.');
    }
    setLoading(false);
  }

  function startEdit(image: StudioImage) {
    setEditingId(image.id);
    setEditTitle(image.title);
    setEditUrl(image.url);
  }

  async function saveEdit() {
    if (!editingId) return;
    setLoading(true);
    setSaved('');

    const res = await fetch('/api/studio', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editingId, title: editTitle, url: editUrl }),
    });
    const data = await res.json();

    if (res.ok) {
      setImages((prev) => prev.map((img) => (img.id === editingId ? data.image : img)));
      setEditingId('');
      setEditTitle('');
      setEditUrl('');
      setSaved('Image updated successfully.');
    } else {
      setSaved(data.error || 'Failed to update image.');
    }
    setLoading(false);
  }

  async function removeImage(id: string) {
    setLoading(true);
    setSaved('');

    const res = await fetch('/api/studio', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();

    if (res.ok) {
      setImages((prev) => prev.filter((img) => img.id !== id));
      setSaved('Image removed successfully.');
    } else {
      setSaved(data.error || 'Failed to remove image.');
    }
    setLoading(false);
  }

  if (!isLoggedIn) {
    return (
      <main className="container-shell py-16">
        <div className="rounded-[2rem] border border-dashed border-[#ccb8a6] bg-[#fff7f0] p-10 text-center">
          <div className="serif-display text-5xl text-[#4b3428]">Studio Dashboard is for signed-in users.</div>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-[#76675c]">
            Sign in to manage studio images (add, edit, remove).
          </p>
          <button onClick={() => setIsLoggedIn(true)} className="btn-primary mt-6">
            Sign In to Continue
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container-shell py-12 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.22em] text-[#B66A3C]">Studio Dashboard</div>
          <h1 className="mt-4 serif-display text-6xl text-[#3d2a20]">Manage Studio Images</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-[#76675c]">
            Add, edit, and remove the images used for your studio collection content.
          </p>
          <div className="mt-8 overflow-hidden rounded-[2rem]">
            <Image src={imageByKey.clay} alt="Studio" width={1200} height={900} className="h-[28rem] w-full object-cover" />
          </div>
        </div>

        <div className="rounded-[2rem] border border-[#e6d9cd] bg-white p-8">
          <h2 className="serif-display text-5xl text-[#4b3428]">Add New Image</h2>
          <form onSubmit={addImage} className="mt-6 grid gap-4">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-2xl border border-[#e6d9cd] bg-[#fffdfb] px-5 py-4 outline-none"
              placeholder="Image title"
              required
            />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rounded-2xl border border-[#e6d9cd] bg-[#fffdfb] px-5 py-4 outline-none"
              placeholder="Image URL"
              required
            />
            <button disabled={loading} className="btn-primary">
              {loading ? 'Saving...' : 'Add Image'}
            </button>
          </form>

          {saved && <div className="mt-6 rounded-[2rem] bg-[#fff7f0] p-5 text-sm leading-7 text-[#735f51]">{saved}</div>}

          <div className="mt-8 space-y-4">
            {images.map((img) => (
              <div key={img.id} className="rounded-2xl border border-[#e6d9cd] p-4">
                {editingId === img.id ? (
                  <div className="grid gap-3">
                    <label className="sr-only" htmlFor={`edit-title-${img.id}`}>
                      Edit image title
                    </label>
                    <input
                      id={`edit-title-${img.id}`}
                      title="Edit image title"
                      placeholder="Image title"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="rounded-xl border border-[#e6d9cd] px-4 py-2"
                    />
                    <label className="sr-only" htmlFor={`edit-url-${img.id}`}>
                      Edit image URL
                    </label>
                    <input
                      id={`edit-url-${img.id}`}
                      title="Edit image URL"
                      placeholder="Image URL"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="rounded-xl border border-[#e6d9cd] px-4 py-2"
                    />
                    <div className="flex gap-2">
                      <button onClick={saveEdit} className="btn-primary" type="button">
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId('')}
                        className="rounded-full border border-[#ded1c5] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]"
                        type="button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-lg font-semibold text-[#4b3428]">{img.title}</div>
                        <div className="text-xs text-[#8a7a6d]">{img.url}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(img)} type="button" className="btn-primary">
                          Edit
                        </button>
                        <button
                          onClick={() => removeImage(img.id)}
                          type="button"
                          className="rounded-full border border-[#ded1c5] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
