import { BookmarkIcon, EyeOffIcon, RocketIcon, SaveIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export interface FormActionButtonsProps {
  size?: 'xs' | 'md' | 'lg';
  isEdit: boolean;
  currentStatus: string;
  onSaveDraft: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  disabled: boolean;
}

export function FormActionButtons({
  size = 'xs',
  isEdit,
  currentStatus,
  onSaveDraft,
  onPublish,
  onUnpublish,
  disabled,
}: FormActionButtonsProps) {
  const isPublished = currentStatus === 'published';

  if (isEdit) {
    return (
      <>
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
          <SaveIcon size={14} />
          Lưu thay đổi
        </Button>
        {isPublished ? (
          <Button
            type="button"
            variant="secondary"
            size={size}
            rounded="md"
            blur={false}
            className="flex items-center gap-2 px-4 border border-orange-300 text-orange-600 hover:bg-orange-50"
            onClick={onUnpublish}
            disabled={disabled}
          >
            <EyeOffIcon size={14} />
            Gỡ về nháp
          </Button>
        ) : (
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

  return (
    <>
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
        Đăng tour
      </Button>
    </>
  );
}
