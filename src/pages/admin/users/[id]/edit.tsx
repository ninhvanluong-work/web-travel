import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import UserFormPage from '@/modules/AdminUser/UserFormPage';
import type { NextPageWithLayout } from '@/types';

const AdminUserEditPage: NextPageWithLayout = () => {
  const { query } = useRouter();
  const id = typeof query.id === 'string' ? query.id : undefined;
  // `key` remounts the form when navigating between users
  return <UserFormPage key={id} userId={id} />;
};

AdminUserEditPage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminUserEditPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage', 'adminUser'])),
    },
  };
}
