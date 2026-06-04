import { motion } from 'framer-motion';

interface CriteriaBarProps {
  label: string;
  score: number;
}

export default function CriteriaBar({ label, score }: CriteriaBarProps) {
  const widthPct = `${((score / 5) * 100).toFixed(0)}%`;

  return (
    <div>
      <div className="flex justify-between items-baseline mb-[5px]">
        <span className="text-[12px] text-neutral-900">{label}</span>
        <span className="text-[12px] text-neutral-500 tabular-nums">{score.toFixed(2)}</span>
      </div>
      <div className="h-[4px] bg-neutral-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-neutral-black rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: widthPct }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
