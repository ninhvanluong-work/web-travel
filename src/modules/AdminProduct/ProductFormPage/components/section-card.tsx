export function SectionCard({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      className="scroll-mt-20 bg-white rounded-2xl border border-slate-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <div className="border-b border-slate-100 dark:border-gray-800 px-5 py-4 rounded-t-2xl">
        <h2 className="text-base font-bold text-slate-800 dark:text-white/90 tracking-tight">{label}</h2>
      </div>
      <div className="px-5 pt-5 pb-5">{children}</div>
    </div>
  );
}
