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

export function DetailsSection() {
  const { control } = useFormContext<ProductFormValues>();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
      <h2 className="font-semibold text-gray-900">🎯 Chi tiết tour</h2>

      <FormField
        control={control}
        name="highlight"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <span className="text-yellow-500 mr-1">⚡</span>Điểm nổi bật (Highlight)
            </FormLabel>
            <FormControl>
              <div className="rounded-lg overflow-hidden border border-input">
                <Editor
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  value={field.value ?? ''}
                  onEditorChange={(content) => field.onChange(content)}
                  init={EDITOR_INIT}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="include"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <span className="text-green-500 mr-1">✅</span>Bao gồm (Include)
            </FormLabel>
            <FormControl>
              <div className="rounded-lg overflow-hidden border border-input">
                <Editor
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  licenseKey="gpl"
                  value={field.value ?? ''}
                  onEditorChange={(content) => field.onChange(content)}
                  init={EDITOR_INIT}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="exclude"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              <span className="text-red-500 mr-1">❌</span>Không bao gồm (Exclude)
            </FormLabel>
            <FormControl>
              <div className="rounded-lg overflow-hidden border border-input">
                <Editor
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  licenseKey="gpl"
                  value={field.value ?? ''}
                  onEditorChange={(content) => field.onChange(content)}
                  init={EDITOR_INIT}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
