import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import GuideListPage from '@/modules/AdminTourGuide/GuideListPage';
import type { NextPageWithLayout } from '@/types';

const AdminGuidesPage: NextPageWithLayout = () => <GuideListPage />;

AdminGuidesPage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminGuidesPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage'])),
    },
  };
}
