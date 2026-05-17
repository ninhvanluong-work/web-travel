import { BookmarkIcon, EyeIcon, EyeOffIcon, RocketIcon, SaveIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export interface FormActionButtonsProps {
  size?: 'xs' | 'md' | 'lg';
  isEdit: boolean;
  currentStatus: string;
  onSaveDraft: () => void;
  onSaveChanges: () => void;
  onPublish: () => void;
  onHide: () => void;
  disabled: boolean;
}

export function FormActionButtons({
  size = 'xs',
  isEdit,
  currentStatus,
  onSaveDraft,
  onSaveChanges,
  onPublish,
  onHide,
  disabled,
}: FormActionButtonsProps) {
  if (!isEdit) {
    return (
      <Button
        type="button"
        variant="secondary"
        size={size}
        rounded="md"
        blur={false}
        className="flex items-center gap-2 px-4 border border-gray-300"
        onClick={onSaveDraft}
        disabled={disabled}
      >
        <BookmarkIcon size={14} />
        Lưu nháp
      </Button>
    );
  }

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size={size}
        rounded="md"
        blur={false}
        className="flex items-center gap-2 px-4 border border-gray-300"
        onClick={onSaveChanges}
        disabled={disabled}
      >
        <SaveIcon size={14} />
        Lưu thay đổi
      </Button>

      {currentStatus === 'published' && (
        <Button
          type="button"
          variant="secondary"
          size={size}
          rounded="md"
          blur={false}
          className="flex items-center gap-2 px-4 border border-orange-300 text-orange-600 hover:bg-orange-50"
          onClick={onHide}
          disabled={disabled}
        >
          <EyeOffIcon size={14} />
          Ẩn sản phẩm
        </Button>
      )}

      {currentStatus === 'hidden' && (
        <Button
          type="button"
          variant="primary"
          size={size}
          rounded="md"
          blur={false}
          className="flex items-center gap-2 px-4"
          onClick={onPublish}
          disabled={disabled}
        >
          <EyeIcon size={14} />
          Công khai lại
        </Button>
      )}

      {currentStatus === 'draft' && (
        <Button
          type="button"
          variant="primary"
          size={size}
          rounded="md"
          blur={false}
          className="flex items-center gap-2 px-4"
          onClick={onPublish}
          disabled={disabled}
        >
          <RocketIcon size={14} />
          Đăng công khai
        </Button>
      )}
    </>
  );
}
