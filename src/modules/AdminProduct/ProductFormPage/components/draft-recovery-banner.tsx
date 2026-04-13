import AlertWarningIcon from '@/assets/svg/alert-warning.svg';

interface Props {
  onRestore: () => void;
  onDiscard: () => void;
}

export function DraftRecoveryBanner({ onRestore, onDiscard }: Props) {
  return (
    <div className="border-b border-warning-500/30 bg-warning-500/15 px-6 py-3">
      <div className="flex items-start gap-3">
        <div className="-mt-0.5 text-warning-500">
          <AlertWarningIcon className="fill-current" width={24} height={24} />
        </div>
        <div className="flex-1">
          <h4 className="mb-1 text-sm font-semibold text-gray-800 dark:text-white/90">Bản nháp chưa lưu</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bạn có một bản nháp chưa lưu. Bạn có muốn phục hồi không?
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0 mt-0.5">
          <button type="button" className="text-xs font-semibold text-warning-600 hover:underline" onClick={onRestore}>
            Phục hồi
          </button>
          <button type="button" className="text-xs text-gray-400 hover:underline" onClick={onDiscard}>
            Bỏ qua
          </button>
        </div>
      </div>
    </div>
  );
}
