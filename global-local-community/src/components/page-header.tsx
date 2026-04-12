export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-6 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
      <div className="bg-gradient-to-r from-sky-50 via-white to-white px-6 py-6 sm:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-600">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">{description}</p>
      </div>
    </div>
  );
}
