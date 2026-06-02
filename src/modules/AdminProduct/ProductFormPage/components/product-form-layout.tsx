import { AlertTriangle, AlignLeft, Calendar, FileText, ImageIcon, MapPin, Sparkles, Tv } from 'lucide-react';

export const STATUS_CONFIG: Record<string, { dot: string; label: string; text: string }> = {
  published: { dot: 'bg-emerald-500', label: 'bg-emerald-50 text-emerald-700 ring-emerald-200', text: 'Cong khai' },
  hidden: { dot: 'bg-slate-400', label: 'bg-slate-50 text-slate-600 ring-slate-200', text: 'Da an' },
  draft: { dot: 'bg-amber-400', label: 'bg-amber-50 text-amber-700 ring-amber-200', text: 'Ban nhap' },
};

export const NAV_SECTIONS = [
  { id: 'section-banner', label: 'Video Sản phẩm', icon: Tv },
  { id: 'section-overview', label: 'Tổng quan', icon: FileText },
  { id: 'section-experiences', label: 'Trải nghiệm', icon: Sparkles },
  { id: 'section-images', label: 'Hình ảnh', icon: ImageIcon },
  { id: 'section-itinerary', label: 'Lịch trình', icon: Calendar },
  { id: 'section-quick-facts', label: 'Thông tin nhanh', icon: MapPin },
  { id: 'section-read-before', label: 'Lưu ý', icon: AlertTriangle },
  { id: 'section-details', label: 'Chi tiết', icon: AlignLeft },
];

export const SECTION_IDS = NAV_SECTIONS.map((s) => s.id);

export function SectionCard({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      className="scroll-mt-20 overflow-hidden bg-white rounded-2xl border border-slate-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <div className="border-b border-slate-100 dark:border-gray-800 px-6 py-5">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white/90 tracking-tight">{label}</h2>
      </div>
      <div className="px-6 pt-8 pb-7">{children}</div>
    </div>
  );
}
