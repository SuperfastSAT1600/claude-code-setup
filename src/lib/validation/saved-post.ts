import { z } from 'zod';

export const referenceSchema = z.object({
  type: z.enum(['my-post', 'sat-material', 'web-search']),
  title: z.string().min(1, 'Reference title is required'),
  url: z.string().url().optional().or(z.literal('')),
  excerpt: z.string(),
});

export const postMetadataSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  readingTime: z.number().optional(),
  wordCount: z.number().optional(),
});

export const seoMetadataSchema = z.object({
  metaDescription: z.string().optional(),
  focusKeyword: z.string().optional(),
  semanticKeywords: z.array(z.string()).optional(),
  structuredDataType: z.string().optional(),
  naverKeyword: z.string().optional(),
  keywordDensity: z.string().optional(),
  targetKeywordCount: z.number().optional(),
  engagementPrompt: z.string().optional(),
});

export const generatedContentSchema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters'),
  content: z.string().min(100, 'Content must be at least 100 characters'),
  outline: z.array(z.string()).default([]),
  references: z.array(referenceSchema).default([]),
  metadata: postMetadataSchema,
  generatedAt: z.coerce.date(),
  seoMetadata: seoMetadataSchema.optional(),
});

export type GeneratedContentFormData = z.infer<typeof generatedContentSchema>;
