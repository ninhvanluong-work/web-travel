import { request } from '../axios';
import type { ApiTagCreateResponse, ApiTagItem, ApiTagListResponse } from '../product/types';

const toTagItem = (x: ApiTagItem) => ({ id: x.id, name: x.name });

export interface TagPage {
  items: { id: string; name: string }[];
  nextPage: number | undefined;
}

export async function getTagPage(page: number): Promise<TagPage> {
  const { data } = await request.get<ApiTagListResponse>('/tag', {
    params: { page, pageSize: 49 },
  });
  const { items, pagination } = data.data;
  return {
    items: items.map(toTagItem),
    nextPage: pagination.page < pagination.totalPages ? pagination.page + 1 : undefined,
  };
}

export async function createTag(name: string): Promise<{ id: string; name: string }> {
  const { data } = await request.post<ApiTagCreateResponse>('/tag', { name });
  return toTagItem(data.data);
}

export async function updateTag(id: string, name: string): Promise<{ id: string; name: string }> {
  const { data } = await request.patch<ApiTagCreateResponse>(`/tag/${id}`, { name });
  return toTagItem(data.data);
}

export async function deleteTag(id: string): Promise<void> {
  await request.delete(`/tag/${id}`);
}
