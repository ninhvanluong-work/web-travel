import { request } from '../axios';
import type { ApiListResponse } from '../types';
import type {
  ApiVideoItem,
  ApiVideoListResponse,
  IVideo,
  IVideoPage,
  IVideoVariables,
  IVideoVariablesInfinite,
} from './types';

// ---------- Mapper ----------

const toVideo = (item: ApiVideoItem): IVideo => ({
  id: item.id,
  title: item.name,
  link: item.url,
  shortUrl: item.shortUrl,
  thumbnail: item.thumbnail,
  description: item.description,
  likeCount: item.like,
});

// ---------- Defaults ----------

const DEFAULT_PAGE_SIZE = 6;

// ---------- Requests ----------

export const getListVideo = async (variables?: IVideoVariables): Promise<IVideo[]> => {
  const { data } = await request<ApiListResponse<ApiVideoItem>>({
    url: '/video',
    method: 'GET',
    params: {
      pageSize: variables?.pageSize ?? DEFAULT_PAGE_SIZE,
      ...(variables?.query && { query: variables.query }),
    },
  });
  return data.data.items.map(toVideo);
};

export const getVideoPage = async (variables?: IVideoVariablesInfinite): Promise<IVideoPage> => {
  const pageSize = variables?.pageSize ?? DEFAULT_PAGE_SIZE;
  const { data } = await request<ApiVideoListResponse>({
    url: '/video',
    method: 'GET',
    params: {
      pageSize,
      ...(variables?.query && { query: variables.query }),
      ...(variables?.distanceScore !== undefined && { distanceScore: variables.distanceScore }),
    },
  });

  const items = data.data.items.map(toVideo);

  return {
    items,
    nextCursor: items.length < pageSize ? null : data.data.stats.distanceScore ?? null,
  };
};
