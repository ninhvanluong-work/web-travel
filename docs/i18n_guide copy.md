# Hướng dẫn Tổ chức Đa ngôn ngữ (i18n) — Next.js với `next-i18next`

> Tài liệu này trích xuất **code thực tế** từ dự án **nest-ecom-fe** để mô tả đầy đủ cách tổ chức i18n từ config → file JSON → component → page.

---

## 1. Tech Stack & Cài đặt

| Thư viện        | Phiên bản  |
| --------------- | ---------- |
| `next-i18next`  | `^15.2.0`  |
| `i18next`       | `^23.10.1` |
| `react-i18next` | `^14.1.0`  |

```bash
pnpm add next-i18next i18next react-i18next
```

---

## 2. File Cấu hình

### `next-i18next.config.js` (root)

```js
/** @type {import('next-i18next').UserConfig} */
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'vi'],
  },
};
```

### `next.config.js`

```js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});
const path = require('path');
const withReactSvg = require('next-react-svg')({ include: path.resolve(__dirname, 'src/assets/svg') });
const { i18n } = require('./next-i18next.config'); // ← Import config i18n

const nextConfig = {
  swcMinify: true,
  images: {
    domains: [],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 1800,
  },
  i18n, // ← Truyền vào nextConfig
  webpack(config, { isServer }) {
    config.module.rules.push({
      test: /\.(ogg|mp3|wav|mpe?g)$/i,
      exclude: config.exclude,
      use: [
        {
          loader: require.resolve('url-loader'),
          options: {
            limit: config.inlineImageLimit,
            fallback: require.resolve('file-loader'),
            publicPath: `${config.assetPrefix}/_next/static/images/`,
            outputPath: `${isServer ? '../' : ''}static/images/`,
            name: '[name]-[hash].[ext]',
            esModule: config.esModule || false,
          },
        },
      ],
    });

    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

const KEYS_TO_OMIT = [
  'webpackDevMiddleware',
  'configOrigin',
  'target',
  'analyticsId',
  'webpack5',
  'amp',
  'assetPrefix',
];

module.exports = (_phase, { defaultConfig }) => {
  const plugins = [
    [withBundleAnalyzer, {}],
    [withReactSvg, {}],
  ];

  const wConfig = plugins.reduce((acc, [plugin, config]) => plugin({ ...acc, ...config }), {
    ...defaultConfig,
    ...nextConfig,
  });

  const finalConfig = {};
  Object.keys(wConfig).forEach((key) => {
    if (!KEYS_TO_OMIT.includes(key)) {
      finalConfig[key] = wConfig[key];
    }
  });

  return finalConfig;
};
```

### `src/pages/_app.tsx` — Kích hoạt i18n cho toàn App

Đây là bước **bắt buộc và quan trọng nhất**. Wrap toàn bộ app bằng `appWithTranslation` để i18n context hoạt động ở mọi component.

```tsx
import '@/styles/globals.css';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import { appWithTranslation } from 'next-i18next'; // ← Import HOC
import type { ReactNode } from 'react';

import { MainLayout, ModuleLayout } from '@/components/layouts';
import { siteConfig } from '@/config/site';
import Provider from '@/lib/Provider';
import type { NextPageWithLayout } from '@/types';

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

dayjs.extend(relativeTime);

const MyApp = (props: AppPropsWithLayout) => {
  const { Component, pageProps } = props;

  // Cho phép từng page tự định nghĩa layout riêng, mặc định dùng MainLayout
  const getLayout = Component.getLayout ?? ((page: ReactNode) => <MainLayout>{page}</MainLayout>);

  return (
    <>
      <Head>
        <title>{siteConfig.name}</title>
        <meta property="og:description" content={siteConfig.description} />
        <meta property="og:url" content={siteConfig.url} />
        <meta property="og:site_name" content={siteConfig.name} />
        <meta property="og:type" content="website" />
      </Head>
      <div>
        <Provider>
          <ModuleLayout>{getLayout(<Component {...pageProps} />)}</ModuleLayout>
        </Provider>
      </div>
    </>
  );
};

// ↓ Wrap app bằng appWithTranslation — PHẢI có dòng này để i18n hoạt động
export default appWithTranslation(MyApp);
```

> **Lưu ý:** `appWithTranslation` sẽ tự đọc `next-i18next.config.js` ở root và inject i18n context vào toàn bộ component tree. Nếu thiếu dòng này, `useTranslation()` sẽ không trả về đúng ngôn ngữ.

**Luồng kết nối:**

```
next-i18next.config.js         ← Khai báo locales & defaultLocale
       ↓
next.config.js { i18n }        ← Next.js nhận biết routing theo locale (/vi/login)
       ↓
_app.tsx appWithTranslation()  ← Inject i18n context vào toàn app
       ↓
pages/*.tsx serverSideTranslations() ← Load đúng file JSON theo locale + namespace
       ↓
components useTranslation()    ← Đọc từ context, trả về chuỗi đã dịch
```

---

## 3. Cấu trúc Thư mục Locale

