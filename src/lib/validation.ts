import { z } from 'zod';

export const blogFormSchema = z.object({
  seoPlatform: z.enum(['google', 'naver', 'none'], {
    message: 'Please select a platform',
  }),
  topic: z
    .string()
    .min(10, 'Topic must be at least 10 characters')
    .max(500, 'Topic must be less than 500 characters'),
  desiredLength: z.enum(['quick', 'standard', 'deep'], {
    message: 'Please select content length',
  }),
});

export type BlogFormData = z.infer<typeof blogFormSchema>;
