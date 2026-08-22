import { useUserStore } from '@/stores/UserStore';

export const useAuth = () => {
  const accessToken = useUserStore.use.accessToken();
  const user = useUserStore.use.user();

  return {
    isLoggedIn: !!accessToken,
    isAdmin: user?.role === 'admin',
    user,
    accessToken,
  };
};
