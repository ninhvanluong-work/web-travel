# Phase 01 — SVG Icons

Create 14 SVG files in `src/assets/svg/` and register each in `src/assets/icons.tsx`.

---

## SVG File Format

All files follow the existing pattern — 18×18 viewBox, `currentColor` for stroke/fill, no hardcoded colors:

```svg
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- paths here -->
</svg>
```

---

## Files to Create

### `clock.svg` → key: `clock`

Used: Quick Facts — Duration

```svg
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.4"/>
  <path d="M9 5V9L12 11" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
</svg>
```

### `globe.svg` → key: `globe`

Used: Quick Facts — Languages

```svg
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.4"/>
  <path d="M2 9H16M9 2C11 4.5 12 6.5 12 9C12 11.5 11 13.5 9 16C7 13.5 6 11.5 6 9C6 6.5 7 4.5 9 2Z" stroke="currentColor" stroke-width="1.4"/>
</svg>
```

### `group-people.svg` → key: `groupPeople`

Used: Quick Facts — Group size

```svg
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="6.5" cy="6.5" r="2.5" stroke="currentColor" stroke-width="1.4"/>
  <circle cx="12.5" cy="7.5" r="2" stroke="currentColor" stroke-width="1.4"/>
  <path d="M2 14C2 12 4 11 6.5 11C9 11 11 12 11 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
  <path d="M11 13C11 12 12 11.5 12.5 11.5C14.5 11.5 16 12.5 16 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
</svg>
```

### `person-pickup.svg` → key: `personPickup`

Used: Quick Facts — Pickup/dropoff

```svg
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="9" cy="4" r="2" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <path d="M2 14H16M3 11C5 9 7 8 9 8C11 8 13 9 15 11" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
</svg>
```

### `mountain.svg` → key: `mountain`

Used: Quick Facts — Difficulty

```svg
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 14L6 8L9 11L13 5L16 14" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round" fill="none"/>
</svg>
```

### `trek-mountain.svg` → key: `trekMountain`

Used: Experience card — Trek highlight

```svg
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 15L5 8L8 11L11 4L16 15" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" fill="none"/>
</svg>
```

### `hearth-fire.svg` → key: `hearthFire`

Used: Experience card — Dinner by hearth

```svg
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M9 3C7 5 6 7 9 9C12 7 11 5 9 3Z" fill="currentColor"/>
  <path d="M5 11C5 13 7 15 9 15C11 15 13 13 13 11" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
</svg>
```

### `person-home.svg` → key: `personHome`

Used: Experience card — Homestay

```svg
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="9" cy="6" r="2.5" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <path d="M3 14C5 11 7 10 9 10C11 10 13 11 15 14" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
</svg>
```

### `sun-rise.svg` → key: `sunRise`

Used: Experience card — Sunrise

```svg
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="9" cy="9" r="3" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <path d="M9 2V4M9 14V16M2 9H4M14 9H16M4 4L5.5 5.5M12.5 12.5L14 14M14 4L12.5 5.5M5.5 12.5L4 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
</svg>
```

### `person-best.svg` → key: `personBest`

Used: Before You Book — bestFor

```svg
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="9" cy="6" r="3" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <path d="M3 16C3 13 5.5 11 9 11C12.5 11 15 13 15 16" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
</svg>
```

### `warning-circle.svg` → key: `warningCircle`

Used: Before You Book — notRecommended

```svg
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="9" cy="9" r="7" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <path d="M9 5V10M9 12.5V13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
</svg>
```

### `house-bring.svg` → key: `houseBring`

Used: Before You Book — bring

```svg
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M5 6L9 2L13 6V15C13 15.5 12.5 16 12 16H6C5.5 16 5 15.5 5 15V6Z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/>
  <path d="M7 9H11M7 12H11" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
</svg>
```

### `clothing-wear.svg` → key: `clothingWear`

Used: Before You Book — wear

```svg
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M7 5V3C7 2.5 7.5 2 8 2H10C10.5 2 11 2.5 11 3V5" stroke="currentColor" stroke-width="1.4" fill="none"/>
  <path d="M4 16V8C4 6 6 5 9 5C12 5 14 6 14 8V16" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/>
</svg>
```

### `cultural-smile.svg` → key: `culturalSmile`

Used: Before You Book — cultural

```svg
<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M2 12C2 9 5 6 9 6C13 6 16 9 16 12" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <circle cx="6" cy="9" r="1" fill="currentColor"/>
  <circle cx="12" cy="9" r="1" fill="currentColor"/>
  <path d="M9 6V3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
</svg>
```

---

## Registration in `src/assets/icons.tsx`

### Imports to append (after existing imports, before `const IconList`)

```typescript
import clock from '@/assets/svg/clock.svg';
import globe from '@/assets/svg/globe.svg';
import groupPeople from '@/assets/svg/group-people.svg';
import personPickup from '@/assets/svg/person-pickup.svg';
import mountain from '@/assets/svg/mountain.svg';
import trekMountain from '@/assets/svg/trek-mountain.svg';
import hearthFire from '@/assets/svg/hearth-fire.svg';
import personHome from '@/assets/svg/person-home.svg';
import sunRise from '@/assets/svg/sun-rise.svg';
import personBest from '@/assets/svg/person-best.svg';
import warningCircle from '@/assets/svg/warning-circle.svg';
import houseBring from '@/assets/svg/house-bring.svg';
import clothingWear from '@/assets/svg/clothing-wear.svg';
import culturalSmile from '@/assets/svg/cultural-smile.svg';
```

### Entries to append inside `IconList` object

```typescript
  clock,
  globe,
  groupPeople,
  personPickup,
  mountain,
  trekMountain,
  hearthFire,
  personHome,
  sunRise,
  personBest,
  warningCircle,
  houseBring,
  clothingWear,
  culturalSmile,
```
