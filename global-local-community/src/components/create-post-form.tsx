"use client";

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { KOREA_CITIES } from '@/lib/locations';
import { validateImageFiles } from '@/lib/media';

function SubmitButton({ label }: { label?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
      type="submit"
      disabled={pending}
    >
      {pending ? 'Publishing...' : label ?? 'Publish post'}
    </button>
  );
}

export function CreatePostForm({
  action,
  city,
  onImagesSelected,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  city: string;
  onImagesSelected?: (files: File[]) => void;
  submitLabel?: string;
}) {
  const [imageMessage, setImageMessage] = useState<string | null>(null);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-900">City</label>
          <select name="city" defaultValue={city} className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-sky-200 focus:ring">
            {KOREA_CITIES.map((cityOption) => (
              <option key={cityOption} value={cityOption}>{cityOption}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-900">District or area</label>
          <input name="district" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-sky-200 focus:ring" placeholder="Mapo-gu, Haeundae-gu, Suseong-gu" />
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-900">Category</label>
        <select name="category" defaultValue="housing" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-sky-200 focus:ring">
          <option value="housing">Housing</option>
          <option value="jobs">Jobs</option>
          <option value="daily-life">Daily life</option>
          <option value="events">Events</option>
          <option value="marketplace">Marketplace</option>
        </select>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-900">Title</label>
        <input name="title" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-sky-200 focus:ring" placeholder="Need a short-term officetel near Banwoldang" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-900">Body</label>
        <textarea
          name="body"
          className="min-h-40 w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-sky-200 focus:ring"
          placeholder="Budget, district, timing, and what kind of help you need."
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-900">Tags</label>
        <input name="tags" className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none ring-sky-200 focus:ring" placeholder="housing, newcomer, near-subway" />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-900">Images</label>
        <input
          type="file"
          name="images"
          multiple
          accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            setImageMessage(validateImageFiles(files));
            onImagesSelected?.(files);
          }}
        />
        <p className="mt-2 text-xs leading-6 text-slate-500">Allowed formats: JPG, JPEG, PNG, and WebP only. Up to 4 images, 20MB each, with a 50MB total upload cap per post. Images are resized in the layout to avoid aggressive cropping.</p>
        {imageMessage ? <p className="mt-1 text-xs text-rose-600">{imageMessage}</p> : null}
      </div>
      <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <p className="font-medium">How to get better replies</p>
        <ul className="mt-2 list-disc pl-5">
          <li>Include your city or area, timeline, and budget if relevant</li>
          <li>Say whether you want advice, referrals, or direct leads</li>
          <li>Add enough context so other foreigners in Korea can answer fast</li>
        </ul>
      </div>
      <SubmitButton label={submitLabel} />
    </form>
  );
}
