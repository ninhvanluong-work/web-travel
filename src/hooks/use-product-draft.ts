import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import type { ProductFormValues } from '@/lib/validations/product';

interface DraftData {
  formValues: ProductFormValues;
  savedAt: string;
}

function getDraftKey(productId?: string) {
  return `product-draft-${productId ?? 'new'}`;
}

export function useProductDraft(productId: string | undefined, form: UseFormReturn<ProductFormValues>) {
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (productId) return;
    const key = getDraftKey(productId);
    const raw = localStorage.getItem(key);
    if (raw) setHasDraft(true);
  }, [productId]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const key = getDraftKey(productId);
      const draft: DraftData = {
        formValues: form.getValues(),
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(draft));
      setLastSaved(format(new Date(), 'HH:mm'));
    }, 5000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [productId, form]);

  function restoreDraft(): boolean {
    const key = getDraftKey(productId);
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    try {
      const draft = JSON.parse(raw) as DraftData;
      form.reset(draft.formValues);
      setHasDraft(false);
      return true;
    } catch {
      return false;
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
