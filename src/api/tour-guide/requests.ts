import { request } from '../axios';
import type {
  ApiTourGuide,
  ApiTourGuideDetail,
  ApiTourGuideDetailResponse,
  ApiTourGuideListResponse,
  ITourGuideProfile,
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
  destinations: [],
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
    items: items.map((x: ApiTourGuide) => ({ id: x.id, name: x.name })),
    nextPage: pagination.page < pagination.totalPages ? pagination.page + 1 : undefined,
  };
}

export async function getTourGuideById(id: string): Promise<ITourGuideProfile> {
  const { data } = await request.get<ApiTourGuideDetailResponse>(`/tour-guide/${id}`);
  return toTourGuideProfile(data.data);
}
