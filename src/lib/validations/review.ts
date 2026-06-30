import * as z from 'zod';

export const tourGuideReviewSchema = z.object({
  point: z.number({ required_error: 'ratingSheet.ratingRequired' }).min(1, 'ratingSheet.ratingRequired').max(5),
  comment: z.string().min(1, 'ratingSheet.commentRequired').max(500, 'ratingSheet.commentMaxLength'),
});

export type TourGuideReviewSchema = z.infer<typeof tourGuideReviewSchema>;
