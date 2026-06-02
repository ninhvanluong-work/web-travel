import { type ProductFormValues, READ_BEFORE_KEY_OPTIONS } from '@/lib/validations/product';

import { request } from '../axios';
import type {
  ApiProductDetail,
  ApiProductListResponse,
  ApiProductReviewListResponse,
  IProductListParams,
  IProductListResult,
  IProductReview,
  IProductReviewResult,
} from './types';

function toProductReview(item: {
  id: string;
  createdAt: string;
  comment: string;
  point: number;
  user?: { name?: string };
}): IProductReview {
  const d = new Date(item.createdAt);
  return {
    id: item.id,
    name: item.user?.name ?? '',
    comment: item.comment,
    point: item.point,
    date: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
  };
}

export async function getProductReviews(id: string, pageSize = 2): Promise<IProductReviewResult> {
  const { data } = await request.get<ApiProductReviewListResponse>(`/product/${id}/review`, {
    params: { page: 1, pageSize },
  });
  return {
    items: data.data.items.map(toProductReview),
    pagination: data.data.pagination,
  };
}

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
    description: values.description || undefined,
    shortDescription: values.shortDescription || undefined,
    thumbnail: values.thumbnail || undefined,
    images: (values.images ?? []).map((img) => img.url).filter(Boolean),
    itineraryImage: values.itineraryImage || undefined,
    highlight: values.highlight || undefined,
    include: values.include || undefined,
    exclude: values.exclude || undefined,
    status: values.status,
    minPrice: values.minPrice,
    destinationId: values.destinationId || undefined,
    supplierId: values.supplierId || undefined,
    heroVideoId: values.videoId || undefined,
    tagIds: values.tags?.length ? values.tags.map((t) => t.id) : undefined,
    tourGuideIds: values.tourGuideIds?.length ? values.tourGuideIds : undefined,
    experience: values.experiences?.length
      ? values.experiences.map((e) => ({ imageUrl: e.imageUrl ?? '', title: e.title, content: e.content ?? '' }))
      : undefined,
    readBefore: values.readBefores?.length
      ? values.readBefores
          .filter((r) => r.description?.trim())
          .map((r) => ({
            key: r.key,
            title: READ_BEFORE_KEY_OPTIONS.find((o) => o.value === r.key)?.label ?? r.key,
            description: r.description ?? '',
          }))
      : undefined,
    elementIds: values.elementIds?.length ? values.elementIds : undefined,
    banner: values.banner?.length ? values.banner : undefined,
    itineraries: values.itineraries?.length
      ? values.itineraries.map((it) => ({
          name: it.name,
          featuredName: it.featuredName || undefined,
          order: Number(it.order),
          description: it.description || '',
        }))
      : undefined,
  };
}

export async function createProduct(values: ProductFormValues): Promise<ApiProductDetail> {
  const { data } = await request.post<{ data: ApiProductDetail }>('/product', toApiPayload(values));
  return data.data;
}

export async function updateProduct(id: string, values: ProductFormValues): Promise<ApiProductDetail> {
  const { data } = await request.put<{ data: ApiProductDetail }>(`/product/${id}`, toApiPayload(values));
  return data.data;
}

export async function patchProductStatus(
  id: string,
  status: 'draft' | 'published' | 'hidden'
): Promise<ApiProductDetail> {
  const { data } = await request.patch<{ data: ApiProductDetail }>(`/product/${id}`, { status });
  return data.data;
}

export async function updateProductStatus(id: string, status: 'published' | 'hidden'): Promise<ApiProductDetail> {
  const { data } = await request.post<{ data: ApiProductDetail }>(`/product/${id}/status/${status}`);
  return data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await request.delete(`/product/${id}`);
}
