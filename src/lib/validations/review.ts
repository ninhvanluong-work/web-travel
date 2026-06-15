import * as z from 'zod';

export const tourGuideReviewSchema = z.object({
  point: z
    .number({ required_error: 'Vui lòng chọn số sao đánh giá' })
    .min(1, 'Vui lòng chọn số sao đánh giá')
    .max(5),
  comment: z
    .string()
    .min(1, 'Vui lòng nhập nhận xét của bạn')
    .max(500, 'Nhận xét không được vượt quá 500 ký tự'),
});

export type TourGuideReviewSchema = z.infer<typeof tourGuideReviewSchema>;
