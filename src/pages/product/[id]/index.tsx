import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import ProductPage from '@/modules/ProductPage';

const Product: NextPage = () => <ProductPage />;

export default Product;

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'productPage'])),
    },
  };
}
