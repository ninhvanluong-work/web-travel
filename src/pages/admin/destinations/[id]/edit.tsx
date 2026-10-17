import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import DestinationFormPage from '@/modules/AdminDestination/DestinationFormPage';
import type { NextPageWithLayout } from '@/types';

const AdminDestinationEditPage: NextPageWithLayout = () => {
  const { query } = useRouter();
  const id = typeof query.id === 'string' ? query.id : undefined;
  // `key` remounts the form when navigating between destinations
  return <DestinationFormPage key={id} destinationId={id} />;
};

AdminDestinationEditPage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminDestinationEditPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage', 'adminDestination'])),
    },
  };
}
