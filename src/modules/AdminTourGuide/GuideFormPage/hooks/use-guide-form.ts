import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useCreateTourGuide, useTourGuideById, useUpdateTourGuide } from '@/api/tour-guide/queries';
import type { TourGuideFormPayload } from '@/api/tour-guide/types';
import { type TourGuideFormValues, tourGuideSchema } from '@/lib/validations/tour-guide';
import { useAlertStore } from '@/stores/use-alert-store';
import { ROUTE } from '@/types';

const DEFAULT_VALUES: TourGuideFormValues = {
  name: '',
  avatar: null,
  coverImg: null,
  quote: null,
  summary: null,
  description: null,
  expYear: 0,
  languages: [],
  experts: [],
  careerPath: [],
};

export function useGuideForm(guideId?: string, onAfterSave?: () => void) {
  const { t } = useTranslation('adminPage');
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = !!guideId;
  const { addAlert } = useAlertStore.getState();

  const invalidate = () => {
    queryClient.removeQueries({ queryKey: ['/tour-guide/list'] });
    queryClient.removeQueries({ queryKey: ['/tour-guide/detail'] });
  };

  const { data: guideData } = useTourGuideById({
    variables: { id: guideId! },
    enabled: isEdit,
  });

  const form = useForm<TourGuideFormValues>({
    resolver: zodResolver(tourGuideSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (!guideData) return;
    form.reset({
      name: guideData.name,
      avatar: guideData.avatarUrl ?? null,
      coverImg: guideData.coverUrl ?? null,
      quote: guideData.slogan?.replace(/^"|"$/g, '') ?? null,
      summary: guideData.title ?? null,
      description: guideData.bio ?? null,
      expYear: guideData.metrics.yearsOfExperience,
      languages: guideData.metrics.languages,
      experts: guideData.specialties.map((s) => s.label),
      careerPath: guideData.careerTimeline.map((c) => {
        const tourCountMatch = c.description.match(/^(\d+)\s*tours?\s*·\s*(.+)/);
        const tourCount = tourCountMatch ? parseInt(tourCountMatch[1], 10) : 0;
        const desc = tourCountMatch ? tourCountMatch[2].trim() : c.description;
        const startYear = parseInt(c.period.split(/[–-]/)[0].trim(), 10) || new Date().getFullYear();
        return { company: c.companyName, role: c.role, startYear, tourCount, description: desc };
      }),
    });
  }, [guideData, form]);

  const toPayload = (data: TourGuideFormValues): TourGuideFormPayload => ({
    name: data.name,
    avatar: data.avatar ?? undefined,
    coverImg: data.coverImg ?? undefined,
    quote: data.quote ?? undefined,
    summary: data.summary ?? undefined,
    description: data.description ?? undefined,
    expYear: data.expYear,
    languages: data.languages,
    experts: data.experts,
    careerPath: data.careerPath,
  });

  const createMutation = useCreateTourGuide({
    onSuccess: () => {
      invalidate();
      addAlert({ type: 'success', title: t('createSuccess') });
      form.reset(form.getValues());
      onAfterSave?.();
      router.push(ROUTE.ADMIN_GUIDES);
    },
    onError: (err: any) => {
      addAlert({ type: 'error', title: err?.response?.data?.message ?? t('genericError') });
    },
  });

  const updateMutation = useUpdateTourGuide({
    onError: (err: any) => {
      addAlert({ type: 'error', title: err?.response?.data?.message ?? t('genericError') });
    },
  });

  const onSubmit = (data: TourGuideFormValues) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: guideId!, payload: toPayload(data) },
        {
          onSuccess: () => {
            invalidate();
            addAlert({ type: 'success', title: t('updateSuccess') });
            form.reset(data);
            onAfterSave?.();
            router.push(ROUTE.ADMIN_GUIDES);
          },
        }
      );
    } else {
      createMutation.mutate(toPayload(data));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return { form, isEdit, guideData, onSubmit, isPending };
}
