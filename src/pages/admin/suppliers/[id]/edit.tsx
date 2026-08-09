import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import SupplierFormPage from '@/modules/AdminSupplier/SupplierFormPage';
import type { NextPageWithLayout } from '@/types';

const AdminSupplierEditPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id = router.query.id as string;
  return <SupplierFormPage supplierId={id} />;
};

AdminSupplierEditPage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminSupplierEditPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage'])),
    },
  };
}
