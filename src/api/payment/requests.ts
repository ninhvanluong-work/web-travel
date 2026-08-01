import { request } from '../axios';
import type {
  ApiPaypalCaptureOrderResponse,
  ApiPaypalConfig,
  ApiPaypalConfigResponse,
  ApiPaypalCreateOrderResponse,
} from './types';

export async function getPaypalConfig(): Promise<ApiPaypalConfig> {
  const { data } = await request.get<ApiPaypalConfigResponse>('/payment/paypal/config');
  return data.data;
}

export async function createPaypalOrder(bookingId: string): Promise<string> {
  const { data } = await request.post<ApiPaypalCreateOrderResponse>(`/payment/paypal/${bookingId}/create-order`);
  return data.data.orderId;
}

export async function capturePaypalOrder(
  bookingId: string,
  orderId: string
): Promise<ApiPaypalCaptureOrderResponse['data']> {
  const { data } = await request.post<ApiPaypalCaptureOrderResponse>(`/payment/paypal/${bookingId}/capture-order`, {
    orderId,
  });
  return data.data;
}
