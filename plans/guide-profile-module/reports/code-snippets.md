# Code Snippets Reference

## API Layer Pattern Examples

### types.ts - Tour Guide Model

/d/Remote/web-travel/src/api/product/types.ts (lines 1-20)

```typescript
export interface ApiTourGuide {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  avatar: string | null;
  ratingCount: number;
  expYear: number;
  ratingStar: number;
}

export interface ApiTourGuideListResponse {
  data: {
    items: ApiTourGuide[];
    pagination: IProductPagination;
  };
  code: number;
  error: string | null;
  message: string;
}
```

### requests.ts - API Calls

/d/Remote/web-travel/src/api/tour-guide/requests.ts

```typescript
import { request } from '../axios';
import type { ApiTourGuide, ApiTourGuideListResponse } from '../product/types';

export interface TourGuidePage {
  items: { id: string; name: string }[];
  nextPage: number | undefined;
}

export async function getTourGuidePage(page: number): Promise<TourGuidePage> {
  const { data } = await request.get<ApiTourGuideListResponse>('/tour-guide', {
    params: { page, pageSize: 49 },
  });
  const { items, pagination } = data.data;
  return {
    items: items.map((x: ApiTourGuide) => ({ id: x.id, name: x.name })),
    nextPage: pagination.page < pagination.totalPages ? pagination.page + 1 : undefined,
  };
}
```

### queries.ts - React Query Hooks

/d/Remote/web-travel/src/api/tour-guide/queries.ts

```typescript
import { createInfiniteQuery } from 'react-query-kit';
import { getTourGuidePage, type TourGuidePage } from './requests';

export const useTourGuideListInfinite = createInfiniteQuery<TourGuidePage, void, Error, number>({
  primaryKey: '/tour-guide',
  queryFn: ({ pageParam = 1 }) => getTourGuidePage(pageParam as number),
  getNextPageParam: (lastPage) => lastPage.nextPage,
  staleTime: 5 * 60 * 1000,
});
```

### index.ts - Barrel Export

/d/Remote/web-travel/src/api/tour-guide/index.ts

```typescript
export * from './queries';
export * from './requests';
```

---

## Routing Pattern

### routes.ts

/d/Remote/web-travel/src/types/routes.ts

Current:

```typescript
export const ROUTE = {
  HOME: '/',
  SEARCH: '/search',
  VIDEO_DETAIL: '/video/[slug]',
  PRODUCT: '/product/[id]',
  ADMIN_PRODUCTS: '/admin/products',
  // ... etc
} as const;
```

Add for Guide Profile:

```typescript
GUIDE_PROFILE: '/guide/[id]',
GUIDE_PROFILE_PATH: (id: string) => `/guide/${id}`,
```

---

## Page Router Pattern

### Page File - /src/pages/guide/[id].tsx

```typescript
import GuideProfilePage from '@/modules/GuideProfilePage';

export { default } from '@/modules/GuideProfilePage';
```

---

## Module Structure Pattern

### Main Module - /src/modules/GuideProfilePage/index.tsx

```typescript
import type { NextPageWithLayout } from '@/types';

const GuideProfilePage: NextPageWithLayout = () => {
  // implementation
  return <div>{/* layout structure */}</div>;
};

export default GuideProfilePage;
```

---

## Layout Pattern

### MainLayout

/d/Remote/web-travel/src/components/layouts/MainLayout/MainLayout.tsx

```typescript
const MainLayout: FCC<Props> = ({ children }) => {
  return (
    <div className="bg-slate-900 flex justify-center items-center min-h-screen">
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] 
                      h-[100dvh] max-h-[932px] overflow-hidden bg-white shadow-2xl"
      >
        <main className="h-full overflow-hidden scrollbar-hide">{children}</main>
      </div>
    </div>
  );
};
```

Key constraint: max-w-[430px] h-[100dvh] max-h-[932px]

---

## UI Component Examples

### Button

/d/Remote/web-travel/src/components/ui/button.tsx

