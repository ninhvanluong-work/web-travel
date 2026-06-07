import type { ReactNode } from 'react';

import { AdminLayout } from '@/components/layouts/AdminLayout';
import { GuideFormPage } from '@/modules/AdminTourGuide';
import type { NextPageWithLayout } from '@/types';

const AdminGuidesCreatePage: NextPageWithLayout = () => <GuideFormPage />;

AdminGuidesCreatePage.getLayout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default AdminGuidesCreatePage;
