import { Icons } from '@/assets/icons';

interface ProductHeaderProps {
  tags: string[];
  name: string;
  shortDescription: string;
  rating: number;
  reviewCount: number;
}

export default function ProductHeader({ tags, name, shortDescription, rating, reviewCount }: ProductHeaderProps) {
  return (
    <div className="px-[18px] pt-1 pb-4">
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {tags.map((tag, i) => (
          <span
            key={tag}
            className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
              i === 0 ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-[#F1EFE8] text-[#444441]'
            }`}
          >
            {tag}
          </span>
        ))}
      </div>

      <p className="text-[23px] font-medium leading-[1.25] tracking-[-0.4px] mb-2">{name}</p>

      <div
        className="text-[15px] text-[#888884] leading-[1.55] mb-0 [&_p]:italic [&_*]:font-serif"
        style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
        dangerouslySetInnerHTML={{ __html: shortDescription }}
      />

      <div className="flex items-center gap-3 pt-3 border-t border-black/[0.08] mt-3">
        <div className="flex items-baseline gap-1.5">
          <Icons.star className="w-[14px] h-[14px] text-[#0F6E56]" />
          <span className="text-base font-medium tracking-[-0.2px]">{rating}</span>
          <span className="text-[12px] text-[#888884]">/ 5</span>
        </div>
        <span className="text-[12px] text-[#888884]">·</span>
        <a href="#reviews" className="text-[13px] text-[#1A1A18] underline underline-offset-[3px] decoration-black/20">
          {reviewCount} reviews
        </a>
      </div>
    </div>
  );
}
