import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import ResetPasswordPage from '@/modules/ResetPasswordPage';

const ResetPassword: NextPage = () => <ResetPasswordPage />;

export default ResetPassword;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'authPage'])),
    },
  };
}
