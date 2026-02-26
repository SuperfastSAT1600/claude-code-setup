import { BlogWriterAgent } from '@blog-agent/agents/blog-writer';
import type {
  ContentRequest,
  GeneratedContent,
} from '@blog-agent/types';
import type { SEOPlatform } from '@blog-agent/config/seo-config';
import type { LLMProviderType } from '@blog-agent/providers/llm-provider';

interface GenerateRequest {
  topic: string;
  seoPlatform: SEOPlatform;
  desiredLength: 'quick' | 'standard' | 'deep';
}

export class BlogGenerationService {
  /**
   * Generate a blog post using the BlogWriterAgent
   */
  async generate(request: GenerateRequest): Promise<GeneratedContent> {
    // Get API key from environment
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    // Create agent instance
    const agent = new BlogWriterAgent(apiKey, 'anthropic');

    // Derive target audience based on platform
    const targetAudience = this.deriveTargetAudience(request.seoPlatform);

    // Auto-derive SAT and web queries from topic
    const satQuery = this.deriveSATQuery(request.topic);
    const webQuery = this.deriveWebQuery(request.topic);

    // Build content request
    const contentRequest: ContentRequest = {
      topic: request.topic,
      targetAudience,
      desiredLength: request.desiredLength,
      includeReferences: true,
      satMaterialsQuery: satQuery,
      webSearchQuery: webQuery,
      seoPlatform: request.seoPlatform,
      llmProvider: 'anthropic' as LLMProviderType,
    };

    // Generate content
    return agent.generatePost(contentRequest);
  }

  /**
   * Complete an incomplete blog post
   */
  async complete(request: {
    title: string;
    incompleteContent: string;
    seoPlatform?: string;
    metadata?: any;
  }): Promise<GeneratedContent> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const agent = new BlogWriterAgent(apiKey, 'anthropic');

    // Build continuation prompt
    const continuationPrompt = `
The following blog post was incomplete. Please continue from where it left off and complete it naturally.

TITLE: ${request.title}

INCOMPLETE CONTENT:
${request.incompleteContent}

INSTRUCTIONS:
1. Analyze where the content stopped (mid-sentence, mid-paragraph, or mid-section)
2. Continue seamlessly from that exact point
3. Maintain the same tone, style, and formatting
4. Complete any unfinished sections
5. Add a proper conclusion if missing
6. Ensure the ending feels natural and complete

${request.seoPlatform ? `Platform: ${request.seoPlatform}` : ''}

Provide ONLY the continuation (starting from where it left off), in the same JSON format:
{
  "title": "Same title",
  "content": "CONTINUED content (include everything from start + new continuation)",
  "outline": [...],
  "references": [...],
  "metadata": {...}
}
`;

    // Use agent's LLM call directly
    const llmResponse = await (agent as any).callLLM(continuationPrompt);

    // Parse continuation response
    const parsed = (agent as any).parseResponse(llmResponse.text, request.seoPlatform);

    // Add completion status
    parsed.completionStatus = {
      isComplete: llmResponse.stopReason === 'end_turn',
      stopReason: llmResponse.stopReason,
      tokenUsage: llmResponse.tokenUsage
    };

    return parsed;
  }

  /**
   * Derive target audience from platform
   */
  private deriveTargetAudience(platform: SEOPlatform): string {
    const audiences = {
      google: 'SAT students seeking comprehensive test preparation strategies',
      naver: 'SAT를 준비하는 고등학생과 학부모',
      none: 'SAT test takers',
    };
    return audiences[platform];
  }

  /**
   * Derive SAT query from topic (extract key nouns)
   */
  private deriveSATQuery(topic: string): string {
    // Simple extraction: lowercase, remove common words
    const commonWords = new Set([
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
      'of',
      'with',
      'by',
    ]);

    const words = topic
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => !commonWords.has(word))
      .slice(0, 3);

    return words.join(' ');
  }

  /**
   * Derive web query from topic (append current year)
   */
  private deriveWebQuery(topic: string): string {
    return `${topic} ${new Date().getFullYear()}`;
  }
}
