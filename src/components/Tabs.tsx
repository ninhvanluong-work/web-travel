import { motion } from 'framer-motion';
import { useId } from 'react';

import { cn } from '@/lib/utils';

interface TabItem<T> {
  name: React.ReactNode;
  value: T;
}

interface Props<T extends string | number> {
  data: TabItem<T>[];
  onChange: (value: T) => void;
  value: T;
  className?: string;
  extras?: any;
}

const Tabs = <T extends string | number>({ data, extras, className, onChange, value }: Props<T>) => {
  const id = useId();
  return (
    <div className={className}>
      <div className="border-b">
        <div className="overflow-x-auto scrollbar-hide">
          <ul className="-mb-0.5 flex min-h-[48px] items-center">
            {data.map((tab, i) => (
              <li
                onClick={() => onChange(tab.value)}
                className={cn(
                  'text-slate-400 relative cursor-pointer whitespace-nowrap px-5 py-3.5 text-center text-[13px] font-bold transition-colors hover:text-main active:scale-[0.98]',
                  {
                    'text-main': value === tab.value,
                  }
                )}
                key={i}
              >
                {tab.name}
                {value === tab.value ? (
                  <motion.div
                    layoutId={id}
                    className="bg-main absolute bottom-0 left-0 z-10 h-[3px] w-full rounded-t-full"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                ) : null}
              </li>
            ))}

            {extras && <li className="ml-auto flex items-center justify-end">{extras}</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Tabs;
