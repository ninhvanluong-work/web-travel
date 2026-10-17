import * as z from 'zod';

import { requiredText } from './text-fields';

export const tourGuideReviewSchema = z.object({
  point: z.number({ required_error: 'ratingSheet.ratingRequired' }).min(1, 'ratingSheet.ratingRequired').max(5),
  // Normalized before validating: whitespace-only fails, inner line breaks are kept
  comment: requiredText({
    message: 'ratingSheet.commentRequired',
    max: 500,
    maxMessage: 'ratingSheet.commentMaxLength',
    multiline: true,
  }),
});

export type TourGuideReviewSchema = z.infer<typeof tourGuideReviewSchema>;
