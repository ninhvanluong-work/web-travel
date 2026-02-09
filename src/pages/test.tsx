import TestPage from '@/modules/TestPage';

export default TestPage;

export async function getStaticProps({ locale: _locale }: { locale: string }) {
  return {
    props: {},
  };
}
