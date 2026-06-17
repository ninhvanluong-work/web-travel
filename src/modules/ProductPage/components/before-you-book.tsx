import { useTranslation } from 'next-i18next';

import { Icons } from '@/assets/icons';

import type { BookItemType } from '../types';

interface BeforeYouBookItem {
  type: BookItemType;
  title: string;
  description: string;
}

interface BeforeYouBookProps {
  items: BeforeYouBookItem[];
}

const TYPE_CONFIG: Record<BookItemType, { icon: keyof typeof Icons; bg: string; color: string }> = {
  passport: { icon: 'paper', bg: '#FFF4E5', color: '#A85E00' },
  bestFor: { icon: 'checkCircle', bg: '#E1F5EE', color: '#0F6E56' },
  notRecommended: { icon: 'warningCircle', bg: '#FCEBEB', color: '#791F1F' },
  bring: { icon: 'houseBring', bg: '#F1EFE8', color: '#444441' },
  wear: { icon: 'clothingWear', bg: '#F1EFE8', color: '#444441' },
  cultural: { icon: 'globe', bg: '#EEF3FC', color: '#2B5CB8' },
};

export default function BeforeYouBook({ items }: BeforeYouBookProps) {
  const { t } = useTranslation('productPage');

  return (
    <div className="bg-[#F8F6F0] px-[18px] py-6 border-t border-black/[0.08]">
      <p className="text-base font-medium">{t('readBeforeYouBook')}</p>
      <p className="text-[12px] text-[#888884] mt-0.5">{t('tripSmoothExplanation')}</p>

      <div className="mt-4 flex flex-col gap-3">
        {items.map((item, i) => {
          const cfg = TYPE_CONFIG[item.type];
          const Icon = Icons[cfg.icon] as React.ElementType;
          return (
            <div key={i} className="flex items-start gap-3 bg-white rounded-[14px] p-3.5">
              <div
                className="w-[38px] h-[38px] rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                style={{ backgroundColor: cfg.bg }}
              >
                <Icon className="w-[18px] h-[18px]" style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium">{item.title}</p>
                <p className="text-[12px] text-[#888884] leading-[1.55] mt-0.5">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
