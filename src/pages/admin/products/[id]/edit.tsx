import { useRouter } from 'next/router';
import type { ReactNode } from 'react';

import AdminLayout from '@/components/layouts/AdminLayout';
import ProductFormPage from '@/modules/AdminProduct/ProductFormPage';
import type { NextPageWithLayout } from '@/types';

const AdminProductEditPage: NextPageWithLayout = () => {
  const { query } = useRouter();
  const id = typeof query.id === 'string' ? query.id : undefined;
  return <ProductFormPage productId={id} />;
};

AdminProductEditPage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminProductEditPage;
