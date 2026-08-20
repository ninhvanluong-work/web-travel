// ── Raw API types ─────────────────────────────────────────────────────────────

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

export interface ApiSessionListResponse {
  data: {
    items: ApiSessionItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  code: number;
  message: string;
  error: string | null;
}

export interface ApiSessionDetailResponse {
  data: ApiSessionItem;
  code: number;
  message: string;
  error: string | null;
}

export interface ApiSessionRangeResponse {
  data: ApiSessionItem[];
  code: number;
  message: string;
  error: string | null;
}

// ── Domain model ──────────────────────────────────────────────────────────────

export interface IUnit {
  id: string;
  name: string;
  note: string | null;
  productId: string;
}

export interface ISessionUnit {
  id: string;
  sessionId: string;
  unitId: string;
  price: number;
  unit?: IUnit;
}

export interface ISession {
  id: string;
  productId: string;
  travelDate: string; // YYYY-MM-DD
  capacity: number;
  status: 'active' | 'inactive';
  sessionUnits: ISessionUnit[];
  createdAt: string;
  updatedAt: string;
}

export interface ISessionPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ISessionListResult {
  items: ISession[];
  pagination: ISessionPagination;
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface ISessionParams {
  productId: string;
  fromDate?: string;
  toDate?: string;
  status?: 'active' | 'inactive';
  keyword?: string;
  page?: number;
  pageSize?: number;
}

// ── Mutation payloads ─────────────────────────────────────────────────────────

export interface SessionUnitPayload {
  unitId: string;
  price: number;
}

export interface CreateSessionPayload {
  productId: string;
  travelDate: string; // YYYY-MM-DD
  status: 'active' | 'inactive';
  capacity?: number;
  sessionUnits?: SessionUnitPayload[];
}

export interface ConflictResolutionItem {
  date: string; // YYYY-MM-DD
  action: 'skip' | 'overwrite';
}

export interface ConflictResolutions {
  defaultAction: 'skip' | 'overwrite';
  overrides: ConflictResolutionItem[];
}

export interface CreateSessionRangePayload {
  productId: string;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  weekdays?: number[]; // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  status?: 'active' | 'inactive';
  capacity?: number;
  sessionUnits?: SessionUnitPayload[];
  conflictResolutions?: ConflictResolutions;
}

export interface UpdateSessionPayload {
  status?: 'active' | 'inactive';
  capacity?: number;
  sessionUnits?: SessionUnitPayload[];
}
