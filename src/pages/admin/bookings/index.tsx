import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import { BookingListPage } from '@/modules/AdminBooking';
import type { NextPageWithLayout } from '@/types';

const AdminBookingsPage: NextPageWithLayout = () => <BookingListPage />;

AdminBookingsPage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminBookingsPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'adminPage'])),
    },
  };
}
