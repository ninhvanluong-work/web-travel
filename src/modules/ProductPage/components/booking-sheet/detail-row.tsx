export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-[#F2F2F2] last:border-0">
      <span className="text-[14px] font-medium text-[#555] flex-shrink-0 w-[90px]">{label}</span>
      <span className="text-[14px] font-semibold text-[#111] text-right flex-1">{value}</span>
    </div>
  );
}
