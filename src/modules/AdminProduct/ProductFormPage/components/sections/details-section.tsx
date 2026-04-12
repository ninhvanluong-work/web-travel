import { Editor } from '@tinymce/tinymce-react';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { ProductFormValues } from '@/lib/validations/product';

const EDITOR_INIT = {
  height: 280,
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
  file_picker_callback: (cb: (value: string, meta?: Record<string, unknown>) => void) => {
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
};

const DETAIL_FIELDS: Array<{
  name: keyof ProductFormValues;
  label: string;
  accent: string;
}> = [
  { name: 'highlight', label: 'Điểm nổi bật của sản phẩm', accent: 'text-amber-500' },
  { name: 'include', label: 'Dịch vụ bao gồm', accent: 'text-emerald-500' },
  { name: 'exclude', label: 'Dịch vụ không bao gồm', accent: 'text-red-500' },
];

export function DetailsSection() {
  const { control } = useFormContext<ProductFormValues>();

  return (
    <div className="space-y-5">
      {DETAIL_FIELDS.map(({ name, label }) => (
        <FormField
          key={name}
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-[13px] text-slate-500 font-medium">{label}</FormLabel>
              <FormControl>
                <div className="rounded-lg overflow-hidden border border-input">
                  <Editor
                    tinymceScriptSrc="/tinymce/tinymce.min.js"
                    licenseKey="gpl"
                    value={(field.value as string) ?? ''}
                    onEditorChange={(content) => field.onChange(content)}
                    init={EDITOR_INIT}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
