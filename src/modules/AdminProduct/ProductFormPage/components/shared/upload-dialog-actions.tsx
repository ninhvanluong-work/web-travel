import { Pause, Play, Upload, X } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import { Button } from '@/components/ui/button';
import type { UploadState } from '@/modules/AdminVideo/VideoPage/components/upload-types';

interface UploadDialogActionsProps {
  uploadState: UploadState;
  onClose: () => void;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  onRetrySave: (bunnyVideoId: string) => void;
  onRetryUpload: () => void;
}

export function UploadDialogActions({
  uploadState,
  onClose,
  onStart,
  onPause,
  onResume,
  onCancel,
  onRetrySave,
  onRetryUpload,
}: UploadDialogActionsProps) {
  const { t } = useTranslation('adminPage');

  return (
    <div className="flex gap-2 pt-1">
      {uploadState.status === 'idle' && (
        <Button
          type="button"
          variant="secondary"
          rounded="md"
          blur={false}
          fullWidth
          className="py-2 text-xs"
          onClick={onClose}
        >
          {t('close')}
        </Button>
      )}

      {uploadState.status === 'selected' && !uploadState.error && (
        <>
          <Button
            type="button"
            variant="primary"
            rounded="md"
            blur={false}
            fullWidth
            className="py-2 text-xs"
            onClick={onStart}
          >
            <Upload size={14} className="mr-1.5" />
            {t('uploadStart')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            rounded="md"
            blur={false}
            className="text-rose-500 hover:text-rose-600 px-3"
            onClick={onClose}
          >
            <X size={14} />
          </Button>
        </>
      )}

      {uploadState.status === 'uploading' && (
        <>
          <Button
            type="button"
            variant="secondary"
            rounded="md"
            blur={false}
            className="flex-1 py-2 text-xs"
            onClick={onPause}
          >
            <Pause size={14} className="mr-1.5" />
            {t('uploadPause')}
          </Button>
          <Button
            type="button"
            variant="ghost"
            rounded="md"
            blur={false}
            className="text-rose-500 hover:text-rose-600 px-3"
            onClick={onCancel}
          >
            <X size={14} />
          </Button>
        </>
      )}

      {uploadState.status === 'paused' && (
        <>
          <Button
            type="button"
            variant="primary"
            rounded="md"
            blur={false}
            className="flex-1 py-2 text-xs"
            onClick={onResume}
          >
            <Play size={14} className="mr-1.5" />
            {t('uploadResume')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            rounded="md"
            blur={false}
            className="text-rose-500 hover:text-rose-600 border-rose-200 px-4 py-2 text-xs"
            onClick={onCancel}
          >
            {t('uploadCancel')}
          </Button>
        </>
      )}

      {uploadState.status === 'error' && uploadState.phase === 'saving' && (
        <Button
          type="button"
          variant="primary"
          rounded="md"
          blur={false}
          fullWidth
          className="py-2 text-xs"
          onClick={() => onRetrySave(uploadState.bunnyVideoId)}
        >
          {t('retrySave')}
        </Button>
      )}

      {uploadState.status === 'error' && uploadState.phase === 'upload' && (
        <Button
          type="button"
          variant="secondary"
          rounded="md"
          blur={false}
          fullWidth
          className="py-2 text-xs"
          onClick={onRetryUpload}
        >
          {t('retry')}
        </Button>
      )}
    </div>
  );
}
