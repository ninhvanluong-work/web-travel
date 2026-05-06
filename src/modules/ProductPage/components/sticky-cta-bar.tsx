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
  const symbol = currency === 'USD' ? '$' : currency;

  return (
    <div className="flex-shrink-0 px-3 pb-3" style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}>
      <div className="bg-white border border-black/[0.08] rounded-[14px] px-4 py-3.5 flex items-center justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[11px] text-[#888884] line-through">
              {symbol}
              {originalPrice}
            </span>
            <span className="text-[11px] px-1.5 py-0.5 bg-[#E1F5EE] text-[#0F6E56] rounded-full font-medium">
              -{discountPercent}%
            </span>
          </div>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-[19px] font-medium">
              {symbol}
              {salePrice}
            </span>
            <span className="text-[12px] text-[#888884]">/ {priceUnit}</span>
          </div>
        </div>

        <button className="bg-[#0F6E56] text-white rounded-full px-[22px] py-[13px] text-[14px] font-medium">
          Book now
        </button>
      </div>
    </div>
  );
}
