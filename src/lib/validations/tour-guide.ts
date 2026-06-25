import { z } from 'zod';

export const careerPathSchema = z
  .object({
    role: z.string().min(1, 'Role is required'),
    company: z.string().min(1, 'Company is required'),
    startYear: z.coerce.number().min(1990).max(new Date().getFullYear()),
    endYear: z.coerce.number().min(1990).max(new Date().getFullYear()).optional().nullable(),
    tourCount: z.coerce.number().min(0),
    description: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.endYear && data.endYear < data.startYear) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End year must be after start year',
        path: ['endYear'],
      });
    }
  });

export const tourGuideSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  avatar: z.string().optional().nullable(),
  coverImg: z.string().optional().nullable(),
  quote: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  expYear: z.coerce.number().min(0).max(50),
  languages: z.array(z.string()).min(1, 'Select at least 1 language'),
  experts: z.array(z.string()),
  careerPath: z.array(careerPathSchema),
});

export type TourGuideFormValues = z.infer<typeof tourGuideSchema>;
