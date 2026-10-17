import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import DestinationListPage from '@/modules/AdminDestination/DestinationListPage';
import type { NextPageWithLayout } from '@/types';

const AdminDestinationsPage: NextPageWithLayout = () => <DestinationListPage />;

AdminDestinationsPage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminDestinationsPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage', 'adminDestination'])),
    },
  };
}
