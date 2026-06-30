import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useForm } from 'react-hook-form';

import { useForgotPasswordMutation } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { forgotPasswordSchema, type ForgotSchema } from '@/lib/validations/auth';
import { containerVariants, itemVariants, shakeVariants } from '@/modules/auth-shared/animations';
import { AuthHeader } from '@/modules/auth-shared/auth-header';
import { useAlertStore } from '@/stores/use-alert-store';
import { ROUTE } from '@/types';

export default function ForgotPasswordPage() {
  const { t } = useTranslation('authPage');

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
      onSuccess: () => {
        useAlertStore.getState().addAlert({
          type: 'success',
          title: t('forgotPassword.successTitle'),
          description: t('forgotPassword.successMessage'),
          duration: 4000,
        });
      },
      onError: (err: unknown) => {
        const apiErr = err as { message?: string };
        const message = apiErr?.message ?? t('forgotPassword.errorGeneric');
        useAlertStore.getState().addAlert({ type: 'error', title: message, duration: 3000 });
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-[#F3F4F6] font-dinpro">
      <AuthHeader backHref={ROUTE.SIGN_IN} />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="px-[30px] pb-10">
        <motion.div variants={itemVariants} className="mb-6 text-center">
          <h1 className="text-[28px] font-bold tracking-[-0.8px] text-[#010F1C] leading-tight font-dinpro">
            {t('forgotPassword.title')}
          </h1>
          <p className="text-body3 text-[#646464] mt-2 leading-relaxed font-dinpro">{t('forgotPassword.subtitle')}</p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-2">
          <motion.div variants={itemVariants} className="mb-5">
            <motion.div animate={errors.email ? 'shake' : ''} variants={shakeVariants}>
              <Input
                {...register('email')}
                type="email"
                placeholder={t('forgotPassword.emailPlaceholder')}
                className="!bg-white rounded-full border-0 placeholder:text-[#939393] shadow-sm text-[#010F1C] [&:-webkit-autofill]:shadow-[inset_0_0_0_9999px_white]"
                prefix={
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#374151] ml-1">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                }
                fullWidth
                disabled={isLoading}
              />
            </motion.div>
            <motion.div animate={errors.email ? 'shake' : ''} variants={shakeVariants}>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-body4 text-red-500 mt-1.5 ml-4"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </motion.div>
          </motion.div>

          <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
            <Button
              type="submit"
              variant="dark"
              size="icon"
              fullWidth
              blur={false}
              loading={isLoading}
              disabled={isLoading}
              className="h-14 rounded-full bg-[#3BB77E] hover:opacity-90 transition-opacity text-white text-button1 font-semibold tracking-[0.3px] shadow-sm font-dinpro"
            >
              {t('forgotPassword.submitButton')}
            </Button>
          </motion.div>
        </form>

        <motion.div variants={itemVariants} className="flex items-center justify-center gap-1.5 mt-7">
          <span className="text-body3 text-[#646464] font-dinpro">{t('forgotPassword.rememberPassword')}</span>
          <Link
            href={ROUTE.SIGN_IN}
            className="text-body3 font-bold text-[#3BB77E] font-dinpro hover:opacity-70 transition-opacity"
          >
            {t('forgotPassword.clickHere')}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
