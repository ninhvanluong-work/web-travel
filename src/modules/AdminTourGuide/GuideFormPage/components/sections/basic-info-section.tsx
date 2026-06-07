import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { TourGuideFormValues } from '@/lib/validations/tour-guide';
import { ExperienceImageUpload } from '@/modules/AdminProduct/ProductFormPage/components/shared/experience-image-upload';

export function BasicInfoSection() {
  const { control } = useFormContext<TourGuideFormValues>();

  return (
    <div className="space-y-5">
      {/* Name */}
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">
              Tên hướng dẫn viên <span className="text-red-500">*</span>
            </FormLabel>
            <FormControl>
              <Input size="sm" placeholder="Nguyễn Văn A" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Summary */}
      <FormField
        control={control}
        name="summary"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">Subtitle / Title</FormLabel>
            <FormControl>
              <Input
                size="sm"
                placeholder="Hướng dẫn viên · Hà Nội & vùng cao phía Bắc"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Quote */}
      <FormField
        control={control}
        name="quote"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">Slogan / Quote</FormLabel>
            <FormControl>
              <Input size="sm" placeholder="Mỗi ngọn núi có một câu chuyện..." {...field} value={field.value ?? ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Avatar + Cover — 2 columns */}
      <div className="grid grid-cols-2 gap-5 pt-2">
        <FormField
          control={control}
          name="avatar"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[13px] text-slate-500 font-medium">Avatar</FormLabel>
              <FormControl>
                <ExperienceImageUpload value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="coverImg"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              <FormLabel className="text-[13px] text-slate-500 font-medium">Cover Image</FormLabel>
              <FormControl>
                <ExperienceImageUpload value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
