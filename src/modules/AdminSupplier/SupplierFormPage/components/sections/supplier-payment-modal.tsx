import { Loader2 } from 'lucide-react';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';

import type { ISupplierPayment } from '@/api/supplier-payment/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { useSupplierPaymentForm } from './use-supplier-payment-form';

interface SupplierPaymentModalProps {
  supplierId: string;
  target: ISupplierPayment | null;
  open: boolean;
  onClose: () => void;
}

export function SupplierPaymentModal({ supplierId, target, open, onClose }: SupplierPaymentModalProps) {
  const { t } = useTranslation('adminPage');
  const form = useSupplierPaymentForm(supplierId, target, onClose);

  useEffect(() => {
    if (open) form.resetToTarget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v && !form.isPending) onClose();
      }}
    >
      <DialogContent className="max-w-lg rounded-2xl border-slate-100 shadow-2xl dark:border-gray-800/80">
        <DialogHeader>
          <DialogTitle className="text-slate-800 dark:text-white/90 font-bold">
            {form.isEdit ? t('paymentEditTitle') : t('paymentAddTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Method + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="admin-form-label">{t('paymentMethod')}</label>
              <Select value={form.method} onValueChange={form.setMethod}>
                <SelectTrigger inputSize="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank">{t('paymentMethodBank')}</SelectItem>
                  <SelectItem value="card">{t('paymentMethodCard')}</SelectItem>
                  <SelectItem value="paypal">{t('paymentMethodPaypal')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="admin-form-label">{t('paymentCurrency')}</label>
              <Select value={form.currency} onValueChange={form.setCurrency}>
                <SelectTrigger inputSize="sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="VND">VND</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bank fields */}
          {form.method === 'bank' && (
            <>
              <div className="space-y-1.5">
                <label className="admin-form-label">
                  {t('paymentBankName')} <span className="text-red-500">*</span>
                </label>
                <Input
                  size="sm"
                  fullWidth
                  placeholder={t('paymentBankNamePlaceholder')}
                  value={form.details.bankName ?? ''}
                  onChange={(e) => form.setDetail('bankName', e.target.value)}
                />
                {form.errors.bankName && <p className="text-xs text-red-500">{form.errors.bankName}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="admin-form-label">
                  {t('paymentAccountHolder')} <span className="text-red-500">*</span>
                </label>
                <Input
                  size="sm"
                  fullWidth
                  placeholder={t('paymentAccountHolderPlaceholder')}
                  value={form.details.accountHolder ?? ''}
                  onChange={(e) => form.setDetail('accountHolder', e.target.value)}
                />
                {form.errors.accountHolder && <p className="text-xs text-red-500">{form.errors.accountHolder}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="admin-form-label">
                  {t('paymentAccountNumber')} <span className="text-red-500">*</span>
                </label>
                <Input
                  size="sm"
                  fullWidth
                  placeholder={t('paymentAccountNumberPlaceholder')}
                  value={form.details.accountNumber ?? ''}
                  onChange={(e) => form.setDetail('accountNumber', e.target.value)}
                />
                {form.errors.accountNumber && <p className="text-xs text-red-500">{form.errors.accountNumber}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="admin-form-label">{t('paymentSwiftCode')}</label>
                <Input
                  size="sm"
                  fullWidth
                  placeholder={t('paymentSwiftCodePlaceholder')}
                  value={form.details.swiftCode ?? ''}
                  onChange={(e) => form.setDetail('swiftCode', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Card fields */}
          {form.method === 'card' && (
            <>
              <div className="space-y-1.5">
                <label className="admin-form-label">{t('paymentCardHolder')}</label>
                <Input
                  size="sm"
                  fullWidth
                  placeholder={t('paymentCardHolderPlaceholder')}
                  value={form.details.cardHolder ?? ''}
                  onChange={(e) => form.setDetail('cardHolder', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="admin-form-label">
                  {t('paymentCardNumber')} <span className="text-red-500">*</span>
                </label>
                <Input
                  size="sm"
                  fullWidth
                  placeholder={t('paymentCardNumberPlaceholder')}
                  value={form.details.cardNumber ?? ''}
                  onChange={(e) => form.setDetail('cardNumber', e.target.value)}
                />
                {form.errors.accountNumber && <p className="text-xs text-red-500">{form.errors.accountNumber}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="admin-form-label">{t('paymentExpiryMonth')}</label>
                  <Input
                    size="sm"
                    fullWidth
                    placeholder="MM"
                    maxLength={2}
                    value={form.details.expiryMonth ?? ''}
                    onChange={(e) => form.setDetail('expiryMonth', e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="admin-form-label">{t('paymentExpiryYear')}</label>
                  <Input
                    size="sm"
                    fullWidth
                    placeholder="YYYY"
                    maxLength={4}
                    value={form.details.expiryYear ?? ''}
                    onChange={(e) => form.setDetail('expiryYear', e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Email */}
          <div className="space-y-1.5">
            <label className="admin-form-label">{t('paymentEmail')}</label>
            <Input
              type="email"
              size="sm"
              fullWidth
              placeholder={t('supplierEmailPlaceholder')}
              value={form.details.email ?? ''}
              onChange={(e) => form.setDetail('email', e.target.value)}
            />
            {form.errors.email && <p className="text-xs text-red-500">{form.errors.email}</p>}
          </div>

          {/* isDefault toggle */}
          <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 dark:border-gray-800 dark:bg-white/[0.02]">
            <span className="text-sm font-medium text-slate-700 dark:text-gray-300">{t('paymentSetAsDefault')}</span>
            <Switch checked={form.isDefault} onCheckedChange={form.setIsDefault} />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            blur={false}
            onClick={onClose}
            disabled={form.isPending}
            className="h-10 px-5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-800 transition-all font-semibold text-sm shadow-none"
          >
            {t('cancel')}
          </Button>
          <Button
            type="button"
            blur={false}
            onClick={form.handleSubmit}
            disabled={form.isPending}
            className="h-10 px-5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white transition-all font-semibold text-sm active:scale-95 flex items-center gap-1.5 disabled:opacity-50"
          >
            {form.isPending && <Loader2 size={14} className="animate-spin" />}
            {form.isEdit ? t('save') : t('paymentAdd')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
