import type { ITourGuideProfile } from './types';

const storageKey = (id: string) => `guide_profile_${id}`;

export function mergeWithLocalStorage(id: string, profile: ITourGuideProfile): ITourGuideProfile {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return profile;
    const saved = JSON.parse(raw) as Partial<ITourGuideProfile>;
    // hasSeenOnboarding is DB-owned — always keep the API value, never let localStorage overwrite it
    return { ...profile, ...saved, hasSeenOnboarding: profile.hasSeenOnboarding };
  } catch {
    return profile;
  }
}

export function saveProfileToLocalStorage(id: string, partial: Partial<ITourGuideProfile>): void {
  try {
    localStorage.setItem(storageKey(id), JSON.stringify(partial));
  } catch {
    // ignore storage errors
  }
}
