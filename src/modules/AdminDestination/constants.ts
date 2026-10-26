import { ROUTE } from '@/types';

export const DESTINATION_ROUTES = {
  LIST: ROUTE.ADMIN_DESTINATIONS,
  CREATE: ROUTE.ADMIN_DESTINATIONS_CREATE,
  EDIT: ROUTE.ADMIN_DESTINATIONS_EDIT,
} as const;

export const DESTINATION_NS = 'adminDestination';

export const DESTINATION_PAGE_SIZE = 10;

export const DESTINATION_FORM_ID = 'destination-form';
