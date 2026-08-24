import { useAdminStore } from '@/stores/AdminStore';
import { useUserStore } from '@/stores/UserStore';

export const useAuth = () => {
  const accessToken = useUserStore.use.accessToken();
  const user = useUserStore.use.user();
  const adminAccessToken = useAdminStore.use.adminAccessToken();
  const adminUser = useAdminStore.use.adminUser();

  return {
    isLoggedIn: !!accessToken,
    isAdmin: !!adminAccessToken && adminUser?.role === 'admin',
    user,
    accessToken,
  };
};
