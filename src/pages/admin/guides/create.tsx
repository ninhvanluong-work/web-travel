import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import { GuideFormPage } from '@/modules/AdminTourGuide';
import type { NextPageWithLayout } from '@/types';

const AdminGuidesCreatePage: NextPageWithLayout = () => <GuideFormPage />;

AdminGuidesCreatePage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminGuidesCreatePage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage'])),
    },
  };
}
