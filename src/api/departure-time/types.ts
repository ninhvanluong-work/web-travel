export interface CreateDepartureTimePayload {
  productId: string;
  time: string;
  label?: string;
  note?: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateDepartureTimePayload {
  time?: string;
  label?: string;
  note?: string;
  order?: number;
  isActive?: boolean;
}
