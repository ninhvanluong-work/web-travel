import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Controller, useForm } from 'react-hook-form';

import { useAdminLoginMutation } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { containerVariants, itemVariants, shakeVariants } from '@/modules/auth-shared/animations';
import { useAlertStore } from '@/stores/use-alert-store';
import { useUserStore } from '@/stores/UserStore';
import { ROUTE } from '@/types';

import { type AdminLoginSchema, adminLoginSchema } from './admin-login-schema';

export function AdminLoginForm() {
  const { t } = useTranslation('adminPage');
  const router = useRouter();
  const setStore = useUserStore.use.setStore();
  const { mutate: adminLogin, isLoading } = useAdminLoginMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginSchema>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = (values: AdminLoginSchema) => {
    adminLogin(values, {
      onSuccess: (data) => {
        setStore(data);
        const callbackUrl = router.query.callbackUrl as string | undefined;
        const isSafeRedirect = callbackUrl?.startsWith('/') && !callbackUrl.startsWith('//');
        router.push(isSafeRedirect ? callbackUrl! : ROUTE.ADMIN_PRODUCTS);
      },
      onError: (err: unknown) => {
        const apiError = err as { statusCode?: number; message?: string };
        let message = t('adminLogin.errorGeneric');
        if (apiError?.statusCode === 401) message = t('adminLogin.errorInvalid');
        else if (apiError?.statusCode === 403) message = t('adminLogin.errorForbidden');
        useAlertStore.getState().addAlert({ type: 'error', title: message, duration: 3000 });
      },
    });
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex w-1/2 flex-col bg-white px-20 py-12"
    >
      <motion.div variants={itemVariants}>
        <Link
          href={ROUTE.HOME}
          className="group inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          {t('adminLogin.backToHome')}
        </Link>
      </motion.div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <motion.div variants={itemVariants} className="mb-9">
          <h1 className="mb-2.5 text-[2rem] font-bold leading-none tracking-tight text-slate-900">
            {t('adminLogin.title')}
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">{t('adminLogin.subtitle')}</p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Email */}
          <motion.div variants={itemVariants}>
            <label className="mb-1.5 block text-[0.8125rem] font-semibold text-slate-700">
              {t('adminLogin.emailLabel')} <span className="text-red-500">*</span>
            </label>
            <motion.div animate={errors.email ? 'shake' : ''} variants={shakeVariants}>
              <Input
                {...register('email')}
                type="email"
                placeholder={t('adminLogin.emailPlaceholder')}
                fullWidth
                disabled={isLoading}
                prefix={
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px] text-slate-400">
                    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                  </svg>
                }
              />
            </motion.div>
            <AnimatePresence>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="ml-1 mt-1.5 text-xs text-red-500"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Password */}
          <motion.div variants={itemVariants}>
            <label className="mb-1.5 block text-[0.8125rem] font-semibold text-slate-700">
              {t('adminLogin.passwordLabel')} <span className="text-red-500">*</span>
            </label>
            <motion.div animate={errors.password ? 'shake' : ''} variants={shakeVariants}>
              <Input
                {...register('password')}
                type="password"
                placeholder={t('adminLogin.passwordPlaceholder')}
                fullWidth
                disabled={isLoading}
                prefix={
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px] text-slate-400">
                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                  </svg>
                }
              />
            </motion.div>
            <AnimatePresence>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="ml-1 mt-1.5 text-xs text-red-500"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Remember me */}
          <motion.div variants={itemVariants} className="flex items-center pt-1">
            <label className="flex cursor-pointer select-none items-center gap-2">
              <Controller
                name="rememberMe"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="adminRememberMe"
                    checked={field.value ?? false}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                    className="h-5 w-5 rounded"
                  />
                )}
              />
              <span className="text-sm text-slate-600">{t('adminLogin.keepLoggedIn')}</span>
            </label>
          </motion.div>

          {/* Submit */}
          <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="pt-1">
            <Button
              type="submit"
              fullWidth
              loading={isLoading}
              disabled={isLoading}
              variant="dark"
              size="icon"
              className="h-14 rounded-lg bg-[#2563EB] text-sm font-semibold text-white hover:bg-[#1D4ED8]"
            >
              {t('adminLogin.submitButton')}
            </Button>
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}
