import { RotateCcw } from 'lucide-react';

interface Props {
  onRestore: () => void;
  onDiscard: () => void;
}

export function DraftRecoveryBanner({ onRestore, onDiscard }: Props) {
  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-3 text-sm text-amber-800">
      <RotateCcw size={14} className="shrink-0" />
      <span className="flex-1">Bạn có một bản nháp chưa lưu. Bạn có muốn phục hồi không?</span>
      <button type="button" className="text-xs font-semibold text-amber-900 hover:underline" onClick={onRestore}>
        Phục hồi
      </button>
      <button type="button" className="text-xs text-amber-600 hover:underline" onClick={onDiscard}>
        Bỏ qua
      </button>
    </div>
  );
}
