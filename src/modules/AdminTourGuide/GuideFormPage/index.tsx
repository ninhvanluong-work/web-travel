import { AlignLeft, BarChart2, Briefcase, Sparkles, User } from 'lucide-react';

import { FormWrapper } from '@/components/ui/form';
import { useScrollSpy } from '@/hooks/use-scroll-spy';

import { GuideFormHeader } from './components/guide-form-header';
import { BasicInfoSection } from './components/sections/basic-info-section';
import { BioSection } from './components/sections/bio-section';
import { CareerSection } from './components/sections/career-section';
import { ExpertsSection } from './components/sections/experts-section';
import { MetricsSection } from './components/sections/metrics-section';
import { useGuideForm } from './hooks/use-guide-form';

interface GuideFormPageProps {
  guideId?: string;
}

const NAV_SECTIONS = [
  { id: 'section-basic', label: 'Basic Info', icon: User },
  { id: 'section-bio', label: 'Bio', icon: AlignLeft },
  { id: 'section-metrics', label: 'Metrics', icon: BarChart2 },
  { id: 'section-experts', label: 'Specialties', icon: Sparkles },
  { id: 'section-career', label: 'Career', icon: Briefcase },
];

const SECTION_IDS = NAV_SECTIONS.map((s) => s.id);

function SectionCard({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div
      id={id}
      className="scroll-mt-20 bg-white rounded-2xl border border-slate-200 shadow-theme-xs dark:border-gray-800 dark:bg-white/[0.03]"
    >
      <div className="border-b border-slate-100 dark:border-gray-800 px-5 py-4 rounded-t-2xl">
        <h2 className="text-base font-bold text-slate-800 dark:text-white/90 tracking-tight">{label}</h2>
      </div>
      <div className="px-5 pt-5 pb-5">{children}</div>
    </div>
  );
}

export default function GuideFormPage({ guideId }: GuideFormPageProps) {
  const { form, isEdit, onSubmit, isPending } = useGuideForm(guideId);
  const activeSection = useScrollSpy(SECTION_IDS);

  const handleSave = form.handleSubmit(onSubmit);

  return (
    <div className="flex flex-col min-h-full bg-gray-50 dark:bg-gray-900">
      <GuideFormHeader isEdit={isEdit} guideId={guideId} isPending={isPending} onSave={handleSave} />

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
                </button>
              ))}
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0 py-4 space-y-4">
              <SectionCard id="section-basic" label="Basic Info">
                <BasicInfoSection />
              </SectionCard>
              <SectionCard id="section-bio" label="Bio">
                <BioSection />
              </SectionCard>
              <SectionCard id="section-metrics" label="Metrics">
                <MetricsSection />
              </SectionCard>
              <SectionCard id="section-experts" label="Specialties">
                <ExpertsSection />
              </SectionCard>
              <SectionCard id="section-career" label="Career">
                <CareerSection />
              </SectionCard>
            </div>
          </div>
        </FormWrapper>
      </div>
    </div>
  );
}
