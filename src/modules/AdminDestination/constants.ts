import { ROUTE } from '@/types';

export const DESTINATION_ROUTES = {
  LIST: ROUTE.ADMIN_DESTINATIONS,
  CREATE: ROUTE.ADMIN_DESTINATIONS_CREATE,
  EDIT: ROUTE.ADMIN_DESTINATIONS_EDIT,
} as const;

export const DESTINATION_NS = 'adminDestination';

export const DESTINATION_PAGE_SIZE = 10;

export const DESTINATION_FORM_ID = 'destination-form';

// Same AlertDialog button styling as AdminTourGuide / AdminSupplier dialogs
export const DIALOG_CANCEL_CLASS =
  'mt-0 h-10 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-800 transition-all font-semibold text-sm active:scale-95 dark:border-gray-800 dark:bg-transparent dark:text-gray-300 dark:hover:bg-gray-800 shrink-0';

export const DIALOG_DANGER_CLASS =
  'h-10 px-5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 hover:text-white transition-all font-semibold text-sm shadow-sm active:scale-95 active:bg-rose-700 border-0 shrink-0 inline-flex items-center gap-1.5 disabled:opacity-60';
