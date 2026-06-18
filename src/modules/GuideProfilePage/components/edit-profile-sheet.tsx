import { Info, Loader2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FormWrapper } from '@/components/ui/form';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { ExpertsSection } from '@/modules/AdminTourGuide/GuideFormPage/components/sections/experts-section';

import { useEditProfileForm } from '../hooks/use-edit-profile-form';
import { MobileCareerSection } from './edit-profile-career-section';
import { EditProfilePersonalFields } from './edit-profile-personal-fields';
import { EditProfileTabBar } from './edit-profile-tab-bar';

interface EditProfileSheetProps {
  open: boolean;
  onClose: () => void;
  guideId: string;
  guideName: string;
  onOpenManageMoments?: () => void;
}

export default function EditProfileSheet({
  open,
  onClose,
  guideId,
  guideName,
  onOpenManageMoments,
}: EditProfileSheetProps) {
  const { t } = useTranslation(['guidePage', 'adminPage']);
  const [activeTab, setActiveTab] = useState('profile');

  const {
    form,
    saving,
    hasDraft,
    showDiscardConfirm,
    setShowDiscardConfirm,
    cardId,
    restoreDraft,
    discardDraft,
    handleClose,
    confirmDiscard,
    onSubmit,
  } = useEditProfileForm({ open, guideId, onClose });

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && handleClose()}>
        <SheetContent
          side="bottom"
          className="rounded-t-3xl p-0 flex flex-col max-h-[85vh] bg-[#F8FAFC] border-t border-slate-200/80 shadow-2xl transition-all duration-300"
          style={{
            left: 'max(0px, calc(50% - 215px))',
            right: 'max(0px, calc(50% - 215px))',
          }}
        >
          {/* Drag handle */}
          <div className="relative h-6 flex items-center justify-center shrink-0">
            <div className="w-12 h-1.5 rounded-full bg-slate-200" />
          </div>

          {/* Header */}
          <div className="sticky top-0 z-10 px-6 pb-2 shrink-0 bg-[#F8FAFC]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 bg-[#F8FAFC]">
              <div>
                <SheetTitle className="text-[15px] font-semibold text-neutral-black leading-snug">
                  {t('editProfileSheet.title', { ns: 'guidePage' })}
                </SheetTitle>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                  {cardId} · {guideName}
                </p>
              </div>
            </div>
          </div>

          {/* Draft recovery banner */}
          {hasDraft && (
            <div className="mx-6 mt-2 rounded-2xl border border-blue-100 bg-blue-50/50 p-3.5 flex items-start gap-2.5 shrink-0 shadow-theme-xs">
              <Info size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-[12px] font-bold text-slate-700 leading-normal">
                  {t('editProfileSheet.draftRecoveryTitle', { ns: 'guidePage' })}
                </p>
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={restoreDraft}
                    className="text-[12px] font-bold text-brand-500 hover:text-brand-600 transition-colors"
                  >
                    {t('editProfileSheet.draftRestore', { ns: 'guidePage' })}
                  </button>
                  <button
                    onClick={discardDraft}
                    className="text-[12px] font-semibold text-slate-400 hover:text-slate-500 transition-colors"
                  >
                    {t('editProfileSheet.draftDiscard', { ns: 'guidePage' })}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Form body with Tabs */}
          <FormWrapper form={form} onSubmit={onSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex-1 flex flex-col overflow-hidden min-h-0"
            >
              <EditProfileTabBar activeTab={activeTab} onTabChange={setActiveTab} form={form} />

              <TabsContent
                value="profile"
                className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain scrollbar-hide min-h-0 mt-0"
              >
                <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <EditProfilePersonalFields />
                </div>
              </TabsContent>

              <TabsContent
                value="expertise"
                className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain scrollbar-hide min-h-0 mt-0"
              >
                <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <ExpertsSection />
                </div>
              </TabsContent>

              <TabsContent
                value="career"
                className="flex-1 overflow-y-auto px-6 py-4 overscroll-contain scrollbar-hide min-h-0 mt-0 space-y-4"
              >
                <div className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <MobileCareerSection />
                </div>

                {onOpenManageMoments && (
                  <button
                    type="button"
                    onClick={onOpenManageMoments}
                    className="w-full bg-white rounded-3xl border border-slate-100 p-5 shadow-[0_8px_30px_rgb(0,0,0,0.02)] flex items-center justify-between text-left hover:bg-slate-50/60 transition-colors active:scale-[0.99] mb-4"
                  >
                    <div>
                      <p
                        className="text-[10px] font-semibold text-brand-500 uppercase border-l-2 border-brand-500 pl-2 mb-1"
                        style={{ letterSpacing: '0.5px' }}
                      >
                        {t('editProfileSheet.momentsCardTitle', { ns: 'guidePage' })}
                      </p>
                      <p className="text-[12px] font-semibold text-slate-700 pl-2">
                        {t('editProfileSheet.momentsCardLink', { ns: 'guidePage', count: 0 })}
                      </p>
                    </div>
                    <span className="text-slate-400 text-[18px] shrink-0 ml-3">›</span>
                  </button>
                )}
              </TabsContent>
            </Tabs>

            {/* Footer */}
            <div className="sticky bottom-0 z-10 px-6 py-4.5 border-t border-slate-100 bg-white/90 backdrop-blur-md flex gap-3 shrink-0 shadow-[0_-8px_30px_rgb(0,0,0,0.02)]">
              <button
                type="button"
                onClick={handleClose}
                disabled={saving}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-bold hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {t('cancel', { ns: 'adminPage' })}
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-neutral-black text-white text-[13px] font-bold hover:bg-neutral-black/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    {t('saving', { ns: 'adminPage' })}
                  </>
                ) : (
                  t('editProfileSheet.saveChanges', { ns: 'guidePage' })
                )}
              </button>
            </div>
          </FormWrapper>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('editProfileSheet.discardChangesTitle', { ns: 'guidePage' })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('editProfileSheet.discardChangesDesc', { ns: 'guidePage' })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel', { ns: 'adminPage' })}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDiscard}>
              {t('editProfileSheet.discardConfirm', { ns: 'guidePage' })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
