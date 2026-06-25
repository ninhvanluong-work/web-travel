# UI & i18n Research Report

## 1. AlertBanner Component

**Location:** `src/components/ui/AlertBanner/index.tsx`

**Props Interface:**

```typescript
interface AlertBannerProps {
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  showLink?: boolean; // default: false
  linkHref?: string; // default: '#'
  linkText?: string; // default: 'Learn more'
}
```

**Auto-close Support:** No duration/auto-close prop. Component is static and must be conditionally rendered by parent.

**Usage Pattern:**

- Parent controls visibility via state
- Render inside page content, not as toast/notification overlay
- Use `showLink` to add a clickable link at bottom
- Variant determines colors (success/error/warning/info with custom dark mode support)

**Import:** `import AlertBanner from '@/components/ui/AlertBanner'`

---

## 2. i18n Configuration

**Config Location:** `next-i18next.config.js` (root)

```javascript
{
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'vi'],
  },
  localePath: path.resolve('./public/locales'),
}
```

**Locale Structure:** `public/locales/{locale}/{namespace}.json`

**Existing Namespaces:**

- `authPage.json` — sign-in, sign-up, forgot-password sections
- `common.json`
- `searchPage.json`
- `homePage.json`
- `videoDetail.json`
- `productPage.json`
- `adminPage.json`
- `guidePage.json`

**Auth Keys Already Present (en/vi):**

- `signIn.*` (10 keys: title, subtitle, labels, placeholders, buttons, links, errors)
- `signUp.*` (11 keys)
- `forgotPassword.*` (8 keys)

**Adding New Auth Keys:**

1. Add to `public/locales/en/authPage.json` and `public/locales/vi/authPage.json`
2. Use namespaced access: `useTranslation('authPage')` then `t('newKey')`
3. Organize under existing sections (signIn, signUp, forgotPassword) or create new top-level key

**Hook Usage:**

```typescript
const { t } = useTranslation('authPage');
// Then: t('signIn.title'), t('signUp.emailLabel'), etc.
```

---

## 3. Module Pattern

**Folder Structure (HomePage example):**

```
src/modules/HomePage/
  ├── index.tsx              // Main component (NextPageWithLayout export)
  └── components/
      └── SearchBox.tsx      // Reusable sub-component
```

**Export Pattern:**

- `index.tsx` is the default export (module's public interface)
- Exports `NextPageWithLayout` type component
- Sub-components in `components/` folder, imported and used in index
- Each module is a feature domain (video, search, auth, etc.)

**Integration:**

- Page (`src/pages/`) imports and re-exports from module
- Module handles all logic + UI, page is thin wrapper
- Module uses `useTranslation('moduleName')` for i18n

---

## 4. Existing Pages

**Auth Pages Already Exist:**

- `src/pages/sign-in.tsx` — maps to ROUTE.SIGN_IN ('/sign-in')
- `src/pages/sign-up.tsx` — maps to ROUTE.SIGN_UP ('/sign-up')
- `src/pages/forgot-password.tsx` — maps to ROUTE.FORGOT_PASSWORD ('/forgot-password')

**Required Structure:**

- Page file imports/re-exports module logic
- Create `src/modules/AuthPage/` or split: `SignInPage/`, `SignUpPage/`, `ForgotPasswordPage/`

---

## 5. Route Constants

**File:** `src/types/routes.ts`

**Auth Routes Already Defined:**

```typescript
ROUTE.SIGN_IN = '/sign-in';
ROUTE.SIGN_UP = '/sign-up';
ROUTE.FORGOT_PASSWORD = '/forgot-password';
```

**Route Helpers:**

```typescript
ROUTE.VIDEO_DETAIL_PATH(slug);
ROUTE.PRODUCT_DETAIL(id);
ROUTE.ADMIN_GUIDES_EDIT(id);
// etc.
```

---

## Unresolved Questions

1. Should auth pages use single `AuthPage` module with conditional rendering, or separate modules per page (SignInPage, SignUpPage, ForgotPasswordPage)?
2. Are there existing sign-in/sign-up page implementations to review, or starting from scratch?
3. Does AlertBanner need wrapping in an auto-dismissing container, or always manually controlled?
