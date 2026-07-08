import { driver } from 'driver.js';
import { useEffect } from 'react';

interface ProfileOnboardingProps {
  isReady: boolean;
  replayTrigger: number;
  hasSeen: boolean;
  markAsSeen: () => void;
}

export default function ProfileOnboarding({ isReady, replayTrigger, hasSeen, markAsSeen }: ProfileOnboardingProps) {
  useEffect(() => {
    if (!isReady) return;
    if (hasSeen && replayTrigger === 0) return;

    const driverObj = driver({
      showProgress: true,
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayOpacity: 0.65,
      nextBtnText: 'Tiếp tục →',
      prevBtnText: '← Quay lại',
      doneBtnText: 'Bắt đầu thôi!',
      onDestroyed: () => {
        markAsSeen();
      },
      steps: [
        {
          popover: {
            title: 'Chào mừng đến với Hồ sơ của bạn! 🎉',
            description:
              'Đây là trang cá nhân của bạn, nơi du khách và các đơn vị lữ hành sẽ nhìn thấy. Hãy cùng khám phá cách làm cho hồ sơ của bạn thật ấn tượng nhé!',
          },
        },
        {
          element: '#tour-hero',
          popover: {
            title: 'Ảnh đại diện & Ảnh bìa',
            description:
              'Một bức ảnh chuyên nghiệp và nụ cười rạng rỡ sẽ là điểm cộng lớn. Nhấn vào đây để cập nhật những hình ảnh đẹp nhất của bạn.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-action-bar',
          popover: {
            title: 'Thanh công cụ',
            description:
              'Nơi bạn có thể chỉnh sửa thông tin nhanh, chia sẻ hồ sơ (Share), hoặc xem các thống kê cá nhân.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-storytelling',
          popover: {
            title: 'Câu chuyện của bạn',
            description:
              'Hãy kể cho du khách nghe về đam mê, kinh nghiệm và phong cách dẫn tour độc đáo của bạn. Một câu chuyện hay sẽ tạo nên sự kết nối tuyệt vời.',
            side: 'bottom',
            align: 'start',
          },
        },
        {
          element: '#tour-stats',
          popover: {
            title: 'Thành tích & Chỉ số',
            description:
              'Các con số biết nói! Nơi này tổng hợp số tour bạn đã dẫn, số năm kinh nghiệm và số ngôn ngữ bạn sử dụng.',
            side: 'top',
            align: 'start',
          },
        },
        {
          element: '#tour-moments',
          popover: {
            title: 'Khoảnh khắc đáng nhớ',
            description:
              'Đăng tải những bức ảnh tuyệt đẹp từ các chuyến đi của bạn. Đây là "portfolio" trực quan nhất để thuyết phục khách hàng.',
            side: 'top',
            align: 'start',
          },
        },
        {
          popover: {
            title: 'Bạn đã sẵn sàng! 🚀',
            description: 'Giờ thì hãy bắt đầu cập nhật thông tin và sẵn sàng cho những chuyến đi tuyệt vời sắp tới!',
          },
        },
      ],
    });

    driverObj.drive();

    return () => {
      driverObj.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, replayTrigger]);

  return null;
}
