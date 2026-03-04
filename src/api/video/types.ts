// Domain model
export interface IVideo {
  id: string;
  title: string;
  link: string;
  thumbnail: string;
  description: string;
  likeCount: number;
}

// Query variables
export interface IVideoVariables {
  query?: string;
  page?: number;
  pageSize?: number;
}

// Internal API response types
export interface ApiVideoItem {
  id: string;
  name: string;
  url: string;
  thumbnail: string;
  description: string;
  tag: string | null;
  like: number;
}
