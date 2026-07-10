import { driver } from 'driver.js';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';

interface ProfileOnboardingProps {
  isReady: boolean;
  replayTrigger: number;
  hasSeen: boolean;
  markAsSeen: () => void;
}

export default function ProfileOnboarding({ isReady, replayTrigger, hasSeen, markAsSeen }: ProfileOnboardingProps) {
  const { t } = useTranslation('guidePage');

  useEffect(() => {
    if (!isReady || (hasSeen && replayTrigger === 0)) return undefined;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayOpacity: 0.65,
      nextBtnText: t('onboarding.nextBtnText'),
      prevBtnText: t('onboarding.prevBtnText'),
      doneBtnText: t('onboarding.doneBtnText'),
      onDestroyed: () => {
        markAsSeen();
      },
      steps: [
        {
          popover: {
            title: t('onboarding.stepWelcomeTitle'),
            description: t('onboarding.stepWelcomeDesc'),
          },
        },
        {
          element: '#tour-hero',
          popover: {
            title: t('onboarding.stepHeroTitle'),
            description: t('onboarding.stepHeroDesc'),
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-action-bar',
          popover: {
            title: t('onboarding.stepActionBarTitle'),
            description: t('onboarding.stepActionBarDesc'),
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-storytelling',
          popover: {
            title: t('onboarding.stepStorytellingTitle'),
            description: t('onboarding.stepStorytellingDesc'),
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-stats',
          popover: {
            title: t('onboarding.stepStatsTitle'),
            description: t('onboarding.stepStatsDesc'),
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#tour-moments',
          popover: {
            title: t('onboarding.stepMomentsTitle'),
            description: t('onboarding.stepMomentsDesc'),
            side: 'top',
            align: 'start',
          },
        },
        {
          popover: {
            title: t('onboarding.stepReadyTitle'),
            description: t('onboarding.stepReadyDesc'),
          },
        },
      ],
    });

    driverObj.drive();

    return () => driverObj.destroy();
    // hasSeen is intentionally excluded from deps: replay works via replayTrigger (> 0 bypasses the hasSeen guard).
    // Adding hasSeen here would cause the effect to re-run on every markAsSeen call and break the flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, replayTrigger, t]);

  return null;
}
