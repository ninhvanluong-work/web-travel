import { createMutation, createQuery } from 'react-query-kit';

import type { ProductFormValues } from '@/lib/validations/product';

import {
  createProduct,
  deleteProduct,
  getProductById,
  getProductList,
  patchProductStatus,
  updateProduct,
} from './requests';
import type { ApiProductDetail, IProductListParams, IProductListResult } from './types';

export const useProductList = createQuery<IProductListResult, IProductListParams>({
  primaryKey: '/product',
  queryFn: ({ queryKey: [, variables] }) => getProductList(variables ?? {}),
});

export const useProductById = createQuery<ApiProductDetail, { id: string }>({
  primaryKey: '/product/detail',
  queryFn: ({ queryKey: [, { id }] }) => getProductById(id),
});

export const useCreateProduct = createMutation<ApiProductDetail, ProductFormValues>({
  mutationFn: (values) => createProduct(values),
});

export const useUpdateProduct = createMutation<ApiProductDetail, { id: string; values: ProductFormValues }>({
  mutationFn: ({ id, values }) => updateProduct(id, values),
});

export const usePatchProductStatus = createMutation<
  ApiProductDetail,
  { id: string; status: 'draft' | 'published' | 'hidden' }
>({
  mutationFn: ({ id, status }) => patchProductStatus(id, status),
});

export const useDeleteProduct = createMutation<void, { id: string }>({
  mutationFn: ({ id }) => deleteProduct(id),
});
