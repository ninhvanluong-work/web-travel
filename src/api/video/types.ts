// Domain model
export interface IVideo {
  id: string;
  slug: string;
  title: string;
  link: string;
  shortUrl: string;
  thumbnail: string;
  description: string;
  likeCount: number;
}

// Query variables
export interface IVideoVariables {
  query?: string;
  pageSize?: number;
}

// Internal API response types
export interface ApiVideoItem {
  id: string;
  slug: string;
  name: string;
  url: string;
  shortUrl: string;
  thumbnail: string;
  description: string;
  tag: string | null;
  like: number;
  score: number;
}

export interface ApiVideoDetailResponse {
  data: ApiVideoItem;
}

export interface ApiVideoListResponse {
  data: {
    items: ApiVideoItem[];
    stats: {
      distanceScore: number;
    };
  };
}

export interface IVideoPage {
  items: IVideo[];
  nextCursor: number | null;
}

export interface IVideoVariablesInfinite {
  query?: string;
  pageSize?: number;
  distanceScore?: number;
  rootId?: string;
  excludeIds?: string[];
}
