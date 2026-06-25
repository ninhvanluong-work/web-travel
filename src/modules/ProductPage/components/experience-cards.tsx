import { useTranslation } from 'next-i18next';

interface Highlight {
  image?: string;
  title: string;
  subtitle: string;
}

interface ExperienceCardsProps {
  highlights: Highlight[];
}

const MOCK_IMAGES = [
  'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
  'https://images.unsplash.com/photo-1540202404-a2f29016b523?w=400&q=80',
  'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&q=80',
  'https://images.unsplash.com/photo-1552733407-5d5c46c3bb3b?w=400&q=80',
  'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=400&q=80',
  'https://images.unsplash.com/photo-1498503182468-3b51cbb6cb24?w=400&q=80',
  'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400&q=80',
  'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
  'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&q=80',
];

export default function ExperienceCards({ highlights }: ExperienceCardsProps) {
  const { t } = useTranslation('productPage');
  const items = highlights.slice(0, 10);

  return (
    <div className="bg-[#F8F6F0] px-[18px] py-5">
      <p className="text-[11px] uppercase tracking-wide text-[#888884] font-medium mb-3">
        {t('whatYouWillExperience')}
      </p>
      <div className={`grid gap-2.5 ${items.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {items.map((h, i) => {
          const imgSrc = h.image ?? MOCK_IMAGES[i % MOCK_IMAGES.length];
          return (
            <div key={i} className="bg-white rounded-[14px] overflow-hidden flex flex-col">
              <img src={imgSrc} alt={h.title} className="w-full aspect-[4/3] object-cover" />
              <div className="p-3">
                <p className="text-[13px] font-medium leading-snug">{h.title}</p>
                {h.subtitle && <p className="text-[11px] text-[#888884] leading-snug mt-0.5">{h.subtitle}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
