import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';
import type { TourGuideFormValues } from '@/lib/validations/tour-guide';
import { ExperienceImageUpload } from '@/modules/AdminProduct/ProductFormPage/components/shared/experience-image-upload';

import { LanguageSelector } from './language-selector';

export function BasicInfoSection() {
  const { control } = useFormContext<TourGuideFormValues>();

  return (
    <div className="grid grid-cols-2 gap-5">
      {/* --- ZONE 1: IDENTIFICATION --- */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="admin-form-label">
              Tên hướng dẫn viên <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input size="sm" fullWidth placeholder="Nguyễn Văn A" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="summary"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="admin-form-label">Subtitle / Title</FormLabel>
            <FormControl>
              <Input
                size="sm"
                fullWidth
                placeholder="Hướng dẫn viên · Hà Nội & vùng cao phía Bắc"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="quote"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="admin-form-label">Slogan / Quote</FormLabel>
            <FormControl>
              <Input
                size="sm"
                fullWidth
                placeholder="Mỗi ngọn núi có một câu chuyện..."
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="expYear"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="admin-form-label">Số năm kinh nghiệm</FormLabel>
            <FormControl>
              <Input
                size="sm"
                fullWidth
                inputMode="numeric"
                placeholder="0"
                className="w-full"
                value={field.value === 0 ? '' : String(field.value)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/[^0-9]/g, '');
                  field.onChange(raw === '' ? 0 : Number(raw));
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <LanguageSelector />

      {/* --- DIVIDER: BIO --- */}
      <div className="col-span-2 zone-divider" />

      <FormField
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem className="col-span-2 space-y-1.5">
            <FormLabel className="admin-form-label">Giới thiệu bản thân</FormLabel>
            <FormControl>
              <TextArea
                placeholder="Giới thiệu về hướng dẫn viên..."
                className="min-h-[120px] resize-none bg-slate-50/20 border-slate-200 focus-visible:bg-white transition-colors rounded-xl shadow-theme-xs"
                rows={5}
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* --- DIVIDER: MEDIA --- */}
      <div className="col-span-2 zone-divider" />

      {/* --- ZONE 3: MEDIA --- */}
      <div className="col-span-2 flex items-start gap-6 pt-1">
        <FormField
          control={control}
          name="avatar"
          render={({ field }) => (
            <FormItem className="space-y-1.5 shrink-0">
              <FormLabel className="admin-form-label">Ảnh đại diện (Avatar)</FormLabel>
              <FormControl>
                <ExperienceImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  aspectRatio="w-[120px] h-[120px]"
                  shape="circle"
                  hideUrlInput={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="coverImg"
          render={({ field }) => (
            <FormItem className="flex-1 space-y-1.5">
              <FormLabel className="admin-form-label">Ảnh bìa</FormLabel>
              <FormControl>
                <ExperienceImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  aspectRatio="w-full aspect-[21/9] max-h-[160px]"
                  hideUrlInput={true}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
