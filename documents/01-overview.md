# 01 · Product overview

> Snapshot 2026-11-16, branch `dev`. Verify against code before relying on line numbers.

## What it is

**web-travel** — mobile-first travel **video** app (TikTok-style feeds of tour videos) where a video leads to a **tour (product)** that can be **booked and paid**, plus **tour-guide profiles** and an **admin back-office**.

Domain chain: **Video → Product (tour) → Option (package) → Session (date + unit prices) → Booking → Payment**. A product also has units (Adult/Child…), departure times, pickup locations, tags, quick-facts (elements), itineraries, a supplier, a destination and tour guides.

## Users & areas

| Area | Who | Entry | Layout |
| --- | --- | --- | --- |
| Client | Guests / logged-in users | `/`, `/search`, `/video/[slug]`, `/product/[id]` | Phone frame 430×932 (`MainLayout`) |
| Tour guide | user with `role=tour_guide` + `tourGuideId` | `/guide/[id]` (owner mode) | Phone frame |
| Admin | `admin`, `super_admin` | `/admin/*` (login `/admin/login`) | Desktop `AdminLayout` (sidebar) |

## Core user flows

1. **Discover:** Home (background video + search) → `/search?q=` grid (MP4 previews, infinite) → `/video/[slug]` vertical snap feed (HLS).
2. **Book:** video info card → `/product/[id]` → `/product/[id]/booking` 4 steps: info (date→session→passengers, contact) → options (departure, pickup, package) → review (`POST /booking`) → payment (PayPal for non-VND, VNPay for VND).
3. **Guide:** profile, moments (videos uploaded via tus → Bunny), ratings/reviews, onboarding tour.
4. **Admin:** CRUD products (+sessions/pricing), destinations, tour guides (+moment moderation), suppliers (+bank accounts), videos (upload), bookings (list, detail, cancel), users (roles, reset password).

## Systems

| System | Value |
| --- | --- |
| Frontend | this repo (Next.js 13 Pages Router), port 3000 dev / 8080 prod |
| Backend | NestJS `web-travel-be` → `https://web-travel-be.fly.dev` (Swagger `/docs`, JSON `/docs-json`) |
| DB | PostgreSQL (DigitalOcean), TypeORM — read-only via MCP `_postgres`, schema in skill `web-travel-db` |
| Video | Bunny Stream (`vz-186cf1b9-231.b-cdn.net`, tus upload), images on `web-travel.b-cdn.net` |
| Maps | Goong (autocomplete, distance, map tiles) |
| Payments | PayPal (inline buttons), VNPay (redirect + `/payment/vnpay/return`) |
| Monitoring | Sentry (production only) |

## Where to go next

See [README.md](./README.md) task map.
