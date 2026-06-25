# Phase 03 — Staggered Animation + Micro-interactions

**Parent:** [plan.md](./plan.md)  
**Date:** 2026-06-24  
**Priority:** P1  
**Status:** pending  
**Dependencies:** Phase 01, Phase 02 complete

---

## Overview

Both auth pages currently have a single `motion.div` wrapper. Upgrade to staggered entrance (5.1) per form element and add micro-interactions (5.3).

---

## Key Insights

- Framer Motion already installed and used in the project
- Current animation: single `motion.div` with `{ opacity: 0, y: 12 } → { opacity: 1, y: 0 }`
- Target 5.1: each form element animates in with `0.05s` stagger delay, spring physics
- Target 5.3:
  - **Error shake**: horizontal shake on input when field has error
  - **Magnetic button**: `scale: 1.02` on hover, `scale: 0.97` on tap
  - **Liquid loading**: Button already has `loading` prop that shows spinner — Button component handles this; just confirm text fades correctly (likely already works)
- Animation shared logic → create `src/modules/auth-shared/animations.ts` with reusable variants

---

## Related Code Files

- `src/modules/SignInPage/index.tsx`
- `src/modules/SignUpPage/index.tsx`
- `src/modules/auth-shared/animations.ts` ← new file

---

## Implementation Steps

### Step 1 — Create `src/modules/auth-shared/animations.ts`

```typescript
export const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

export const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export const shakeVariants = {
  shake: {
    x: [0, -8, 8, -8, 8, -4, 4, 0],
    transition: { duration: 0.3 },
  },
};
```

### Step 2 — Apply staggered entrance to both pages

Replace single `motion.div` wrapper with:

```tsx
<motion.div variants={containerVariants} initial="hidden" animate="visible" className="px-[30px] pb-10">
  <motion.div variants={itemVariants}>{/* title block */}</motion.div>
  <motion.div variants={itemVariants}>{/* email field */}</motion.div>
  <motion.div variants={itemVariants}>{/* password field */}</motion.div>
  {/* etc. */}
</motion.div>
```

### Step 3 — Error shake on inputs

Wrap each Input in `motion.div` with `animate` triggered when `errors.fieldName` exists:

```tsx
<motion.div
  animate={errors.email ? 'shake' : ''}
  variants={shakeVariants}
>
  <Input ... />
</motion.div>
```

### Step 4 — Magnetic button

Wrap the submit Button in `motion.div`:

```tsx
<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
  <Button ... />
</motion.div>
```

Note: Button already handles loading/spinner state via `loading` prop — liquid loading is already covered.

---

## Todo

- [ ] Create `src/modules/auth-shared/animations.ts`
- [ ] Apply staggered container/item variants to SignInPage
- [ ] Apply staggered container/item variants to SignUpPage
- [ ] Add error shake to email + password inputs (both pages)
- [ ] Add magnetic scale to submit button (both pages)
- [ ] Verify liquid loading already works via Button `loading` prop

---

## Success Criteria

- Form elements appear sequentially with spring animation on page load
- Input shakes horizontally on validation error
- Submit button scales on hover/tap
- Loading spinner appears smoothly when submitting
