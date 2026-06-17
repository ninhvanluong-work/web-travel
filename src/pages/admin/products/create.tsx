import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import ProductFormPage from '@/modules/AdminProduct/ProductFormPage';
import type { NextPageWithLayout } from '@/types';

const AdminProductCreatePage: NextPageWithLayout = () => <ProductFormPage />;

AdminProductCreatePage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminProductCreatePage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage'])),
    },
  };
}
