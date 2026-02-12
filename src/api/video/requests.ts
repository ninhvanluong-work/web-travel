import type { IVideo } from './types';

const FAKE_VIDEOS: IVideo[] = [
  {
    id: '1',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4',
    title: 'Du lịch Miền Bắc',
    description: 'Khám phá vẻ đẹp thiên nhiên hùng vĩ và văn hóa độc đáo của miền Bắc Việt Nam.',
    thumbnail: 'https://placehold.co/600x400?text=Mien+Bac',
  },
  {
    id: '2',
    link: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Big Buck Bunny',
    description: 'Một đoạn phim hoạt hình ngắn hài hước về chú thỏ khổng lồ.',
    thumbnail: 'https://placehold.co/600x400?text=Bunny',
  },
  {
    id: '3',
    link: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    title: 'Flower Blooming',
    description: 'Timelapse quá trình nở hoa tuyệt đẹp.',
    thumbnail: 'https://placehold.co/600x400?text=Flower',
  },
  {
    id: '4',
    link: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Du lịch Miền Bắc - Sapa',
    description: 'Khám phá thị trấn sương mù Sapa với những bản làng người Hmong, Dao.',
    thumbnail: 'https://placehold.co/600x400?text=Sapa',
  },
  {
    id: '5',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4',
    title: 'Du lịch Miền Bắc - Hà Giang',
    description: 'Trải nghiệm cung đường đèo Mã Pí Lèng hùng vĩ và cao nguyên đá Đồng Văn.',
    thumbnail: 'https://placehold.co/600x400?text=Ha+Giang',
  },
  {
    id: '6',
    link: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    title: 'Du lịch Miền Bắc - Hạ Long',
    description: 'Chiêm ngưỡng vẻ đẹp kỳ quan thiên nhiên thế giới Vịnh Hạ Long.',
    thumbnail: 'https://placehold.co/600x400?text=Ha+Long',
  },
  {
    id: '7',
    link: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Du lịch Miền Bắc - Ninh Bình',
    description: 'Thăm Tràng An, Tam Cốc - Bích Động, cố đô Hoa Lư.',
    thumbnail: 'https://placehold.co/600x400?text=Ninh+Binh',
  },
  {
    id: '8',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4',
    title: 'Du lịch Miền Trung - Đà Nẵng',
    description: 'Thành phố đáng sống nhất Việt Nam với cầu Rồng, biển Mỹ Khê.',
    thumbnail: 'https://placehold.co/600x400?text=Da+Nang',
  },
  {
    id: '9',
    link: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    title: 'Du lịch Miền Trung - Hội An',
    description: 'Phố cổ Hội An lung linh sắc màu đèn lồng về đêm.',
    thumbnail: 'https://placehold.co/600x400?text=Hoi+An',
  },
  {
    id: '10',
    link: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Du lịch Miền Trung - Huế',
    description: 'Tham quan Đại Nội Huế, lăng tẩm các vua Nguyễn.',
    thumbnail: 'https://placehold.co/600x400?text=Hue',
  },
  {
    id: '11',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4',
    title: 'Du lịch Miền Nam - Sài Gòn',
    description: 'Thành phố Hồ Chí Minh sôi động và náo nhiệt.',
    thumbnail: 'https://placehold.co/600x400?text=Sai+Gon',
  },
  {
    id: '12',
    link: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    title: 'Du lịch Miền Nam - Cần Thơ',
    description: 'Chợ nổi Cái Răng, nét văn hóa sông nước miền Tây.',
    thumbnail: 'https://placehold.co/600x400?text=Can+Tho',
  },
  {
    id: '13',
    link: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Du lịch Miền Nam - Phú Quốc',
    description: 'Thiên đường nghỉ dưỡng đảo ngọc Phú Quốc.',
    thumbnail: 'https://placehold.co/600x400?text=Phu+Quoc',
  },
  {
    id: '14',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4',
    title: 'Du lịch Miền Bắc - Mộc Châu',
    description: 'Đồi chè xanh mướt và những mùa hoa cải trắng tinh khôi.',
    thumbnail: 'https://placehold.co/600x400?text=Moc+Chau',
  },
  {
    id: '15',
    link: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    title: 'Du lịch Miền Trung - Nha Trang',
    description: 'Biển xanh cát trắng nắng vàng tại thành phố biển Nha Trang.',
    thumbnail: 'https://placehold.co/600x400?text=Nha+Trang',
  },
  {
    id: '16',
    link: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Du lịch Miền Tây - An Giang',
    description: 'Rừng tràm Trà Sư mùa nước nổi.',
    thumbnail: 'https://placehold.co/600x400?text=An+Giang',
  },
  {
    id: '17',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4',
    title: 'Du lịch - Vũng Tàu',
    description: 'Cuối tuần thư giãn tại biển Vũng Tàu.',
    thumbnail: 'https://placehold.co/600x400?text=Vung+Tau',
  },
  {
    id: '18',
    link: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    title: 'Du lịch - Đà Lạt',
    description: 'Thành phố ngàn hoa với không khí se lạnh quanh năm.',
    thumbnail: 'https://placehold.co/600x400?text=Da+Lat',
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
