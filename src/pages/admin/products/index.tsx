import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import ProductListPage from '@/modules/AdminProduct/ProductListPage';
import type { NextPageWithLayout } from '@/types';

const AdminProductsPage: NextPageWithLayout = () => <ProductListPage />;

AdminProductsPage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminProductsPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage'])),
    },
  };
}
