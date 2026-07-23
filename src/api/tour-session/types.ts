export interface ApiUnitRef {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  key: 'adult' | 'children';
  name: string;
  note: string | null;
}

export interface ApiTourSessionItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  optionId: string;
  travelDate: string;
  departureTime: string;
  capacity: number;
  remainingSlot: number;
  unitRefId: string;
  price: string;
  status: 'active' | 'inactive';
  unitRef: ApiUnitRef;
}

export interface ITourSessionParams {
  optionId: string;
  fromDate: string;
  toDate: string;
  page?: number;
  pageSize?: number;
}

export interface ApiTourSessionData {
  items: ApiTourSessionItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiTourSessionResponse {
  data: ApiTourSessionData;
  code: number;
  message: string;
  error: string | null;
}
