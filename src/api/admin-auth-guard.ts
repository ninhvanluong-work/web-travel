import Router from 'next/router';

import { useAdminStore } from '@/stores/AdminStore';
import { ROUTE } from '@/types';

export class AdminAuthRequiredError extends Error {
  constructor() {
    super('Admin authentication required');
    this.name = 'AdminAuthRequiredError';
  }
}

/**
 * Proactively guard admin mutation requests: require an adminAccessToken before
 * hitting the network, mirroring the Client-side pattern of checking accessToken
 * before allowing an action instead of waiting for a reactive 401.
 */
export function ensureAdminAuth(): void {
  const { adminAccessToken, logoutAdmin } = useAdminStore.getState();
  if (!adminAccessToken) {
    logoutAdmin();
    Router.replace(ROUTE.ADMIN_LOGIN);
    throw new AdminAuthRequiredError();
  }
}
