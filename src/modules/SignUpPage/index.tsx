import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Controller, useForm } from 'react-hook-form';

import { useRegisterMutation } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { type SignUpSchema, signUpSchema } from '@/lib/validations/auth';
import { AuthHeader } from '@/modules/auth-shared/auth-header';
import { OAuthSection } from '@/modules/auth-shared/oauth-section';
import { useAlertStore } from '@/stores/use-alert-store';
import { useUserStore } from '@/stores/UserStore';
import { ROUTE } from '@/types/routes';

const labelCls = 'block text-body4 font-semibold text-neutral-700 mb-2 tracking-[0.2px] font-dinpro';
const inputCls = 'bg-neutral-100/50 border-neutral-200 placeholder:text-neutral-400';
const errorCls = 'text-body4 text-red-500 mt-1.5';

export default function SignUpPage() {
  const { t } = useTranslation('authPage');
  const router = useRouter();
  const setStore = useUserStore.use.setStore();

  const { mutate: register, isLoading } = useRegisterMutation();

  const {
    register: field,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', agreeTerms: false },
  });

  const onSubmit = (values: SignUpSchema) => {
    register(
      {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        company: '',
      },
      {
        onSuccess: (data) => {
          setStore(data);
          router.push(ROUTE.HOME);
        },
        onError: (err: unknown) => {
          const status = (err as { response?: { status?: number } })?.response?.status;
          const message = status === 409 ? t('signUp.errorEmailTaken') : t('signUp.errorGeneric');
          useAlertStore.getState().addAlert({ type: 'error', title: message });
        },
      }
    );
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-hide bg-white font-dinpro">
      <AuthHeader backHref={ROUTE.SIGN_IN} />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="px-[30px] pb-10"
      >
        <div className="mb-8">
          <h1 className="text-[28px] font-bold tracking-[-0.8px] text-neutral-black leading-tight font-dinpro">
            {t('signUp.title')}
          </h1>
          <p className="text-body3 text-neutral-500 mt-2 leading-relaxed font-dinpro">{t('signUp.subtitle')}</p>
        </div>

        <OAuthSection namespace="signUp" />

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-2">
          <div className="flex gap-3 mb-4">
            <div className="flex-1">
              <label className={labelCls}>{t('signUp.firstNameLabel')}</label>
              <Input
                {...field('firstName')}
                size="sm"
                placeholder={t('signUp.firstNamePlaceholder')}
                className={inputCls}
                fullWidth
                disabled={isLoading}
              />
              {errors.firstName && <p className={errorCls}>{errors.firstName.message}</p>}
            </div>
            <div className="flex-1">
              <label className={labelCls}>{t('signUp.lastNameLabel')}</label>
              <Input
                {...field('lastName')}
                size="sm"
                placeholder={t('signUp.lastNamePlaceholder')}
                className={inputCls}
                fullWidth
                disabled={isLoading}
              />
              {errors.lastName && <p className={errorCls}>{errors.lastName.message}</p>}
            </div>
          </div>

          <div className="mb-4">
            <label className={labelCls}>{t('signUp.emailLabel')}</label>
            <Input
              {...field('email')}
              type="email"
              placeholder={t('signUp.emailPlaceholder')}
              className={inputCls}
              fullWidth
              disabled={isLoading}
            />
            {errors.email && <p className={errorCls}>{errors.email.message}</p>}
          </div>

          <div className="mb-5">
            <label className={labelCls}>{t('signUp.passwordLabel')}</label>
            <Input
              {...field('password')}
              type="password"
              placeholder={t('signUp.passwordPlaceholder')}
              className={inputCls}
              fullWidth
              disabled={isLoading}
            />
            {errors.password && <p className={errorCls}>{errors.password.message}</p>}
          </div>

          <div className="flex items-start gap-3 mb-6 p-3.5 rounded-xl bg-neutral-100/50 border border-neutral-200/60">
            <Controller
              name="agreeTerms"
              control={control}
              render={({ field: f }) => (
                <Checkbox
                  id="agreeTerms"
                  checked={f.value}
                  onCheckedChange={f.onChange}
                  disabled={isLoading}
                  className="mt-0.5 shrink-0"
                />
              )}
            />
            <div>
              <label
                htmlFor="agreeTerms"
                className="text-body4 text-neutral-600 leading-[1.6] font-dinpro cursor-pointer"
              >
                {t('signUp.agreeText')} <span className="font-bold text-neutral-black">{t('signUp.termsLink')}</span>
                {t('signUp.andText')} <span className="font-bold text-neutral-black">{t('signUp.privacyLink')}</span>
              </label>
              {errors.agreeTerms && <p className={errorCls}>{errors.agreeTerms.message}</p>}
            </div>
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
            {t('signUp.submitButton')}
          </Button>
        </form>

        <div className="flex items-center justify-center gap-1.5 mt-7">
          <span className="text-body3 text-neutral-500 font-dinpro">{t('signUp.haveAccount')}</span>
          <Link
            href={ROUTE.SIGN_IN}
            className="text-body3 font-bold text-neutral-black font-dinpro hover:opacity-70 transition-opacity"
          >
            {t('signUp.signInLink')}
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
