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
} as const;

export type ROUTE_KEY = keyof typeof ROUTE;
