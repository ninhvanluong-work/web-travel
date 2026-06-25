import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, ImageIcon, Menu, Video } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import type { ProductFormValues } from '@/lib/validations/product';

import { BannerItem } from '../shared/banner-item';

type FieldItem = ReturnType<typeof useFieldArray<ProductFormValues, 'banner'>>['fields'][number];

interface DraggableBannerItemProps {
  item: FieldItem;
  index: number;
  onRemove: () => void;
  onDragEnd: () => void;
}

function DraggableBannerItem({ item, index, onRemove, onDragEnd }: DraggableBannerItemProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragControls={dragControls}
      dragListener={false}
      layout
      onDragEnd={onDragEnd}
      whileDrag={{
        scale: 0.99,
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      }}
      className="rounded-2xl"
    >
      <div className="flex items-start gap-2">
        <div
          className="mt-[22px] shrink-0 cursor-grab active:cursor-grabbing touch-none select-none text-slate-300 hover:text-slate-500 p-1"
          onPointerDown={(e) => dragControls.start(e)}
        >
          <Menu size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <BannerItem index={index} onRemove={onRemove} />
        </div>
      </div>
    </Reorder.Item>
  );
}

export function BannerSection() {
  const { control } = useFormContext<ProductFormValues>();
  const { fields, append, remove, move } = useFieldArray({ control, name: 'banner' });
  const { t } = useTranslation('adminPage');

  const [displayOrder, setDisplayOrder] = useState<FieldItem[]>([]);

  // Sync display order whenever fields change (add / remove)
  useEffect(() => {
    setDisplayOrder([...fields]);
  }, [fields]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleReorder = (newOrder: FieldItem[]) => {
    // Only update visual — no RHF write during drag
    setDisplayOrder(newOrder);
  };

  const handleDragEnd = () => {
    // Guard: ignore if something went wrong (e.g. dragged outside)
    if (displayOrder.length !== fields.length) {
      setDisplayOrder([...fields]);
      return;
    }

    // Apply moves using fields IDs (still original order — unchanged during drag)
    // Track intermediate positions so each subsequent move uses correct index
    const workingIds = fields.map((f) => f.id);
    const targetIds = displayOrder.map((f) => f.id);

    targetIds.forEach((targetId, targetIdx) => {
      const currentIdx = workingIds.indexOf(targetId);
      if (currentIdx !== -1 && currentIdx !== targetIdx) {
        move(currentIdx, targetIdx);
        workingIds.splice(currentIdx, 1);
        workingIds.splice(targetIdx, 0, targetId);
      }
    });
  };

  return (
    <div className="space-y-5">
      {fields.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <ImageIcon size={32} className="text-slate-300 mb-3" />
          <p className="text-[14px] font-medium text-slate-600">{t('noBannersYet')}</p>
          <p className="text-[13px] text-slate-400 mt-1 mb-4">{t('noBannersDesc')}</p>
        </div>
      )}

      {fields.length > 1 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand-50 border border-brand-100 w-fit">
          <GripVertical size={13} className="text-brand-400 shrink-0" />
          <span className="text-[12px] font-medium text-brand-600">{t('holdDragReorder')}</span>
        </div>
      )}

      <Reorder.Group axis="y" values={displayOrder} onReorder={handleReorder} className="space-y-4">
        {displayOrder.map((item) => {
          const fieldIndex = fields.findIndex((f) => f.id === item.id);
          if (fieldIndex === -1) return null;
          return (
            <DraggableBannerItem
              key={item.id}
              item={item}
              index={fieldIndex}
              onRemove={() => remove(fieldIndex)}
              onDragEnd={handleDragEnd}
            />
          );
        })}
      </Reorder.Group>

      <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={() => append({ type: 'image', url: '' })}
          className="gap-2 h-10 px-4 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-theme-xs transition-colors rounded-lg font-medium"
        >
          <ImageIcon size={16} className="text-slate-400" />
          {t('addImage')}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => append({ type: 'video', url: '' })}
          className="gap-2 h-10 px-4 bg-brand-500 hover:bg-brand-600 text-white font-semibold shadow-theme-xs transition-colors rounded-lg border-none"
        >
          <Video size={16} className="text-white" />
          {t('addVideo')}
        </Button>
      </div>
    </div>
  );
}
