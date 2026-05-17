import { Film } from 'lucide-react';
import type { RefObject } from 'react';

import type { UploadState } from './upload-types';
import { formatBytes } from './upload-types';

interface Props {
  uploadState: UploadState;
  fileInputRef: RefObject<HTMLInputElement>;
  onDrop: (file: File) => void;
  onFileChange: (file: File) => void;
}

export function UploadDropzone({ uploadState, fileInputRef, onDrop, onFileChange }: Props) {
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) onDrop(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileChange(file);
  }

  const isSelected = uploadState.status === 'selected';
  const hasError = isSelected && uploadState.error;

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
        // eslint-disable-next-line no-nested-ternary
        isSelected && !hasError
          ? 'border-indigo-300 bg-indigo-50'
          : hasError
          ? 'border-rose-300 bg-rose-50'
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
      }`}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => fileInputRef.current?.click()}
    >
      <input ref={fileInputRef} type="file" accept=".mp4,video/mp4" className="hidden" onChange={handleInputChange} />

      {isSelected ? (
        <div className="space-y-1">
          <Film size={24} className={`mx-auto ${hasError ? 'text-rose-400' : 'text-indigo-400'}`} />
          <p className={`text-sm font-medium truncate ${hasError ? 'text-rose-600' : 'text-indigo-700'}`}>
            {uploadState.file.name}
          </p>
          <p className="text-xs text-gray-400">{formatBytes(uploadState.file.size)}</p>
          {uploadState.error && <p className="text-xs text-rose-500 mt-1">{uploadState.error}</p>}
        </div>
      ) : (
        <div className="space-y-1">
          <Film size={24} className="mx-auto text-gray-300" />
          <p className="text-sm text-gray-500">Kéo thả file vào đây</p>
          <p className="text-xs text-gray-400">hoặc nhấn để chọn file .mp4 (tối đa 500 MB)</p>
        </div>
      )}
    </div>
  );
}
