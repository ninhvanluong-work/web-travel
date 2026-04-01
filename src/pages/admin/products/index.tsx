import type { ReactNode } from 'react';

import AdminLayout from '@/components/layouts/AdminLayout';
import ProductListPage from '@/modules/AdminProduct/ProductListPage';
import type { NextPageWithLayout } from '@/types';

const AdminProductsPage: NextPageWithLayout = () => <ProductListPage />;

AdminProductsPage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminProductsPage;
