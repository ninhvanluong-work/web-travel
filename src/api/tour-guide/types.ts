// ── Tour guide list (moved from ../product/types) ────────────────────────
// ApiTourGuide: used by ApiProductDetail.tourGuides (has ratingStar from product detail API)

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

// ApiTourGuideListItem: actual shape returned by GET /tour-guide list endpoint
// ⚠️ uses ratingValue (not ratingStar — confirmed from real API)
export interface ApiTourGuideListItem {
  id: string;
  createdAt: string;
  name: string;
  avatar: string | null;
  ratingCount: number;
  expYear: number;
  ratingValue: number;
}

export interface ApiTourGuideListResponse {
  data: {
    items: ApiTourGuideListItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  code: number;
  error: string | null;
  message: string;
}

// ── Raw API sub-types — GET /tour-guide/:id ───────────────────────────────

export interface ApiTourGuideSupplierReview {
  id: string;
  name: string;
  point: number;
  content: string;
  tourName: string;
  createdAt: string;
}

export interface ApiTourGuideUserRating {
  key: string;
  name: string;
  value: number;
}

export interface ApiTourGuideUserReview {
  ratings: ApiTourGuideUserRating[];
  reviewCount: number;
  reviewValue: number;
}

export interface ApiTourGuideCareerPath {
  role: string;
  company: string;
  startYear: number;
  tourCount: number;
  description: string;
}

export interface ApiTourGuideDestinationSummary {
  destinationId: string;
  destinationName: string;
  productCount: number;
}

export interface ApiTourGuideDetail {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  name: string;
  avatar: string | null;
  ratingCount: number;
  expYear: number;
  ratingValue: number;
  quote: string | null;
  coverImg: string | null;
  summary: string | null;
  description: string | null;
  languages: string[];
  experts: string[];
  supplierReview: ApiTourGuideSupplierReview[] | null;
  userReview: ApiTourGuideUserReview;
  careerPath: ApiTourGuideCareerPath[];
  destinationSummary: ApiTourGuideDestinationSummary[] | null;
  totalProducts: number;
}

export interface ApiTourGuideDetailResponse {
  data: ApiTourGuideDetail;
  code: number;
  message: string;
  error: string | null;
}

export interface ApiTourGuideReviewItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  comment: string;
  point: number;
  images: string[] | null;
  videos: string[] | null;
  user: {
    id: string;
    name: string;
  } | null;
}

export interface ApiTourGuideReviewResponse {
  data: {
    items: ApiTourGuideReviewItem[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
  code: number;
  message: string;
  error: string | null;
}

// ── Domain model — review ─────────────────────────────────────────────────

export interface ITourGuideReview {
  id: string;
  date: string;
  content: string;
  rating: number;
  images: string[];
  videos: string[];
  authorId: string;
  authorName: string;
}

export interface ITourGuideReviewResult {
  items: ITourGuideReview[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ITourGuideReviewParams {
  id: string;
  page?: number;
  pageSize?: number;
}

// ── Admin list — domain model ─────────────────────────────────────────────

export interface ITourGuide {
  id: string;
  createdAt: string;
  name: string;
  avatar: string | null;
  ratingCount: number;
  expYear: number;
  ratingValue: number;
}

export interface ITourGuidePagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ITourGuideListResult {
  items: ITourGuide[];
  pagination: ITourGuidePagination;
}

export interface ITourGuideListParams {
  keyword?: string;
  page?: number;
  pageSize?: number;
}

// ── Form payload (POST / PUT) ─────────────────────────────────────────────

export interface TourGuideFormPayload {
  name: string;
  avatar?: string;
  expYear: number;
  quote?: string;
  coverImg?: string;
  summary?: string;
  description?: string;
  languages: string[];
  experts: string[];
  careerPath: Array<{
    company: string;
    role: string;
    startYear: number;
    tourCount: number;
    description: string;
  }>;
}

// ── Domain model — profile (mapped from detail API) ───────────────────────

export interface ITourGuideProfile {
  id: string;
  cardId: string;
  name: string;
  title: string;
  slogan: string;
  coverUrl: string | undefined;
  avatarUrl: string | undefined;
  bio: string;
  metrics: {
    toursLed: number;
    yearsOfExperience: number;
    languages: string[];
  };
  specialties: Array<{ label: string; bg: string; text: string }>;
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
  careerTimeline: Array<{
    id: string;
    companyName: string;
    role: string;
    period: string;
    description: string;
    isCurrent: boolean;
  }>;
  dispatches: Array<{
    code: string;
    tourName: string;
    date: string;
    status: 'completed' | 'upcoming';
  }>;
  moments: Array<{
    id: string;
    title: string;
    location: string;
    duration: string;
    videoId: string;
    placeholderGradient: string;
  }>;
  destinations: Array<{
    name: string;
    toursCount: number;
    percentage: number;
  }>;
}
