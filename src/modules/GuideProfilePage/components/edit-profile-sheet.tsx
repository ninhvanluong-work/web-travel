import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Info, Loader2, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFieldArray, useForm, useFormContext } from 'react-hook-form';

import { saveProfileToLocalStorage } from '@/api/tour-guide/mock-adapter';
import { useTourGuideById } from '@/api/tour-guide/queries';
import type { ITourGuideProfile } from '@/api/tour-guide/types';
import { FormControl, FormField, FormItem, FormLabel, FormMessage, FormWrapper } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { TextArea } from '@/components/ui/textarea';
import { type TourGuideFormValues, tourGuideSchema } from '@/lib/validations/tour-guide';
import { ExperienceImageUpload } from '@/modules/AdminProduct/ProductFormPage/components/shared/experience-image-upload';
import { ExpertsSection } from '@/modules/AdminTourGuide/GuideFormPage/components/sections/experts-section';
import { LanguageSelector } from '@/modules/AdminTourGuide/GuideFormPage/components/sections/language-selector';
import { useAlertStore } from '@/stores/use-alert-store';
import { useUserStore } from '@/stores/UserStore';

// ── Constants ──────────────────────────────────────────────────────────────

const SPECIALTY_PALETTE = [
  { bg: '#EEEDFE', text: '#3C3489' },
  { bg: '#FAECE7', text: '#712B13' },
  { bg: '#E1F5EE', text: '#085041' },
  { bg: '#FAEEDA', text: '#633806' },
  { bg: '#FBEAF0', text: '#72243E' },
] as const;

const draftKey = (id: string) => `guide_profile_draft_${id}`;

// ── Mobile Career Section (Up/Down buttons, no drag) ───────────────────────

