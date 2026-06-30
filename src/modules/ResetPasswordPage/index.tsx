import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useResetPasswordMutation } from '@/api/auth';
import AlertBanner from '@/components/ui/AlertBanner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resetPassSchema, type ResetSchema } from '@/lib/validations/auth';
import { containerVariants, itemVariants, shakeVariants } from '@/modules/auth-shared/animations';
import { AuthHeader } from '@/modules/auth-shared/auth-header';
import { useAlertStore } from '@/stores/use-alert-store';
import { ROUTE } from '@/types';

export default function ResetPasswordPage() {
  const { t } = useTranslation('authPage');
  const router = useRouter();

  const token = router.query.token as string | undefined;

  useEffect(() => {
    if (router.isReady && !token) {
      router.replace(ROUTE.FORGOT_PASSWORD);
    }
  }, [router.isReady, token, router]);

  const { mutate: doReset, isLoading, isError, error } = useResetPasswordMutation();

  const apiError = isError ? (error as { message?: string })?.message ?? t('resetPassword.errorGeneric') : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetSchema>({
    resolver: zodResolver(resetPassSchema),
    defaultValues: { newPassword: '' },
  });

  const onSubmit = (values: ResetSchema) => {
    if (!token) return;
    doReset(
      { token, newPassword: values.newPassword },
      {
        onSuccess: () => {
          useAlertStore.getState().addAlert({
            type: 'success',
            title: t('resetPassword.successTitle'),
            description: t('resetPassword.successMessage'),
            duration: 3000,
          });
          setTimeout(() => router.replace(ROUTE.SIGN_IN), 1500);
        },
        onError: () => {},
      }
    );
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-[#F3F4F6] font-dinpro">
      <AuthHeader backHref={ROUTE.FORGOT_PASSWORD} />

      <AnimatePresence mode="wait">
        <motion.div
          key="form"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="px-[30px] pb-10"
        >
          <motion.div variants={itemVariants} className="mb-6 text-center">
            <h1 className="text-[28px] font-bold tracking-[-0.8px] text-[#010F1C] leading-tight font-dinpro">
              {t('resetPassword.title')}
            </h1>
            <p className="text-body3 text-[#646464] mt-2 leading-relaxed font-dinpro">{t('resetPassword.subtitle')}</p>
          </motion.div>

          {apiError && (
            <motion.div variants={itemVariants} className="mb-5">
              <AlertBanner
                variant="error"
                title={apiError}
                message=""
                showLink
                linkHref={ROUTE.FORGOT_PASSWORD}
                linkText={t('resetPassword.requestAgain')}
              />
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-2">
            <motion.div variants={itemVariants} className="mb-6">
              <motion.div animate={errors.newPassword ? 'shake' : ''} variants={shakeVariants}>
                <Input
                  {...register('newPassword')}
                  type="password"
                  placeholder={t('resetPassword.newPasswordPlaceholder')}
                  className="!bg-white rounded-full border-0 placeholder:text-[#939393] shadow-sm text-[#010F1C]"
                  prefix={
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#374151] ml-1">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                    </svg>
                  }
                  fullWidth
                  disabled={isLoading}
                />
              </motion.div>
              <AnimatePresence>
                {errors.newPassword && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-body4 text-red-500 mt-1.5 ml-4"
                  >
                    {errors.newPassword.message}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Button
                type="submit"
                variant="dark"
                size="icon"
                fullWidth
                blur={false}
                loading={isLoading}
                disabled={isLoading || !token}
                className="h-14 rounded-full bg-[#3BB77E] hover:opacity-90 transition-opacity text-white text-button1 font-semibold tracking-[0.3px] shadow-sm font-dinpro"
              >
                {t('resetPassword.submitButton')}
              </Button>
            </motion.div>
          </form>

          <motion.div variants={itemVariants} className="flex items-center justify-center mt-7">
            <Link
              href={ROUTE.SIGN_IN}
              className="text-body3 font-bold text-[#3BB77E] font-dinpro hover:opacity-70 transition-opacity"
            >
              {t('resetPassword.backToLogin')}
            </Link>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
