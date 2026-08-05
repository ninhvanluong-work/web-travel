export interface ApiProductBookingDepartureTime {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productId: string;
  time: string;
  label: string;
  order: number;
  isActive: boolean;
  note: string | null;
}

export interface ApiProductBookingPickupLocation {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productId: string;
  name: string;
  address: string | null;
  isPopular: boolean;
  mapUrl: string | null;
  order: number;
}

export interface ApiProductBookingOption {
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
  currency: string;
  productId: string;
  include?: string[];
}

export interface ApiProductUnit {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productId: string;
  name: string;
  note: string | null;
}

export interface ApiProductBookingData {
  departureTimes: ApiProductBookingDepartureTime[];
  pickupLocations: ApiProductBookingPickupLocation[];
  options: ApiProductBookingOption[];
}

export interface ApiProductBookingResponse {
  data: ApiProductBookingData;
  code: number;
  message: string;
  error: string | null;
}
