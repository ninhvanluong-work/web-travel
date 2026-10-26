import { useMemo } from 'react';

import { useAdminStore } from '@/stores/AdminStore';

import type { Actor } from '../permissions';

/** The signed-in admin, as needed by the permission helpers. */
export function useAdminActor(): Actor {
  const adminUser = useAdminStore.use.adminUser();
  const id = adminUser?.id;
  const role = adminUser?.role;
  return useMemo(() => ({ id, role }), [id, role]);
}
