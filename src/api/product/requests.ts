import { request } from '../axios';
import type { ApiProductListResponse, IProductListParams, IProductListResult } from './types';

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
