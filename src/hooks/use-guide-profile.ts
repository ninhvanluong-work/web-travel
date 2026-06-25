import { useTourGuideById } from '@/api/tour-guide/queries';

export function useGuideProfile(id: string | undefined) {
  const { data, isLoading, error } = useTourGuideById({
    variables: { id: id! },
    enabled: !!id,
  });

  return {
    data: data ?? null,
    isLoading,
    error,
  };
}
