// ── Tour guide list (moved from ../product/types) ────────────────────────

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
  supplierReview: ApiTourGuideSupplierReview[];
  userReview: ApiTourGuideUserReview;
  careerPath: ApiTourGuideCareerPath[];
}

export interface ApiTourGuideDetailResponse {
  data: ApiTourGuideDetail;
  code: number;
  message: string;
  error: string | null;
}

// ── Domain model (mapped) ─────────────────────────────────────────────────

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
