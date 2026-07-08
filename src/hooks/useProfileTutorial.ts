import { useState } from 'react';

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

export function useProfileTutorial(): UseProfileTutorialReturn {
  const [hasSeen, setHasSeen] = useState<boolean>(readStorage);

  const markAsSeen = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setHasSeen(true);
  };

  const resetTutorial = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasSeen(false);
  };

  return { hasSeen, markAsSeen, resetTutorial };
}