```
public/
└── locales/
    ├── en/
    │   ├── common.json
    │   ├── auth.json
    │   ├── loginPage.json
    │   ├── registerPage.json
    │   ├── forgotPasswordPage.json
    │   ├── product.json
    │   ├── homePage.json
    │   ├── crumbs.json
    │   └── default.json
    └── vi/
        ├── common.json          ← Mirror đầy đủ cấu trúc của en/
        ├── auth.json
        ├── loginPage.json
        └── ...
```

---

## 4. Nội dung File JSON Locale (Code Thực Tế)

### `public/locales/en/common.json`

```json
{
  "categories": {
    "1": { "name": "All Categories" },
    "2": { "name": "Milks and Dairies" },
    "4": { "name": "Pet Foods & Toy" }
  },
  "createHere": "Create here",
  "header": {
    "account": "Account",
    "cart": "Cart",
    "compare": "Compare",
    "withList": "With List"
  },
  "hotDeals": "Hot Deals",
  "navigation": {
    "home": "Home,Home 1&Home 2&Home 3",
    "food": "Food,Food 1&Food 2&Food 3",
    "vegetables": "Vegetables,Vegetables 1&Vegetables 2&Vegetables 3",
    "drink": "Drink,",
    "cookies": "Cookies,",
    "meatSeafood": "Meat & Seafood,",
    "bakery": "Bakery,"
  },
  "browseAllCategories": "Browse All Categories",
  "browCategories": {
    "milksAndDairies": "Milks and Dairies",
    "winesAndDrinks": "Wines and Drinks",
    "clothingAndBeauty": "Clothing and Beauty",
    "freshSeafood": "Fresh Seafood",
    "petFoodsAndToys": "Pet Foods and Toy",
    "fastFoods": "Fast Foods",
    "bakingMaterial": "Baking Material",
    "vegetables": "Vegetables",
    "freshFruits": "Fresh Fruits",
    "breadAndJuice": "Bread and Juice"
  },
  "supportCenter": "24/7 Support Center",
  "footer": {
    "title": "Awesome grocery store website template",
    "siteInformation": {
      "address": "Address:",
      "callUs": "Call Us:",
      "email": "Email:",
      "hours": "Hours:"
    },
    "footerAction": {
      "company": "Company",
      "aboutUs": "About Us",
      "deliveryInformation": "Delivery Information",
      "privacyPolicy": "Privacy Policy",
      "termsAndConditions": "Terms & Conditions",
      "contactUs": "Contact Us",
      "supportCenter": "Support Center",
      "careers": "Careers",
      "account": "Account",
      "signIn": "Sign In",
      "viewCart": "View Cart",
      "myWishlist": "My Wishlist",
      "tractMyOrder": "Track My Order",
      "helpTickets": "Help Tickets",
      "shippingDetails": "Shipping Details",
      "compareProduct": "Compare Product",
      "information": "Information",
      "searchTerms": "Search Terms",
      "advancedSearch": "Advanced Search",
      "helpsAndFAQs": "Helps & FAQs",
      "storeLocations": "Store Locations",
      "ordersAndReturns": "Orders & Returns",
      "feedBackForUs": "FeedBack For Us",
      "appAndPayment": "App & Payment",
      "installNetMartFromAppStoreOrGooglePlay": "Install NetMart from App Store or Google Play",
      "securedPayment": "Secured Payment Gateways",
      "compareProducts": "Compare Products"
    }
  },
  "helloWorld": "Hello World",
  "invalidEmail": "This is not a valid Email",
  "learnMore": "Learn more",
  "or": "or",
  "required": "Required",
  "searchForItem": "Search for items...",
  "stringMustContain": "String must contain at least {{value}} character(s)",
  "termsAndConditions": "I agree to terms & Policy.",
  "add": "Add",
  "sale": "Sale",
  "subscribe": "Subscribe",
  "emailAddress": "Your address email"
}
```

### `public/locales/vi/common.json`