function MobileCareerSection() {
  const form = useFormContext<TourGuideFormValues>();
  const { t } = useTranslation('adminPage');
  const { fields, append, remove, replace } = useFieldArray({ control: form.control, name: 'careerPath' });

  const move = useCallback(
    (from: number, to: number) => {
      if (to < 0 || to >= fields.length) return;
      const reordered = [...fields];
      const [item] = reordered.splice(from, 1);
      reordered.splice(to, 0, item);
      replace(
        reordered.map(({ role, company, startYear, tourCount, description }) => ({
          role,
          company,
          startYear,
          tourCount,
          description,
        }))
      );
    },
    [fields, replace]
  );

  return (
    <div className="space-y-3">
      {fields.length === 0 && (
        <div className="py-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/20">
          <p className="text-xs text-slate-400 italic">{t('noCareerEntries')}</p>
        </div>
      )}

      {fields.map((field, index) => (
        <div key={field.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t('careerPosition', { index: index + 1 })}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
                className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={index === fields.length - 1}
                className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30"
              >
                <ChevronDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => remove(index)}
                className="p-1 rounded text-slate-400 hover:text-rose-600"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <FormField
              control={form.control}
              name={`careerPath.${index}.role`}
              render={({ field: f }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="admin-form-label">{t('roleLabel')}</FormLabel>
                  <FormControl>
                    <Input size="sm" fullWidth placeholder={t('rolePlaceholder')} {...f} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`careerPath.${index}.company`}
              render={({ field: f }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="admin-form-label">{t('companyLabel')}</FormLabel>
                  <FormControl>
                    <Input size="sm" fullWidth placeholder={t('companyPlaceholder')} {...f} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`careerPath.${index}.startYear`}
              render={({ field: f }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="admin-form-label">{t('startYearLabel')}</FormLabel>
                  <FormControl>
                    <Input size="sm" fullWidth type="number" placeholder={String(new Date().getFullYear())} {...f} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`careerPath.${index}.tourCount`}
              render={({ field: f }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="admin-form-label">{t('tourCountLabel')}</FormLabel>
                  <FormControl>
                    <Input size="sm" fullWidth type="number" placeholder="0" {...f} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name={`careerPath.${index}.description`}
              render={({ field: f }) => (
                <FormItem className="col-span-2 space-y-1">
                  <FormLabel className="admin-form-label">{t('shortDescLabel')}</FormLabel>
                  <FormControl>
                    <Input size="sm" fullWidth placeholder={t('shortDescPlaceholder')} {...f} value={f.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={() =>
          append({ role: '', company: '', startYear: new Date().getFullYear(), tourCount: 0, description: '' })
        }
        className="w-full h-9 border border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-500 hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-1"
      >
        <Plus size={13} />
        {t('addCareerEntry')}
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────

interface EditProfileSheetProps {
  open: boolean;
  onClose: () => void;
  guideId: string;
  guideName: string;
}

export default function EditProfileSheet({ open, onClose, guideId, guideName }: EditProfileSheetProps) {
  const { t } = useTranslation(['guidePage', 'adminPage']);
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const { data: profile } = useTourGuideById({ variables: { id: guideId } });
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

  // Initialize form when profile loads or sheet opens
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
          const startYear = parseInt(c.period.split(/[–-]/)[0].trim(), 10) || new Date().getFullYear();
          return { company: c.companyName, role: c.role, startYear, tourCount, description: desc };
        }),
      });
      setHasDraft(!!sessionStorage.getItem(draftKey(guideId)));
    }
  }, [open, profile, guideId, form]);

  // Auto-save draft to sessionStorage every 3s on change
  useEffect(() => {
    if (!open) return undefined;
    const subscription = form.watch(() => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
      autoSaveRef.current = setTimeout(() => {
        try {
          sessionStorage.setItem(draftKey(guideId), JSON.stringify(form.getValues()));
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
      const raw = sessionStorage.getItem(draftKey(guideId));
      if (raw) form.reset(JSON.parse(raw) as TourGuideFormValues);
    } catch {
      // ignore
    }
    setHasDraft(false);
  };

  const discardDraft = () => {
    sessionStorage.removeItem(draftKey(guideId));
    setHasDraft(false);
  };

  const handleClose = () => {
    onClose();
  };

  const onSubmit = async (values: TourGuideFormValues) => {
    if (!profile) return;
    setSaving(true);

    try {
      const patch: Partial<ITourGuideProfile> = {
        name: values.name,
        avatarUrl: values.avatar ?? undefined,
        coverUrl: values.coverImg ?? undefined,
        title: values.summary ?? '',
        slogan: values.quote ? `"${values.quote}"` : '',
        bio: values.description ?? '',
        metrics: {
          toursLed: profile.metrics.toursLed,
          yearsOfExperience: values.expYear,
          languages: values.languages,
        },
        specialties: values.experts.map((label, i) => ({
          label,
          bg: SPECIALTY_PALETTE[i % SPECIALTY_PALETTE.length].bg,
          text: SPECIALTY_PALETTE[i % SPECIALTY_PALETTE.length].text,
        })),
        careerTimeline: values.careerPath.map((item, index) => ({
          id: `career-${index}`,
          companyName: item.company,
          role: item.role,
          period: index === 0 ? `${item.startYear} – nay` : `${item.startYear}`,
          description: `${item.tourCount} tours · ${item.description}`,
          isCurrent: index === 0,
        })),
      };

      // Optimistic update
      queryClient.setQueryData(useTourGuideById.getKey({ id: guideId }), (old: ITourGuideProfile | undefined) =>
        old ? { ...old, ...patch } : old
      );

      // Persist to localStorage
      saveProfileToLocalStorage(guideId, patch);

      // Update UserStore name if this is the logged-in guide
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

      sessionStorage.removeItem(draftKey(guideId));
      useAlertStore.getState().addAlert({ type: 'success', title: t('updateSuccess', { ns: 'adminPage' }) });
      handleClose();
    } catch {
      useAlertStore.getState().addAlert({ type: 'error', title: t('genericError', { ns: 'adminPage' }) });
    } finally {
      setSaving(false);
    }
  };

  const cardId = profile?.cardId ?? '';

  return (
    <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl p-0 flex flex-col max-h-[85vh] bg-slate-50 border-t border-slate-200"
        style={{
          left: 'max(0px, calc(50% - 215px))',
          right: 'max(0px, calc(50% - 215px))',
        }}
      >
        {/* Drag handle */}
        <div className="relative h-8 flex items-center justify-center shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Header */}
        <div className="px-5 pb-3 shrink-0">
          <SheetTitle className="text-[16px] font-bold text-neutral-black leading-snug">
            {t('editProfile', { ns: 'guidePage' })}
          </SheetTitle>
          <p className="text-[12px] text-slate-400 mt-0.5">
            {cardId} · {guideName}
          </p>
        </div>

        {/* Draft recovery banner */}
        {hasDraft && (
          <div className="mx-5 mb-2 rounded-xl border border-blue-200 bg-blue-50 p-3 flex items-start gap-2 shrink-0">
            <Info size={15} className="text-blue-500 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-[12px] font-semibold text-slate-700">
                {t('editProfileSheet.draftRecoveryTitle', { ns: 'guidePage' })}
              </p>
              <div className="flex gap-3 mt-1.5">
                <button onClick={restoreDraft} className="text-[12px] font-semibold text-blue-600 underline">
                  {t('editProfileSheet.draftRestore', { ns: 'guidePage' })}
                </button>
                <button onClick={discardDraft} className="text-[12px] text-slate-400">
                  {t('editProfileSheet.draftDiscard', { ns: 'guidePage' })}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Form body */}
        <FormWrapper form={form} onSubmit={onSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto overscroll-contain min-h-0 px-5 pb-4">
            <div className="space-y-4 pb-2">
              {/* Card 1: My Profile */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-3 shadow-sm">
                <h3 className="text-xs font-bold text-brand-500 uppercase tracking-wider">
                  {t('basicInfo', { ns: 'adminPage' })}
                </h3>

                {/* Avatar + Cover */}
                <div className="flex gap-4 items-start">
                  <FormField
                    control={form.control}
                    name="avatar"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 shrink-0">
                        <FormLabel className="admin-form-label">{t('avatarLabel', { ns: 'adminPage' })}</FormLabel>
                        <FormControl>
                          <ExperienceImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            aspectRatio="w-20 h-20"
                            shape="circle"
                            hideUrlInput={true}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="coverImg"
                    render={({ field }) => (
                      <FormItem className="flex-1 space-y-1.5">
                        <FormLabel className="admin-form-label">{t('coverImgLabel', { ns: 'adminPage' })}</FormLabel>
                        <FormControl>
                          <ExperienceImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            aspectRatio="w-full aspect-[21/9] max-h-[80px]"
                            hideUrlInput={true}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Name — full width */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="admin-form-label">
                        {t('guideName', { ns: 'adminPage' })} <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          size="sm"
                          fullWidth
                          placeholder={t('guideNamePlaceholder', { ns: 'adminPage' })}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Title — full width */}
                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="admin-form-label">Title</FormLabel>
                      <FormControl>
                        <Input
                          size="sm"
                          fullWidth
                          placeholder={t('guideSummaryPlaceholder', { ns: 'adminPage' })}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Slogan — full width */}
                <FormField
                  control={form.control}
                  name="quote"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="admin-form-label">Slogan</FormLabel>
                      <FormControl>
                        <Input
                          size="sm"
                          fullWidth
                          placeholder={t('guideQuotePlaceholder', { ns: 'adminPage' })}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* ExpYear — half width */}
                <div className="w-1/2 pr-1.5">
                  <FormField
                    control={form.control}
                    name="expYear"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="admin-form-label">{t('yearsOfExpLabel', { ns: 'adminPage' })}</FormLabel>
                        <FormControl>
                          <Input
                            size="sm"
                            fullWidth
                            inputMode="numeric"
                            placeholder="0"
                            value={field.value === 0 ? '' : String(field.value)}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^0-9]/g, '');
                              field.onChange(raw === '' ? 0 : Number(raw));
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Languages — full width (9 flag toggles need room) */}
                <LanguageSelector />

                {/* Bio — full width */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="admin-form-label">{t('aboutMe', { ns: 'adminPage' })}</FormLabel>
                      <FormControl>
                        <TextArea
                          placeholder={t('aboutMePlaceholder', { ns: 'adminPage' })}
                          className="min-h-[80px] resize-none bg-slate-50/20 border-slate-200 focus-visible:bg-white transition-colors rounded-xl shadow-theme-xs text-[13px]"
                          rows={3}
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Card 2: Expertise */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold text-brand-500 uppercase tracking-wider">
                  {t('expertise', { ns: 'adminPage' })}
                </h3>
                <ExpertsSection />
              </div>

              {/* Card 3: Career Timeline */}
              <div className="bg-white rounded-2xl border border-slate-100 p-4 space-y-4 shadow-sm">
                <h3 className="text-xs font-bold text-brand-500 uppercase tracking-wider">
                  {t('career', { ns: 'adminPage' })}
                </h3>
                <MobileCareerSection />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-slate-200 bg-white flex gap-3 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              disabled={saving}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-[14px] font-semibold hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50"
            >
              {t('cancel', { ns: 'adminPage' })}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-3 rounded-xl bg-neutral-black text-white text-[14px] font-semibold hover:bg-neutral-black/90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  {t('saving', { ns: 'adminPage' })}
                </>
              ) : (
                t('saveChanges', { ns: 'adminPage' })
              )}
            </button>
          </div>
        </FormWrapper>
      </SheetContent>
    </Sheet>
  );
}
