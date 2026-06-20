import { request } from '../axios';
import { mergeWithLocalStorage } from './mock-adapter';
import type {
  ApiCreateMomentPayload,
  ApiCreateMomentResponse,
  ApiTourGuideDetail,
  ApiTourGuideDetailResponse,
  ApiTourGuideListResponse,
  ApiTourGuideMoment,
  ApiTourGuideMomentsResponse,
  ApiTourGuideReviewResponse,
  ApiUpdateMomentPayload,
  ITourGuide,
  ITourGuideListParams,
  ITourGuideListResult,
  ITourGuideMoment,
  ITourGuideMomentsParams,
  ITourGuideMomentsResult,
  ITourGuideProfile,
  ITourGuideReview,
  ITourGuideReviewParams,
  ITourGuideReviewResult,
  TourGuideFormPayload,
} from './types';

// ---------- Constants ----------

const SPECIALTY_PALETTE = [
  { bg: '#EEEDFE', text: '#3C3489' },
  { bg: '#FAECE7', text: '#712B13' },
  { bg: '#E1F5EE', text: '#085041' },
  { bg: '#FAEEDA', text: '#633806' },
  { bg: '#FBEAF0', text: '#72243E' },
] as const;

// ---------- Helpers ----------

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatViDate(iso: string): string {
  const d = new Date(iso);
  return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
}

// ---------- Mapper ----------

const toTourGuideProfile = (api: ApiTourGuideDetail): ITourGuideProfile => ({
  id: api.id,
  cardId: `ID-${api.id.slice(-4).toUpperCase()}`,
  name: api.name,
  title: api.summary ?? '',
  slogan: api.quote ? `"${api.quote}"` : '',
  coverUrl: api.coverImg ?? undefined,
  avatarUrl: api.avatar ?? undefined,
  bio: api.description ?? '',
  metrics: {
    toursLed: api.ratingCount,
    yearsOfExperience: api.expYear,
    languages: api.languages ?? [],
  },
  specialties: (api.experts ?? []).map((label, i) => ({
    label,
    bg: SPECIALTY_PALETTE[i % SPECIALTY_PALETTE.length].bg,
    text: SPECIALTY_PALETTE[i % SPECIALTY_PALETTE.length].text,
  })),
  operatorReviews: (api.supplierReview ?? []).map((r) => ({
    id: r.id,
    companyName: r.name,
    tourName: r.tourName,
    date: formatViDate(r.createdAt),
    rating: r.point,
    comment: r.content,
  })),
  guestFeedback: {
    totalReviews: api.userReview?.reviewCount ?? 0,
    averageRating: api.userReview?.reviewValue ?? 0,
    criteria: (api.userReview?.ratings ?? []).map((r) => ({
      label: r.name,
      score: r.value,
    })),
    featuredReviews: [],
  },
  careerTimeline: (api.careerPath ?? []).map((item, index) => ({
    id: `career-${index}`,
    companyName: item.company,
    role: item.role,
    period: index === 0 ? `${item.startYear} – nay` : `${item.startYear}`,
    description: `${item.tourCount} tours · ${item.description}`,
    isCurrent: index === 0,
  })),
  dispatches: [],
  moments: [],
  destinations: (api.destinationSummary ?? []).map((d) => ({
    name: d.destinationName,
    toursCount: d.productCount,
    percentage: api.totalProducts > 0 ? Math.round((d.productCount / api.totalProducts) * 100) : 0,
  })),
});

const toTourGuide = (item: {
  id: string;
  createdAt: string;
  name: string;
  avatar: string | null;
  ratingCount: number;
  expYear: number;
  ratingValue: number;
}): ITourGuide => ({
  id: item.id,
  name: item.name,
  avatar: item.avatar,
  ratingCount: item.ratingCount,
  expYear: item.expYear,
  ratingValue: item.ratingValue,
  createdAt: item.createdAt,
});

// ---------- Requests ----------

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
    items: items.map((x) => ({ id: x.id, name: x.name })),
    nextPage: pagination.page < pagination.totalPages ? pagination.page + 1 : undefined,
  };
}

export async function getTourGuideList(params: ITourGuideListParams): Promise<ITourGuideListResult> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null)
  );
  const { data } = await request.get<ApiTourGuideListResponse>('/tour-guide', { params: cleanParams });
  return {
    items: data.data.items.map(toTourGuide),
    pagination: data.data.pagination,
  };
}

export async function getTourGuideById(id: string): Promise<ITourGuideProfile> {
  const { data } = await request.get<ApiTourGuideDetailResponse>(`/tour-guide/${id}`);
  return mergeWithLocalStorage(id, toTourGuideProfile(data.data));
}

export async function createTourGuide(payload: TourGuideFormPayload): Promise<ApiTourGuideDetail> {
  const { data } = await request.post<ApiTourGuideDetailResponse>('/tour-guide', payload);
  return data.data;
}

export async function updateTourGuide(id: string, payload: TourGuideFormPayload): Promise<ApiTourGuideDetail> {
  const { data } = await request.put<ApiTourGuideDetailResponse>(`/tour-guide/${id}`, payload);
  return data.data;
}

export async function deleteTourGuide(id: string): Promise<void> {
  await request.delete(`/tour-guide/${id}`);
}

const toTourGuideMoment = (api: ApiTourGuideMoment): ITourGuideMoment => ({
  id: api.id,
  title: api.description || api.name,
  thumbnail: api.thumbnail ?? null,
  duration: formatDuration(api.duration),
  embedUrl: api.embedUrl,
  name: api.name,
  description: api.description ?? undefined,
});

export async function getTourGuideMoments({
  id,
  page = 1,
  pageSize = 10,
}: ITourGuideMomentsParams): Promise<ITourGuideMomentsResult> {
  const { data } = await request.get<ApiTourGuideMomentsResponse>(`/tour-guide/${id}/moment`, {
    params: { page, pageSize },
  });
  return {
    items: data.data.items.map(toTourGuideMoment),
    pagination: data.data.pagination,
  };
}

export async function createTourGuideMoment(
  guideId: string,
  payload: ApiCreateMomentPayload
): Promise<ApiTourGuideMoment> {
  const { data } = await request.post<ApiCreateMomentResponse>(`/tour-guide/${guideId}/moment`, payload);
  return data.data;
}

export async function updateTourGuideMoment(
  guideId: string,
  momentId: string,
  payload: ApiUpdateMomentPayload
): Promise<ApiTourGuideMoment> {
  const { data } = await request.put<ApiCreateMomentResponse>(`/tour-guide/${guideId}/moment/${momentId}`, payload);
  return data.data;
}

export async function deleteTourGuideMoment(guideId: string, momentId: string): Promise<void> {
  await request.delete(`/tour-guide/${guideId}/moment/${momentId}`);
}

export async function getTourGuideReviews({
  id,
  page = 1,
  pageSize = 10,
}: ITourGuideReviewParams): Promise<ITourGuideReviewResult> {
  const { data } = await request.get<ApiTourGuideReviewResponse>(`/tour-guide/${id}/review`, {
    params: { page, pageSize },
  });
  return {
    items: data.data.items.map(
      (r): ITourGuideReview => ({
        id: r.id,
        date: formatViDate(r.createdAt),
        content: r.comment,
        rating: r.point,
        images: (r.images ?? []).filter((u) => u.startsWith('http')),
        videos: (r.videos ?? []).filter((u) => u.startsWith('http')),
        authorId: r.user?.id ?? '',
        authorName: r.user?.name ?? 'Ẩn danh',
      })
    ),
    pagination: data.data.pagination,
  };
}