Variants: primary, secondary, ghost, glass, glassLight, overlay, transparent
Sizes: md, xs, lg, icon
Rounded: default, full, md, none

```typescript
<Button variant="primary" size="md" rounded="full">
  Click me
</Button>
```

### Avatar

/d/Remote/web-travel/src/components/ui/avatar.tsx

```typescript
<Avatar src={imageUrl}>{initials}</Avatar>
```

### Card

/d/Remote/web-travel/src/components/ui/card.tsx

```typescript
<Card variant="default">Content here</Card>
```

### Skeleton & SkeletonWrapper

/d/Remote/web-travel/src/components/ui/skeleton.tsx

```typescript
<SkeletonWrapper loading={isLoading}>
  <div>Actual content</div>
</SkeletonWrapper>
```

### Sheet (Bottom Sheet)

/d/Remote/web-travel/src/components/ui/sheet.tsx

```typescript
<Sheet>
  <SheetTrigger>Open</SheetTrigger>
  <SheetContent side="bottom">
    <SheetHeader>
      <SheetTitle>Title</SheetTitle>
    </SheetHeader>
    {/* content */}
  </SheetContent>
</Sheet>
```

---

## Existing Guide UI Component

### GuideBlock

/d/Remote/web-travel/src/modules/ProductPage/components/guide-block.tsx

```typescript
interface GuideBlockProps {
  initials: string;
  name: string;
  rating: number;
  yearsExperience: number;
  toursInArea: number;
  area: string;
}

export default function GuideBlock({ initials, name, rating, yearsExperience, toursInArea, area }: GuideBlockProps) {
  return (
    <div className="px-[18px] pb-[22px]">
      <p className="text-[11px] uppercase text-[#888884]">Your guide</p>
      <div className="border rounded-[14px] p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-[#E1F5EE] text-[#0F6E56]">{initials}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-[14px] font-medium">{name}</p>
            <span className="text-[12px]">· {rating} ★</span>
          </div>
          <p className="text-[12px]">
            {yearsExperience} years · {toursInArea} tours in {area}
          </p>
        </div>
        <Button>View profile →</Button>
      </div>
    </div>
  );
}
```

---

## Tailwind Text Sizes Reference

From /d/Remote/web-travel/tailwind.config.ts:

Headings (h1-h6): 4rem down to 1.5rem, fontWeight 500, tracking -1%
Body (body1-body4): 1.25rem down to 0.75rem, fontWeight 500
Captions (caption1, caption2): 0.875rem, 0.75rem, fontWeight 500
Buttons (button1-button3): 0.875rem to 0.625rem
Overlines (overline1-3): tracking 2%

---

## BunnyVideoPlayer Example

/d/Remote/web-travel/src/components/BunnyVideoPlayer.tsx

```typescript
const playerRef = useRef<BunnyPlayerHandle>(null);

<BunnyVideoPlayer
  ref={playerRef}
  embedUrl={videoUrl}
  muted={false}
  className="w-full aspect-video"
  onReady={() => console.log('ready')}
/>;

// Usage:
await playerRef.current?.play();
playerRef.current?.pause();
playerRef.current?.unmute();
playerRef.current?.mute();
```

---

## Axios & Authentication

/d/Remote/web-travel/src/api/axios.ts

Request interceptor automatically adds Bearer token:

```typescript
request.interceptors.request.use(async (config) => {
  const token = useUserStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Response interceptor handles 401 -> token refresh + retry

---

## Module Export Pattern

### Next.js Pages Pattern

Simple re-export:

```typescript
// /src/pages/guide/[id].tsx
export { default } from '@/modules/GuideProfilePage';
```

With custom layout:

```typescript
const Page: NextPageWithLayout = () => {...};
Page.getLayout = (page) => <CustomLayout>{page}</CustomLayout>;
export default Page;
```

---

## Key TypeScript Types

### NextPageWithLayout

```typescript
export type NextPageWithLayout<P = {}> = NextPage<P> & {
  getLayout?: (page: ReactElement) => ReactNode;
};
```

### FCC (Functional Component with Children)

Used throughout for components that accept children
