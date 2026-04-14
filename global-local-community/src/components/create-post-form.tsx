"use client";

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { KOREA_CITIES } from '@/lib/locations';
import { validateImageFiles } from '@/lib/media';
import { CATEGORY_OPTIONS } from '@/lib/categories';

function SubmitButton({ label }: { label?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="min-h-11 rounded-full bg-sky-600 px-5 py-3 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-60"
      type="submit"
      disabled={pending}
    >
      {pending ? 'Publishing...' : label ?? 'Publish post'}
    </button>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
    </div>
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
    <form action={action} className="space-y-5 rounded-3xl border border-sky-100 bg-gradient-to-br from-white to-sky-50/40 p-4 shadow-sm sm:space-y-6 sm:p-5">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/85 p-4">
        <SectionHeader
          title="Core details"
          description="Start with the basics so people can understand your situation quickly."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">City</label>
            <select name="city" defaultValue={city} className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring">
              {KOREA_CITIES.map((cityOption) => (
                <option key={cityOption} value={cityOption}>{cityOption}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-900">District or area</label>
            <input name="district" className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring" placeholder="Mapo-gu, Haeundae-gu, Suseong-gu" />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-900">Category</label>
          <select name="category" defaultValue="housing" className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring">
            {CATEGORY_OPTIONS.filter((option) => option.value !== 'all').map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-900">Title</label>
          <input name="title" className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring" placeholder="Need a short-term officetel near Banwoldang" />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/85 p-4">
        <SectionHeader
          title="What help do you need?"
          description="Share enough context for someone local to answer without guessing."
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-900">Body</label>
          <textarea
            name="body"
            className="min-h-40 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none ring-sky-200 focus:ring"
            placeholder="Budget, timing, current situation, and what kind of response would be most useful."
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-900">Tags</label>
          <input name="tags" className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-sky-200 focus:ring" placeholder="housing, newcomer, near-subway" />
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/85 p-4">
        <SectionHeader
          title="Images"
          description="Optional, but helpful when visuals make the situation clearer."
        />
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-900">Upload images</label>
          <input
            type="file"
            name="images"
            multiple
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            className="min-h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
            onChange={(event) => {
              const files = Array.from(event.target.files ?? []);
              setImageMessage(validateImageFiles(files));
              onImagesSelected?.(files);
            }}
          />
          <p className="mt-2 text-xs leading-5 text-slate-500 sm:leading-6">Allowed formats: JPG, JPEG, PNG, and WebP only. Up to 4 images, 5MB each, with a 20MB total upload cap per post.</p>
          {imageMessage ? <p className="mt-1 text-xs text-rose-600">{imageMessage}</p> : null}
        </div>
      </section>

      <section className="rounded-2xl border border-sky-200 bg-white/80 p-4 text-sm text-sky-900 shadow-sm">
        <p className="font-medium">Reply quality checklist</p>
        <ul className="mt-2 list-disc pl-5 leading-6">
          <li>Include your city or area, timeline, and budget if relevant</li>
          <li>Say whether you want advice, referrals, or direct leads</li>
          <li>Keep the ask specific enough that someone can answer in one reply</li>
        </ul>
      </section>

      <div className="flex flex-col gap-3 border-t border-sky-100 pt-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-xs leading-5 text-slate-500">Publish only when the title and body clearly match the help you want.</p>
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}
