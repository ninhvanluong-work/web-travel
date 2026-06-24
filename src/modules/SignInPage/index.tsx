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
    <div className="h-full overflow-y-auto scrollbar-hide bg-white font-dinpro">
      <AuthHeader backHref={ROUTE.HOME} />

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="px-[30px] pb-10">
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-[28px] font-bold tracking-[-0.8px] text-neutral-black leading-tight font-dinpro">
            {t('signIn.title')}
          </h1>
          <p className="text-body3 text-neutral-500 mt-2 leading-relaxed font-dinpro">{t('signIn.subtitle')}</p>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-2">
          <motion.div variants={itemVariants} className="mb-4">
            <label className="block text-body4 font-semibold text-neutral-700 mb-2 tracking-[0.2px] font-dinpro">
              {t('signIn.emailLabel')}
            </label>
            <motion.div animate={errors.email ? 'shake' : ''} variants={shakeVariants}>
              <Input
                {...register('email')}
                type="email"
                placeholder={t('signIn.emailPlaceholder')}
                className="bg-neutral-100/50 border-neutral-200 placeholder:text-neutral-400"
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
                  className="text-body4 text-red-500 mt-1.5"
                >
                  {errors.email.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants} className="mb-3">
            <label className="block text-body4 font-semibold text-neutral-700 mb-2 tracking-[0.2px] font-dinpro">
              {t('signIn.passwordLabel')}
            </label>
            <motion.div animate={errors.password ? 'shake' : ''} variants={shakeVariants}>
              <Input
                {...register('password')}
                type="password"
                placeholder={t('signIn.passwordPlaceholder')}
                className="bg-neutral-100/50 border-neutral-200 placeholder:text-neutral-400"
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
                  className="text-body4 text-red-500 mt-1.5"
                >
                  {errors.password.message}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div variants={itemVariants} className="flex items-center py-3 mb-4">
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
              <span className="text-body4 text-neutral-600 font-dinpro">{t('signIn.keepLoggedIn')}</span>
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
              className="h-14 rounded-xl bg-neutral-black text-white text-button1 font-semibold tracking-[0.3px] shadow-sm font-dinpro"
            >
              {t('signIn.submitButton')}
            </Button>
          </motion.div>
        </form>

        <motion.div variants={itemVariants} className="flex items-center justify-center gap-1.5 mt-7">
          <span className="text-body3 text-neutral-500 font-dinpro">{t('signIn.noAccount')}</span>
          <Link
            href={ROUTE.SIGN_UP}
            className="text-body3 font-bold text-neutral-black font-dinpro hover:opacity-70 transition-opacity"
          >
            {t('signIn.signUpLink')}
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
