import { Upload } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useRef, useState } from 'react';

import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useAlertStore } from '@/stores/use-alert-store';

import { ProgressCircle } from './moments-upload-progress-circle';

interface AddMomentSheetProps {
  open: boolean;
  onClose: () => void;
  destinations: string[];
}

export function AddMomentSheet({ open, onClose, destinations }: AddMomentSheetProps) {
  const { t } = useTranslation('guidePage');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState('');
  const [linkedTour, setLinkedTour] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);

  const reset = () => {
    setCaption('');
    setLinkedTour('');
    setFile(null);
    setProgress(0);
    setUploading(false);
    setUploadDone(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = '';
    if (!selected) return;

    if (selected.size > 50 * 1024 * 1024) {
      useAlertStore.getState().addAlert({ type: 'error', title: t('manageMomentsSheet.fileTooLarge') });
      return;
    }
    if (!['video/mp4', 'video/webm'].includes(selected.type)) {
      useAlertStore.getState().addAlert({ type: 'error', title: t('manageMomentsSheet.invalidFormat') });
      return;
    }

    setFile(selected);
    setUploading(true);
    setUploadDone(false);
    setProgress(0);

    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 5;
      if (current >= 100) {
        current = 100;
        clearInterval(interval);
        setUploading(false);
        setUploadDone(true);
      }
      setProgress(current);
    }, 200);
  };

  const handleSave = () => {
    if (!uploadDone) return;
    useAlertStore.getState().addAlert({ type: 'success', title: t('manageMomentsSheet.addMoment') });
    handleClose();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-3xl p-0 flex flex-col max-h-[80vh] bg-[#F8FAFC] border-t border-slate-200/80 shadow-2xl"
        style={{
          left: 'max(0px, calc(50% - 215px))',
          right: 'max(0px, calc(50% - 215px))',
        }}
      >
        <div className="relative h-6 flex items-center justify-center shrink-0">
          <div className="w-12 h-1.5 rounded-full bg-slate-200" />
        </div>

        <div className="sticky top-0 z-10 px-6 pb-4 border-b border-slate-100 bg-white/85 backdrop-blur-md shrink-0">
          <SheetTitle className="text-[15px] font-semibold text-neutral-black">
            {t('manageMomentsSheet.addMomentTitle')}
          </SheetTitle>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 scrollbar-hide">
          {/* Video upload area */}
          <div
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="relative w-full aspect-video rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand-400 transition-colors overflow-hidden"
          >
            {file ? (
              <>
                <div className="absolute inset-0 bg-neutral-black/60 flex flex-col items-center justify-center gap-1">
                  <ProgressCircle progress={progress} />
                  <p className="text-[12px] text-white font-medium mt-1">
                    {uploading ? t('manageMomentsSheet.uploading', { progress }) : `${progress}%`}
                  </p>
                </div>
                <p className="absolute bottom-2 left-3 right-3 text-[11px] text-white/80 truncate">{file.name}</p>
              </>
            ) : (
              <>
                <Upload size={24} className="text-slate-400" />
                <p className="text-[12px] text-slate-400 text-center px-4">{t('manageMomentsSheet.uploadVideo')}</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>

          {/* Caption */}
          <div className="space-y-1.5">
            <label className="admin-form-label">{t('manageMomentsSheet.captionLabel')}</label>
            <textarea
              maxLength={150}
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t('manageMomentsSheet.captionPlaceholder')}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/30 px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
            <p className="text-[11px] text-slate-400 text-right">{caption.length}/150</p>
          </div>

          {/* Tour selector */}
          <div className="space-y-1.5">
            <label className="admin-form-label">{t('manageMomentsSheet.tourLabel')}</label>
            <select
              value={linkedTour}
              onChange={(e) => setLinkedTour(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/30 px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all appearance-none"
            >
              <option value="">{t('manageMomentsSheet.tourPlaceholder')}</option>
              {destinations.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sticky bottom-0 z-10 px-6 py-4 border-t border-slate-100 bg-white/90 backdrop-blur-md flex gap-3 shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-bold hover:bg-slate-50 transition-all active:scale-[0.98]"
          >
            {t('manageMomentsSheet.cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!uploadDone}
            className="flex-1 py-3 rounded-xl bg-neutral-black text-white text-[13px] font-bold hover:bg-neutral-black/90 transition-all active:scale-[0.98] disabled:opacity-40"
          >
            {t('manageMomentsSheet.save')}
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
