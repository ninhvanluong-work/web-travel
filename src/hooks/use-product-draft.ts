import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import type { ItineraryFormValues, OptionFormValues, ProductFormValues } from '@/lib/validations/product';

interface DraftData {
  formValues: ProductFormValues;
  itineraries: ItineraryFormValues[];
  options: OptionFormValues[];
  savedAt: string;
}

function getDraftKey(productId?: string) {
  return `product-draft-${productId ?? 'new'}`;
}

export function useProductDraft(
  productId: string | undefined,
  form: UseFormReturn<ProductFormValues>,
  itineraries: ItineraryFormValues[],
  options: OptionFormValues[]
) {
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Check for existing draft on mount (create mode only)
  useEffect(() => {
    if (productId) return;
    const key = getDraftKey(productId);
    const raw = localStorage.getItem(key);
    if (raw) setHasDraft(true);
  }, [productId]);

  // Auto-save every 5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const key = getDraftKey(productId);
      const draft: DraftData = {
        formValues: form.getValues(),
        itineraries,
        options,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(draft));
      setLastSaved(format(new Date(), 'HH:mm'));
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [productId, form, itineraries, options]);

  function restoreDraft(): { itineraries: ItineraryFormValues[]; options: OptionFormValues[] } | null {
    const key = getDraftKey(productId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      const draft = JSON.parse(raw) as DraftData;
      form.reset(draft.formValues);
      setHasDraft(false);
      return { itineraries: draft.itineraries, options: draft.options };
    } catch {
      return null;
    }
  }

  function discardDraft() {
    const key = getDraftKey(productId);
    localStorage.removeItem(key);
    setHasDraft(false);
  }

  function clearDraftOnSuccess() {
    const key = getDraftKey(productId);
    localStorage.removeItem(key);
  }

  return { lastSaved, hasDraft, restoreDraft, discardDraft, clearDraftOnSuccess };
}