```json
{
  "categories": {
    "1": { "name": "Tất cả danh mục" },
    "2": { "name": "Danh mục 1" },
    "4": { "name": "Danh mục 2" }
  },
  "createHere": "Tạo ở đây",
  "header": {
    "account": "Tài Khoản",
    "cart": "Giỏ Hàng",
    "compare": "So sánh",
    "withList": "Danh sách yêu thích"
  },
  "helloWorld": "Chào thế giới",
  "invalidEmail": "Đây không phải là một Email hợp lệ",
  "hotDeals": "Ưu đãi lớn",
  "navigation": {
    "home": "Trang Chủ,Trang Chủ 1&Trang Chủ 2&Trang Chủ 3",
    "food": "Đồ ăn,Đồ ăn 1&Đồ ăn 2&Đồ ăn 3",
    "vegetables": "Rau,Rau 1&Rau 2&Rau 3",
    "drink": "Đồ uống,",
    "cookies": "Bánh quy,",
    "meatSeafood": "Thịt và hải sản,",
    "bakery": "Bánh,"
  },
  "browseAllCategories": "Duyệt tất cả danh mục",
  "browCategories": {
    "milksAndDairies": "Sữa và sản phẩm từ sữa",
    "winesAndDrinks": "Rượu và Đồ uống",
    "clothingAndBeauty": "Quần áo và Làm đẹp",
    "freshSeafood": "Hải sản tươi Sống",
    "petFoodsAndToys": "thức ăn và đồ chơi cho thú cưng",
    "fastFoods": "đồ ăn nhanh",
    "bakingMaterial": "Nguyên liệu làm bánh",
    "vegetables": "rau củ",
    "freshFruits": "Hoa quả tươi",
    "breadAndJuice": "Bánh mì và nước ép"
  },
  "supportCenter": "24/7 Trung tâm hỗ trợ",
  "footer": {
    "title": "Mẫu website cửa hàng tạp hóa ấn tượng",
    "siteInformation": {
      "address": "Địa chỉ:",
      "callUs": "Gọi cho chúng tôi:",
      "email": "E-mail:",
      "hours": "Giờ:"
    },
    "footerAction": {
      "company": "Công ty",
      "aboutUs": "Về chúng tôi",
      "deliveryInformation": "Thông tin giao hàng",
      "privacyPolicy": "Chính sách bảo mật",
      "termsAndConditions": "Điều khoản và điều kiện",
      "contactUs": "Liên hệ với chúng tôi",
      "supportCenter": "Trung tâm hỗ trợ",
      "careers": "Cơ hội nghề nghiệp",
      "account": "Tài khoản",
      "signIn": "Đăng nhập",
      "viewCart": "Xem giỏ hàng",
      "myWishlist": "Danh sách mong muốn của tôi",
      "tractMyOrder": "Theo dõi đơn hàng của tôi",
      "helpTickets": "Phiếu trợ giúp",
      "shippingDetails": "Chi tiết vận chuyển",
      "compareProducts": "So sánh sản phẩm",
      "information": "Thông tin",
      "searchTerms": "Các điều khoản tìm kiếm",
      "advancedSearch": "Tìm kiếm nâng cao",
      "helpsAndFAQs": "Trợ giúp & Câu hỏi thường gặp",
      "storeLocations": "Các cửa hàng",
      "ordersAndReturns": "Đơn đặt hàng & Trả hàng",
      "feedBackForUs": "Phản hồi cho chúng tôi",
      "appAndPayment": "Ứng dụng & Thanh toán",
      "installNetMartFromAppStoreOrGooglePlay": "Cài đặt NetMart từ App Store hoặc Google Play",
      "securedPayment": "Cổng thanh toán bảo mật"
    }
  },
  "searchForItem": "Tìm kiếm sản phẩm...",
  "stringMustContain": "Chuỗi phải chứa ít nhất {{value}} ký tự",
  "learnMore": "Tìm hiểu thêm",
  "or": "hoặc",
  "required": "Yêu cầu",
  "termsAndConditions": "Tôi đồng ý với các điều khoản & Chính sách.",
  "username": "tên tài khoản",
  "subscribe": "Ghi danh",
  "emailAddress": "Địa chỉ email của bạn",
  "add": "Thêm",
  "sale": "Giảm Giá"
}
```

### `public/locales/en/loginPage.json`

```json
{
  "continueWithApple": "Continue with Apple",
  "continueWithFacebook": "Continue with Facebook",
  "continueWithGoogle": "Continue with Google",
  "dontHaveAnAccount": "Don't have an account?",
  "forgotPassword": "Forgot password",
  "login": "Login",
  "password": "Password",
  "rememberMe": "Remember me",
  "securityCode": "Security code",
  "usernameOrEmail": "Username or Email"
}
```

### `public/locales/vi/loginPage.json`

```json
{
  "continueWithApple": "Tiếp tục với Apple",
  "continueWithFacebook": "Tiếp tục với Facebook",
  "continueWithGoogle": "Tiếp tục với Google",
  "dontHaveAnAccount": "Bạn chưa có tài khoản?",
  "forgotPassword": "Quên mật khẩu",
  "login": "Đăng nhập",
  "password": "Mật khẩu",
  "rememberMe": "nhớ tôi",
  "securityCode": "Mã bảo mật",
  "usernameOrEmail": "Tên người dùng hoặc email"
}
```

### `public/locales/en/auth.json`

```json
{
  "loginPage": {
    "login": "login",
    "continueWithApple": "Continue with Apple",
    "continueWithFacebook": "Continue with Facebook",
    "continueWithGoogle": "Continue with Google",
    "dontHaveAnAccount": "Don't have an account?"
  },
  "registerPage": {
    "createAnAccount": "Create an account",
    "policyDescription": "Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes escribed in our privacy policy",
    "register": "Register"
  },
  "forgotPasswordPage": {
    "dontWorryForPassword": "Not to worry, we got you! Let's get you a new password. Please enter your email address or your Username",
    "forgotYourPassword": "Forgot your password"
  },
  "resetPasswordPage": {
    "setNewPassword": "Set new password",
    "newPassRule": "Please create a new password that you don't use on any other site."
  },
  "confirmPassword": "Confirm Password",
  "resetPassword": "Reset password",
  "submit": "Submit",
  "forgotPassword": "Forgot password",
  "password": "Password",
  "rememberMe": "Remember me",
  "securityCode": "Security code",
  "usernameOrEmail": "Username or Email"
}
```

