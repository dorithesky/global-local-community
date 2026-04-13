export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-5 overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm sm:mb-6">
      <div className="bg-gradient-to-r from-sky-50 via-white to-cyan-50/40 px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700 sm:text-xs">{eyebrow}</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{description}</p>
      </div>
    </div>
  );
}
