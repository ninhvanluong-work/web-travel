import { useState } from 'react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TagListInputProps {
  value: string | null | undefined;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function TagListInput({ value, onChange, placeholder }: TagListInputProps) {
  const [input, setInput] = useState('');
  const items = value ? value.split('\n').filter(Boolean) : [];

  const add = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onChange([...items, trimmed].join('\n'));
    setInput('');
  };

  const remove = (i: number) => {
    onChange(items.filter((_, idx) => idx !== i).join('\n'));
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          size="sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="primary"
          size="xs"
          rounded="md"
          blur={false}
          onClick={add}
          className="px-3 whitespace-nowrap"
        >
          + Thêm
        </Button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1 pt-1">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <span className="flex-1">{item}</span>
              <button
                type="button"
                className="text-gray-400 hover:text-red-500 transition-colors"
                onClick={() => remove(i)}
              >
                <X size={14} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
