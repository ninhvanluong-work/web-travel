import { Briefcase, Sparkles, User } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

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
import { useScrollSpy } from '@/hooks/use-scroll-spy';
import type { TourGuideFormValues } from '@/lib/validations/tour-guide';

import { GuideFormHeader } from './components/guide-form-header';
import { BasicInfoSection } from './components/sections/basic-info-section';
import { CareerSection } from './components/sections/career-section';
import { ExpertsSection } from './components/sections/experts-section';
import { useGuideForm } from './hooks/use-guide-form';

interface GuideFormPageProps {
  guideId?: string;
}

const NAV_SECTIONS = [
  { id: 'section-basic', label: 'Thông tin cơ bản', icon: User, description: 'Thông tin cơ bản hiển thị trên profile' },
  { id: 'section-experts', label: 'Chuyên môn', icon: Sparkles, description: 'Lĩnh vực chuyên môn nổi bật' },
  {
    id: 'section-career',
    label: 'Sự nghiệp',
    icon: Briefcase,
    description: 'Hành trình sự nghiệp — mới nhất đến cũ nhất',
  },
];

const SECTION_IDS = NAV_SECTIONS.map((s) => s.id);

const SECTION_ERROR_FIELDS: Record<string, (keyof TourGuideFormValues)[]> = {
  'section-basic': ['name', 'summary', 'quote', 'description', 'expYear', 'languages', 'avatar', 'coverImg'],
  'section-experts': ['experts'],
  'section-career': ['careerPath'],
};

function SectionCard({
  id,
  label,
  description,
  children,
}: {
  id: string;
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-20 bg-white rounded-2xl border border-slate-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <div className="border-b border-slate-100 dark:border-gray-800 px-5 py-4 rounded-t-2xl">
        <h2 className="text-base font-bold text-slate-800 dark:text-white/90 tracking-tight">{label}</h2>
        {description && <p className="text-[12px] text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="px-5 pt-5 pb-5">{children}</div>
    </div>
  );
}

export default function GuideFormPage({ guideId }: GuideFormPageProps) {
  const router = useRouter();
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const bypassGuardRef = useRef(false);

  const { form, isEdit, onSubmit, isPending } = useGuideForm(guideId, () => {
    bypassGuardRef.current = true;
  });
  const activeSection = useScrollSpy(SECTION_IDS);
  const { isDirty, errors } = form.formState;

  // Native browser unload warning
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  // Next.js router navigation guard
  useEffect(() => {
    const handleRouteChange = (url: string, { shallow }: { shallow: boolean } = { shallow: false }) => {
      if (isDirty && !bypassGuardRef.current) {
        setPendingPath(url);
        router.events.emit('routeChangeError', 'routeChange aborted', url, { shallow });
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw 'routeChange aborted';
      }
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => router.events.off('routeChangeStart', handleRouteChange);
  }, [isDirty, router]);

  const sectionHasError = (id: string) => (SECTION_ERROR_FIELDS[id] ?? []).some((f) => !!errors[f]);

  const handleSave = form.handleSubmit(onSubmit);

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-900">
      <GuideFormHeader isEdit={isEdit} guideId={guideId} isPending={isPending} isDirty={isDirty} onSave={handleSave} />

      <div className="flex-1">
        <FormWrapper form={form} onSubmit={onSubmit}>
          <div className="flex gap-8 items-start w-full">
            {/* Scroll-spy nav */}
            <div className="hidden lg:flex flex-col gap-0.5 sticky top-[130px] w-40 shrink-0 pt-4">
              {NAV_SECTIONS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left transition-colors ${
                    activeSection === id
                      ? 'bg-brand-50 text-brand-600'
                      : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon size={13} className="shrink-0" />
                  <span className="flex-1 text-left">{label}</span>
                  {sectionHasError(id) && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0 py-4 space-y-4">
              {NAV_SECTIONS.map(({ id, label, description }) => (
                <SectionCard key={id} id={id} label={label} description={description}>
                  {id === 'section-basic' && <BasicInfoSection />}
                  {id === 'section-experts' && <ExpertsSection />}
                  {id === 'section-career' && <CareerSection />}
                </SectionCard>
              ))}
            </div>
          </div>
        </FormWrapper>
      </div>

      {/* Unsaved changes dialog */}
      <AlertDialog
        open={!!pendingPath}
        onOpenChange={(open) => {
          if (!open) setPendingPath(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl border-slate-100 shadow-2xl max-w-md dark:border-gray-800/80">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-800 dark:text-white/90 font-bold">
              Có thay đổi chưa lưu
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-gray-400">
              Bạn có thay đổi chưa lưu. Rời trang sẽ mất toàn bộ dữ liệu đã nhập.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-3 sm:space-x-0 mt-2">
            <AlertDialogCancel
              className="mt-0 h-10 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-800 transition-all font-semibold text-sm active:scale-95 dark:border-gray-800 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800 shrink-0"
              onClick={() => setPendingPath(null)}
            >
              Ở lại
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-10 px-5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 hover:text-white transition-all font-semibold text-sm shadow-sm active:scale-95 active:bg-rose-700 border-0 shrink-0"
              onClick={() => {
                if (pendingPath) {
                  bypassGuardRef.current = true;
                  setPendingPath(null);
                  router.push(pendingPath);
                }
              }}
            >
              Rời trang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
