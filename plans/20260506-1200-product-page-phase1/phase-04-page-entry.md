# Phase 04 — Page Entry

File: `src/pages/product.tsx`

---

## Context

The existing `src/pages/product.tsx` is a placeholder (untracked, confirmed via git status). Replace it entirely with the ProductPage import.

No custom `getLayout` is needed — `MainLayout` already renders a clean phone frame with no Header or Navbar injected globally. The default layout from `_app.tsx` is correct as-is.

---

## Final file content

```typescript
import type { NextPage } from 'next';

import ProductPage from '@/modules/ProductPage';

const Product: NextPage = () => <ProductPage />;

export default Product;
```

---

## Verification checklist

- [ ] Route `/product` renders without errors
- [ ] Phone frame constraint respected (no overflow outside 430px frame)
- [ ] Scroll area scrolls independently within the frame
- [ ] CTA bar stays anchored at the bottom of the frame, not the viewport
- [ ] Hero carousel swipe works on mobile (touch drag + dot tap)
- [ ] Accordion single-expand animation is smooth
- [ ] `#reviews` anchor link in ProductHeader scrolls to ReviewsSection
- [ ] No TypeScript errors (`pnpm check-types`)
- [ ] No ESLint errors (`pnpm lint`)
