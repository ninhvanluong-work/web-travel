import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import DestinationFormPage from '@/modules/AdminDestination/DestinationFormPage';
import type { NextPageWithLayout } from '@/types';

const AdminDestinationCreatePage: NextPageWithLayout = () => <DestinationFormPage />;

AdminDestinationCreatePage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminDestinationCreatePage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage', 'adminDestination'])),
    },
  };
}
