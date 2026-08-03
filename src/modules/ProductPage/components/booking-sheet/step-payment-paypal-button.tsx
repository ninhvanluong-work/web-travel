import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useTranslation } from 'next-i18next';

interface StepPaymentPaypalButtonProps {
  clientId: string;
  currency: string;
  isCapturing: boolean;
  onCreateOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onError: () => void;
  onCancel: () => void;
}

export function StepPaymentPaypalButton({
  clientId,
  currency,
  isCapturing,
  onCreateOrder,
  onApprove,
  onError,
  onCancel,
}: StepPaymentPaypalButtonProps) {
  const { t } = useTranslation('productPage');

  return (
    <div className="relative w-full h-[55px]">
      {/* Capturing overlay */}
      {isCapturing && (
        <div className="absolute inset-0 bg-white/80 z-30 flex items-center justify-center gap-2 rounded-[16px]">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#0F6E56]" />
          <span className="text-[13px] text-[#0F6E56] font-semibold">{t('booking.paymentConfirming')}</span>
        </div>
      )}

      {/* Custom visual — pointer-events-none, clicks pass through */}
      <div className="absolute inset-0 rounded-[16px] bg-[#FFC439] flex items-center justify-between px-5 shadow-md pointer-events-none select-none">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-[10px] bg-[#003087] flex items-center justify-center flex-shrink-0">
            <span className="text-[14px] font-black text-white tracking-tight leading-none">PP</span>
          </div>
          <div>
            <p className="text-[15px] font-bold text-[#1C2B5E] leading-snug">PayPal</p>
            <p className="text-[13px] text-[#1C2B5E]/70 mt-0.5">{t('booking.paymentPaypalSubtext')}</p>
          </div>
        </div>
        <span className="text-[#1C2B5E]/50 text-[18px] flex-shrink-0 ml-2">→</span>
      </div>

      {/* PayPal iframe — opacity-0, exact same size as container, receives all clicks */}
      <div className="absolute inset-0 opacity-0 z-20">
        <PayPalScriptProvider
          options={{
            clientId,
            currency,
            intent: 'capture',
          }}
        >
          <PayPalButtons
            style={{
              color: 'gold',
              shape: 'rect',
              label: 'pay',
              height: 55,
            }}
            createOrder={async () => {
              const orderId = await onCreateOrder();
              return `${orderId}`;
            }}
            onApprove={onApprove}
            onError={onError}
            onCancel={onCancel}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
}
