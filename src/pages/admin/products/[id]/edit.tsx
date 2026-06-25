import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import ProductFormPage from '@/modules/AdminProduct/ProductFormPage';
import type { NextPageWithLayout } from '@/types';

const AdminProductEditPage: NextPageWithLayout = () => {
  const { query } = useRouter();
  const id = typeof query.id === 'string' ? query.id : undefined;
  return <ProductFormPage productId={id} />;
};

AdminProductEditPage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminProductEditPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage'])),
    },
  };
}
