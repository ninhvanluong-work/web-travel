import { z } from 'zod';

export const careerPathSchema = z.object({
  role: z.string().min(1, 'Nhập chức danh'),
  company: z.string().min(1, 'Nhập tên công ty'),
  startYear: z.coerce.number().min(1990).max(new Date().getFullYear()),
  tourCount: z.coerce.number().min(0),
  description: z.string().optional().default(''),
});

export const tourGuideSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống'),
  avatar: z.string().optional().nullable(),
  coverImg: z.string().optional().nullable(),
  quote: z.string().optional().nullable(),
  summary: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  expYear: z.coerce.number().min(0).max(50),
  languages: z.array(z.string()).min(1, 'Chọn ít nhất 1 ngôn ngữ'),
  experts: z.array(z.string()),
  careerPath: z.array(careerPathSchema),
});

export type TourGuideFormValues = z.infer<typeof tourGuideSchema>;
