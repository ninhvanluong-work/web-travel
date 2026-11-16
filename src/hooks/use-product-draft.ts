import { format } from 'date-fns';
import { useEffect, useRef, useState } from 'react';
import { type UseFormReturn, useFormState } from 'react-hook-form';

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

  // Only user edits are worth saving; the interval reads these refs instead of re-subscribing
  const { isDirty } = useFormState({ control: form.control });
  const isDirtyRef = useRef(isDirty);
  isDirtyRef.current = isDirty;
  // An existing draft must not be overwritten before the user picks Restore or Discard
  const pendingDraftRef = useRef(false);

  useEffect(() => {
    if (productId) return;
    const key = getDraftKey(productId);
    const raw = localStorage.getItem(key);
    if (raw) {
      pendingDraftRef.current = true;
      setHasDraft(true);
    }
  }, [productId]);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      if (pendingDraftRef.current || !isDirtyRef.current) return;
      const key = getDraftKey(productId);
      const draft: DraftData = {
        formValues: form.getValues(),
        savedAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem(key, JSON.stringify(draft));
        setLastSaved(format(new Date(), 'HH:mm'));
      } catch {
        // Storage full or unavailable: skip this round rather than breaking the form
      }
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
      pendingDraftRef.current = false;
      setHasDraft(false);
      return true;
    } catch {
      // Unreadable draft: let autosave take over again
      pendingDraftRef.current = false;
      return false;
    }
  }

  function discardDraft() {
    const key = getDraftKey(productId);
    localStorage.removeItem(key);
    pendingDraftRef.current = false;
    setHasDraft(false);
  }

  function clearDraftOnSuccess() {
    const key = getDraftKey(productId);
    localStorage.removeItem(key);
  }

  return { lastSaved, hasDraft, restoreDraft, discardDraft, clearDraftOnSuccess };
}
