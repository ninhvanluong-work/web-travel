import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDestinations, getSuppliers, type LookupItem, type ProductFormValues } from '@/lib/validations/product';

export function RelationCard() {
  const { control } = useFormContext<ProductFormValues>();
  const [suppliers, setSuppliers] = useState<LookupItem[]>([]);
  const [destinations, setDestinations] = useState<LookupItem[]>([]);

  useEffect(() => {
    setSuppliers(getSuppliers());
    setDestinations(getDestinations());
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <h3 className="font-semibold text-gray-900">Điểm đến & Nhà cung cấp</h3>

      <FormField
        control={control}
        name="destination_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Điểm đến</FormLabel>
            <FormControl>
              <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                <SelectTrigger inputSize="sm" className="w-full">
                  <SelectValue placeholder="Chọn điểm đến" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Không chọn</SelectItem>
                  {destinations.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="supplier_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nhà cung cấp</FormLabel>
            <FormControl>
              <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                <SelectTrigger inputSize="sm" className="w-full">
                  <SelectValue placeholder="Chọn nhà cung cấp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Không chọn</SelectItem>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
