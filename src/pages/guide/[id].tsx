import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import GuideProfilePage from '@/modules/GuideProfilePage';

const GuidePage: NextPage = () => <GuideProfilePage />;

export default GuidePage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'guidePage'])),
    },
  };
}
