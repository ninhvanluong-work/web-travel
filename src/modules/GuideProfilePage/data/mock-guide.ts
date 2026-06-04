export interface GuideProfileData {
  id: string;
  cardId: string;
  name: string;
  title: string;
  slogan: string;
  coverUrl?: string;
  bio: string;
  metrics: {
    toursLed: number;
    yearsOfExperience: number;
    languages: string[];
  };
  dispatches: Array<{
    code: string;
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
    bg: string;
    text: string;
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
  careerTimeline: Array<{
    id: string;
    companyName: string;
    role: string;
    period: string;
    description: string;
    isCurrent: boolean;
  }>;
}

export const MOCK_GUIDE: GuideProfileData = {
  id: '1',
  cardId: 'HN-2847',
  name: 'Nguyễn Văn Minh',
  title: 'Hướng dẫn viên · Hà Nội & vùng cao phía Bắc',
  slogan: '"Mỗi ngọn núi ở Sapa có một câu chuyện. Tôi chỉ mượn lời để kể lại."',
  coverUrl: '/images/sapa_cover.png',
  bio: 'Bố tôi là người Tày ở Lào Cai, mẹ tôi là người Hà Nội. Tôi lớn lên giữa hai thế giới — phố cổ và rừng núi — và mỗi tour của tôi là một cách để chia sẻ cả hai. Sau bảy năm dẫn khách, tôi vẫn xúc động khi thấy ai đó nhìn ruộng bậc thang lần đầu tiên.',
  metrics: {
    toursLed: 284,
    yearsOfExperience: 7,
    languages: ['VI', 'EN', 'FR'],
  },
  dispatches: [
    { code: 'VVV-BKG-2026-0284', tourName: 'Sapa 2D1N trek', date: '12/04/2026', status: 'completed' },
    { code: 'VVV-BKG-2026-0251', tourName: 'Tour làng nghề Hà Nội', date: '28/03/2026', status: 'completed' },
    { code: 'VVV-BKG-2026-0312', tourName: 'Quảng Phú Cầu & làng hương', date: '18/04/2026', status: 'completed' },
    { code: 'VVV-BKG-2026-0395', tourName: 'Sapa 3D2N private', date: '05/05/2026', status: 'upcoming' },
  ],
  operatorReviews: [
    {
      id: '1',
      companyName: 'VVV — Vietnam Village Vibes',
      tourName: 'Sapa 2D1N trek',
      date: 'Tháng 4/2026',
      rating: 5.0,
      comment:
        'Minh xử lý một tình huống khách bị lạc đường trong sương mù với sự bình tĩnh hiếm có. Đây là loại HDV chúng tôi muốn giao tour cao cấp.',
    },
    {
      id: '2',
      companyName: 'Hanoi Heritage Tours',
      tourName: 'Tour làng nghề',
      date: 'Tháng 11/2025',
      rating: 4.9,
      comment:
        'Kỹ năng kể chuyện vượt trội. Khách Pháp đặc biệt ấn tượng với cách Minh kết nối lịch sử thuộc địa với đời sống làng nghề hôm nay.',
    },
  ],
  guestFeedback: {
    totalReviews: 231,
    averageRating: 4.87,
    criteria: [
      { label: 'Storytelling', score: 4.92 },
      { label: 'Local knowledge', score: 4.95 },
      { label: 'Care & attention', score: 4.85 },
      { label: 'Safety awareness', score: 4.9 },
      { label: 'Punctuality', score: 4.82 },
      { label: 'English', score: 4.78 },
      { label: 'Hài hước & vui vẻ', score: 4.71 },
    ],
    featuredReviews: [
      {
        id: '1',
        author: 'Sarah K.',
        country: 'UK',
        tourName: 'Sapa trek',
        date: 'Tháng 4/2026',
        content:
          '"Minh\'s stories about Hmong culture made the trek unforgettable. We came for the mountains, we left feeling like we\'d been welcomed into a family."',
      },
      {
        id: '2',
        author: 'Pierre D.',
        country: 'Pháp',
        tourName: 'Tour làng hương',
        date: 'Tháng 4/2026',
        content: '"On a notre guide pour la vie. Mon fils de 8 ans n\'arrête pas de parler de Minh."',
      },
    ],
  },
  specialties: [
    { label: 'Trekking expert', bg: 'bg-[#EEEDFE]', text: 'text-[#3C3489]' },
    { label: 'Food storyteller', bg: 'bg-[#FAECE7]', text: 'text-[#712B13]' },
    { label: 'Family-friendly', bg: 'bg-[#E1F5EE]', text: 'text-[#085041]' },
    { label: 'Photography support', bg: 'bg-[#FAEEDA]', text: 'text-[#633806]' },
    { label: 'Premium private guide', bg: 'bg-[#FBEAF0]', text: 'text-[#72243E]' },
  ],
  moments: [
    {
      id: '1',
      title: '"Sương mù lúc 6 giờ sáng"',
      location: 'Cát Cát',
      duration: '0:42',
      videoId: 'mock-video-1',
      placeholderGradient: 'linear-gradient(160deg, #5DCAA5, #0F6E56)',
    },
    {
      id: '2',
      title: '"Mùi hương trầm ngày Tết"',
      location: 'Quảng Phú Cầu',
      duration: '1:08',
      videoId: 'mock-video-2',
      placeholderGradient: 'linear-gradient(160deg, #F0997B, #993C1D)',
    },
    {
      id: '3',
      title: '"Chợ phiên Bắc Hà sáng sớm"',
      location: 'Bắc Hà',
      duration: '2:14',
      videoId: 'mock-video-3',
      placeholderGradient: 'linear-gradient(160deg, #7EC8E3, #1A6B8A)',
    },
    {
      id: '4',
      title: '"Bếp lửa nhà người Mông"',
      location: 'Sapa',
      duration: '1:33',
      videoId: 'mock-video-4',
      placeholderGradient: 'linear-gradient(160deg, #F5C26B, #A05C1A)',
    },
  ],
  destinations: [
    { name: 'Hà Nội Old Quarter', toursCount: 112, percentage: 100 },
    { name: 'Sapa & Cát Cát', toursCount: 68, percentage: 61 },
    { name: 'Quảng Phú Cầu', toursCount: 54, percentage: 48 },
    { name: 'Ninh Bình · Tràng An', toursCount: 31, percentage: 28 },
    { name: 'Hạ Long bay', toursCount: 19, percentage: 17 },
  ],
  careerTimeline: [
    {
      id: '1',
      companyName: 'VVV — Vietnam Village Vibes',
      role: 'Lead guide',
      period: '2023 – nay',
      description: '184 tours · chuyên trekking và làng nghề',
      isCurrent: true,
    },
    {
      id: '2',
      companyName: 'Hanoi Heritage Tours',
      role: 'Senior guide',
      period: '2020 – 2023',
      description: '78 tours · Hà Nội, Ninh Bình',
      isCurrent: false,
    },
    {
      id: '3',
      companyName: 'Indochina Voyages',
      role: 'Junior guide',
      period: '2018 – 2020',
      description: '22 tours · vào nghề',
      isCurrent: false,
    },
  ],
};
