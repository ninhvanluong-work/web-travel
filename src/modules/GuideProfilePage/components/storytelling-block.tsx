interface StorytellingBlockProps {
  bio: string;
}

export default function StorytellingBlock({ bio }: StorytellingBlockProps) {
  return (
    <div className="py-[22px] px-[18px] bg-white border-b border-neutral-200">
      <p className="text-[11px] text-neutral-500 uppercase font-medium mb-2.5" style={{ letterSpacing: '0.5px' }}>
        Vì sao tôi làm nghề này
      </p>
      <p
        className="text-[16px] text-neutral-900 leading-[1.65] font-normal"
        style={{ fontFamily: 'var(--font-serif)' }}
      >
        {bio}
      </p>
    </div>
  );
}
