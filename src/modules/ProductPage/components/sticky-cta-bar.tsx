import { useTranslation } from 'next-i18next';

import { Button } from '@/components/ui/button';

interface StickyCTABarProps {
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  currency: string;
  priceUnit: string;
}

export default function StickyCTABar({
  originalPrice,
  salePrice,
  discountPercent,
  currency,
  priceUnit,
}: StickyCTABarProps) {
  const { t } = useTranslation('productPage');
  const symbol = currency;
  const formatPrice = (n: number) =>
    symbol === '₫' ? `${symbol}${n.toLocaleString('vi-VN')}` : `${symbol}${n.toLocaleString('en-US')}`;

  const hasDiscount = discountPercent > 0;

  return (
    <div className="flex-shrink-0 px-3 pb-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
      <div className="bg-white border border-black/[0.08] rounded-[14px] px-4 py-3.5 flex items-center justify-between">
        <div>
          {hasDiscount && (
            <div className="flex items-baseline gap-1.5">
              <span className="text-[11px] text-[#888884] line-through">{formatPrice(originalPrice)}</span>
              <span className="text-[11px] px-1.5 py-0.5 bg-[#E1F5EE] text-[#0F6E56] rounded-full font-medium">
                -{discountPercent}%
              </span>
            </div>
          )}
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[19px] font-medium">{formatPrice(salePrice)}</span>
            <span className="text-[12px] text-[#888884]">/ {priceUnit}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          rounded="full"
          blur={false}
          className="bg-[#0F6E56] text-white px-[22px] py-[13px] text-[14px] font-medium h-auto"
        >
          {t('bookNow')}
        </Button>
      </div>
    </div>
  );
}
