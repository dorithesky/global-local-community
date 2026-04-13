export function PageHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description?: string }) {
  return (
    <div className="mb-3 overflow-hidden rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface-primary)] shadow-sm sm:mb-4">
      <div className="px-4 py-3.5 sm:px-5 sm:py-4">
        {eyebrow ? <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary)]">{eyebrow}</p> : null}
        <h1 className={`${eyebrow ? 'mt-1' : ''} text-xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-2xl`}>{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-5 text-[var(--text-secondary)]">{description}</p> : null}
      </div>
    </div>
  );
}
