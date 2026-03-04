export interface ApiListResponse<T> {
  data: {
    items: T[];
    total?: number;
    page?: number;
    pageSize?: number;
  };
}
