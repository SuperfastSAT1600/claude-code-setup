import type { ContentRequest } from './types.js';
import type { SEOPlatform } from './config/seo-config.js';
import type { LLMProviderType } from './providers/llm-provider.js';
import { SEO_PLATFORM_LABELS } from './config/seo-config.js';
import { Logger } from './utils/logger.js';

const LLM_PROVIDER_LABELS: Record<LLMProviderType, string> = {
  anthropic: 'Anthropic Claude (claude-sonnet-4-5)',
  openai: 'OpenAI GPT (gpt-4o)'
};

// ========================================
// Auto-Derivation Helper Functions
// ========================================

/**
 * Extract keywords from topic using simple NLP
 */
function deriveKeywordsFromTopic(topic: string): string[] {
  // Common stop words to filter out
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'should', 'could', 'may', 'might', 'must', 'can', 'about'
  ]);

  // Split by common delimiters and clean
  const words = topic
    .toLowerCase()
    .split(/[\s,:\-\/]+/)
    .map(w => w.trim())
    .filter(w => w.length > 2 && !stopWords.has(w));

  // Return unique keywords (max 5)
  return [...new Set(words)].slice(0, 5);
}

/**
 * Get platform-specific default target audience
 */
function deriveTargetAudience(platform: SEOPlatform): string {
  const defaults: Record<SEOPlatform, string> = {
    google: 'SAT students seeking comprehensive test preparation strategies',
    naver: 'SAT를 준비하는 고등학생과 학부모',
    none: 'SAT test takers'
  };
  return defaults[platform];
}

/**
 * Extract key nouns from topic for SAT materials query
 */
function deriveSATQuery(topic: string): string {
  const keywords = deriveKeywordsFromTopic(topic);
  // Take first 2-3 most relevant keywords
  return keywords.slice(0, 3).join(' ');
}

/**
 * Generate web search query with current year
 */
function deriveWebQuery(topic: string): string {
  const currentYear = new Date().getFullYear();
  return `${topic} ${currentYear}`;
}

/**
 * Map length choice to word count
 */
function getLengthRange(length: 'quick' | 'standard' | 'deep'): number {
  const ranges = {
    quick: 1000,
    standard: 1500,
    deep: 2000
  };
  return ranges[length];
}

/**
 * Interactive CLI for blog generation
 */
export class BlogCLI {
  /**
   * Run interactive prompt to get user input (SIMPLIFIED)
   */
  static async getContentRequest(): Promise<ContentRequest> {
    console.log('\n🚀 Blog Agent - SAT Content Writer\n');

    try {
      // Dynamic import for CommonJS module
      const enquirer = (await import('enquirer')).default;

      // SIMPLIFIED: Only 4 prompts
      const responses = await enquirer.prompt<{
        seoPlatform: SEOPlatform;
        topic: string;
        desiredLength: 'quick' | 'standard' | 'deep';
        additionalKeywords: string;
      }>([
        {
          type: 'select',
          name: 'seoPlatform',
          message: '🎯 SEO 플랫폼:',
          choices: [
            { name: 'google', message: SEO_PLATFORM_LABELS.google },
            { name: 'naver', message: SEO_PLATFORM_LABELS.naver },
            { name: 'none', message: SEO_PLATFORM_LABELS.none }
          ],
          initial: 0
        },
        {
          type: 'input',
          name: 'topic',
          message: '📝 블로그 주제:',
          initial: 'SAT Reading Comprehension Strategies',
          validate: (value: string) => value.length > 0 || '주제를 입력해주세요'
        },
        {
          type: 'select',
          name: 'desiredLength',
          message: '📏 콘텐츠 길이:',
          choices: [
            { name: 'quick', message: 'Quick (800-1000 words)' },
            { name: 'standard', message: 'Standard (1200-1500 words)' },
            { name: 'deep', message: 'Deep (1800-2500 words)' }
          ],
          initial: 1
        },
        {
          type: 'input',
          name: 'additionalKeywords',
          message: '🔑 추가 검색 키워드 (선택, Enter to skip):',
          initial: ''
        }
      ]);

      // Auto-derive missing fields
      const derivedKeywords = deriveKeywordsFromTopic(responses.topic);
      const targetAudience = deriveTargetAudience(responses.seoPlatform);
      const satQuery = deriveSATQuery(responses.topic);
      const webQuery = deriveWebQuery(responses.topic);
      const desiredLength = getLengthRange(responses.desiredLength);

      // Get LLM provider from environment variable
      const llmProvider = (process.env.LLM_PROVIDER as LLMProviderType) || 'anthropic';

      const request: ContentRequest = {
        topic: responses.topic,
        targetAudience,
        desiredLength: responses.desiredLength,
        includeReferences: true,
        seoPlatform: responses.seoPlatform,
        llmProvider,
        satMaterialsQuery: satQuery,
        webSearchQuery: webQuery,
        derivedKeywords
      };

      // Display summary with auto-derived values
      console.log('\n📋 설정 확인:');
      console.log(`   AI 모델: ${LLM_PROVIDER_LABELS[llmProvider]} (from env)`);
      console.log(`   플랫폼: ${SEO_PLATFORM_LABELS[request.seoPlatform]}`);
      console.log(`   주제: ${request.topic}`);
      console.log(`   자동 추출 키워드: ${derivedKeywords.join(', ')}`);
      if (responses.additionalKeywords) {
        console.log(`   추가 키워드: ${responses.additionalKeywords}`);
      }
      console.log(`   타겟 독자: ${targetAudience} (platform default)`);
      console.log(`   길이: ${responses.desiredLength} (약 ${desiredLength} 단어)`);
      console.log(`   SAT 검색: "${satQuery}" (auto-derived)`);
      console.log(`   웹 검색: "${webQuery}" (auto-derived)`);
      console.log('');

      return request;
    } catch (error) {
      Logger.error('CLI prompt cancelled or failed:', error);
      throw new Error('User cancelled the prompt');
    }
  }

  /**
   * Simple confirmation prompt
   */
  static async confirm(message: string): Promise<boolean> {
    try {
      const enquirer = (await import('enquirer')).default;
      const response = await enquirer.prompt<{ confirmed: boolean }>({
        type: 'confirm',
        name: 'confirmed',
        message,
        initial: true
      });
      return response.confirmed;
    } catch {
      return false;
    }
  }

  /**
   * Display progress
   */
  static showProgress(message: string) {
    console.log(`⏳ ${message}...`);
  }

  /**
   * Display success
   */
  static showSuccess(message: string) {
    console.log(`✅ ${message}`);
  }

  /**
   * Display error
   */
  static showError(message: string) {
    console.log(`❌ ${message}`);
  }

  /**
   * Display info
   */
  static showInfo(message: string) {
    console.log(`ℹ️  ${message}`);
  }
}
