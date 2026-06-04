import type { GuideProfileData } from '../data/mock-guide';

interface HeroBannerProps {
  guide: Pick<GuideProfileData, 'name' | 'title' | 'slogan' | 'coverUrl'>;
}

export default function HeroBanner({ guide }: HeroBannerProps) {
  const hasCover = !!guide.coverUrl;

  return (
    <div
      className="relative h-[280px] overflow-hidden"
      style={
        hasCover
          ? {
              backgroundImage: `url(${guide.coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 60%',
            }
          : {
              background: 'linear-gradient(135deg, #1D9E75 0%, #0F6E56 60%, #04342C 100%)',
            }
      }
    >
      {hasCover ? (
        <>
          <div className="absolute inset-0 bg-[#0F6E56]/20 mix-blend-multiply" />
          <div className="absolute bottom-0 left-0 right-0 h-[75%] bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
        </>
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.15), transparent 50%)' }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-black/55 to-transparent" />
        </>
      )}

      <div className="absolute bottom-0 left-0 right-0 px-[18px] pb-[18px] z-10">
        <p
          className="text-[13px] text-white/90 mb-1.5 font-medium"
          style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
        >
          {guide.slogan}
        </p>
        <p className="text-[22px] font-semibold text-white leading-tight tracking-[-0.3px] drop-shadow-sm">
          {guide.name}
        </p>
        <p className="text-[13px] text-white/80 mt-0.5 font-medium">{guide.title}</p>
      </div>
    </div>
  );
}