### `public/locales/en/product.json`

```json
{
  "description": "Description",
  "additionalInfo": "Additional info",
  "reviews": "Reviews",
  "relatedProducts": "Related products",
  "filterItems": "Filter items",
  "popularItems": "Popular Items",
  "popularTags": "Popular Tags",
  "packagingDelivery": "Packaging & Delivery",
  "suggestedUse": "Suggested Use",
  "otherIngredients": "Other Ingredients",
  "warnings": "Warnings",
  "addToCart": "Add To Cart",
  "filter": "Filter",
  "shopNow": "Shop Now"
}
```

### `public/locales/en/homePage.json`

```json
{
  "slideBar": {
    "slideOne": {
      "title": "Don't miss amazing <br /> grocery deals",
      "title2": "Sign up for the daily newsletter"
    },
    "slideTwo": {
      "title": "Fresh vegetables <br /> Big discount",
      "title2": "Save up to 50% off on your first order"
    }
  },
  "banner": {
    "title": "Everyday Fresh & Clean with Our Products",
    "title2": "Make your Breakfast Healthy and Easy",
    "title3": "The best Organic Products Online",
    "shopNow": "Shop Now"
  }
}
```

### `public/locales/en/crumbs.json`

```json
{
  "home": "Home",
  "login": "Login",
  "vegetablesTubers": "Vegetables & tubers"
}
```

### `public/locales/en/registerPage.json`

```json
{
  "confirmPassword": "Confirm Password",
  "createAnAccount": "Create an account",
  "policyDescription": "Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes escribed in our privacy policy",
  "register": "Register",
  "submit": "Submit"
}
```

---

## 5. Tải Namespace ở Server-Side (Page Files)

### `src/pages/index.tsx`

```tsx
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import LandingPage from '@/modules/LandingPage';

export default LandingPage;

// Dùng getStaticProps hoặc getServerSideProps đều được
export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'homePage'])),
    },
  };
}
```

### `src/pages/login.tsx`

```tsx
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import LoginPage from '@/modules/LoginPage';

export default LoginPage;

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['loginPage', 'common', 'crumbs'])),
    },
  };
}
```

### `src/pages/forgot-password.tsx`

```tsx
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import ForgotPasswordPage from '@/modules/ForgotPasswordPage';

export default ForgotPasswordPage;

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'forgotPasswordPage', 'loginPage'])),
    },
  };
}
```

### `src/pages/products/index.tsx`

```tsx
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import AllProduct from '@/modules/ProductsPage';
import { PRODUCT_LIST_1 } from '@/modules/ProductsPage/data';

export async function getStaticProps({ locale }: { locale: string }) {
  const products = PRODUCT_LIST_1;
  return {
    props: {
      products,
      ...(await serverSideTranslations(locale, ['common', 'product', 'crumbs'])),
    },
  };
}

export default AllProduct;
```

### `src/pages/reset-password.tsx`

```tsx
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common', 'auth'])),
    },
  };
}
```

> **Quy tắc:** Luôn bao gồm `'common'` vì Header/Footer cần nó. Chỉ thêm namespace của trang cụ thể để tránh tải thừa.

---

## 6. Sử dụng trong Component (Code Thực Tế)

### `src/components/layouts/MainLayout/Header/HeaderAction.tsx`

Pattern: chỉ định namespace khi gọi `useTranslation`, dùng key dạng `"section.key"`.

```tsx
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import React, { useMemo } from 'react';

import { Icons } from '@/assets/icons';
import { Label } from '@/components/ui/label';
import { ROUTE } from '@/types';

const headerAction = [
  {
    name: 'account',
    href: ROUTE.PAGE_ACCOUNT,
    label: 'Account',
    icon: <Icons.account className="h-5" />,
    isMobile: false,
    count: <div></div>,
  },
  {
    name: 'compare',
    href: ROUTE.PAGE_COMPARE,
    label: 'Compare',
    icon: <Icons.compare className="h-5" />,
    isMobile: false,
    count: <div></div>,
  },
  {
    name: 'withList',
    href: ROUTE.WISH_LIST,
    label: 'Wishlist',
    icon: (
      <div className="relative">
        <Icons.heart className="h-6" />
        <div className="w-5 h-5 bg-green rounded-full absolute right-[-0.5625rem] top-[-0.5625rem]">
          <Label className="text-neutral-0 font-lato font-normal flex justify-center items-center">5</Label>
        </div>
      </div>
    ),
    isMobile: true,
  },
  {
    name: 'cart',
    href: ROUTE.CART,
    label: 'Cart',
    icon: (
      <div className="relative">
        <Icons.shoppingCart className="h-6" />
        <div className="w-5 h-5 bg-green rounded-full absolute right-[-0.5625rem] top-[-0.5625rem]">
          <Label className="text-neutral-0 font-lato font-normal flex justify-center items-center">6</Label>
        </div>
      </div>
    ),
    isMobile: true,
  },
];

interface ActionHeaderProp {
  isMobile: boolean;
}

const ActionHeader = ({ isMobile }: ActionHeaderProp) => {
  const { t } = useTranslation('common'); // ← chỉ định namespace 'common'

  const getDateActionHeader = useMemo(
    () => (isMobile ? headerAction.filter((item) => item.isMobile) : headerAction),
    [isMobile]
  );

  return (
    <div className="flex flex-1 items-center justify-end mt-[0.6875rem] lg:flex-none">
      {getDateActionHeader.map((item, index) => (
        <div key={index}>
          <Link href={item.href} className="flex flex-row justify-end ml-4 2xl:ml-5">
            {item.icon}
            <Label className="lg:block ml-[.1875rem] font-normal font-quicksand text-body-text text-xs leading-6 whitespace-nowrap hidden">
              {t(`header.${item.name}`)} {/* → t('header.account'), t('header.cart')... */}
            </Label>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ActionHeader;
```

