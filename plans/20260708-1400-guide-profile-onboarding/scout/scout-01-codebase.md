# Scout Report: GuideProfilePage Onboarding Readiness

## 1. Tutorial Library Status

**driver.js / react-joyride installed?** NO

Existing animation libs available:

- `framer-motion` v10.15.0
- `animate.css` v4.1.1

Must install driver.js or react-joyride before implementation.

## 2. Component File Paths

| Component         | Path                                                             |
| ----------------- | ---------------------------------------------------------------- |
| Page root         | `src/modules/GuideProfilePage/index.tsx`                         |
| HeroBanner        | `src/modules/GuideProfilePage/components/hero-banner.tsx`        |
| ActionBar         | `src/modules/GuideProfilePage/components/action-bar.tsx`         |
| StorytellingBlock | `src/modules/GuideProfilePage/components/storytelling-block.tsx` |
| StatsBlock        | `src/modules/GuideProfilePage/components/stats-block.tsx`        |
| MomentsGrid       | `src/modules/GuideProfilePage/components/moments-grid.tsx`       |

32 total components in the directory (edit flows, sheets, rating, etc.)

## 3. Data Loading State

YES — isLoading is handled:

```tsx
const { data, isLoading } = useGuideProfile(id);
if (isLoading) return <GuideProfileSkeleton />;
if (!data) return null;
```

Tutorial must only start after `isLoading === false`. Safe to add guard.

## 4. ActionBar Current Buttons (in order)

1. "Book Tour [Name]" — black primary CTA (flex-1)
2. Conditional (isOwner):
   - Owner → Edit Profile (pencil icon) → EditProfileSheet
   - Visitor → Rate (star icon) → RatingSheet (auth-gated)
3. QR button (icon) → QrSheet
4. Share button (icon) → native share / clipboard

All use `motion.button` with `scale: 0.96` tap animation.

## 5. Zustand Stores

| Store             | File                                             |
| ----------------- | ------------------------------------------------ |
| UserStore         | `src/stores/UserStore.ts` (persisted, selectors) |
| VideoListStore    | `src/stores/VideoListStore.ts`                   |
| IntersectionStore | `src/stores/IntersectionStore.ts`                |
| AlertStore        | `src/stores/use-alert-store.ts`                  |

Selector pattern: `useUserStore.use.user()`, `useUserStore.use.accessToken()`

## 6. Owner Detection

```tsx
const isOwner = user?.role === 'tour_guide' && user?.tourGuideId === id;
```

Tutorial should only auto-trigger for owner (`isOwner === true`).

## 7. Key Insights

- Page already has clear section hierarchy matching tutorial steps
- All components wrapped in `motion.div` with `fadeUp` — tutorial starts after animations
- isOwner flag available to guard tutorial trigger
- ActionBar is good candidate for "?" replay button (add after Share button)

## Unresolved

- Need to check exact props/className structure of each component to know where to add IDs
