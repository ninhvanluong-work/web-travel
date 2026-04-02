import { Editor } from '@tinymce/tinymce-react';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { generateSlug, type ProductFormValues } from '@/lib/validations/product';

export function BasicInfoSection({ isEdit }: { isEdit: boolean }) {
  const { control, setValue } = useFormContext<ProductFormValues>();
  const nameValue = useWatch({ control, name: 'name' });

  useEffect(() => {
    if (!isEdit && nameValue) {
      setValue('slug', generateSlug(nameValue), { shouldValidate: false });
    }
  }, [isEdit, nameValue, setValue]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h2 className="font-semibold text-gray-900">📋 Thông tin cơ bản</h2>

      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              Tên tour <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input size="sm" placeholder="VD: Tour Hà Nội – Hạ Long 3N2Đ" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="slug"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Slug (URL)</FormLabel>
            <FormControl>
              <Input size="sm" placeholder="tu-dong-tao-tu-ten" {...field} className="bg-gray-50" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Mô tả tour</FormLabel>
            <FormControl>
              <div className="rounded-lg overflow-hidden border border-input">
                <Editor
                  tinymceScriptSrc="/tinymce/tinymce.min.js"
                  licenseKey="gpl"
                  value={field.value ?? ''}
                  onEditorChange={(content) => field.onChange(content)}
                  init={{
                    height: 320,
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
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
