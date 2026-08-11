import { CalendarDays } from 'lucide-react';
import { useTranslation } from 'next-i18next';

import { useProductById } from '@/api/product';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SessionSection } from '@/modules/AdminProduct/ProductFormPage/components/sections/session-section';

interface Props {
  productId: string | null;
  productName: string;
  onClose: () => void;
  open?: boolean;
}

export function ProductSessionSheet({ productId, productName, onClose, open }: Props) {
  const { t } = useTranslation('adminPage');

  const { data: productDetail, isLoading } = useProductById(
    { variables: { id: productId! }, enabled: !!productId },
    undefined
  );

  const units = productDetail?.units ?? [];

  return (
    <Sheet open={open ?? !!productId} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[800px] sm:max-w-[800px] overflow-y-auto overscroll-contain p-0"
      >
        <SheetHeader className="px-6 py-5 border-b border-slate-100 sticky top-0 bg-white z-10">
          <SheetTitle className="flex items-center gap-2 text-base font-bold text-slate-800">
            <CalendarDays size={18} className="text-brand-500" />
            {t('secSessions')} — {productName}
          </SheetTitle>
        </SheetHeader>

        <div className="px-6 py-5">
          {isLoading && (
            <div className="space-y-3 animate-pulse">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded-xl" />
              ))}
            </div>
          )}
          {!isLoading && productId && <SessionSection productId={productId} units={units} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
