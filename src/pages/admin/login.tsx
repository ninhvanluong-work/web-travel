import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import AdminLoginModule from '@/modules/AdminLogin';
import type { NextPageWithLayout } from '@/types';

const AdminLoginPage: NextPageWithLayout = () => <AdminLoginModule />;

AdminLoginPage.getLayout = (page: ReactNode) => page;

export default AdminLoginPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage'])),
    },
  };
}
