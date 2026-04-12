import { DollarSign, MapPin, Store } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { useDestinationList, useSupplierList } from '@/api/product';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ProductFormValues } from '@/lib/validations/product';

function SidebarCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03] ${className}`}
    >
      {children}
    </div>
  );
}

function CardSection({
  icon: Icon,
  label,
  iconBg,
  iconColor,
  children,
}: {
  icon: React.ElementType;
  label: string;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
}) {
  return (
    <SidebarCard>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2.5">
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon size={13} className={iconColor} />
        </span>
        <span className="text-xs font-semibold text-gray-700 dark:text-white/90 tracking-wide">{label}</span>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </SidebarCard>
  );
}

export function PricingCard() {
  const { control } = useFormContext<ProductFormValues>();

  return (
    <CardSection icon={DollarSign} label="Định giá" iconBg="bg-emerald-50" iconColor="text-emerald-600">
      <FormField
        control={control}
        name="minPrice"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-xs text-gray-500">
              Giá từ <span className="font-normal">(VND)</span>
            </FormLabel>
            <FormControl>
              <Input type="number" size="sm" min={0} placeholder="VD: 2.500.000" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </CardSection>
  );
}

export function RelationCard() {
  const { control } = useFormContext<ProductFormValues>();

  const { data: suppliers = [] } = useSupplierList();
  const { data: destinations = [] } = useDestinationList();

  return (
    <SidebarCard>
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-violet-50">
          <Store size={13} className="text-violet-600" />
        </span>
        <span className="text-xs font-semibold text-gray-700 dark:text-white/90 tracking-wide">Nhà cung cấp</span>
      </div>
      <div className="p-4">
        <FormField
          control={control}
          name="supplierId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                  <SelectTrigger inputSize="sm" className="w-full">
                    <SelectValue placeholder="-- Chọn nhà cung cấp --" />
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

      <div className="border-t border-gray-200 dark:border-gray-800 px-4 py-3 flex items-center gap-2.5">
        <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 bg-sky-50">
          <MapPin size={13} className="text-sky-600" />
        </span>
        <span className="text-xs font-semibold text-gray-700 dark:text-white/90 tracking-wide">Điểm đến</span>
      </div>
      <div className="px-4 pb-4">
        <FormField
          control={control}
          name="destinationId"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                  <SelectTrigger inputSize="sm" className="w-full">
                    <SelectValue placeholder="-- Chọn điểm đến --" />
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
      </div>
    </SidebarCard>
  );
}
