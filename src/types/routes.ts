export const ROUTE = {
  HOME: '/',
  SEARCH: '/search',
  VIDEO_DETAIL: '/video/[slug]',
  PRODUCT: '/product',
  DASHBOARD: '/dashboard',
  ME: '/me',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  PROFILE: '/profile',
  SUPPORT: '/support',
  SUPPORT_NEW: '/support_new',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCTS_CREATE: '/admin/products/create',
  ADMIN_VIDEOS: '/admin/videos',
} as const;

export type ROUTE_KEY = keyof typeof ROUTE;

export const MAPPING_ROUTE_TITLE = {
  [ROUTE.DASHBOARD]: 'Course',
  [ROUTE.SUPPORT]: 'Support',
  [ROUTE.PROFILE]: 'Profile',
} as unknown as Record<ROUTE_KEY, string>;
