import { Editor } from '@tinymce/tinymce-react';
import { ChevronDown, ChevronRight, Copy, GripVertical, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { ItineraryFormValues } from '@/lib/validations/product';

interface ItineraryFormRowProps {
  value: ItineraryFormValues;
  index: number;
  isOpen: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLSpanElement>;
  onChange: (index: number, patch: Partial<ItineraryFormValues>) => void;
  onRemove: (index: number) => void;
  onClone: (index: number) => void;
  onToggle: (index: number) => void;
}

export function ItineraryFormRow({
  value,
  index,
  isOpen,
  dragHandleProps,
  onChange,
  onRemove,
  onClone,
  onToggle,
}: ItineraryFormRowProps) {
  const set = (patch: Partial<ItineraryFormValues>) => onChange(index, patch);

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      {/* Header — always visible */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-b border-gray-100 cursor-pointer select-none">
        {/* Drag handle */}
        <span
          className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing shrink-0"
          {...dragHandleProps}
        >
          <GripVertical size={15} />
        </span>

        {/* Order badge */}
        <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 text-xs font-bold flex items-center justify-center shrink-0">
          {value.order}
        </span>

        {/* Title */}
        <button
          type="button"
          className="flex-1 text-left text-sm font-medium text-gray-700 truncate"
          onClick={() => onToggle(index)}
        >
          {value.name || `Ngày ${value.order}`}
        </button>

        {/* Clone */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          rounded="md"
          className="h-7 w-7 text-gray-400 hover:text-violet-600 hover:bg-violet-50 shrink-0"
          onClick={() => onClone(index)}
          title="Nhân bản ngày này"
        >
          <Copy size={12} />
        </Button>

        {/* Delete */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          rounded="md"
          className="h-7 w-7 text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0"
          onClick={() => onRemove(index)}
        >
          <Trash2 size={13} />
        </Button>

        {/* Expand toggle */}
        <button type="button" className="text-gray-400 hover:text-gray-600 shrink-0" onClick={() => onToggle(index)}>
          {isOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
        </button>
      </div>

      {/* Body — collapses */}
      {isOpen && (
        <div className="p-4 space-y-3 bg-gray-50/40">
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
            <label className="text-xs font-medium text-gray-600">Hoạt động trong ngày</label>
            <div className="rounded-lg overflow-hidden border border-input bg-white">
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                licenseKey="gpl"
                value={value.description ?? ''}
                onEditorChange={(content) => set({ description: content })}
                init={{
                  height: 260,
                  menubar: false,
                  statusbar: false,
                  branding: false,
                  promotion: false,
                  plugins: [
                    'advlist',
                    'autolink',
                    'lists',
                    'link',
                    'charmap',
                    'searchreplace',
                    'wordcount',
                    'table',
                    'fullscreen',
                    'code',
                  ],
                  toolbar:
                    'undo redo | blocks | bold italic underline | forecolor | alignleft aligncenter alignright | bullist numlist | link table | code fullscreen',
                  content_style:
                    'body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 14px; color: #111827; line-height: 1.6; }',
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