### `src/components/layouts/MainLayout/Header/SearchBox.tsx`

Pattern: dịch tên category động bằng key được build từ data.

```tsx
import { useTranslation } from 'next-i18next';
import React, { useMemo, useState } from 'react';

import { Icons } from '@/assets/icons';
import { Input, inputVariants } from '@/components/ui/input';
import { cn } from '@/lib/utils';

import SelectSearchCategories from './SelectSearchCategories';

export interface IsearchCategory {
  id: string;
  name: string;
}

interface SearchBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  searchCategories: IsearchCategory[];
  isScroll?: boolean;
}

const SearchBox = ({ searchCategories, className, isScroll }: SearchBoxProps) => {
  const { t } = useTranslation('common');

  // Dịch tên category động bằng key pattern "categories.{id}.name"
  const translatedCategories = useMemo(
    () =>
      searchCategories.map((category) => ({
        id: category.id,
        name: t(`categories.${category.id}.name`),
      })),
    [searchCategories, t]
  );

  const [currentValue, setCurrentValue] = useState(t(translatedCategories[0].id));

  const handleValueChange = (selectedId: string) => {
    const selectedCategory = translatedCategories.find((cat) => cat.id === selectedId);
    if (selectedCategory) {
      setCurrentValue(selectedCategory.id);
    }
  };

  return (
    <div
      className={cn(
        'z-50 2xl:max-w-[43.75rem] w-full justify-start items-center border-textColor-primary-sm border-2 focus-visible:border-textColor-primary-sm border-solid rounded-[.3125rem]',
        className
      )}
    >
      <SelectSearchCategories
        value={t(`categories.${currentValue}.name`)}
        placeholder={translatedCategories[0].name}
        data={translatedCategories}
        readOnly
        onValueChange={handleValueChange}
        isScroll={isScroll}
        className="focus:outline-none focus:border-none pl-[1.375rem] border-none text-sm"
      />
      <span className="mr-[.8869rem] ml-[0.24125rem] text-silver">|</span>
      <div className="w-full">
        <Input
          id="nestMart"
          type="search"
          placeholder={t('searchForItem')}  {/* → "Search for items..." / "Tìm kiếm sản phẩm..." */}
          suffix={<Icons.search className="mr-[0.9375rem] w-5 h-5" />}
          className={cn(inputVariants({ size: 'search', 'color-ct': 'search', border: 'search' }))}
        />
      </div>
    </div>
  );
};

export default SearchBox;
```

### `src/modules/LoginPage/index.tsx`

Pattern: không chỉ định namespace trong hook, dùng cú pháp `"namespace:key"` trực tiếp trong `t()`.

