import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import HomePage from '@/modules/HomePage';

export default HomePage;

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'homePage'])),
    },
  };
}
