import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import VideoDetailPage from '@/modules/VideoDetailPage';

export default VideoDetailPage;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'videoDetail'])),
    },
  };
}