```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { useForm } from 'react-hook-form';

import { Icons } from '@/assets/icons';
import Breadcrumb from '@/components/Breadcrumb';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormWrapper } from '@/components/ui/form';
import { TextField } from '@/components/ui/FormField';
import { VStack } from '@/components/ui/Utilities';
import { loginSchema } from '@/lib/validations/auth';
import { type NextPageWithLayout, ROUTE } from '@/types';

const LoginPage: NextPageWithLayout = () => {
  const { t } = useTranslation(); // ← Không chỉ định namespace → dùng prefix "namespace:"

  const form = useForm({
    mode: 'onBlur',
    defaultValues: { email: '', password: '', code: '' },
    criteriaMode: 'firstError',
    resolver: zodResolver(loginSchema),
  });

  const error = form.formState.errors;

  return (
    <>
      <Breadcrumb
        childrenCrumbs={[
          { link: ROUTE.HOME, title: 'home' },
          { link: ROUTE.SIGN_IN, title: 'login' },
        ]}
        className="border border-neutral-5 w-full"
      />
      <div className={'container lg:flex pt-[9.375rem] pb-[9.375rem]'}>
        <div className={'hidden lg:block md:basis-1/2'}>
          <Image
            src="/images/cover-login.png"
            alt="Do not care about me :)"
            width={1195}
            height={800}
            className={'w-[29.96875rem] rounded-xl float-right mr-10'}
          />
        </div>
        <div className={'md:basis-1/2 w-full md:max-w-[29.9375rem]'}>
          <div className={'mx-6 md:mx-0 mb-[2.4375rem]'}>
            <h1 className={'text-h1 text-darkblue font-bold mb-[0.428125rem]'}>
              {t('loginPage:login')} {/* → "Login" / "Đăng nhập" */}
            </h1>
            <p className={'text-base font-medium text-silver'}>
              {t('loginPage:dontHaveAnAccount')} {/* → "Don't have an account?" */}
              <Link href={ROUTE.SIGN_UP} className={'ml-1 text-primary font-bold'}>
                {t('common:createHere')} {/* → "Create here" */}
              </Link>
            </p>
          </div>
          <FormWrapper form={form} onSubmit={console.log} className={'mx-6 md:mx-0'}>
            <VStack spacing={32}>
              <TextField
                control={form.control}
                name={'email'}
                size={'lg'}
                placeholder={`${t('loginPage:usernameOrEmail')}*`}
                error={error.email}
              />
              <TextField
                control={form.control}
                name={'password'}
                type={'password'}
                size={'lg'}
                placeholder={`${t('loginPage:password')}*`}
                error={error.password}
              />
              <div className={'flex justify-between w-full'}>
                <TextField
                  control={form.control}
                  name={'code'}
                  size={'lg'}
                  placeholder={`${t('loginPage:securityCode')}*`}
                  error={error.code}
                />
                <span className={'bg-otp inline-block pr-[2.5rem] pl-[2.5rem] leading-[4rem] rounded-md'}>
                  <b className={'text-2xl'}>8</b>
                  <b className={'text-2xl text-red-400'}>8</b>
                  <b className={'text-2xl text-yellow-400'}>8</b>
                  <b className={'text-2xl text-primary'}>8</b>
                </span>
              </div>
              <div className={'flex justify-between mt-1.5 min-h-8'}>
                <Checkbox
                  className={'rounded-sm border-primary border-2 h-[1.125rem] w-[1.125rem]'}
                  label={t('loginPage:rememberMe')}
                  labelClassName={'ms-[0.5625rem] leading-5 font-medium text-primary'}
                />
                <Link className={'font-bold text-silver hover:text-primary'} href={ROUTE.FORGOT_PASSWORD}>
                  {`${t('loginPage:forgotPassword')}?`}
                </Link>
              </div>
              <div className={'my-0 mx-auto'}>
                <Button
                  type={'submit'}
                  variant={'darkblue'}
                  rounded={'md'}
                  size={'lg'}
                  className={'font-bold w-32 inline-block'}
                >
                  {t('loginPage:login')}
                </Button>
              </div>
              <div className="flex items-center justify-center w-full">
                <hr className="w-64 h-px my-2 bg-gray-400 border-0" />
                <span className="absolute px-3 font-bold bg-white">{t('common:or')}</span>
              </div>
              <div className={'grid grid-rows-3 gap-4 justify-center'}>
                <Button
                  variant={'blue'}
                  rounded={'md'}
                  size={'lg'}
                  className={'shadow-lg justify-normal rounded-[0.9375rem] min-w-60'}
                >
                  <Icons.facebook className={'ml-6'} />
                  <p className={'ml-2 font-bold'}>{t('loginPage:continueWithFacebook')}</p>
                </Button>
                <Button
                  variant={'shadow'}
                  rounded={'md'}
                  size={'lg'}
                  className={'shadow-md justify-normal rounded-[0.9375rem]'}
                >
                  <Icons.google className={'ml-6'} />
                  <p className={'ml-2 font-bold'}>{t('loginPage:continueWithGoogle')}</p>
                </Button>
                <Button
                  rounded={'md'}
                  size={'lg'}
                  className={'shadow-md justify-normal rounded-[0.9375rem] bg-black hover:bg-black/85'}
                >
                  <Icons.apple className={'ml-6'} />
                  <p className={'ml-2 font-bold'}>{t('loginPage:continueWithApple')}</p>
                </Button>
              </div>
            </VStack>
          </FormWrapper>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
```

### `src/components/ui/form.tsx` — FormMessage

Pattern: dùng i18n để dịch error message từ validation.

```tsx
const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { t } = useTranslation(); // ← Dùng trong shared component
    const { error, formMessageId } = useFormField();
    const body = error ? String(error?.message) : children;

    if (!body) return null;

    return (
      <p
        ref={ref}
        id={formMessageId}
        className={cn('absolute text-destructive text-sm font-medium', className)}
        {...props}
      >
        {typeof body === 'string' ? t(body) : body}
        {/* ↑ Khi body là string key (vd: "common:required"), t() sẽ dịch tự động */}
      </p>
    );
  }
);
```

---

## 7. Type-Safe Translation Hook (TypeScript)

### `src/types/util.types.ts`

