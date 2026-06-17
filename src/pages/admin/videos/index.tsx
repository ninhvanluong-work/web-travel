import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import AdminVideoPage from '@/modules/AdminVideo/VideoPage';
import type { NextPageWithLayout } from '@/types';

const AdminVideosPage: NextPageWithLayout = () => <AdminVideoPage />;
AdminVideosPage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminVideosPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage'])),
    },
  };
}
