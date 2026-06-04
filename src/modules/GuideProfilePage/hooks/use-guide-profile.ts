import { useEffect, useState } from 'react';

import type { GuideProfileData } from '../data/mock-guide';
import { MOCK_GUIDE } from '../data/mock-guide';

export function useGuideProfile(_id: string | undefined) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<GuideProfileData | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(MOCK_GUIDE);
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  return { data, isLoading };
}
