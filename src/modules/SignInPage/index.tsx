import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Controller, useForm } from 'react-hook-form';

import { useLoginMutation } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { type LoginSchema, loginSchema } from '@/lib/validations/auth';
import { AuthHeader } from '@/modules/auth-shared/auth-header';
import { OAuthSection } from '@/modules/auth-shared/oauth-section';
import { useAlertStore } from '@/stores/use-alert-store';
import { useUserStore } from '@/stores/UserStore';
import { ROUTE } from '@/types/routes';

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
        if (data.user.role === 'guide' && data.user.tourGuideId) {
          router.push(`/guide/${data.user.tourGuideId}`);
        } else {
          router.push(ROUTE.HOME);
        }
      },
      onError: (err: unknown) => {
        const status = (err as { response?: { status?: number } })?.response?.status;
        const message = status === 401 ? t('signIn.errorInvalid') : t('signIn.errorGeneric');
        useAlertStore.getState().addAlert({ type: 'error', title: message });
      },
    });
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-white font-dinpro">
      <AuthHeader backHref={ROUTE.HOME} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="px-[30px] pb-10"
      >
        <div className="mb-8">
          <h1 className="text-[28px] font-bold tracking-[-0.8px] text-neutral-black leading-tight font-dinpro">
            {t('signIn.title')}
          </h1>
          <p className="text-body3 text-neutral-500 mt-2 leading-relaxed font-dinpro">{t('signIn.subtitle')}</p>
        </div>

        <OAuthSection namespace="signIn" />

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-2">
          <div className="mb-4">
            <label className="block text-body4 font-semibold text-neutral-700 mb-2 tracking-[0.2px] font-dinpro">
              {t('signIn.emailLabel')}
            </label>
            <Input
              {...register('email')}
              type="email"
              placeholder={t('signIn.emailPlaceholder')}
              className="bg-neutral-100/50 border-neutral-200 placeholder:text-neutral-400"
              fullWidth
              disabled={isLoading}
            />
            {errors.email && <p className="text-body4 text-red-500 mt-1.5">{errors.email.message}</p>}
          </div>

          <div className="mb-3">
            <label className="block text-body4 font-semibold text-neutral-700 mb-2 tracking-[0.2px] font-dinpro">
              {t('signIn.passwordLabel')}
            </label>
            <Input
              {...register('password')}
              type="password"
              placeholder={t('signIn.passwordPlaceholder')}
              className="bg-neutral-100/50 border-neutral-200 placeholder:text-neutral-400"
              fullWidth
              disabled={isLoading}
            />
            {errors.password && <p className="text-body4 text-red-500 mt-1.5">{errors.password.message}</p>}
          </div>

          <div className="flex items-center justify-between py-3 mb-4">
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
            <Link
              href={ROUTE.FORGOT_PASSWORD}
              className="text-body4 font-semibold text-neutral-black hover:opacity-60 transition-opacity font-dinpro"
            >
              {t('signIn.forgotPassword')}
            </Link>
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
            {t('signIn.submitButton')}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-1.5 mt-7">
          <span className="text-body3 text-neutral-500 font-dinpro">{t('signIn.noAccount')}</span>
          <Link
            href={ROUTE.SIGN_UP}
            className="text-body3 font-bold text-neutral-black font-dinpro hover:opacity-70 transition-opacity"
          >
            {t('signIn.signUpLink')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
