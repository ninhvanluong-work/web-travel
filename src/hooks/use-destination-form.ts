import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';

import { useCreateDestination, useDestinationById, useUpdateDestination } from '@/api/destination/queries';
import type { IDestination } from '@/api/destination/types';
import { destinationFormSchema, type DestinationFormValues } from '@/lib/validations/destination';
import { DESTINATION_NS, DESTINATION_ROUTES } from '@/modules/AdminDestination/constants';
import { useAlertStore } from '@/stores/use-alert-store';

type ApiError = AxiosError<{ message?: string | string[] }>;

const DEFAULT_VALUES: DestinationFormValues = { name: '', description: '' };

export function getDestinationApiError(err: unknown, fallback: string): string {
  const msg = (err as ApiError)?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  return msg || fallback;
}

/**
 * Used after delete: refetch every cached list query, including inactive ones (the user navigates
 * back to the list right after), and drop cached details.
 */
export function invalidateDestinationQueries(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ['/destination/list'], refetchType: 'all' });
  queryClient.removeQueries({ queryKey: ['/destination/detail'] });
}

export function useDestinationForm(destinationId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { t } = useTranslation(DESTINATION_NS);
  const isEdit = !!destinationId;

  const detailQuery = useDestinationById({
    variables: { id: destinationId ?? '' },
    enabled: isEdit,
    retry: (count, err) => (err as ApiError)?.response?.status !== 404 && count < 2,
    refetchOnWindowFocus: false,
  });

  const form = useForm<DestinationFormValues>({
    resolver: zodResolver(destinationFormSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Populate the form once per destination so background refetches never wipe user edits
  const loadedIdRef = useRef<string | null>(null);
  const destination = detailQuery.data;
  useEffect(() => {
    if (!destination || loadedIdRef.current === destination.id) return;
    loadedIdRef.current = destination.id;
    form.reset({ name: destination.name, description: destination.description });
  }, [destination, form]);

  // After saving we stay on the form: refresh lists in the background and seed the detail cache
  // with the server response so the edit page renders it immediately (no refetch / skeleton).
  const syncCaches = (saved: IDestination) => {
    queryClient.invalidateQueries({ queryKey: ['/destination/list'], refetchType: 'all' });
    queryClient.setQueryData(useDestinationById.getKey({ id: saved.id }), saved);
  };

  const onError = (err: unknown) => {
    useAlertStore.getState().addAlert({ type: 'error', title: getDestinationApiError(err, t('genericError')) });
  };

  const createMutation = useCreateDestination({
    onSuccess: (created) => {
      syncCaches(created);
      useAlertStore.getState().addAlert({ type: 'success', title: t('destinationCreated') });
      // Move to the edit URL of the new record so a second "Save" updates instead of creating a duplicate
      router.replace(DESTINATION_ROUTES.EDIT(created.id));
    },
    onError,
  });

  const updateMutation = useUpdateDestination({
    onSuccess: (updated) => {
      syncCaches(updated);
      // Show the normalized server values and clear the dirty state
      form.reset({ name: updated.name, description: updated.description });
      useAlertStore.getState().addAlert({ type: 'success', title: t('destinationUpdated') });
    },
    onError,
  });

  const onSubmit = useCallback(
    (values: DestinationFormValues) => {
      if (destinationId) {
        updateMutation.mutate({ id: destinationId, payload: values });
      } else {
        createMutation.mutate(values);
      }
    },
    [destinationId, createMutation, updateMutation]
  );

  const isNotFound = isEdit && (detailQuery.error as ApiError | null)?.response?.status === 404;

  return {
    form,
    isEdit,
    destination,
    isLoadingDetail: isEdit && detailQuery.isLoading && !isNotFound,
    isNotFound,
    onSubmit,
    isPending: createMutation.isLoading || updateMutation.isLoading,
  };
}
