import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import { GuideFormPage } from '@/modules/AdminTourGuide';
import type { NextPageWithLayout } from '@/types';

const AdminGuidesEditPage: NextPageWithLayout = () => {
  const router = useRouter();
  const id = router.query.id as string | undefined;
  return <GuideFormPage guideId={id} />;
};

AdminGuidesEditPage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminGuidesEditPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage'])),
    },
  };
}