Utility type sinh ra union của tất cả path hợp lệ dạng `"namespace:key"`.

```ts
type Join<S1, S2> = S1 extends string ? (S2 extends string ? `${S1}:${S2}` : never) : never;

export type Paths<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? Join<K, Paths<T[K]>> : K;
}[keyof T];
```

### `src/hooks/useTypeSafeTranslation.ts`

```ts
// Import kiểu từ file JSON của locale mặc định (en/)
import type auth from '@public/locales/en/auth.json';
import type translations from '@public/locales/en/common.json';
import type crumbs from '@public/locales/en/crumbs.json';
import type defaultType from '@public/locales/en/default.json';
import type forgotPasswordPage from '@public/locales/en/forgotPasswordPage.json';
import type loginPage from '@public/locales/en/loginPage.json';
import type product from '@public/locales/en/product.json';
import type registerPage from '@public/locales/en/registerPage.json';
import { useTranslation } from 'next-i18next';

import { type Paths } from '@/types/util.types';

// Map tên namespace → kiểu JSON tương ứng
export type TranslationType = {
  common: typeof translations;
  loginPage: typeof loginPage;
  default: typeof defaultType;
  registerPage: typeof registerPage;
  forgotPasswordPage: typeof forgotPasswordPage;
  product: typeof product;
  auth: typeof auth;
  crumbs: typeof crumbs;
};

// Union type của tất cả key hợp lệ
export type TranslationKeys = Paths<TranslationType> | string;
export type TFunctionType = (s: TranslationKeys, p?: any) => string;

// Hook bọc useTranslation với type-safety
export const useTypeSafeTranslation = () => {
  const { t, ...rest } = useTranslation();

  return {
    t: (s: TranslationKeys, p?: any) => t(s, p) as string,
    ...rest,
  };
};
```

> **Kết quả:** IDE tự động gợi ý đúng key khi gõ `t('...')`, báo lỗi ngay nếu sai key.

---

## 8. Tổng hợp: 2 Cách dùng `t()`

| Cách                                 | Khi nào dùng                   | Ví dụ                                                                       |
| ------------------------------------ | ------------------------------ | --------------------------------------------------------------------------- |
| `useTranslation('namespace')`        | Component chỉ dùng 1 namespace | `const { t } = useTranslation('common')` → `t('header.account')`            |
| `useTranslation()` (không namespace) | Component dùng nhiều namespace | `const { t } = useTranslation()` → `t('loginPage:login')`, `t('common:or')` |

---

## 9. Các Kỹ thuật Dịch Nâng Cao & Custom Translation

Trong thực tế phát triển dự án, bạn sẽ gặp các trường hợp cần dịch HTML markup phức tạp, dịch dữ liệu động từ API/Database, hoặc truyền biến số vào chuỗi dịch. Dưới đây là cách giải quyết:

### 9.1. Dịch chuỗi chứa HTML/React Component (Sử dụng `<Trans>`)

Khi chuỗi dịch có chứa các thẻ HTML như `<br />`, `<strong>`, `<a>` hoặc các React component tùy chỉnh, hàm `t()` thông thường không thể xử lý trực tiếp. Ta cần dùng Component `<Trans>` từ `next-i18next`.

#### Ví dụ thực tế từ slide trang chủ (`SlideOne.tsx`):

```tsx
import { Trans } from 'next-i18next';

const SlideOne = () => {
  return (
    <p className="text-h1 font-bold">
      {/* Sử dụng Trans component, truyền key và map các component cần thay thế */}
      <Trans i18nKey="homePage:slideBar:slideOne:title" components={{ br: <br /> }} />
    </p>
  );
};
```

#### JSON locale tương ứng:

```json
// public/locales/en/homePage.json
{
  "slideBar": {
    "slideOne": {
      "title": "Don't miss amazing <br /> grocery deals"
    }
  }
}
```

> **Cơ chế hoạt động:** `<Trans>` sẽ tìm thẻ `<br />` (hoặc định dạng `<0></0>` đối với các phần tử lồng nhau) trong chuỗi JSON locale và thay thế nó bằng React element thực tế được định nghĩa trong prop `components`.

---

### 9.2. Dịch Dữ liệu Động từ API hoặc Database (Dynamic Translation)

Với các dữ liệu động nhận từ server (ví dụ: Tên sản phẩm, mô tả danh mục) đã được lưu sẵn các phiên bản ngôn ngữ khác nhau trong Database (như `name_en`, `name_vi`), ta có thể dịch động bằng cách lấy locale hiện tại từ Next.js Router:

```tsx
import { useRouter } from 'next/router';

interface Product {
  name_en: string;
  name_vi: string;
  price: number;
}

const ProductCard = ({ product }: { product: Product }) => {
  const { locale } = useRouter(); // Lấy locale hiện tại ('en' hoặc 'vi')

  // Chọn trường dữ liệu tương ứng với locale hiện tại
  const displayName = locale === 'vi' ? product.name_vi : product.name_en;

  return (
    <div>
      <h3>{displayName}</h3>
      <p>{product.price} USD</p>
    </div>
  );
};
```

