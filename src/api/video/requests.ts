import { request } from '../axios';
import type { ApiListResponse } from '../types';
import type {
  ApiAdminListResponse,
  ApiAdminVideoItem,
  ApiAdminVideoResponse,
  ApiVideoDetailResponse,
  ApiVideoItem,
  ApiVideoListResponse,
  CreateVideoPayload,
  IVideo,
  IVideoAdminPage,
  IVideoPage,
  IVideoPageAdmin,
  IVideoVariables,
  IVideoVariablesInfinite,
  UpdateVideoPayload,
} from './types';

// ---------- Mapper ----------

const toVideo = (item: ApiVideoItem): IVideo => ({
  id: item.id,
  slug: item.slug,
  title: item.name,
  link: item.url,
  shortUrl: item.shortUrl,
  embedUrl: item.embedUrl,
  thumbnail: item.thumbnail,
  description: item.description,
  likeCount: item.like,
  tag: item.tag ?? null,
  type: item.type ?? null,
  uploadingStatus: item.uploadingStatus ?? null,
  product: item.product ?? null,
});

// ---------- Defaults ----------

const DEFAULT_PAGE_SIZE = 6;

// ---------- Requests ----------

export interface GetListVideoResult {
  items: IVideo[];
  nextCursor: number | null;
}

export const getListVideoAdminPaged = async (variables?: {
  keyword?: string;
  page?: number;
  pageSize?: number;
}): Promise<IVideoPageAdmin> => {
  const { data } = await request<ApiAdminListResponse<ApiVideoItem>>({
    url: '/video/admin',
    method: 'GET',
    params: {
      page: variables?.page ?? 1,
      pageSize: variables?.pageSize ?? 10,
      ...(variables?.keyword && { keyword: variables.keyword }),
    },
  });
  return {
    items: data.data.items.map(toVideo),
    totalPages: data.data.pagination.totalPages,
  };
};

export const getVideoAdminPage = async (variables?: {
  keyword?: string;
  page?: number;
  pageSize?: number;
}): Promise<IVideoAdminPage> => {
  const { data } = await request<ApiAdminListResponse<ApiVideoItem>>({
    url: '/video/admin',
    method: 'GET',
    params: {
      page: variables?.page ?? 1,
      pageSize: variables?.pageSize ?? 20,
      ...(variables?.keyword && { keyword: variables.keyword }),
    },
  });
  const { items, pagination } = data.data;
  return {
    items: items.map(toVideo),
    nextPage: pagination.page < pagination.totalPages ? pagination.page + 1 : undefined,
  };
};

export const getListVideoAdmin = async (variables?: {
  keyword?: string;
  page?: number;
  pageSize?: number;
}): Promise<IVideo[]> => {
  const { data } = await request<ApiListResponse<ApiVideoItem>>({
    url: '/video/admin',
    method: 'GET',
    params: {
      page: variables?.page ?? 1,
      pageSize: variables?.pageSize ?? 50,
      ...(variables?.keyword && { keyword: variables.keyword }),
    },
  });
  return data.data.items.map(toVideo);
};

export const getListVideo = async (variables?: IVideoVariables): Promise<IVideo[]> => {
  const { data } = await request<ApiListResponse<ApiVideoItem>>({
    url: '/video',
    method: 'GET',
    params: {
      pageSize: variables?.pageSize ?? DEFAULT_PAGE_SIZE,
      ...(variables?.query && { query: variables.query }),
      ...(variables?.distanceScore !== undefined && { distanceScore: variables.distanceScore }),
    },
  });
  return data.data.items.map(toVideo);
};

export const getListVideoPaged = async (variables?: IVideoVariables): Promise<GetListVideoResult> => {
  const pageSize = variables?.pageSize ?? DEFAULT_PAGE_SIZE;
  const { data } = await request<ApiVideoListResponse>({
    url: '/video',
    method: 'GET',
    params: {
      pageSize,
      distanceScore: variables?.distanceScore ?? 0,
      ...(variables?.query && { query: variables.query }),
    },
  });
  const items = data.data.items.map(toVideo);
  return {
    items,
    nextCursor: items.length < pageSize ? null : data.data.stats.distanceScore ?? null,
  };
};

export const getVideoPage = async (variables?: IVideoVariablesInfinite): Promise<IVideoPage> => {
  const pageSize = variables?.pageSize ?? DEFAULT_PAGE_SIZE;
  const { data } = await request<ApiVideoListResponse>({
    url: '/video',
    method: 'GET',
    params: {
      pageSize,
      distanceScore: variables?.distanceScore ?? 0,
      ...(variables?.query && { query: variables.query }),
      ...(variables?.rootId && { rootId: variables.rootId }),
      ...(variables?.excludeIds?.length && { excludeIds: variables.excludeIds }),
    },
  });

  const items = data.data.items.map(toVideo);

  return {
    items,
    nextCursor: items.length < pageSize ? null : data.data.stats.distanceScore ?? null,
  };
};

export const getVideoBySlug = async (slug: string): Promise<IVideo> => {
  const { data } = await request<ApiVideoDetailResponse>({
    url: `/video/${slug}`,
    method: 'GET',
  });
  return toVideo(data.data);
};

// ---------- Like / Dislike ----------

export const likeVideo = async (id: string): Promise<void> => {
  await request({ url: `/video/${id}/like`, method: 'POST' });
};

export const dislikeVideo = async (id: string): Promise<void> => {
  await request({ url: `/video/${id}/dislike`, method: 'POST' });
};

export const getVideoById = async (id: string): Promise<IVideo> => {
  const { data } = await request<ApiVideoDetailResponse>({
    url: `/video/id/${id}`,
    method: 'GET',
  });
  return toVideo(data.data);
};

export const createVideo = async (payload: CreateVideoPayload): Promise<ApiAdminVideoItem> => {
  const { data } = await request<ApiAdminVideoResponse>({
    url: '/video',
    method: 'POST',
    data: payload,
  });
  return data.data;
};

export const updateVideo = async (id: string, payload: UpdateVideoPayload): Promise<ApiAdminVideoItem> => {
  const { data } = await request<ApiAdminVideoResponse>({
    url: `/video/${id}`,
    method: 'PUT',
    data: payload,
  });
  return data.data;
};
