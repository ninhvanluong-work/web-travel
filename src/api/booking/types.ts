export interface IBookingPassenger {
  unitId: string;
  count: number;
}

export interface IBookingMessengerApp {
  name: string;
  username: string;
}

export interface IBookingPassengerItem {
  count: number;
  price: number;
  unitId: string;
  unitName: string;
}

export interface IBookingListItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  travelDate: string;
  bookingCode: string;
  optionId: string;
  optionName: string;
  tourSessionId: string;
  pickupLocationId: string | null;
  pickupLocationName: string;
  departureId: string;
  departureTime: string;
  departureLabel: string;
  passengers: IBookingPassengerItem[];
  totalPrice: string;
  currency: string;
  productName: string;
  status: 'paid' | 'pending' | 'cancel' | string;
  email: string;
  phone: string;
  username: string;
  messengerApp: IBookingMessengerApp[];
  userId: string | null;
  productId: string;
  supplierId: string;
  supplierName: string;
}

export interface IBookingPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface IBookingStatItem {
  count: number;
  totalPrice: number;
}

export interface IBookingStats {
  pending: IBookingStatItem;
  paid: IBookingStatItem;
  cancel: IBookingStatItem;
  total: IBookingStatItem;
}

export interface IBookingListResult {
  items: IBookingListItem[];
  pagination: IBookingPagination;
  stats?: IBookingStats;
}

export interface IBookingListResponse {
  data: {
    items: IBookingListItem[];
    pagination: IBookingPagination;
    stats?: IBookingStats;
  };
  code: number;
  message: string;
  error: string | null;
}

export interface IBookingQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  supplierId?: string;
  productId?: string;
  fromDate?: string;
  toDate?: string;
}

export interface ICreateBookingPayload {
  productId: string;
  optionId: string;
  tourSessionId: string;
  pickupLocationId: string | null;
  departureId: string;
  passengers: IBookingPassenger[];
  username: string;
  email: string;
  phone: string;
  messengerApp: IBookingMessengerApp[];
}

export interface ApiBookingDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  productId: string;
  optionId: string;
  tourSessionId: string;
  pickupLocationId: string | null;
  departureId: string;
  username: string;
  email: string;
  phone: string;
  messengerApp: IBookingMessengerApp[];
}

export interface ApiBookingResponse {
  data: ApiBookingDetail;
  code: number;
  message: string;
  error: string | null;
}
