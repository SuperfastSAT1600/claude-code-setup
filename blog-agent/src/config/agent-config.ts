import type { BlogWriterConfig } from '../types.js';
import type { LLMProviderType } from '../providers/llm-provider.js';

/**
 * Resolve LLM provider from environment variable
 */
function resolveLLMProvider(): LLMProviderType {
  const env = process.env.LLM_PROVIDER;
  if (env === 'openai' || env === 'anthropic') return env;
  return 'anthropic';
}

/**
 * Default configuration for Blog Writer Agent
 */
export const defaultBlogWriterConfig: BlogWriterConfig = {
  llmProvider: resolveLLMProvider(),
  model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5-20250929',
  temperature: parseFloat(process.env.CLAUDE_TEMPERATURE || '0.7'),
  maxTokens: parseInt(process.env.CLAUDE_MAX_TOKENS || '12000', 10),
  apiKey: process.env.ANTHROPIC_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o',

  systemPrompt: `You are an expert blog writer specializing in SAT preparation content.
Your role is to create engaging, informative, and well-structured blog posts that help students prepare for the SAT exam.

Key responsibilities:
1. Analyze the user's writing style from their previous posts
2. Reference official SAT materials for accuracy
3. Incorporate relevant web research for current trends
4. Maintain consistency with the user's tone and voice
5. Create content that is both educational and engaging

Always cite sources properly and ensure factual accuracy, especially when referencing SAT materials.`,

  stylePreferences: {
    tone: 'conversational',
    complexity: 'medium',
    perspective: 'second-person',
    vocabulary: 'intermediate',

    // Korean ending preference (enforce formal endings)
    koreanPreferences: {
      preferFormalEndings: process.env.PREFER_FORMAL_KOREAN !== 'false', // Default: true
      targetFormalRatio: parseFloat(process.env.TARGET_FORMAL_RATIO || '0.85'), // 85% formal
      enforceMinimumFormalRatio: 0.7  // Never go below 70%
    }
  },

  defaultTemplate: 'standard-blog-post',

  enableWebSearch: process.env.ENABLE_WEB_SEARCH === 'true',
  enableSATReferences: process.env.ENABLE_SAT_REFERENCES === 'true',
  enableMyPostsAnalysis: process.env.ENABLE_MY_POSTS_ANALYSIS === 'true',
  enableSupabaseStorage: process.env.ENABLE_SUPABASE_STORAGE !== 'false', // Default: true
  preferSupabasePosts: process.env.PREFER_SUPABASE_POSTS !== 'false', // Default: true
  enablePatternLearning: process.env.ENABLE_PATTERN_LEARNING !== 'false' // Default: true
};

/**
 * Path configurations
 */
export const paths = {
  myPosts: process.env.MY_POSTS_DIR || './data/my-posts',
  satMaterials: process.env.SAT_MATERIALS_DIR || './data/sat-materials',
  outputs: process.env.OUTPUTS_DIR || './data/outputs',
  drafts: process.env.OUTPUTS_DIR ? `${process.env.OUTPUTS_DIR}/drafts` : './data/outputs/drafts',
  published: process.env.OUTPUTS_DIR ? `${process.env.OUTPUTS_DIR}/published` : './data/outputs/published',
  references: './data/references'
};

/**
 * Cache configuration
 */
export const cacheConfig = {
  enabled: process.env.ENABLE_CACHE === 'true',
  ttlHours: parseInt(process.env.CACHE_TTL_HOURS || '24', 10)
};
