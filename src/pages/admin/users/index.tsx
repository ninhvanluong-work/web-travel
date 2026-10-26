import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import UserListPage from '@/modules/AdminUser/UserListPage';
import type { NextPageWithLayout } from '@/types';

const AdminUsersPage: NextPageWithLayout = () => <UserListPage />;

AdminUsersPage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminUsersPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage', 'adminUser'])),
    },
  };
}
