import type { GeneratedContent, Reference } from '../types.js';

/**
 * Format generated content as markdown with frontmatter
 */
export function formatAsMarkdown(generated: GeneratedContent): string {
  let frontmatter = `---
title: "${generated.title}"
category: ${generated.metadata.category}
tags: [${generated.metadata.tags.join(', ')}]
generated: ${generated.generatedAt.toISOString()}
readingTime: ${generated.metadata.readingTime || calculateReadingTime(generated.content)}`;

  // Add SEO metadata to frontmatter if present
  if (generated.seoMetadata && Object.keys(generated.seoMetadata).length > 0) {
    for (const [key, value] of Object.entries(generated.seoMetadata)) {
      if (Array.isArray(value)) {
        frontmatter += `\n${key}: [${value.join(', ')}]`;
      } else {
        frontmatter += `\n${key}: ${JSON.stringify(value)}`;
      }
    }
  }

  frontmatter += '\n---\n\n';

  let content = frontmatter + generated.content;

  if (generated.references.length > 0) {
    content += '\n\n## 참고 자료\n\n';
    generated.references.forEach((ref: Reference, i: number) => {
      if (ref.url) {
        content += `${i + 1}. [${ref.title}](${ref.url})\n`;
      } else {
        content += `${i + 1}. ${ref.title}\n`;
      }
    });
  }

  return content;
}

/**
 * Convert title to URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);
}

/**
 * Count words in text
 */
export function countWords(text: string): number {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Calculate reading time in minutes
 */
export function calculateReadingTime(text: string): number {
  const WORDS_PER_MINUTE = 200;
  return Math.ceil(countWords(text) / WORDS_PER_MINUTE);
}
