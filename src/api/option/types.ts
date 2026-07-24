export interface ApiPickupLocation {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  optionId: string;
  name: string;
  address: string | null;
  isPopular: boolean;
  mapUrl: string | null;
  order: number;
}

export interface ApiDepartureTime {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  optionId: string;
  time: string;
  label: string;
  order: number;
  isActive: boolean;
  note: string | null;
}

export interface ApiOptionDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  title: string;
  description: string | null;
  day: number;
  night: number;
  isDefault: boolean;
  status: 'active' | 'inactive';
  order: number;
  allowUnit: string | null;
  currency: string;
  productId: string;
  pickupLocations: ApiPickupLocation[];
  departureTimes: ApiDepartureTime[];
}

export interface CreateOptionPayload {
  title: string;
  productId: string;
  isDefault?: boolean;
  status?: 'active' | 'inactive';
  order?: number;
  currency?: string;
  day?: number;
  night?: number;
}
