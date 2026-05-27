import { Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useElementList } from '@/api/element';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ELEMENT_KEY_OPTIONS, type ProductFormValues } from '@/lib/validations/product';

import { ElementCombobox } from '../shared/element-value-combobox';

interface RowState {
  rowKey: string;
  key: string;
  elementId: string;
}

export function QuickFactsSection() {
  const { setValue } = useFormContext<ProductFormValues>();
  const selectedIds = (useWatch<ProductFormValues, 'elementIds'>({ name: 'elementIds' }) ?? []) as string[];

  const { data: allElements = [] } = useElementList({ variables: {} });

  const [rows, setRows] = useState<RowState[]>([]);

  useEffect(() => {
    if (allElements.length === 0) return;
    const rowIds = new Set(rows.map((r) => r.elementId).filter(Boolean));
    const formIds = new Set(selectedIds);
    const inSync = rowIds.size === formIds.size && selectedIds.every((id) => rowIds.has(id));
    if (inSync) return;

    setRows(
      selectedIds.map((id) => {
        const el = allElements.find((e) => e.id === id);
        return { rowKey: id, key: el?.key ?? '', elementId: id };
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allElements, selectedIds]);

  const syncForm = (newRows: RowState[]) => {
    setValue(
      'elementIds',
      newRows.filter((r) => r.elementId).map((r) => r.elementId),
      { shouldDirty: true }
    );
  };

  const handleKeyChange = (rowKey: string, newKey: string) => {
    const newRows = rows.map((r) => (r.rowKey === rowKey ? { ...r, key: newKey, elementId: '' } : r));
    setRows(newRows);
    syncForm(newRows);
  };

  const handleElementChange = (rowKey: string, elementId: string) => {
    const newRows = rows.map((r) => (r.rowKey === rowKey ? { ...r, elementId } : r));
    setRows(newRows);
    syncForm(newRows);
  };

  const addRow = () => {
    setRows((prev) => [...prev, { rowKey: crypto.randomUUID(), key: '', elementId: '' }]);
  };

  const removeRow = (rowKey: string) => {
    const newRows = rows.filter((r) => r.rowKey !== rowKey);
    setRows(newRows);
    syncForm(newRows);
  };

  const availableKeys = new Set(allElements.map((e) => e.key));
  const usedKeys = rows.map((r) => r.key).filter(Boolean);

  return (
    <div className="space-y-4">
      {rows.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <p className="text-[14px] font-medium text-slate-600">No configuration set</p>
          <p className="text-[13px] text-slate-400 mt-1">Click the button below to add quick facts for this tour</p>
        </div>
      )}

      <div className="space-y-3">
        {rows.map((row) => {
          const otherRowElementIds = rows
            .filter((r) => r.rowKey !== row.rowKey)
            .map((r) => r.elementId)
            .filter(Boolean);

          return (
            <div key={row.rowKey} className="flex items-center gap-4">
              <Select value={row.key} onValueChange={(v) => handleKeyChange(row.rowKey, v)}>
                <SelectTrigger
                  inputSize="sm"
                  className="w-[240px] shrink-0 bg-slate-50/50 border-slate-200 hover:bg-white transition-colors"
                >
                  <SelectValue placeholder="Select fact type..." />
                </SelectTrigger>
                <SelectContent>
                  {ELEMENT_KEY_OPTIONS.filter((opt) => availableKeys.has(opt.value)).map((opt) => (
                    <SelectItem
                      key={opt.value}
                      value={opt.value}
                      disabled={usedKeys.includes(opt.value) && opt.value !== row.key}
                    >
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <ElementCombobox
                rowKey={row.rowKey}
                elementKey={row.key}
                selectedId={row.elementId}
                allElements={allElements}
                otherSelectedIds={otherRowElementIds}
                onChange={handleElementChange}
              />

              <button
                type="button"
                onClick={() => removeRow(row.rowKey)}
                className="shrink-0 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <Trash2 size={15} />
              </button>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="md"
        onClick={addRow}
        disabled={rows.length >= ELEMENT_KEY_OPTIONS.length}
        className="gap-2 h-9 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-theme-xs transition-colors rounded-lg font-medium text-[13px]"
      >
        <Plus size={14} className="text-brand-500" />
        Add fact
      </Button>
    </div>
  );
}
