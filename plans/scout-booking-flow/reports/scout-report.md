# Scout Report: Booking Flow Implementation

Date: 2026-07-09
Status: Complete
Coverage: ProductDetail page, API types, Zustand patterns, UI components, routing structure

## 1. PRODUCTDETAIL PAGE & BOOK NOW BUTTON

### Location

- Page entry: src/pages/product/[id].tsx
- Main module: src/modules/ProductPage/index.tsx
- Button component: src/modules/ProductPage/components/sticky-cta-bar.tsx

### Key Facts

- ProductPage shows full tour/product information with scrollable content
- "Book Now" button in StickyCTABar (fixed/sticky at bottom)
- Green theme: bg-[#0F6E56] text-white
- NO onClick handler currently - needs implementation
- Receives: originalPrice, salePrice, discountPercent, currency, priceUnit

## 2. EXISTING BOOKING-RELATED FILES

Status: NONE FOUND

- Searched src/\**/*booking\*, checkout, reserve → No matches
- Greenfield implementation

## 3. PRODUCT/TOUR API TYPES

Location: src/api/product/types.ts

ApiProductDetail (Main):

- id, name, slug, minPrice (decimal string)
- elements[] (ApiElementItem) - pickup, dropoff, departure, languages, etc.
- itineraries[] (ApiItineraryItem) - day-by-day schedule
- supplier (ApiSupplier) - tour operator info
- tourGuides[] (ApiTourGuide) - available guides
- tags[] - tour categories

ApiElementItem:
Keys: departure, pickup, dropOff, groupSize, language, difficulty, day, night
Fields: id, key, name (display value), description, isActive

ApiItineraryItem:

- id, name, featuredName (time), order, description, productId

ApiSupplier:

- id, name, avatar, ratingRate, ratingCount, isVerified, tourOffered, responseRate, expYears

ApiTourGuide:

- id, name, ratingStar, ratingCount, expYear

Data Adapter: src/modules/ProductPage/adapter.ts

## 4. ZUSTAND STORES PATTERNS

Location: src/stores/

Existing Stores:

- UserStore (persisted) - user, accessToken, refreshToken
- VideoListStore (session) - videos, query, rootVideo, excludeIds, nextCursor
- IntersectionStore - video auto-play
- AlertStore - Toast notifications

Pattern from UserStore.ts:

- persist middleware for localStorage
- createSelectorFunctions from auto-zustand-selectors-hook
- Access: useUserStore.use.accessToken()

## 5. SHEET / DIALOG / OVERLAY COMPONENTS

Sheet (Bottom Sheet):
File: src/components/ui/sheet.tsx

- @radix-ui/react-dialog based
- Sides: top, bottom, left, right (default: right)
- Components: Sheet, SheetTrigger, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription
- 500ms slide-in/out animations
- 80% opacity overlay
- fullWidth prop for mobile

Dialog (Modal):
File: src/components/ui/dialog.tsx

- Center-positioned
- Similar component structure
- Fade-in/zoom-in animations
- 80% opacity overlay

## 6. STEPPER / MULTI-STEP

Profile Onboarding Example:
File: src/modules/GuideProfilePage/components/profile-onboarding.tsx

- Uses driver.js for guided tours
- Progress indicator, prev/next buttons
- Can replay

Tabs Component:
File: src/components/ui/tabs.tsx (Radix)

- Can use for sequential steps
- Has TabsList, TabsTrigger, TabsContent

Note: No native stepper - needs external library or custom CSS

## 7. DATE PICKER COMPONENTS

DatePicker:
File: src/components/ui/date-picker.tsx

- Popover-based, react-day-picker
- Props: onChange, value?: Date, disablePast?: boolean
- Format: dd/MM/yyyy
- Uses @mantine/hooks

Calendar:
File: src/components/ui/calendar.tsx

- DayPicker component
- Month/year dropdowns
- disablePast support
- Tailwind styled

DatePickerField (Form):
File: src/components/ui/FormField/DatePickerField.tsx

- React Hook Form wrapper
- Props: control, name, label, required, disablePast

Time Picker:
File: src/components/ui/time-select-picker.tsx

## 8. FORM FIELD COMPONENTS

Location: src/components/ui/FormField/

Available:

1. TextField
2. TextAreaField
3. DatePickerField
4. SelectField
5. SelectWithSearchField
6. RadioGroupField
7. CheckboxField
8. SwitchField
9. AvatarUploadField
10. UploadButtonField

All use React Hook Form with control prop

## 9. ROUTING & PAGE STRUCTURE

Current Routes:
src/pages/

- index.tsx → /
- search.tsx → /search
- video/[slug].tsx → /video/[slug]
- product/[id].tsx → /product/[id]
- sign-in.tsx, sign-up.tsx, forgot-password.tsx, reset-password.tsx
- guide/[id].tsx → /guide/[id]
- admin/products, admin/videos, admin/guides
- api/upload/video.ts → POST /api/upload/video

Module Pattern:

- Pages are thin re-exports
- Logic in src/modules/[FeatureName]/index.tsx
- i18n translations via getServerSideProps

Proposed Booking Routes:
/booking/[productId]
/booking/[productId]/confirm
/booking/success
OR: Single sheet overlay from ProductPage

## 10. LAYOUT SYSTEM & CONSTRAINTS

MainLayout:
File: src/components/layouts/MainLayout/

- Fixed phone frame: max-w-[430px] h-[100dvh] max-h-[932px]
- ALL UI within this box (mobile-first)
- Dark background outside

Implication:

- Booking UI must fit 430px width
- Bottom sheet preferred over center modal

## 11. BUTTON COMPONENT

File: src/components/ui/button.tsx

Variants:

- primary - Green gradient + neon border
- secondary - Neutral gradient
- ghost - Transparent
- dark - Solid black
- glass, glassLight - Frosted glass
- overlay - Semi-opaque on video
- transparent

Sizes: md, xs, lg
Custom padding via className

Current "Book Now" Theme:
className="bg-[#0F6E56] text-white px-[22px] py-[13px] text-[14px] font-medium h-auto"

## 12. API LAYER PATTERN

Structure:
src/api/[domain]/ has 4 files:

1. types.ts - Domain models + API response types
2. requests.ts - axios calls + mapping
3. queries.ts - React Query hooks (createQuery, createMutation)
4. index.ts - Barrel export

Shared Axios:
File: src/api/axios.ts

- Reads NEXT_PUBLIC_API_URL
- Attaches Bearer tokens from Zustand
- Handles 401 → refresh automatically

Product API Example:
Requests:

- getProductById(id)
- getProductList(params)
- getProductReviews(id, pageSize)

Queries:
export const useProductById = createQuery<ApiProductDetail, { id: string }>({
primaryKey: '/product/detail',
queryFn: ({ queryKey: [, { id }] }) => getProductById(id),
});

Booking API Template:
src/api/booking/

- types.ts
- requests.ts
- queries.ts
- index.ts

## 13. KEY IMPORTS & ALIASES

Path alias: @/ = src/

Common for booking:
import { Sheet, SheetContent, SheetHeader } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { DatePickerField, SelectField } from '@/components/ui/FormField';
import { AlertBanner } from '@/components/ui/AlertBanner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUserStore, useBookingStore } from '@/stores';
import { useProductById } from '@/api/product';
import { useCreateBooking } from '@/api/booking';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

## 14. TRANSLATION / i18n

Uses next-i18next
Files: public/locales/[lang]/[namespace].json
Pattern: const { t } = useTranslation('namespace')
ProductPage example: useTranslation('productPage')

For booking:
Create public/locales/en/bookingPage.json
Keys: selectDate, selectTime, selectOption, selectGuide, guestCount, continueButton, etc.

## 15. ERROR/SUCCESS NOTIFICATIONS

AlertBanner:
File: src/components/ui/AlertBanner/index.tsx

- Used for all error/warning/success/info
- Via: useAlertStore.getState().addAlert({ type, title, description })

Pattern:
useAlertStore.getState().addAlert({
type: 'error' | 'warning' | 'success' | 'info',
title: 'Message title',
description?: 'Optional details',
});

## KEY FILES FOR BOOKING IMPLEMENTATION

Must Read:

- src/modules/ProductPage/index.tsx
- src/modules/ProductPage/components/sticky-cta-bar.tsx
- src/api/product/types.ts
- src/stores/UserStore.ts
- src/components/ui/sheet.tsx

Reference Components:

- src/components/ui/FormField/\*.tsx
- src/components/ui/date-picker.tsx
- src/components/ui/button.tsx
- src/components/ui/AlertBanner/index.tsx

Reference API:

- src/api/product/requests.ts
- src/api/product/queries.ts

Layout:

- src/pages/\_app.tsx
- Constraint: max-w-[430px] h-[100dvh] phone frame

## UNRESOLVED QUESTIONS

1. Booking data model: tour options (dates/times/availability), guest fields, pricing rules, booking status?
2. API endpoints: POST /booking, GET /booking/:id, GET /product/:id/options?
3. Multi-step form: single sheet, stepper, modal, or separate page?
4. Guest info: full details or just count & contact?
5. Payment: part of booking or separate checkout?
