import type { GeneratedContent } from '../types.js';

/**
 * Content Helper Utilities
 * Extract metadata and insights from generated content
 */

/**
 * Infer topic from title and content
 * @param content Generated content
 * @returns Extracted topic (max 100 chars)
 */
export function extractTopicFromContent(content: GeneratedContent): string {
  // Use title as primary topic
  if (content.title) {
    return content.title.slice(0, 100);
  }

  // Fallback: extract from first heading or paragraph
  const lines = content.content.split('\n').filter(l => l.trim().length > 0);
  const firstLine = lines[0]?.replace(/^#+\s*/, '') || '';

  return firstLine.slice(0, 100) || 'Untitled Topic';
}

/**
 * Infer target audience from keywords and content
 * @param content Generated content
 * @returns Identified audience segment
 */
export function extractAudienceFromContent(content: GeneratedContent): string {
  const lowerContent = content.content.toLowerCase();
  const lowerTitle = content.title.toLowerCase();

  // SAT-specific audience detection
  if (lowerContent.includes('student') || lowerContent.includes('학생')) {
    return 'SAT Students';
  }

  if (lowerTitle.includes('beginner') || lowerContent.includes('beginner')) {
    return 'SAT Beginners';
  }

  if (lowerTitle.includes('advanced') || lowerContent.includes('advanced')) {
    return 'Advanced SAT Students';
  }

  if (lowerContent.includes('parent') || lowerContent.includes('부모')) {
    return 'Parents of SAT Students';
  }

  if (lowerContent.includes('teacher') || lowerContent.includes('선생')) {
    return 'SAT Teachers';
  }

  // Default for SAT blog
  return 'General SAT Preparation Audience';
}

/**
 * Extract category from content and metadata
 * @param content Generated content
 * @returns Category string
 */
export function extractCategoryFromContent(content: GeneratedContent): string {
  // Use existing category if available
  if (content.metadata.category) {
    return content.metadata.category;
  }

  const lowerContent = content.content.toLowerCase();
  const lowerTitle = content.title.toLowerCase();

  // SAT section categories
  if (lowerTitle.includes('math') || lowerContent.includes('math')) {
    return 'SAT Math';
  }

  if (lowerTitle.includes('reading') || lowerContent.includes('reading')) {
    return 'SAT Reading';
  }

  if (lowerTitle.includes('writing') || lowerContent.includes('writing') || lowerContent.includes('grammar')) {
    return 'SAT Writing & Language';
  }

  if (lowerTitle.includes('essay') || lowerContent.includes('essay')) {
    return 'SAT Essay';
  }

  // Strategy categories
  if (lowerTitle.includes('strateg') || lowerContent.includes('strateg')) {
    return 'SAT Strategy';
  }

  if (lowerTitle.includes('tip') || lowerContent.includes('tip')) {
    return 'SAT Tips';
  }

  // Default
  return 'SAT Prep';
}

/**
 * Extract keywords from content for search and tagging
 * @param content Generated content
 * @param maxKeywords Maximum number of keywords to return
 * @returns Array of keywords
 */
export function extractKeywords(content: GeneratedContent, maxKeywords: number = 10): string[] {
  const keywords = new Set<string>();

  // Add existing tags
  content.metadata.tags?.forEach(tag => keywords.add(tag.toLowerCase()));

  // Extract from title
  const titleWords = content.title
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3);
  titleWords.forEach(w => keywords.add(w));

  // Extract common SAT-related terms
  const satTerms = [
    'sat', 'math', 'reading', 'writing', 'grammar', 'essay',
    'strategy', 'tip', 'practice', 'test', 'prep', 'score',
    'student', 'college', 'admission'
  ];

  const lowerContent = content.content.toLowerCase();
  satTerms.forEach(term => {
    if (lowerContent.includes(term)) {
      keywords.add(term);
    }
  });

  return Array.from(keywords).slice(0, maxKeywords);
}
