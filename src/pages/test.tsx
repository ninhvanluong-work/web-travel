import TestPage from '@/modules/TestPage';

export default TestPage;

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {},
  };
}
