export interface IBookingPassenger {
  unitId: string;
  count: number;
}

export interface IBookingMessengerApp {
  name: string;
  username: string;
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
