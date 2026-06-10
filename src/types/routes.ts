export const ROUTE = {
  HOME: '/',
  SEARCH: '/search',
  VIDEO_DETAIL: '/video/[slug]',
  VIDEO_DETAIL_PATH: (slug: string) => `/video/${slug}`,
  PRODUCT: '/product/[id]',
  PRODUCT_DETAIL: (id: string) => `/product/${id}`,
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_PRODUCTS_CREATE: '/admin/products/create',
  ADMIN_PRODUCTS_EDIT: (id: string) => `/admin/products/${id}/edit`,
  ADMIN_VIDEOS: '/admin/videos',
  GUIDE_PROFILE: '/guide/[id]',
  GUIDE_PROFILE_PATH: (id: string) => `/guide/${id}`,
  ADMIN_GUIDES: '/admin/guides',
  ADMIN_GUIDES_CREATE: '/admin/guides/create',
  ADMIN_GUIDES_EDIT: (id: string) => `/admin/guides/${id}/edit`,
} as const;

export type ROUTE_KEY = keyof typeof ROUTE;

export const API_ROUTE = {
  UPLOAD_VIDEO: '/upload/video',
  REVIEW_TOUR_GUIDE: (guideId: string) => `/review/tour-guide/${guideId}`,
} as const;
