import { useTranslation } from 'next-i18next';

import { type Paths } from '@/types/util.types';

import type adminPage from '../../public/locales/en/adminPage.json';
import type common from '../../public/locales/en/common.json';
import type guidePage from '../../public/locales/en/guidePage.json';
import type homePage from '../../public/locales/en/homePage.json';
import type productPage from '../../public/locales/en/productPage.json';
import type searchPage from '../../public/locales/en/searchPage.json';
import type videoDetail from '../../public/locales/en/videoDetail.json';

export type TranslationType = {
  common: typeof common;
  guidePage: typeof guidePage;
  homePage: typeof homePage;
  searchPage: typeof searchPage;
  adminPage: typeof adminPage;
  videoDetail: typeof videoDetail;
  productPage: typeof productPage;
};

export type TranslationKeys = Paths<TranslationType> | string;
export type TFunctionType = (s: TranslationKeys, p?: any) => string;

export const useTypeSafeTranslation = (): {
  t: TFunctionType;
  i18n: any;
  ready: boolean;
} => {
  const { t, i18n, ready } = useTranslation();

  return {
    t: (s: TranslationKeys, p?: any) => t(s, p) as string,
    i18n,
    ready,
  };
};
