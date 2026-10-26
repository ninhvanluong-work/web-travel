import { useAdminUserById } from '@/api/user/queries';

/** Resolves the cancelling admin's UUID to a name (falls back to email, then "—"). */
export function BookingCancelledBy({ userId }: { userId: string | null | undefined }) {
  const { data, isLoading } = useAdminUserById({
    variables: { id: userId ?? '' },
    enabled: !!userId,
    retry: false,
  });

  if (!userId) return <>—</>;
  if (isLoading) return <>…</>;
  return <>{data?.name || data?.email || '—'}</>;
}
