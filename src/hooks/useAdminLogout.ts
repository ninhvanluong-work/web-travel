import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';

import { useLogoutMutation } from '@/api/auth';
import { useAdminStore } from '@/stores/AdminStore';
import { ROUTE } from '@/types';

export function useAdminLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logoutAdmin = useAdminStore.use.logoutAdmin();
  const { mutate, isLoading } = useLogoutMutation();

  const handleAdminLogout = () => {
    mutate(undefined, {
      onSettled: () => {
        logoutAdmin();
        queryClient.removeQueries({ queryKey: ['admin'] });
        router.push(ROUTE.ADMIN_LOGIN);
      },
    });
  };

  return { handleAdminLogout, isLoading };
}
