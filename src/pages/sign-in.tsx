import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import SignInPage from '@/modules/SignInPage';

const SignIn: NextPage = () => <SignInPage />;

export default SignIn;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'authPage'])),
    },
  };
}
