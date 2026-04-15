export default function SectionPlaceholder({ title, description, badge }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-xl font-bold">{title}</h3>
        <span className="rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-600/20 dark:text-brand-100">
          {badge}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Widget Slot 1
        </div>
        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Widget Slot 2
        </div>
        <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Widget Slot 3
        </div>
      </div>
    </section>
  );
}
