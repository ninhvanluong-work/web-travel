import { Copy, Trash2 } from 'lucide-react';
import { useRef } from 'react';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCY_OPTIONS, type OptionFormValues } from '@/lib/validations/product';

function formatNum(n: number): string {
  if (!n) return '';
  return new Intl.NumberFormat('vi-VN').format(n);
}

function parseNum(s: string): number {
  return Number(s.replace(/[,.]/g, '')) || 0;
}

interface Props {
  options: OptionFormValues[];
  lockCurrency: string;
  onSet: (index: number, patch: Partial<OptionFormValues>) => void;
  onClone: (index: number) => void;
  onRemove: (index: number) => void;
}

export function OptionsGridTable({ options, lockCurrency, onSet, onClone, onRemove }: Props) {
  const tableRef = useRef<HTMLTableElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, rowIdx: number, colIdx: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const PRICE_COLS = 3;
    const nextCol = e.key === 'ArrowRight' ? colIdx + 1 : colIdx - 1;
    const actualCol = (nextCol + PRICE_COLS) % PRICE_COLS;
    let actualRow = rowIdx;
    if (nextCol < 0) {
      actualRow = rowIdx - 1;
    } else if (nextCol >= PRICE_COLS) {
      actualRow = rowIdx + 1;
    }
    if (actualRow < 0 || actualRow >= options.length) return;
    tableRef.current?.querySelector<HTMLInputElement>(`[data-cell="${actualRow}-${actualCol}"]`)?.focus();
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table ref={tableRef} className="w-full text-xs">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-medium">
            <th className="py-2.5 pl-3 pr-2 text-left w-10">#</th>
            <th className="py-2.5 px-2 text-left min-w-[160px]">Tên gói</th>
            <th className="py-2.5 px-2 text-right w-32">Người lớn</th>
            <th className="py-2.5 px-2 text-right w-28">Trẻ em</th>
            <th className="py-2.5 px-2 text-right w-24">Em bé</th>
            <th className="py-2.5 px-2 text-center w-20">Tiền tệ</th>
            <th className="py-2.5 pl-2 pr-3 w-16" />
          </tr>
        </thead>
        <tbody>
          {options.map((opt, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-slate-50/60 transition-colors">
              <td className="py-2 pl-3 pr-2 text-gray-400 tabular-nums">{i + 1}</td>
              <td className="py-2 px-2">
                <Input
                  size="sm"
                  placeholder="VD: Gói tiêu chuẩn"
                  value={opt.title}
                  onChange={(e) => onSet(i, { title: e.target.value })}
                />
              </td>
              <td className="py-2 px-2">
                <Input
                  size="sm"
                  className="text-right tabular-nums"
                  placeholder="0"
                  value={formatNum(opt.adultPrice)}
                  data-cell={`${i}-0`}
                  onChange={(e) => onSet(i, { adultPrice: parseNum(e.target.value) })}
                  onKeyDown={(e) => handleKeyDown(e, i, 0)}
                />
              </td>
              <td className="py-2 px-2">
                <Input
                  size="sm"
                  className="text-right tabular-nums"
                  placeholder="0"
                  value={formatNum(opt.childPrice)}
                  data-cell={`${i}-1`}
                  onChange={(e) => onSet(i, { childPrice: parseNum(e.target.value) })}
                  onKeyDown={(e) => handleKeyDown(e, i, 1)}
                />
              </td>
              <td className="py-2 px-2">
                <Input
                  size="sm"
                  className="text-right tabular-nums"
                  placeholder="0"
                  value={formatNum(opt.infantPrice)}
                  data-cell={`${i}-2`}
                  onChange={(e) => onSet(i, { infantPrice: parseNum(e.target.value) })}
                  onKeyDown={(e) => handleKeyDown(e, i, 2)}
                />
              </td>
              <td className="py-2 px-2 text-center">
                {lockCurrency ? (
                  <span className="text-gray-500 font-medium">{opt.currency}</span>
                ) : (
                  <Select value={opt.currency} onValueChange={(v) => onSet(i, { currency: v })}>
                    <SelectTrigger inputSize="sm" className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCY_OPTIONS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </td>
              <td className="py-2 pl-2 pr-3">
                <div className="flex items-center justify-center gap-1">
                  <button
                    type="button"
                    title="Nhân bản"
                    className="text-gray-400 hover:text-violet-600 transition-colors"
                    onClick={() => onClone(i)}
                  >
                    <Copy size={13} />
                  </button>
                  <button
                    type="button"
                    title="Xóa"
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    onClick={() => onRemove(i)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
