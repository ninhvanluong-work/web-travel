import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import SupplierListPage from '@/modules/AdminSupplier/SupplierListPage';
import type { NextPageWithLayout } from '@/types';

const AdminSuppliersPage: NextPageWithLayout = () => <SupplierListPage />;

AdminSuppliersPage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminSuppliersPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage'])),
    },
  };
}
