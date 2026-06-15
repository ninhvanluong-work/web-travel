import { Star } from 'lucide-react';

export const CRITERIA = [
  { key: 'storytelling', name: 'Storytelling' },
  { key: 'localKnowledge', name: 'Local knowledge' },
  { key: 'careAttention', name: 'Care & attention' },
  { key: 'safetyAwareness', name: 'Safety awareness' },
  { key: 'punctuality', name: 'Punctuality' },
  { key: 'english', name: 'English' },
  { key: 'funny', name: 'Funny' },
];

export type CriteriaValues = Record<string, number>;

export function buildDefaultCriteria(): CriteriaValues {
  return Object.fromEntries(CRITERIA.map((c) => [c.key, 0]));
}

interface RatingCriteriaPanelProps {
  values: CriteriaValues;
  onChange: (key: string, value: number) => void;
}

export default function RatingCriteriaPanel({ values, onChange }: RatingCriteriaPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      {CRITERIA.map((c) => (
        <div key={c.key} className="space-y-1">
          <p className="text-[11px] text-slate-500 font-medium">{c.name}</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((val) => (
              <button key={val} type="button" onClick={() => onChange(c.key, val)}>
                <Star
                  size={14}
                  className={
                    val <= values[c.key] ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'
                  }
                />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
