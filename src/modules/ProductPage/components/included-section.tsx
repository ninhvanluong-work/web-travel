import { useTranslation } from 'next-i18next';

import { Icons } from '@/assets/icons';

interface IncludedSectionProps {
  included: string | string[];
  notIncluded: string | string[];
}

function isHtmlString(s: string): boolean {
  return /<[a-z][\s\S]*>/i.test(s);
}

function renderContent(data: string | string[], textClass?: string) {
  if (typeof data === 'string' && isHtmlString(data)) {
    return (
      <div
        className={`text-[13px] leading-snug [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mt-1 ${
          textClass ?? ''
        }`}
        dangerouslySetInnerHTML={{ __html: data }}
      />
    );
  }

  const items = Array.isArray(data) ? data : [data];
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className={`text-[13px] leading-snug ${textClass ?? ''}`}>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function IncludedSection({ included, notIncluded }: IncludedSectionProps) {
  const { t } = useTranslation('productPage');

  return (
    <div className="px-[18px] pb-[22px] border-t border-black/[0.08] pt-6">
      <p className="text-base font-medium mb-4">{t('whatsIncluded')}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#F1EFE8] rounded-[14px] p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-[18px] h-[18px] rounded-full bg-[#0F6E56] flex items-center justify-center flex-shrink-0">
              <Icons.check className="w-[10px] h-[10px] text-white" />
            </div>
            <p className="text-[12px] font-medium">{t('included')}</p>
          </div>
          {renderContent(included)}
        </div>

        <div className="bg-[#F1EFE8] rounded-[14px] p-3">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-[18px] h-[18px] rounded-full bg-white border border-black/[0.1] flex items-center justify-center flex-shrink-0">
              <Icons.x className="w-[8px] h-[8px] text-[#888884]" />
            </div>
            <p className="text-[12px] font-medium">{t('notIncluded')}</p>
          </div>
          {renderContent(notIncluded, 'text-[#888884]')}
        </div>
      </div>
    </div>
  );
}
