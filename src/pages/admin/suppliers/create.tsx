import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import SupplierFormPage from '@/modules/AdminSupplier/SupplierFormPage';
import type { NextPageWithLayout } from '@/types';

const AdminSupplierCreatePage: NextPageWithLayout = () => <SupplierFormPage />;

AdminSupplierCreatePage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminSupplierCreatePage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage'])),
    },
  };
}
