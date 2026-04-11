import type { ProductFormValues } from '@/lib/validations/product';

import { request } from '../axios';
import type { ApiProductDetail, ApiProductListResponse, IProductListParams, IProductListResult } from './types';

export async function getProductList(params: IProductListParams): Promise<IProductListResult> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );

  const { data } = await request.get<ApiProductListResponse>('/product', { params: cleanParams });

  const payload = data.data;
  return {
    items: (payload.items ?? []).map((item) => ({
      ...item,
      minPrice: Number(item.minPrice) || 0,
    })),
    pagination: payload.pagination,
  };
}

export async function getProductById(id: string): Promise<ApiProductDetail> {
  const { data } = await request.get<{ data: ApiProductDetail }>(`/product/${id}`);
  return data.data;
}

function toApiPayload(values: ProductFormValues) {
  return {
    name: values.name,
    slug: values.slug,
    description: values.description ?? undefined,
    thumbnail: values.thumbnail ?? undefined,
    images: (values.images ?? []).map((img) => img.url).filter(Boolean),
    itineraryImage: values.itineraryImage ?? undefined,
    duration: values.duration,
    durationType: values.durationType,
    highlight: values.highlight ?? undefined,
    include: values.include ?? undefined,
    exclude: values.exclude ?? undefined,
    status: values.status,
    minPrice: values.minPrice,
    destinationId: values.destinationId ?? undefined,
    supplierId: values.supplierId ?? undefined,
  };
}

export async function createProduct(values: ProductFormValues): Promise<ApiProductDetail> {
  const { data } = await request.post<{ data: ApiProductDetail }>('/product', toApiPayload(values));
  return data.data;
}

export async function updateProduct(id: string, values: ProductFormValues): Promise<ApiProductDetail> {
  const { data } = await request.patch<{ data: ApiProductDetail }>(`/product/${id}`, toApiPayload(values));
  return data.data;
}

export async function patchProductStatus(
  id: string,
  status: 'draft' | 'published' | 'hidden'
): Promise<ApiProductDetail> {
  const { data } = await request.patch<{ data: ApiProductDetail }>(`/product/${id}`, { status });
  return data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await request.delete(`/product/${id}`);
}
