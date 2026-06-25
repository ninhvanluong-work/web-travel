import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import SignUpPage from '@/modules/SignUpPage';

const SignUp: NextPage = () => <SignUpPage />;

export default SignUp;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'authPage'])),
    },
  };
}