---

### 9.3. Truyền Tham số Động (Interpolation) & Xử lý Số Nhiều (Pluralization)

#### A. Interpolation (Truyền biến số)

Khi cần hiển thị các giá trị động như số lượng, tên user bên trong câu dịch:

- **JSON locale:**

  ```json
  "stringMustContain": "String must contain at least {{value}} character(s)",
  "welcomeUser": "Welcome back, {{name}}!"
  ```

- **Component:**
  ```tsx
  t('common:stringMustContain', { value: 8 }); // -> "String must contain at least 8 character(s)"
  t('common:welcomeUser', { name: 'Khiem' }); // -> "Welcome back, Khiem!"
  ```

#### B. Pluralization (Xử lý số ít, số nhiều)

`i18next` hỗ trợ tự động nhận diện số ít/nhiều qua hậu tố `_one`, `_other` (tùy thuộc quy tắc ngôn ngữ):

- **JSON locale (en):**

  ```json
  "itemCount_one": "{{count}} item in cart",
  "itemCount_other": "{{count}} items in cart"
  ```

- **Component:**
  ```tsx
  t('common:itemCount', { count: 1 }); // -> "1 item in cart"
  t('common:itemCount', { count: 5 }); // -> "5 items in cart"
  ```

---

### 9.4. Dịch Lỗi Validation động (Zod + React Hook Form)

Để dịch các câu thông báo lỗi form, thay vì định nghĩa chuỗi text cứng trong schema, ta định nghĩa **Key dịch (translation key)** và dịch tự động ở component `FormMessage`.

#### Bước 1: Định nghĩa key i18n trong Zod Schema:

```ts
import * as z from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'common:required' }) // Truyền namespace:key
    .email({ message: 'common:invalidEmail' }),
});
```

#### Bước 2: Component hiển thị lỗi (`FormMessage.tsx`) tự động dịch:

```tsx
import { useTranslation } from 'next-i18next';
import { useFormField } from './form-context'; // hoặc hook lấy error của form

const FormMessage = () => {
  const { t } = useTranslation();
  const { error } = useFormField();
  const errorMessage = error ? String(error.message) : '';

  if (!errorMessage) return null;

  return (
    <p className="text-red-500 text-sm">
      {/* Nếu errorMessage là key "common:required", t() sẽ trả về đúng chuỗi đã dịch */}
      {t(errorMessage)}
    </p>
  );
};
```

---

## 10. Checklist Áp Dụng Cho Hệ Thống Mới

### Setup ban đầu

- [ ] Cài package: `pnpm add next-i18next i18next react-i18next`
- [ ] Tạo `next-i18next.config.js` với `defaultLocale` và `locales`
- [ ] Import `{ i18n }` vào `next.config.js` và gán vào `nextConfig`

### File JSON Locale

- [ ] Tạo `public/locales/<locale>/` cho mỗi ngôn ngữ
- [ ] Tạo `common.json` (bắt buộc — dùng cho layout chung)
- [ ] Tạo 1 file JSON riêng cho mỗi trang/module
- [ ] Đảm bảo **tất cả** locale có cùng cấu trúc key với locale mặc định

### Page Files

- [ ] Import `serverSideTranslations` từ `'next-i18next/serverSideTranslations'`
- [ ] Gọi trong `getStaticProps` hoặc `getServerSideProps`
- [ ] Luôn bao gồm `'common'` trong mảng namespace
- [ ] Chỉ load namespace mà trang đó thực sự cần

### TypeScript Type-Safety

- [ ] Tạo `Paths<T>` utility type trong `types/util.types.ts`
- [ ] Tạo `useTypeSafeTranslation` hook
- [ ] Import `type` từ file JSON của locale mặc định
- [ ] Thêm namespace mới vào `TranslationType` khi tạo file JSON mới

### Quy tắc Key

- [ ] Dùng `camelCase` cho tên key
- [ ] Nhóm key liên quan bằng nested object (`header.account`)
- [ ] Dùng `{{variable}}` cho interpolation
- [ ] Không dùng dấu chấm trong tên key cùng cấp

---

## 11. Sơ đồ Luồng Hoạt động

```
User truy cập /vi/login
       ↓
Next.js đọc locale từ URL → "vi"
       ↓
getStaticProps({ locale: 'vi' })
       ↓
serverSideTranslations('vi', ['loginPage', 'common', 'crumbs'])
       ↓
Load file:
  public/locales/vi/loginPage.json  →  { "login": "Đăng nhập", ... }
  public/locales/vi/common.json     →  { "header": { "account": "Tài Khoản" }, ... }
  public/locales/vi/crumbs.json     →  { "home": "Trang chủ", ... }
       ↓
Truyền vào props → i18n Context
       ↓
Component: useTranslation() hoặc useTranslation('common')
       ↓
t('loginPage:login')    → "Đăng nhập"
t('common:header.cart') → "Giỏ Hàng"
t('crumbs:home')        → "Trang chủ"
```
