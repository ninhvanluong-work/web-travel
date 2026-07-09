# Research: Driver.js for Mobile React (Next.js)

## 1. Version & Installation

- Latest: **v1.6.0** (July 2026)
- `pnpm add driver.js`
- Bundle: **~5 KB** gzipped, zero dependencies

## 2. React Integration Pattern

No official React wrapper. Use vanilla JS API inside `useEffect`:

```tsx
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

useEffect(() => {
  const driverObj = driver({ steps: [...], onDestroyed: () => {} });
  driverObj.drive();
  return () => driverObj.destroy();
}, []);
```

## 3. Mobile Viewport (430px)

- Auto collision detection — adjusts popover if it overflows
- No minimum width restriction
- Test needed: nested phone-frame container may affect positioning calculations

## 4. Element Targeting

```js
{ element: '#tour-hero', popover: { title: '...', description: '...' } }
```

Accepts `#id`, `.class`, or DOM element reference.

## 5. No-Spotlight Steps (Welcome / Closing)

Use `element: undefined` — renders floating centered popover, no overlay cutout:

```js
{ element: undefined, popover: { title: 'Chào mừng!', description: '...' } }
```

Or set `overlayOpacity: 0` globally for a specific step via `onHighlightStarted`.

## 6. Auto-Scroll

```js
driver({ smoothScroll: true, ... })
```

Automatically scrolls target element into view. Works with `overflow-y: auto` containers.
**Caveat:** Must test with the phone-frame's inner scroll container, not `window`.

## 7. Tooltip Placement Per Step

```js
{
  element: '#tour-stats',
  popover: {
    title: '...',
    side: 'top',       // 'top' | 'bottom' | 'left' | 'right'
    align: 'center'    // 'start' | 'center' | 'end'
  }
}
```

Auto-falls back if placement overflows viewport.

## 8. Lifecycle Callbacks

```js
driver({
  onDestroyed: () => {
    /* called on finish OR skip */
  },
  onCloseClick: () => {
    /* "X" / Skip clicked */
  },
  onNextClick: (el, step, { driver }) => {
    driver.moveNext();
  },
});
```

Use `onDestroyed` to write to LocalStorage (fires in all exit paths).

## 9. Bundle Size Comparison

| Library       | Size (gzip) |
| ------------- | ----------- |
| driver.js     | ~5 KB       |
| react-joyride | ~34 KB      |

**Decision: Driver.js** — 7x lighter, critical for mobile performance.

## 10. Custom Button Labels

```js
driver({
  nextBtnText: 'Tiếp tục',
  prevBtnText: 'Quay lại',
  doneBtnText: 'Hoàn thành',
  allowClose: true, // shows X to skip
});
```

## Unresolved

- Phone-frame scroll container ID needed for `scrollIntoView` to work correctly (may need `scrollIntoViewOptions` override)
