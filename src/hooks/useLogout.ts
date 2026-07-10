import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/router';

import { useLogoutMutation } from '@/api/auth';
import { useUserStore } from '@/stores/UserStore';
import { ROUTE } from '@/types';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useUserStore.use.logout();
  const { mutate, isLoading } = useLogoutMutation();

  const handleLogout = () => {
    mutate(undefined, {
      onSettled: () => {
        logout();
        queryClient.clear();
        router.push(ROUTE.SIGN_IN);
      },
    });
  };

  return { handleLogout, isLoading };
}
