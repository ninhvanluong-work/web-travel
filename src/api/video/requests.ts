import type { IVideo } from './types';

const THUMBNAILS = [
  'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh2.jpg',
  'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh4.jpg',
  'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh9.jpg',
  'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
];

const FAKE_VIDEOS: IVideo[] = [
  {
    id: '1',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4',
    title: 'Du lịch Miền Bắc',
    description: 'Khám phá vẻ đẹp thiên nhiên hùng vĩ và văn hóa độc đáo của miền Bắc Việt Nam.',
    thumbnail: THUMBNAILS[0],
    likeCount: 4821,
  },
  {
    id: '2',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/BRUNEI%20-%20Cinematic%20Travel%20Video.mp4',
    title: 'Big Buck Bunny',
    description: 'Một đoạn phim hoạt hình ngắn hài hước về chú thỏ khổng lồ.',
    thumbnail: THUMBNAILS[1],
    likeCount: 2347,
  },
  {
    id: '3',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/JAPAN%20-%20Cinematic%20Travel%20Video%20-%20Weathering%20With%20You%20OST.mp4',
    title: 'Flower Blooming',
    description: 'Timelapse quá trình nở hoa tuyệt đẹp.',
    thumbnail: THUMBNAILS[2],
    likeCount: 9132,
  },
  {
    id: '4',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/JOURNEY%20TO%20VIETNAM%20-%20A%20Cinematic%20Travel%20Video.mp4',
    title: 'Du lịch Miền Bắc - Sapa',
    description: 'Khám phá thị trấn sương mù Sapa với những bản làng người Hmong, Dao.',
    thumbnail: THUMBNAILS[3],
    likeCount: 6548,
  },
  {
    id: '5',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Japans%20Unexplored%20Region%20-%20Train%20Trip%20on%20an%20Emerald%20Green%20Lake%20in%20Shizuoka%20-%20JAPAN%20TRAVEL%20VLOG.mp4',
    title: 'Du lịch Miền Bắc - Hà Giang',
    description: 'Trải nghiệm cung đường đèo Mã Pí Lèng hùng vĩ và cao nguyên đá Đồng Văn.',
    thumbnail: THUMBNAILS[0],
    likeCount: 7894,
  },
  {
    id: '6',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/LONDON%20-%20Cinematic%20Travel%20Video%20--%20England%20Travel%20Edit.mp4',
    title: 'Du lịch Miền Bắc - Hạ Long',
    description: 'Chiêm ngưỡng vẻ đẹp kỳ quan thiên nhiên thế giới Vịnh Hạ Long.',
    thumbnail: THUMBNAILS[1],
    likeCount: 5231,
  },
  {
    id: '7',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/My%20most%20beautiful%20drone%20shot%20%20Cinematic%20FPV%20on%20an%20empty%20beach.mp4',
    title: 'Du lịch Miền Bắc - Ninh Bình',
    description: 'Thăm Tràng An, Tam Cốc - Bích Động, cố đô Hoa Lư.',
    thumbnail: THUMBNAILS[2],
    likeCount: 3672,
  },
  {
    id: '8',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4',
    title: 'Du lịch Miền Trung - Đà Nẵng',
    description: 'Thành phố đáng sống nhất Việt Nam với cầu Rồng, biển Mỹ Khê.',
    thumbnail: THUMBNAILS[3],
    likeCount: 8415,
  },
  {
    id: '9',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/THE%20BEAUTY%20OF%20VIETNAM%20-%20A%20Cinematic%20Travel%20Film%20-%20BMPCC%206KPro.mp4',
    title: 'Du lịch Miền Trung - Hội An',
    description: 'Phố cổ Hội An lung linh sắc màu đèn lồng về đêm.',
    thumbnail: THUMBNAILS[0],
    likeCount: 6109,
  },
  {
    id: '10',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/The%20Coldest%20Village%20on%20Earth-%20Oymyakon%20(-71C,%20-96F).mp4',
    title: 'Du lịch Miền Trung - Huế',
    description: 'Tham quan Đại Nội Huế, lăng tẩm các vua Nguyễn.',
    thumbnail: THUMBNAILS[1],
    likeCount: 4387,
  },
  {
    id: '11',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/These%20are%20the%20only%20shots%20you%20will%20ever%20need..mp4',
    title: 'Du lịch Miền Nam - Sài Gòn',
    description: 'Thành phố Hồ Chí Minh sôi động và náo nhiệt.',
    thumbnail: THUMBNAILS[2],
    likeCount: 9876,
  },
  {
    id: '12',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Vietnam%20At%20A%20Glance%20-%2030-Second%20Journey%20Through%20Vietnam.mp4',
    title: 'Du lịch Miền Nam - Cần Thơ',
    description: 'Chợ nổi Cái Răng, nét văn hóa sông nước miền Tây.',
    thumbnail: THUMBNAILS[3],
    likeCount: 2891,
  },
  {
    id: '13',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Vietnam%20At%20A%20Glance%20-%2030-Second%20Journey%20Through%20Vietnam.mp4',
    title: 'Du lịch Miền Nam - Phú Quốc',
    description: 'Thiên đường nghỉ dưỡng đảo ngọc Phú Quốc.',
    thumbnail: THUMBNAILS[0],
    likeCount: 7453,
  },
  {
    id: '14',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4',
    title: 'Du lịch Miền Bắc - Mộc Châu',
    description: 'Đồi chè xanh mướt và những mùa hoa cải trắng tinh khôi.',
    thumbnail: THUMBNAILS[1],
    likeCount: 1234,
  },
  {
    id: '15',
    link: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    title: 'Du lịch Miền Trung - Nha Trang',
    description: 'Biển xanh cát trắng nắng vàng tại thành phố biển Nha Trang.',
    thumbnail: THUMBNAILS[2],
    likeCount: 5678,
  },
  {
    id: '16',
    link: 'https://www.w3schools.com/html/mov_bbb.mp4',
    title: 'Du lịch Miền Tây - An Giang',
    description: 'Rừng tràm Trà Sư mùa nước nổi.',
    thumbnail: THUMBNAILS[3],
    likeCount: 3321,
  },
  {
    id: '17',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4',
    title: 'Du lịch - Vũng Tàu',
    description: 'Cuối tuần thư giãn tại biển Vũng Tàu.',
    thumbnail: THUMBNAILS[0],
    likeCount: 8762,
  },
  {
    id: '18',
    link: 'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Welcome%20to%20Vietnam.mp4',
    title: 'Du lịch - Đà Lạt',
    description: 'Thành phố ngàn hoa với không khí se lạnh quanh năm.',
    thumbnail: THUMBNAILS[1],
    likeCount: 4095,
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
