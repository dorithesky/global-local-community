export function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div className="mb-4 overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-sm sm:mb-5">
      <div className="px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary)]">{eyebrow}</p>
        <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-[2rem]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{description}</p>
      </div>
    </div>
  );
}
