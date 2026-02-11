/**
 * Core type definitions for Blog Agent System
 */

import type { SEOPlatform } from './config/seo-config.js';
import type { LLMProviderType } from './providers/llm-provider.js';

// ========================================
// Blog Post Types
// ========================================

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  metadata: PostMetadata;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostMetadata {
  category: string;
  tags: string[];
  author?: string;
  readingTime?: number;
  wordCount?: number;
}

// ========================================
// Source Material Types
// ========================================

export interface MyPost {
  id: string;
  title: string;
  content: string;
  style: WritingStyle;
  metadata: PostMetadata;
}

export interface SATMaterial {
  id: string;
  type: 'official-guide' | 'practice-test' | 'study-tip' | 'other';
  title: string;
  content: string;
  source: string;
  relevance?: number;
}

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
  content?: string;
  relevance: number;
  fetchedAt: Date;
}

// ========================================
// Writing Style Analysis
// ========================================

export interface WritingStyle {
  // Core style attributes
  tone: 'formal' | 'casual' | 'academic' | 'conversational';
  complexity: 'simple' | 'medium' | 'advanced';
  perspective: 'first-person' | 'second-person' | 'third-person';
  averageSentenceLength: number;
  commonPhrases: string[];
  vocabulary: 'basic' | 'intermediate' | 'advanced';

  // Enhanced style attributes (optional for backward compatibility)
  emojiUsage?: {
    frequency: 'none' | 'rare' | 'moderate' | 'heavy';
    commonEmojis: string[];  // e.g., ['🔥', '📌', '✅']
  };

  koreanPatterns?: {
    usesJondaemal: boolean;  // 존댓말 (formal polite: ~습니다, ~해요)
    usesGueoChae: boolean;   // 구어체 (conversational: ~했어요, ~거예요)
    hasEmpathy: boolean;     // 공감 표현 (empathy: 그쵸?, 맞죠?)
    commonKoreanPhrases: string[];  // Frequently used Korean expressions
  };

  headingStyle?: {
    usesNumbers: boolean;      // Uses numbered headings (1. 2. 3.)
    usesEmojisInHeadings: boolean;  // Emojis in headings
    averageHeadingLength: number;
  };

  engagementStyle?: {
    questionsPerSection: number;  // Average questions per section
    hasCTA: boolean;             // Has call-to-action
    ctaType?: 'comment' | 'share' | 'subscribe' | 'question';
  };

  structurePreferences?: {
    averageParagraphLength: number;  // Sentences per paragraph
    usesBulletPoints: boolean;
    usesNumberedLists: boolean;
    hasIntroGreeting: boolean;  // Starts with greeting (안녕하세요, 여러분)
    hasClosingRemarks: boolean; // Ends with closing (오늘도 화이팅, 궁금한 점 있으면)
  };
}

// ========================================
// Platform Content Rules
// ========================================

export interface PlatformContentRules {
  tone: string;
  perspective: string;
  introStyle: string;
  paragraphLength: string;
  headingFormat: string;
  keywordStrategy: string;
  engagementStyle: string;
  vocabularyLevel: string;
  sentenceComplexity: string;
  visualCues: string[];
  targetLength: { min: number; max: number };
  structurePreferences: string[];
}

// ========================================
// Content Generation
// ========================================

export interface ContentRequest {
  topic: string;
  targetAudience: string;
  desiredLength: number | 'quick' | 'standard' | 'deep';
  includeReferences: boolean;
  style?: Partial<WritingStyle>;
  satMaterialsQuery?: string;
  webSearchQuery?: string;
  seoPlatform?: SEOPlatform;
  llmProvider?: LLMProviderType;
  derivedKeywords?: string[];
}

export interface GeneratedContent {
  title: string;
  content: string;
  outline: string[];
  references: Reference[];
  metadata: PostMetadata;
  generatedAt: Date;
  seoMetadata?: SEOMetadata;
  seoPlatform?: SEOPlatform;  // Platform for format display (naver=text, google=markdown)
}

export interface SEOMetadata {
  // Google-specific fields
  metaDescription?: string;
  focusKeyword?: string;
  semanticKeywords?: string[];
  structuredDataType?: string;

  // Naver-specific fields
  naverKeyword?: string;
  keywordDensity?: string;
  targetKeywordCount?: number;
  engagementPrompt?: string;
}

export interface Reference {
  type: 'my-post' | 'sat-material' | 'web-search';
  title: string;
  url?: string;
  excerpt: string;
}

// ========================================
// Agent Configuration
// ========================================

export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  apiKey?: string;
  llmProvider: LLMProviderType;
  openaiApiKey?: string;
  openaiModel?: string;
}

export interface BlogWriterConfig extends AgentConfig {
  stylePreferences: Partial<WritingStyle>;
  defaultTemplate: string;
  enableWebSearch: boolean;
  enableSATReferences: boolean;
  enableMyPostsAnalysis: boolean;
}

// ========================================
// Prompt Building
// ========================================

export interface PromptContext {
  userRequest: ContentRequest;
  myPostsSamples: MyPost[];
  satMaterials: SATMaterial[];
  webResults: WebSearchResult[];
  styleGuide: WritingStyle;  // Always full WritingStyle (mergeStyles provides defaults)
}

export interface PromptTemplate {
  name: string;
  description: string;
  template: string;
  variables: string[];
}
