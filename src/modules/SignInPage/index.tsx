import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Controller, useForm } from 'react-hook-form';

import { useLoginMutation } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { type LoginSchema, loginSchema } from '@/lib/validations/auth';
import { containerVariants, itemVariants, shakeVariants } from '@/modules/auth-shared/animations';
import { AuthHeader } from '@/modules/auth-shared/auth-header';
import { useAlertStore } from '@/stores/use-alert-store';
import { useUserStore } from '@/stores/UserStore';
import { ROUTE } from '@/types';

export default function SignInPage() {
  const { t } = useTranslation('authPage');
  const router = useRouter();
  const setStore = useUserStore.use.setStore();

  const { mutate: login, isLoading } = useLoginMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = (values: LoginSchema) => {
    login(values, {
      onSuccess: (data) => {
        setStore(data);
        if ((data.user.role === 'guide' || data.user.role === 'tour_guide') && data.user.tourGuideId) {
          router.push(ROUTE.GUIDE_PROFILE_PATH(data.user.tourGuideId));
        } else {
          router.push(ROUTE.HOME);
        }
      },
      onError: (err: unknown) => {
        const apiError = err as { statusCode?: number; message?: string };
        const message =
          apiError?.statusCode === 401 ? t('signIn.errorInvalid') : apiError?.message ?? t('signIn.errorGeneric');
        useAlertStore.getState().addAlert({ type: 'error', title: message, duration: 3000 });
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-[#F3F4F6] font-dinpro">
      <AuthHeader backHref={ROUTE.HOME} />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="px-[30px] pb-10">
        <motion.div variants={itemVariants} className="mb-6 text-center">
          <h1 className="text-[28px] font-bold tracking-[-0.8px] text-[#010F1C] leading-tight font-dinpro">
            {t('signIn.title')}
          </h1>
          <p className="text-body3 text-[#646464] mt-2 leading-relaxed font-dinpro">{t('signIn.subtitle')}</p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-2">
          <motion.div variants={itemVariants} className="mb-5">
            <motion.div animate={errors.email ? 'shake' : ''} variants={shakeVariants}>
              <Input
                {...register('email')}
                type="email"
                placeholder={t('signIn.emailPlaceholder')}
                className="!bg-white rounded-full border-0 placeholder:text-[#939393] shadow-sm text-[#010F1C] [&:-webkit-autofill]:shadow-[inset_0_0_0_9999px_white]"
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
                  className="text-body4 text-red-500 mt-1.5 ml-4"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-5">
            <motion.div animate={errors.password ? 'shake' : ''} variants={shakeVariants}>
              <Input
                {...register('password')}
                type="password"
                placeholder={t('signIn.passwordPlaceholder')}
                className="!bg-white rounded-full border-0 placeholder:text-[#939393] shadow-sm text-[#010F1C] [&:-webkit-autofill]:shadow-[inset_0_0_0_9999px_white]"
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
                  className="text-body4 text-red-500 mt-1.5 ml-4"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center justify-between py-1 mb-6">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="rememberMe"
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    className="h-5 w-5 rounded"
                  />
                )}
              />
              <span className="text-body4 text-[#646464] font-dinpro">{t('signIn.keepLoggedIn')}</span>
            </label>
            <Link
              href="#"
              className="text-body4 font-semibold text-[#646464] font-dinpro hover:text-[#3BB77E] transition-colors"
            >
              {/* Fallback to 'Forgot Password' if translation is missing */}
              {t('signIn.forgotPassword', 'Forgot Password')}
            </Link>
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
              {t('signIn.submitButton')}
            </Button>
          </motion.div>
        </form>

        <motion.div variants={itemVariants} className="flex items-center justify-center gap-1.5 mt-7">
          <span className="text-body3 text-[#646464] font-dinpro">{t('signIn.noAccount')}</span>
          <Link
            href={ROUTE.SIGN_UP}
            className="text-body3 font-bold text-[#3BB77E] font-dinpro hover:opacity-70 transition-opacity"
          >
            {t('signIn.signUpLink')}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
