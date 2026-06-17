import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import ForgotPasswordPage from '@/modules/ForgotPasswordPage';

const ForgotPassword: NextPage = () => <ForgotPasswordPage />;

export default ForgotPassword;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'authPage'])),
    },
  };
}
