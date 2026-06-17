import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import DetailSearchPage from '@/modules/DetailSearchPage';

export default DetailSearchPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'searchPage'])),
    },
  };
}
