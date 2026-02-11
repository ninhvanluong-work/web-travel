import type { IVideo } from './types';

const FAKE_VIDEOS: IVideo[] = [
  {
    id: '1',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4',
    title: 'Du lịch Miền Bắc',
    description: 'Khám phá vẻ đẹp thiên nhiên hùng vĩ và văn hóa độc đáo của miền Bắc Việt Nam.',
  },
  {
    id: '2',
    link: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Big Buck Bunny',
    description: 'Một đoạn phim hoạt hình ngắn hài hước về chú thỏ khổng lồ.',
  },
  {
    id: '3',
    link: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    title: 'Flower Blooming',
    description: 'Timelapse quá trình nở hoa tuyệt đẹp.',
  },
  {
    id: '4',
    link: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Du lịch Miền Bắc - Sapa',
    description: 'Khám phá thị trấn sương mù Sapa với những bản làng người Hmong, Dao.',
  },
  {
    id: '5',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4',
    title: 'Du lịch Miền Bắc - Hà Giang',
    description: 'Trải nghiệm cung đường đèo Mã Pí Lèng hùng vĩ và cao nguyên đá Đồng Văn.',
  },
  {
    id: '6',
    link: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    title: 'Du lịch Miền Bắc - Hạ Long',
    description: 'Chiêm ngưỡng vẻ đẹp kỳ quan thiên nhiên thế giới Vịnh Hạ Long.',
  },
  {
    id: '7',
    link: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Du lịch Miền Bắc - Ninh Bình',
    description: 'Thăm Tràng An, Tam Cốc - Bích Động, cố đô Hoa Lư.',
  },
  {
    id: '8',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4',
    title: 'Du lịch Miền Trung - Đà Nẵng',
    description: 'Thành phố đáng sống nhất Việt Nam với cầu Rồng, biển Mỹ Khê.',
  },
  {
    id: '9',
    link: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    title: 'Du lịch Miền Trung - Hội An',
    description: 'Phố cổ Hội An lung linh sắc màu đèn lồng về đêm.',
  },
  {
    id: '10',
    link: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Du lịch Miền Trung - Huế',
    description: 'Tham quan Đại Nội Huế, lăng tẩm các vua Nguyễn.',
  },
  {
    id: '11',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4',
    title: 'Du lịch Miền Nam - Sài Gòn',
    description: 'Thành phố Hồ Chí Minh sôi động và náo nhiệt.',
  },
  {
    id: '12',
    link: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    title: 'Du lịch Miền Nam - Cần Thơ',
    description: 'Chợ nổi Cái Răng, nét văn hóa sông nước miền Tây.',
  },
  {
    id: '13',
    link: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Du lịch Miền Nam - Phú Quốc',
    description: 'Thiên đường nghỉ dưỡng đảo ngọc Phú Quốc.',
  },
  {
    id: '14',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4',
    title: 'Du lịch Miền Bắc - Mộc Châu',
    description: 'Đồi chè xanh mướt và những mùa hoa cải trắng tinh khôi.',
  },
  {
    id: '15',
    link: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    title: 'Du lịch Miền Trung - Nha Trang',
    description: 'Biển xanh cát trắng nắng vàng tại thành phố biển Nha Trang.',
  },
  {
    id: '16',
    link: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Du lịch Miền Tây - An Giang',
    description: 'Rừng tràm Trà Sư mùa nước nổi.',
  },
  {
    id: '17',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4',
    title: 'Du lịch - Vũng Tàu',
    description: 'Cuối tuần thư giãn tại biển Vũng Tàu.',
  },
  {
    id: '18',
    link: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    title: 'Du lịch - Đà Lạt',
    description: 'Thành phố ngàn hoa với không khí se lạnh quanh năm.',
  },
];

// Mock request function
const request = async (_config: { url: string; method: string }) => {
  await new Promise((resolve) => {
    setTimeout(resolve, 1000);
  });
  return { data: FAKE_VIDEOS };
};

export const getListVideo = async (): Promise<IVideo[]> => {
  const { data } = await request({
    url: '/videos',
    method: 'GET',
  });
  return data;
};
