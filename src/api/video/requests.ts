import { request } from '../axios';
import type { ApiListResponse } from '../types';
import type { ApiVideoItem, IVideo, IVideoVariables } from './types';

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

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;

// ---------- Requests ----------

export const getListVideo = async (variables?: IVideoVariables): Promise<IVideo[]> => {
  const { data } = await request<ApiListResponse<ApiVideoItem>>({
    url: '/video',
    method: 'GET',
    params: {
      page: variables?.page ?? DEFAULT_PAGE,
      pageSize: variables?.pageSize ?? DEFAULT_PAGE_SIZE,
      ...(variables?.query && { query: variables.query }),
    },
  });
  return data.data.items.map(toVideo);
};
