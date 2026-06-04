# Kiến trúc Module: Guide Profile Page

## File Tree

```
src/
├── pages/
│   └── guide/
│       └── [id].tsx                    # thin page, re-exports module
├── types/
│   └── routes.ts                       # thêm GUIDE_PROFILE + GUIDE_PROFILE_PATH
├── modules/
│   └── GuideProfilePage/
│       ├── index.tsx                   # main module, composes sections
│       ├── data/
│       │   └── mock-guide.ts           # GuideProfileData type + mock instance
│       ├── hooks/
│       │   └── use-guide-profile.ts    # hook trả mock data với loading state giả
│       └── components/
│           ├── hero-banner.tsx             # 4.1 — gradient bg, slogan, name, badge
│           ├── card-flip-badge.tsx         # 4.1 — 3D CSS flip for card ID badge
│           ├── action-bar.tsx              # 4.2 — CTA button, QR button, Share button
│           ├── qr-sheet.tsx                # 4.2 — Bottom Sheet với qrcode.react
│           ├── storytelling-block.tsx      # 4.3 — "Vì sao tôi làm nghề này" bio
│           ├── stats-block.tsx             # 4.4 — 3-col grid: tours / years / languages
│           ├── dispatch-list.tsx           # 4.4 — collapsible tour dispatch codes
│           ├── operator-reviews.tsx        # 4.5 — stacked review cards
│           ├── guest-feedback.tsx          # 4.6 — header: totalReviews + avgRating
│           ├── criteria-bar.tsx            # 4.6 — animated progress bar per criterion
│           ├── featured-reviews.tsx        # 4.6 — border-l-2 quote blocks
│           ├── specialty-tags.tsx          # chuyên môn colored tag chips
│           ├── moments-grid.tsx            # 4.7 — 2-col grid, aspect-[9/14] cards
│           ├── destinations-chart.tsx      # 4.8 — animated horizontal bar chart
│           ├── career-timeline.tsx         # 4.8 — vertical timeline with dots
│           └── guide-profile-skeleton.tsx  # shimmer skeleton for loading state
```

## Pattern theo chuẩn codebase

```tsx
// src/pages/guide/[id].tsx  — thin page
import { GuideProfilePage } from '@/modules/GuideProfilePage';
export default function GuidePage() {
  return <GuideProfilePage />;
}
```

```tsx
// src/modules/GuideProfilePage/index.tsx  — module root
export function GuideProfilePage() {
  const router = useRouter();
  const { data, isLoading } = useGuideProfile(router.query.id as string);

  if (isLoading) return <GuideProfileSkeleton />;
  if (!data) return null;

  return (
    <div className="bg-[#F3F3F7] min-h-screen overflow-y-auto">
      <HeroBanner guide={data} />
      <ActionBar guide={data} />
      <StorytellingBlock bio={data.bio} />
      <StatsBlock metrics={data.metrics} />
      <OperatorReviews reviews={data.operatorReviews} />
      <GuestFeedback feedback={data.guestFeedback} />
      <SpecialtyTags specialties={data.specialties} />
      <MomentsGrid moments={data.moments} />
      <DestinationsChart destinations={data.destinations} />
      <CareerTimeline timeline={data.careerTimeline} />
    </div>
  );
}
```

## Dependencies

### Cần add

```bash
pnpm add qrcode.react
```

### Đã có sẵn (không cần install thêm)

- `framer-motion` — animations
- `src/components/ui/sheet.tsx` — Bottom Sheet (Radix Dialog)
- `src/components/ui/skeleton.tsx` — shimmer loading
- `src/components/ui/carousel.tsx` — dự phòng nếu muốn carousel
- `react-query-kit` — query hooks

## Data Model

```ts
// src/modules/GuideProfilePage/data/mock-guide.ts
export interface GuideProfileData {
  id: string;
  cardId: string; // "HN-2847"
  name: string;
  title: string; // "Hướng dẫn viên · Hà Nội & vùng cao phía Bắc"
  slogan: string; // italic quote on banner
  bio: string; // "Vì sao tôi làm nghề này" long text

  metrics: {
    toursLed: number;
    yearsOfExperience: number;
    languages: string[]; // ["VI", "EN", "FR"]
  };

  dispatches: Array<{
    // "Lệnh điều tour"
    code: string; // "VVV-BKG-2026-0284"
    tourName: string;
    date: string;
    status: 'completed' | 'upcoming';
  }>;

  operatorReviews: Array<{
    id: string;
    companyName: string;
    tourName: string;
    date: string;
    rating: number;
    comment: string;
  }>;

  guestFeedback: {
    totalReviews: number;
    averageRating: number;
    criteria: Array<{ label: string; score: number }>;
    featuredReviews: Array<{
      id: string;
      author: string;
      country: string;
      tourName: string;
      date: string;
      content: string;
    }>;
  };

  specialties: Array<{
    label: string;
    bg: string; // "bg-[#EEEDFE]"
    text: string; // "text-[#3C3489]"
  }>;

  moments: Array<{
    id: string;
    title: string;
    location: string;
    duration: string;
    videoId: string; // dùng để navigate /video/[id] (Option A)
    placeholderGradient: string; // "linear-gradient(160deg, #5DCAA5, #0F6E56)"
  }>;

  destinations: Array<{
    name: string;
    toursCount: number;
    percentage: number; // 0–100, dùng làm width của bar
  }>;

  careerTimeline: Array<{
    id: string;
    companyName: string;
    role: string;
    period: string;
    description: string;
    isCurrent: boolean; // true → dot màu đen, false → dot màu xám
  }>;
}
```
