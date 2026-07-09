import { useCallback } from 'react';

import { useMarkOnboardingComplete } from '@/api/tour-guide/queries';

const STORAGE_KEY = 'profile_tutorial_seen';

function readStorage(): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(STORAGE_KEY) === 'true';
}

export interface UseProfileTutorialReturn {
  hasSeen: boolean;
  markAsSeen: () => void;
  resetTutorial: () => void;
}

export function useProfileTutorial(apiHasSeen?: boolean): UseProfileTutorialReturn {
  const { mutate: markOnboarding } = useMarkOnboardingComplete();

  // API value takes precedence; localStorage serves as local cache / fallback.
  // readStorage() returns true on the server (SSR guard in the function), so hasSeen is always true
  // server-side. This is safe because hasSeen is only consumed inside useEffect (ProfileOnboarding),
  // never rendered to the DOM, so there is no hydration mismatch.
  const hasSeen = apiHasSeen === true || readStorage();

  const markAsSeen = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true');
    markOnboarding(undefined, {
      onError: () => {
        // localStorage already set — user won't see tutorial again on this device.
        // Cross-device sync will fail silently until the next successful call.
        console.error('[onboarding] failed to persist to DB');
      },
    });
  }, [markOnboarding]);

  const resetTutorial = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { hasSeen, markAsSeen, resetTutorial };
}
