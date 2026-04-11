// Domain model
export interface IVideo {
  id: string;
  slug: string;
  title: string;
  link: string;
  shortUrl: string;
  embedUrl: string;
  thumbnail: string;
  description: string;
  likeCount: number;
  tag: string | null;
  type: 'hero' | 'normal' | null;
  uploadingStatus: number | null;
}

// Query variables
export interface IVideoVariables {
  query?: string;
  pageSize?: number;
  distanceScore?: number;
}

// Internal API response types
export interface ApiVideoItem {
  id: string;
  slug: string;
  name: string;
  url: string;
  shortUrl: string;
  embedUrl: string;
  thumbnail: string;
  description: string;
  tag: string | null;
  type?: 'hero' | 'normal';
  uploadingStatus?: number;
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

// Admin-specific types
export interface ApiAdminVideoItem {
  id: string;
  name: string;
  slug: string;
  url: string;
  embedUrl: string;
  shortUrl: string;
  thumbnail: string;
  description: string;
  tag: string | null;
  embedding: string;
  type: 'hero' | 'normal';
  guid: string;
  uploadingStatus: number;
  like: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiAdminVideoResponse {
  data: ApiAdminVideoItem;
  code: number;
  error: string | null;
  message: string;
}

export interface CreateVideoPayload {
  name: string;
  url: string;
  thumbnail?: string;
  description?: string;
  type: 'hero' | 'normal';
  tag?: string;
}

export interface UpdateVideoPayload {
  name?: string;
  url?: string;
  thumbnail?: string;
  description?: string;
  type?: 'hero' | 'normal';
  tag?: string;
  productId?: string | null;
  embedding?: string;
}

export interface IVideoVariablesInfinite {
  query?: string;
  pageSize?: number;
  distanceScore?: number;
  rootId?: string;
  excludeIds?: string[];
}
