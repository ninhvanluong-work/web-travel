export interface ApiPaypalConfig {
  clientId: string;
  currency: string;
}

export interface ApiPaypalConfigResponse {
  data: ApiPaypalConfig;
  code: number;
  message: string;
  error: string | null;
}

export interface ApiPaypalCreateOrderResponse {
  data: {
    orderId: string;
  };
  code: number;
  message: string;
  error: string | null;
}

export interface ApiPaypalCaptureOrderResponse {
  data: {
    booking: {
      id: string;
      status: string;
      bookingCode: string;
    };
    payment: {
      id: string;
      status: 'succeed' | 'failed';
      providerTxId: string;
      price: string;
      currency: string;
    };
  };
  code: number;
  message: string;
  error: string | null;
}
