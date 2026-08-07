export interface CreatePickupLocationPayload {
  productId: string;
  name: string;
  address?: string;
  isPopular?: boolean;
  mapUrl?: string;
  order?: number;
}

export interface UpdatePickupLocationPayload {
  name?: string;
  address?: string;
  isPopular?: boolean;
  mapUrl?: string;
  order?: number;
}
