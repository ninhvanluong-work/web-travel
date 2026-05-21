import { Editor } from '@tinymce/tinymce-react';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { ProductFormValues } from '@/lib/validations/product';

const PLUGINS = [
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
];

export function DescriptionEditorField() {
  const { control } = useFormContext<ProductFormValues>();

  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem className="space-y-2 pt-2 border-t border-slate-100">
          <FormLabel className="text-[13px] text-slate-500 font-medium">Mo ta chi tiet tour</FormLabel>
          <FormControl>
            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-theme-xs mt-1 ring-offset-white focus-within:ring-2 focus-within:ring-brand-500/20 transition-all">
              <Editor
                tinymceScriptSrc="/tinymce/tinymce.min.js"
                licenseKey="gpl"
                value={field.value ?? ''}
                onEditorChange={(content) => field.onChange(content)}
                init={{
                  height: 280,
                  menubar: false,
                  statusbar: false,
                  branding: false,
                  promotion: false,
                  plugins: PLUGINS,
                  toolbar: 'undo redo | bold italic underline | bullist numlist | link image | fullscreen code',
                  content_style:
                    'body { font-family: Outfit, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 14px; color: #111827; line-height: 1.6; }',
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
