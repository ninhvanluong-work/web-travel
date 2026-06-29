import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'next-i18next';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useTourGuideById, useTourGuideMoments } from '@/api/tour-guide/queries';
import { updateTourGuide } from '@/api/tour-guide/requests';
import type { TourGuideFormPayload } from '@/api/tour-guide/types';
import { type TourGuideFormValues, tourGuideSchema } from '@/lib/validations/tour-guide';
import { useAlertStore } from '@/stores/use-alert-store';
import { useUserStore } from '@/stores/UserStore';

const draftKey = (id: string) => `guide_profile_draft_${id}`;

interface UseEditProfileFormOptions {
  open: boolean;
  guideId: string;
  onClose: () => void;
}

export function useEditProfileForm({ open, guideId, onClose }: UseEditProfileFormOptions) {
  const { t } = useTranslation(['guidePage', 'adminPage']);
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const { data: profile } = useTourGuideById({ variables: { id: guideId } });
  const { data: momentsData } = useTourGuideMoments({
    variables: { id: guideId, pageSize: 1 },
    enabled: open && !!guideId,
  });
  const momentsCount = momentsData?.pagination.total ?? 0;
  const userStore = useUserStore();
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<TourGuideFormValues>({
    resolver: zodResolver(tourGuideSchema),
    defaultValues: {
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
    },
  });

  useEffect(() => {
    if (open && profile) {
      form.reset({
        name: profile.name,
        avatar: profile.avatarUrl ?? null,
        coverImg: profile.coverUrl ?? null,
        quote: profile.slogan?.replace(/^"|"$/g, '') ?? null,
        summary: profile.title ?? null,
        description: profile.bio ?? null,
        expYear: profile.metrics.yearsOfExperience,
        languages: profile.metrics.languages,
        experts: profile.specialties.map((s) => s.label),
        careerPath: profile.careerTimeline.map((c) => {
          const match = c.description.match(/^(\d+)\s*tours?\s*·\s*(.+)/);
          const tourCount = match ? parseInt(match[1], 10) : 0;
          const desc = match ? match[2].trim() : c.description;

          const years = c.period.match(/\d+/g);
          const startYear = years && years[0] ? parseInt(years[0], 10) : new Date().getFullYear();
          const hasSecondYear = years && years[1];
          const endYear = hasSecondYear ? parseInt(years[1], 10) : null;

          return { company: c.companyName, role: c.role, startYear, endYear, tourCount, description: desc };
        }),
      });
      setHasDraft(!!localStorage.getItem(draftKey(guideId)));
    }
  }, [open, profile, guideId, form]);

  useEffect(() => {
    if (!open) return undefined;
    const subscription = form.watch(() => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      autoSaveRef.current = setTimeout(() => {
        try {
          localStorage.setItem(draftKey(guideId), JSON.stringify(form.getValues()));
        } catch {
          // ignore
        }
      }, 3000);
    });
    return () => {
      subscription.unsubscribe();
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [open, guideId, form]);

  const restoreDraft = () => {
    try {
      const raw = localStorage.getItem(draftKey(guideId));
      if (raw) form.reset(JSON.parse(raw) as TourGuideFormValues);
    } catch {
      // ignore
    }
    setHasDraft(false);
  };

  const discardDraft = () => {
    localStorage.removeItem(draftKey(guideId));
    setHasDraft(false);
  };

  const handleClose = () => {
    if (form.formState.isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    onClose();
  };

  const confirmDiscard = () => {
    localStorage.removeItem(draftKey(guideId));
    setShowDiscardConfirm(false);
    onClose();
  };

  const onSubmit = async (values: TourGuideFormValues) => {
    if (!profile) return;
    setSaving(true);

    try {
      const apiPayload: TourGuideFormPayload = {
        name: values.name,
        avatar: values.avatar ?? undefined,
        coverImg: values.coverImg ?? undefined,
        quote: values.quote ?? undefined,
        summary: values.summary ?? undefined,
        description: values.description ?? undefined,
        expYear: values.expYear,
        languages: values.languages,
        experts: values.experts,
        careerPath: values.careerPath.map(({ company, role, startYear, tourCount, description }) => ({
          company,
          role,
          startYear,
          tourCount,
          description,
        })),
      };

      await updateTourGuide(guideId, apiPayload);
      await queryClient.invalidateQueries({ queryKey: useTourGuideById.getKey({ id: guideId }) });

      if (userStore.user?.tourGuideId === guideId) {
        userStore.setStore({
          accessToken: userStore.accessToken,
          refreshToken: userStore.refreshToken,
          user: {
            ...userStore.user,
            firstName: values.name.split(' ')[0] || '',
            lastName: values.name.split(' ').slice(1).join(' ') || '',
          },
        });
      }

      localStorage.removeItem(draftKey(guideId));
      useAlertStore
        .getState()
        .addAlert({ type: 'success', title: t('updateSuccess', { ns: 'adminPage' }), duration: 3000 });
      onClose();
    } catch (err) {
      const apiError = err as { statusCode?: number };
      const title =
        apiError?.statusCode === 401
          ? t('errorUnauthorized', { ns: 'adminPage' })
          : t('genericError', { ns: 'adminPage' });
      useAlertStore.getState().addAlert({ type: 'error', title, duration: 3000 });
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    saving,
    hasDraft,
    showDiscardConfirm,
    setShowDiscardConfirm,
    cardId: profile?.cardId ?? '',
    momentsCount,
    restoreDraft,
    discardDraft,
    handleClose,
    confirmDiscard,
    onSubmit,
  };
}
