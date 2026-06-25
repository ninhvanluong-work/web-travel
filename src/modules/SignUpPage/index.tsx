import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Controller, useForm } from 'react-hook-form';

import { useRegisterMutation } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { type SignUpSchema, signUpSchema } from '@/lib/validations/auth';
import { containerVariants, itemVariants, shakeVariants } from '@/modules/auth-shared/animations';
import { AuthHeader } from '@/modules/auth-shared/auth-header';
import { useAlertStore } from '@/stores/use-alert-store';
import { ROUTE } from '@/types';

const labelCls = 'block text-body4 font-semibold text-[#010F1C] mb-2 tracking-[0.2px] font-dinpro';
const inputCls =
  '!bg-white rounded-full border-0 placeholder:text-[#939393] shadow-sm text-[#010F1C] [&:-webkit-autofill]:shadow-[inset_0_0_0_9999px_white] [&:-webkit-autofill]:!bg-white';
const errorCls = 'text-body4 text-red-500 mt-1.5';

export default function SignUpPage() {
  const { t } = useTranslation('authPage');
  const router = useRouter();

  const { mutate: register, isLoading } = useRegisterMutation();

  const {
    register: field,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { email: '', password: '', isTourGuide: false },
  });

  const onSubmit = (values: SignUpSchema) => {
    register(
      { email: values.email, password: values.password, role: values.isTourGuide ? 'tour_guide' : 'normal' },
      {
        onSuccess: () => {
          useAlertStore.getState().addAlert({
            type: 'success',
            title: t('signUp.successTitle'),
            description: t('signUp.successMessage'),
          });
          router.push(ROUTE.SIGN_IN);
        },
        onError: (err: unknown) => {
          const apiError = err as { statusCode?: number; message?: string };
          const message = apiError?.message ?? t('signUp.errorGeneric');
          useAlertStore.getState().addAlert({ type: 'error', title: message, duration: 3000 });
        },
      }
    );
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-[#F3F4F6] font-dinpro">
      <AuthHeader backHref={ROUTE.SIGN_IN} />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="px-[30px] pb-10">
        <motion.div variants={itemVariants} className="mb-6 text-center">
          <h1 className="text-[28px] font-bold tracking-[-0.8px] text-[#010F1C] leading-tight font-dinpro">
            {t('signUp.title')}
          </h1>
          <p className="text-body3 text-[#646464] mt-2 leading-relaxed font-dinpro">{t('signUp.subtitle')}</p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <motion.div variants={itemVariants} className="mb-5">
            <motion.div animate={errors.email ? 'shake' : ''} variants={shakeVariants}>
              <Input
                {...field('email')}
                type="email"
                placeholder={t('signUp.emailPlaceholder')}
                className={inputCls}
                prefix={
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#374151] ml-1">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"></path>
                  </svg>
                }
                fullWidth
                disabled={isLoading}
              />
            </motion.div>
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={errorCls}
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-5">
            <motion.div animate={errors.password ? 'shake' : ''} variants={shakeVariants}>
              <Input
                {...field('password')}
                type="password"
                placeholder={t('signUp.passwordPlaceholder')}
                className={inputCls}
                prefix={
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#374151] ml-1">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"></path>
                  </svg>
                }
                fullWidth
                disabled={isLoading}
              />
            </motion.div>
            <AnimatePresence>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={errorCls}
                >
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center gap-3 mb-6 p-3.5 rounded-xl !bg-white border-0 shadow-sm"
          >
            <Controller
              name="isTourGuide"
              control={control}
              render={({ field: f }) => (
                <Checkbox
                  id="isTourGuide"
                  checked={f.value}
                  onCheckedChange={f.onChange}
                  disabled={isLoading}
                  className="h-5 w-5 shrink-0 rounded-md border-2"
                />
              )}
            />
            <label htmlFor="isTourGuide" className="cursor-pointer select-none">
              <span className="block text-body4 font-semibold text-[#010F1C] font-dinpro">
                {t('signUp.isTourGuideLabel')}
              </span>
            </label>
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
              {t('signUp.submitButton')}
            </Button>
          </motion.div>
        </form>

        <motion.div variants={itemVariants} className="flex items-center justify-center gap-1.5 mt-7">
          <span className="text-body3 text-[#646464] font-dinpro">{t('signUp.haveAccount')}</span>
          <Link
            href={ROUTE.SIGN_IN}
            className="text-body3 font-bold text-[#3BB77E] font-dinpro hover:opacity-70 transition-opacity"
          >
            {t('signUp.signInLink')}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
