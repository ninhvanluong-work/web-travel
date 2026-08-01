export interface ApiUnit {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productId: string;
  name: string;
  note: string | null;
}

export interface ApiSessionUnit {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  sessionId: string;
  unitId: string;
  price: string;
  unit?: ApiUnit;
}

export interface ApiSessionItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  productId: string;
  travelDate: string;
  capacity: number;
  status: 'active' | 'inactive';
  sessionUnits: ApiSessionUnit[];
}

export interface ISessionParams {
  productId: string;
  fromDate: string;
  toDate: string;
  page?: number;
  pageSize?: number;
}

export interface ApiSessionData {
  items: ApiSessionItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiSessionResponse {
  data: ApiSessionData;
  code: number;
  message: string;
  error: string | null;
}
