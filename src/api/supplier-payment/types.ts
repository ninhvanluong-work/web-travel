export interface ISupplierPaymentDetails {
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  swiftCode?: string;
  cardHolder?: string;
  cardNumber?: string;
  expiryMonth?: string;
  expiryYear?: string;
  email?: string;
}

export interface ISupplierPayment {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  supplierId: string;
  method: 'bank' | 'card' | 'paypal' | string;
  currency: string;
  details: ISupplierPaymentDetails;
  isDefault: boolean;
}

export interface SupplierPaymentPayload {
  supplierId: string;
  method: string;
  currency: string;
  details: ISupplierPaymentDetails;
  isDefault?: boolean;
}

export interface ISupplierPaymentListParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
  supplierId?: string;
  method?: string;
}

// ── Raw API response wrappers ─────────────────────────────────────────────────

export interface ApiSupplierPaymentListResponse {
  data: {
    items: ISupplierPayment[];
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

export interface ApiSupplierPaymentSingleResponse {
  data: ISupplierPayment;
  code: number;
  message: string;
  error: string | null;
}

export interface ApiSupplierPaymentDeleteResponse {
  data: null;
  code: number;
  message: string;
  error: string | null;
}

export interface ISupplierPaymentListResult {
  items: ISupplierPayment[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
