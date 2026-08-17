# Scout Report: Booking & Payment API Files

**Date**: 2026-08-17  
**Search Scope**: src/modules/, src/api/, src/components/

---

## 1. BOOKING-RELATED FILES

### 1.1 AdminBooking Module

**Location**: `src/modules/AdminBooking/`

#### Main Page

- `/d/Remote/web-travel/src/modules/AdminBooking/BookingListPage.tsx` - List page entry point with KPI cards, filters, pagination, detail drawer

#### Components

- `/d/Remote/web-travel/src/modules/AdminBooking/components/BookingDetailDrawer.tsx` - Right-side sheet drawer displaying booking details (customer, tour, travel info)
- `/d/Remote/web-travel/src/modules/AdminBooking/components/BookingDataTable.tsx` - Main table rendering booking list
- `/d/Remote/web-travel/src/modules/AdminBooking/components/BookingFilterToolbar.tsx` - Search & filter controls
- `/d/Remote/web-travel/src/modules/AdminBooking/components/BookingKpiCards.tsx` - Stats cards (pending, paid, cancel, total)
- `/d/Remote/web-travel/src/modules/AdminBooking/components/BookingPagination.tsx` - Pagination controls
- `/d/Remote/web-travel/src/modules/AdminBooking/components/BookingStatusBadge.tsx` - Status badge (paid/pending/cancel)
- `/d/Remote/web-travel/src/modules/AdminBooking/components/BookingTableRow.tsx` - Individual table row
- `/d/Remote/web-travel/src/modules/AdminBooking/components/booking-date-range-dropdown.tsx` - Date range filter
- `/d/Remote/web-travel/src/modules/AdminBooking/components/PassengerTooltip.tsx` - Passenger count tooltip (inferred)

#### Hooks

- `/d/Remote/web-travel/src/modules/AdminBooking/hooks/use-booking-list-state.ts` - State management for filters, pagination, detail drawer

### 1.2 ProductPage Module (User Booking Flow)

**Location**: `src/modules/ProductPage/components/booking-sheet/`

- `/d/Remote/web-travel/src/modules/ProductPage/components/booking-sheet/booking-bottom-bar.tsx` - CTA buttons
- `/d/Remote/web-travel/src/modules/ProductPage/components/booking-sheet/booking-stepper.tsx` - Step indicator
- `/d/Remote/web-travel/src/modules/ProductPage/components/booking-sheet/use-booking-sheet-state.ts` - Booking state management

---

## 2. BOOKING API LAYER

**Location**: `src/api/booking/`

### 2.1 Types (types.ts)

- IBookingPassenger (unitId, count)
- IBookingMessengerApp (name, username)
- IBookingPassengerItem (count, price, unitId, unitName)
- IBookingListItem (complete booking record with status, travelDate, passenger list, pricing)
- IBookingPagination (page, pageSize, total, totalPages)
- IBookingStatItem (count, totalPrice)
- IBookingStats (pending, paid, cancel, total stats)
- ICreateBookingPayload (payload for creating bookings)
- ApiBookingDetail, ApiBookingResponse

Key Status Values: 'paid' | 'pending' | 'cancel'

### 2.2 Requests (requests.ts)

- createBooking(payload: ICreateBookingPayload) - POST /booking
- getBookingList(params: IBookingQueryParams) - GET /booking (with filters)

### 2.3 Queries (queries.ts)

- useCreateBooking: createMutation
- useBookingList: createQuery (staleTime: 0)

---

## 3. PAYMENT API LAYER

**Location**: `src/api/payment/`

### 3.1 Types (types.ts)

PayPal:

- ApiPaypalConfig (clientId, currency)
- ApiPaypalCreateOrderResponse (orderId)
- ApiPaypalCaptureOrderResponse (booking + payment status)

VNPay:

- ApiVnpayCreateUrlResponse (txnRef, paymentUrl)

### 3.2 Requests (requests.ts)

- getPaypalConfig() - GET /payment/paypal/config
- createPaypalOrder(bookingId) - POST /payment/paypal/{id}/create-order
- capturePaypalOrder(bookingId, orderId) - POST /payment/paypal/{id}/capture-order
- createVnpayPaymentUrl(bookingId) - POST /payment/vnpay/{id}/create-payment-url

### 3.3 Queries (queries.ts)

- usePaypalConfig: createQuery
- useCreatePaypalOrder: createMutation
- useCapturePaypalOrder: createMutation
- useCreateVnpayPaymentUrl: createMutation

---

## 4. PAYMENT UI COMPONENTS

**Location**: `src/modules/ProductPage/components/booking-sheet/`

- step-payment.tsx - Main payment step (PayPal + VNPay buttons)
- step-payment-header.tsx - Header
- step-payment-order-summary.tsx - Summary display
- step-payment-paypal-button.tsx - PayPal SDK wrapper
- step-payment-success.tsx - Success screen

Payment Methods: VNPay (VND, min 10k), PayPal (USD), Card (placeholder)

---

## 5. BOOKING DETAIL DRAWER

**File**: `/d/Remote/web-travel/src/modules/AdminBooking/components/BookingDetailDrawer.tsx`

**Sections**: Customer, Tour, Travel (no tabs yet - all in single view)

**Props**: { booking: IBookingListItem | null, onClose: () => void }

---

## KEY PATHS (Absolute)

Booking Module:

- /d/Remote/web-travel/src/modules/AdminBooking/
- /d/Remote/web-travel/src/api/booking/
- /d/Remote/web-travel/src/modules/ProductPage/components/booking-sheet/

Payment:

- /d/Remote/web-travel/src/api/payment/
