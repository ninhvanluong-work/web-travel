import ButtonPage from 'src/modules/button-page';

export default ButtonPage;

export async function getStaticProps({ locale: _locale }: { locale: string }) {
  return {
    props: {},
  };
}
