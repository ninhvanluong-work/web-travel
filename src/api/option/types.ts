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
  currency: string;
  productId: string;
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
