# Phase 04 — Tour Guide FAB

**Parent:** [plan.md](./plan.md)  
**Date:** 2026-06-24  
**Priority:** P1  
**Status:** pending  
**Dependencies:** Phase 01 complete (user.role from IUser)

---

## Overview

Add a floating action button (FAB) for Tour Guide users. Visible on all pages except `/guide/[id]` (their own profile). Features: expanding pill, auto-expand hint on first load (3s), radar pulse every 10s, scroll reactivity.

---

## Key Insights

- `IUser` already has `role?: 'guide' | 'user'` and `tourGuideId?: string`
- `useUserStore.use.user()` gives access to current user
- `_app.tsx` renders `GlobalAlertProvider` before `ModuleLayout` — FAB should be added here too
- Router: `useRouter().pathname` to detect `/guide/[id]` → exclude when `pathname === '/guide/[id]'` AND `router.query.id === user.tourGuideId`
- i18n: add `tourGuideFab.label` to `common.json` (both locales) — better than authPage since FAB is global
- `router.push(\`/guide/\${user.tourGuideId}\`)` for navigation

---

## Related Code Files

- `src/components/ui/TourGuideFAB/index.tsx` ← new file
- `src/pages/_app.tsx` ← add `<TourGuideFAB />` render
- `public/locales/en/common.json` ← add FAB key
- `public/locales/vi/common.json` ← add FAB key

---

## Architecture

```
TourGuideFAB (component)
├── Reads: useUserStore.use.user(), useRouter()
├── Show condition: user.role === 'guide' && not on own guide page
├── State: isExpanded (boolean), hasShownHint (ref)
├── Effects:
│   ├── Auto-expand on mount → collapse after 3s
│   ├── Radar pulse interval (every 10s) — CSS keyframe animation
│   └── Scroll listener → opacity 0.5 on scroll down, 1.0 on scroll up
└── Click: router.push(`/guide/${user.tourGuideId}`)
```

---

## Implementation Steps

### Step 1 — Add i18n keys

`public/locales/en/common.json`:

```json
"tourGuideFab": {
  "label": "Manage Tour Guide Profile"
}
```

`public/locales/vi/common.json`:

```json
"tourGuideFab": {
  "label": "Quản lý Tour Guide Profile"
}
```

### Step 2 — Create `src/components/ui/TourGuideFAB/index.tsx`

Key implementation details:

```tsx
const FAB_COLLAPSED_W = 52; // circle size
const HINT_DURATION = 3000; // 3s auto-expand on mount

export function TourGuideFAB() {
  const user = useUserStore.use.user();
  const router = useRouter();
  const { t } = useTranslation('common');
  const [isExpanded, setIsExpanded] = useState(true); // starts expanded
  const [opacity, setOpacity] = useState(1);
  const [isPulsing, setIsPulsing] = useState(false);
  const lastScrollY = useRef(0);

  // Show condition
  const isOnOwnProfile = router.pathname === '/guide/[id]' && router.query.id === user?.tourGuideId;
  if (!user?.role || user.role !== 'guide' || isOnOwnProfile) return null;

  // Auto-collapse after 3s
  useEffect(() => {
    const timer = setTimeout(() => setIsExpanded(false), HINT_DURATION);
    return () => clearTimeout(timer);
  }, []);

  // Radar pulse every 10s
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 1000);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  // Scroll reactivity
  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setOpacity(currentY > lastScrollY.current ? 0.5 : 1);
      lastScrollY.current = currentY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.button
      style={{ opacity }}
      animate={{ width: isExpanded ? 'auto' : FAB_COLLAPSED_W }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      onHoverStart={() => setIsExpanded(true)}
      onHoverEnd={() => setIsExpanded(false)}
      onClick={() => router.push(`/guide/${user.tourGuideId}`)}
      className="fixed bottom-6 right-4 z-50 h-[52px] min-w-[52px] px-4 
                 rounded-full bg-neutral-black text-white shadow-xl 
                 flex items-center gap-2.5 overflow-hidden transition-opacity duration-300"
    >
      {/* Radar pulse ring */}
      {isPulsing && (
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-neutral-black"
          initial={{ scale: 1, opacity: 0.6 }}
          animate={{ scale: 1.6, opacity: 0 }}
          transition={{ duration: 1 }}
        />
      )}
      <span className="shrink-0">👤</span> {/* Replace with avatar or icon */}
      <AnimatePresence>
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className="text-sm font-semibold whitespace-nowrap overflow-hidden font-dinpro"
          >
            {t('tourGuideFab.label')}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
```

### Step 3 — Wire into `_app.tsx`

Add inside `<Provider>`, after `<GlobalAlertProvider />`:

```tsx
import { TourGuideFAB } from '@/components/ui/TourGuideFAB';
// ...
<Provider>
  <GlobalAlertProvider />
  <TourGuideFAB />
  <ModuleLayout>{getLayout(<Component {...pageProps} />)}</ModuleLayout>
</Provider>;
```

---

## Todo

- [ ] Add tourGuideFab keys to common.json (en + vi)
- [ ] Create src/components/ui/TourGuideFAB/index.tsx
- [ ] Add TourGuideFAB to \_app.tsx
- [ ] Test: visible as guide on home page, hidden on /guide/[own-id]
- [ ] Test: auto-expands on load → collapses after 3s
- [ ] Test: radar pulse visible after 10s idle
- [ ] Test: opacity fades on scroll down, restores on scroll up

---

## Success Criteria

- FAB only visible when `user.role === 'guide'`
- Hidden on user's own guide profile page
- Expands on mount for 3s showing label text, then collapses to circle
- Hover expands pill with label
- Radar pulse ring animation every 10s
- Scroll down → opacity 0.5, scroll up → opacity 1.0
- Click navigates to `/guide/{tourGuideId}`

---

## Risk Assessment

- Adding to \_app.tsx is additive-only — no existing logic touched ✓
- `useRouter` inside component requires it to be rendered inside Next.js Router context — \_app.tsx is inside that context ✓
- Scroll listener is passive, no performance impact ✓

---

## Security Considerations

- Route check uses `router.query.id === user.tourGuideId` comparison — string comparison, safe ✓
