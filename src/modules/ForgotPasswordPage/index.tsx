import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { useForgotPasswordMutation } from '@/api/auth';
import { Icons } from '@/assets/icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { forgotPasswordSchema, type ForgotSchema } from '@/lib/validations/auth';
import { AuthHeader } from '@/modules/auth-shared/auth-header';
import { useAlertStore } from '@/stores/use-alert-store';
import { ROUTE } from '@/types';

export default function ForgotPasswordPage() {
  const { t } = useTranslation('authPage');
  const [isSuccess, setIsSuccess] = useState(false);

  const { mutate: sendReset, isLoading } = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = (values: ForgotSchema) => {
    sendReset(values, {
      onSuccess: () => setIsSuccess(true),
      onError: (err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        const message = status === 404 ? t('forgotPassword.errorNotFound') : t('forgotPassword.errorGeneric');
        useAlertStore.getState().addAlert({ type: 'error', title: message });
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-white font-dinpro">
      <AuthHeader backHref={ROUTE.SIGN_IN} />

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex flex-col items-center text-center px-[30px] pt-12 pb-10 gap-5"
          >
            <div className="w-20 h-20 rounded-full bg-green-100/80 flex items-center justify-center">
              <Icons.checkCircle className="w-9 h-9 text-green-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-[22px] font-bold tracking-[-0.5px] text-neutral-black font-dinpro">
                {t('forgotPassword.successTitle')}
              </h2>
              <p className="text-body3 text-neutral-500 leading-relaxed font-dinpro max-w-[260px] mx-auto">
                {t('forgotPassword.successMessage')}
              </p>
            </div>

            <Button
              variant="dark"
              size="icon"
              fullWidth
              blur={false}
              asChild
              className="h-14 mt-4 rounded-xl bg-neutral-black text-white text-button1 font-semibold tracking-[0.3px] shadow-sm font-dinpro"
            >
              <Link href={ROUTE.SIGN_IN}>{t('forgotPassword.clickHere')}</Link>
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="px-[30px] pb-10"
          >
            <div className="mb-8">
              <h1 className="text-[28px] font-bold tracking-[-0.6px] text-neutral-black leading-tight font-dinpro">
                {t('forgotPassword.title')}
              </h1>
              <p className="text-body3 text-neutral-500 mt-3 leading-[1.7] font-dinpro">
                {t('forgotPassword.subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="mb-6">
                <label className="block text-body4 font-semibold text-neutral-700 mb-2 tracking-[0.2px] font-dinpro">
                  {t('forgotPassword.emailLabel')}
                </label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder={t('forgotPassword.emailPlaceholder')}
                  className="bg-neutral-100/50 border-neutral-200 placeholder:text-neutral-400"
                  fullWidth
                  disabled={isLoading}
                />
                {errors.email && <p className="text-body4 text-red-500 mt-1.5">{errors.email.message}</p>}
              </div>

              <Button
                type="submit"
                variant="dark"
                size="icon"
                fullWidth
                blur={false}
                loading={isLoading}
                disabled={isLoading}
                className="h-14 rounded-xl bg-neutral-black text-white text-button1 font-semibold tracking-[0.3px] shadow-sm font-dinpro"
              >
                {t('forgotPassword.submitButton')}
              </Button>
            </form>

            <div className="flex items-center justify-center gap-1.5 mt-7">
              <span className="text-body3 text-neutral-500 font-dinpro">{t('forgotPassword.rememberPassword')}</span>
              <Link
                href={ROUTE.SIGN_IN}
                className="text-body3 font-bold text-neutral-black font-dinpro hover:opacity-70 transition-opacity"
              >
                {t('forgotPassword.clickHere')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
