import { useFormContext } from 'react-hook-form';

import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { MultipleAutoComplete } from '@/components/ui/multiple-autocomplete';
import type { ProductFormValues } from '@/lib/validations/product';

const MOCK_TAGS = [
  { value: '3fa85f64-5717-4562-b3fc-2c963f66afa6', label: 'Hehe' },
  { value: 'a1b2c3d4-1111-2222-3333-444455556666', label: 'Mountain' },
  { value: 'b2c3d4e5-2222-3333-4444-555566667777', label: 'Best Seller' },
  { value: 'c3d4e5f6-3333-4444-5555-666677778888', label: 'Free Cancellation' },
  { value: 'd4e5f6a7-4444-5555-6666-777788889999', label: 'Popular' },
  { value: 'e5f6a7b8-5555-6666-7777-888899990000', label: 'Family Friendly' },
  { value: 'f6a7b8c9-6666-7777-8888-999900001111', label: 'Adventure' },
];

type TagObject = { id: string; name: string };

export function TagsInputField() {
  const { control, formState } = useFormContext<ProductFormValues>();
  const defaultTags = (formState.defaultValues?.tags ?? []) as TagObject[];

  return (
    <FormField
      control={control}
      name="tags"
      render={({ field }) => {
        const tags: TagObject[] = (field.value as TagObject[]) ?? [];

        const existingOptions = tags
          .filter((t) => !MOCK_TAGS.find((m) => m.value === t.id))
          .map((t) => ({ value: t.id, label: t.name }));

        const allOptions = [...MOCK_TAGS, ...existingOptions];

        const handleChange = (ids: string[]) => {
          const tagObjects = ids.map((id) => {
            const found = allOptions.find((o) => o.value === id);
            return { id, name: found?.label ?? id };
          });
          field.onChange(tagObjects);
        };

        return (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-[13px] text-slate-500 font-medium">Tags</FormLabel>
            <MultipleAutoComplete
              key={defaultTags.map((t) => t.id).join(',')}
              options={allOptions}
              values={tags.map((t) => t.id)}
              onChange={handleChange}
              label="Tags"
            />
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
