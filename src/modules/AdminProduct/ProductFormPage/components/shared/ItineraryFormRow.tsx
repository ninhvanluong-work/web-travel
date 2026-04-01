import { Trash2 } from 'lucide-react';

import { Editor } from '@tinymce/tinymce-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ItineraryFormValues } from '@/lib/validations/product';

interface ItineraryFormRowProps {
  value: ItineraryFormValues;
  index: number;
  onChange: (index: number, patch: Partial<ItineraryFormValues>) => void;
  onRemove: (index: number) => void;
}

export function ItineraryFormRow({ value, index, onChange, onRemove }: ItineraryFormRowProps) {
  const set = (patch: Partial<ItineraryFormValues>) => onChange(index, patch);

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-blue-600">Ngày {value.order}</span>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          rounded="md"
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 h-7 w-7"
          onClick={() => onRemove(index)}
        >
          <Trash2 size={14} />
        </Button>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Tiêu đề</label>
        <Input
          size="sm"
          placeholder="VD: Hà Nội → Hạ Long"
          value={value.name}
          onChange={(e) => set({ name: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Hoạt động</label>
        <div className="rounded-lg overflow-hidden border border-input">
          <Editor
            tinymceScriptSrc="/tinymce/tinymce.min.js"
            value={value.description ?? ''}
            onEditorChange={(content) => set({ description: content })}
            init={{
              license_key: 'gpl',
              height: 260,
              menubar: true,
              statusbar: false,
              branding: false,
              promotion: false,
              plugins: [
                'advlist',
                'autolink',
                'lists',
                'link',
                'image',
                'charmap',
                'preview',
                'searchreplace',
                'wordcount',
                'table',
                'fullscreen',
                'code',
              ],
              toolbar:
                'undo redo | blocks | bold italic underline strikethrough | ' +
                'forecolor backcolor | alignleft aligncenter alignright alignjustify | ' +
                'bullist numlist | link image table | code fullscreen',
              content_style:
                'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 14px; color: #111827; line-height: 1.6; }',
              image_advtab: true,
              image_uploadtab: true,
              automatic_uploads: false,
              file_picker_types: 'image',
              file_picker_callback: (cb) => {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                input.addEventListener('change', (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.addEventListener('load', () => {
                    cb(reader.result as string, { title: file.name });
                  });
                  reader.readAsDataURL(file);
                });
                input.click();
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
