import { request } from '../axios';
import type { ApiTourGuide, ApiTourGuideListResponse } from '../product/types';

export interface TourGuidePage {
  items: { id: string; name: string }[];
  nextPage: number | undefined;
}

export async function getTourGuidePage(page: number): Promise<TourGuidePage> {
  const { data } = await request.get<ApiTourGuideListResponse>('/tour-guide', {
    params: { page, pageSize: 49 },
  });
  const { items, pagination } = data.data;
  return {
    items: items.map((x: ApiTourGuide) => ({ id: x.id, name: x.name })),
    nextPage: pagination.page < pagination.totalPages ? pagination.page + 1 : undefined,
  };
}
