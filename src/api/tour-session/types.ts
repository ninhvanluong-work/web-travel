export interface ApiUnitRef {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  tourSessionId: string;
  name: string;
  note: string | null;
  price: string;
  capacity: number;
}

export interface ApiTourSessionItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  optionId: string;
  travelDate: string;
  remainingSlot: number;
  status: 'active' | 'inactive';
  unitReferences: ApiUnitRef[];
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
