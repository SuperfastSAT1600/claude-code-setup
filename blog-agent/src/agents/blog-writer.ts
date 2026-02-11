import type { ContentRequest, GeneratedContent, PromptContext } from '../types.js';
import type { LLMProvider, LLMProviderType } from '../providers/llm-provider.js';
import { createLLMProvider } from '../providers/index.js';
import { defaultBlogWriterConfig } from '../config/agent-config.js';
import { MyPostsLoader } from '../sources/my-posts-loader.js';
import { MyPostsPDFLoader } from '../sources/my-posts-pdf-loader.js';
import { SATMaterialsLoader } from '../sources/sat-materials-loader.js';
import { SATMaterialsPDFLoader } from '../sources/sat-materials-pdf-loader.js';
import { WebSearchEngine } from '../sources/web-search-engine.js';
import { Logger } from '../utils/logger.js';
import { fillTemplate, CONTENT_GENERATION_PROMPT } from '../config/prompts.js';
import { getSEOConfig } from '../config/seo-config.js';

/**
 * Main Blog Writer Agent
 * Orchestrates content generation using user's style, SAT materials, and web research
 */
export class BlogWriterAgent {
  private provider: LLMProvider;
  private config = defaultBlogWriterConfig;

  constructor(apiKey?: string, providerType?: LLMProviderType) {
    const type = providerType || this.config.llmProvider;
    const key = type === 'openai'
      ? (apiKey || this.config.openaiApiKey)
      : (apiKey || this.config.apiKey);

    if (!key) {
      const envVar = type === 'openai' ? 'OPENAI_API_KEY' : 'ANTHROPIC_API_KEY';
      throw new Error(`${envVar} not found. Set it in .env`);
    }

    this.provider = createLLMProvider(type, key);
    Logger.info(`Using LLM provider: ${type}`);
  }

  /**
   * Generate a blog post based on the request
   */
  async generatePost(request: ContentRequest): Promise<GeneratedContent> {
    Logger.info('Starting blog post generation for topic:', request.topic);

    try {
      // 1. Gather context
      const context = await this.gatherContext(request);

      // 2. Build prompt
      const prompt = this.buildPrompt(request, context);

      // 3. Call LLM API
      const response = await this.callLLM(prompt);

      // 4. Parse and return result
      const generated = this.parseResponse(response, request.seoPlatform);

      Logger.info('Blog post generation completed successfully');
      return generated;
    } catch (error) {
      Logger.error('Failed to generate blog post:', error);
      throw error;
    }
  }

  /**
   * Gather all necessary context for content generation
   */
  private async gatherContext(request: ContentRequest): Promise<PromptContext> {
    Logger.info('Gathering context...');

    // Load from both markdown and PDF sources
    const [mdPosts, pdfPosts, mdSAT, pdfSAT, webResults] = await Promise.all([
      this.config.enableMyPostsAnalysis
        ? MyPostsLoader.getSamples(5)
        : Promise.resolve([]),
      this.config.enableMyPostsAnalysis
        ? MyPostsPDFLoader.getSamples(5)
        : Promise.resolve([]),
      this.config.enableSATReferences && request.satMaterialsQuery
        ? SATMaterialsLoader.search(request.satMaterialsQuery)
        : Promise.resolve([]),
      this.config.enableSATReferences && request.satMaterialsQuery
        ? SATMaterialsPDFLoader.search(request.satMaterialsQuery)
        : Promise.resolve([]),
      this.config.enableWebSearch && request.webSearchQuery
        ? new WebSearchEngine().search(request.webSearchQuery, 5)
        : Promise.resolve([])
    ]);

    // Combine posts from both sources
    const myPosts = [...mdPosts, ...pdfPosts];
    const satMaterials = [...mdSAT, ...pdfSAT]
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
      .slice(0, 5); // Top 5 most relevant

    Logger.info(`Loaded ${myPosts.length} user posts (${mdPosts.length} MD, ${pdfPosts.length} PDF)`);
    Logger.info(`Loaded ${satMaterials.length} SAT materials (${mdSAT.length} MD, ${pdfSAT.length} PDF)`);
    Logger.info(`Found ${webResults.length} web search results`);

    // Merge styles from all posts (use average of multiple posts)
    // mergeStyles() returns full WritingStyle with defaults if no posts available
    const styleGuide = this.mergeStyles(myPosts.map(p => p.style));

    return {
      userRequest: request,
      myPostsSamples: myPosts,
      satMaterials,
      webResults,
      styleGuide
    };
  }

  /**
   * Merge writing styles from multiple posts to create average style profile
   */
  private mergeStyles(styles: import('../types.js').WritingStyle[]): import('../types.js').WritingStyle {
    // Default style if no posts available
    const defaultStyle: import('../types.js').WritingStyle = {
      tone: 'conversational',
      complexity: 'medium',
      perspective: 'second-person',
      averageSentenceLength: 15,
      commonPhrases: [],
      vocabulary: 'intermediate',
      ...this.config.stylePreferences
    };

    if (styles.length === 0) return defaultStyle;
    if (styles.length === 1) return styles[0];

    // Numerical average
    const avgSentenceLength = Math.round(
      styles.reduce((sum, s) => sum + s.averageSentenceLength, 0) / styles.length
    );

    // Most common value (mode)
    const getMostCommon = <T>(arr: T[]): T => {
      const counts = new Map<T, number>();
      arr.forEach(val => counts.set(val, (counts.get(val) || 0) + 1));
      return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
    };

    const tone = getMostCommon(styles.map(s => s.tone));
    const complexity = getMostCommon(styles.map(s => s.complexity));
    const perspective = getMostCommon(styles.map(s => s.perspective));
    const vocabulary = getMostCommon(styles.map(s => s.vocabulary));

    // Merge commonPhrases from all posts
    const allPhrases = styles.flatMap(s => s.commonPhrases);
    const phraseMap = new Map<string, number>();
    allPhrases.forEach(phrase => {
      phraseMap.set(phrase, (phraseMap.get(phrase) || 0) + 1);
    });
    const commonPhrases = Array.from(phraseMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([phrase]) => phrase);

    // Merge emoji usage
    const emojiFrequencies = styles
      .map(s => s.emojiUsage?.frequency)
      .filter((f): f is NonNullable<typeof f> => f !== undefined);
    const emojiUsage = emojiFrequencies.length > 0 ? {
      frequency: getMostCommon(emojiFrequencies),
      commonEmojis: [...new Set(styles.flatMap(s => s.emojiUsage?.commonEmojis || []))].slice(0, 5)
    } : undefined;

    // Merge Korean patterns
    const koreanPatterns = {
      usesJondaemal: styles.filter(s => s.koreanPatterns?.usesJondaemal).length > styles.length / 2,
      usesGueoChae: styles.filter(s => s.koreanPatterns?.usesGueoChae).length > styles.length / 2,
      hasEmpathy: styles.filter(s => s.koreanPatterns?.hasEmpathy).length > styles.length / 2,
      commonKoreanPhrases: [...new Set(styles.flatMap(s => s.koreanPatterns?.commonKoreanPhrases || []))].slice(0, 8)
    };

    // Merge heading style
    const headingStyle = {
      usesNumbers: styles.filter(s => s.headingStyle?.usesNumbers).length > styles.length / 2,
      usesEmojisInHeadings: styles.filter(s => s.headingStyle?.usesEmojisInHeadings).length > styles.length / 2,
      averageHeadingLength: Math.round(
        styles.reduce((sum, s) => sum + (s.headingStyle?.averageHeadingLength || 0), 0) / styles.length
      )
    };

    // Merge engagement style
    const engagementStyles = styles.map(s => s.engagementStyle?.ctaType).filter((t): t is NonNullable<typeof t> => t !== undefined);
    const engagementStyle = {
      questionsPerSection: styles.reduce((sum, s) => sum + (s.engagementStyle?.questionsPerSection || 0), 0) / styles.length,
      hasCTA: styles.filter(s => s.engagementStyle?.hasCTA).length > styles.length / 2,
      ctaType: engagementStyles.length > 0 ? getMostCommon(engagementStyles) : undefined
    };

    // Merge structure preferences
    const structurePreferences = {
      averageParagraphLength: styles.reduce((sum, s) => sum + (s.structurePreferences?.averageParagraphLength || 0), 0) / styles.length,
      usesBulletPoints: styles.filter(s => s.structurePreferences?.usesBulletPoints).length > styles.length / 2,
      usesNumberedLists: styles.filter(s => s.structurePreferences?.usesNumberedLists).length > styles.length / 2,
      hasIntroGreeting: styles.filter(s => s.structurePreferences?.hasIntroGreeting).length > styles.length / 2,
      hasClosingRemarks: styles.filter(s => s.structurePreferences?.hasClosingRemarks).length > styles.length / 2
    };

    return {
      tone,
      complexity,
      perspective,
      averageSentenceLength: avgSentenceLength,
      commonPhrases,
      vocabulary,
      emojiUsage,
      koreanPatterns,
      headingStyle,
      engagementStyle,
      structurePreferences
    };
  }

  /**
   * Build the prompt for Claude with platform-specific content rules
   */
  private buildPrompt(request: ContentRequest, context: PromptContext): string {
    // Format my posts samples
    const myPostsText = context.myPostsSamples
      .map(post => `Title: ${post.title}\nExcerpt:\n${post.content.slice(0, 500)}...\n`)
      .join('\n---\n');

    // Format SAT materials
    const satMaterialsText = context.satMaterials
      .map(mat => `[${mat.type}] ${mat.title}\n${mat.content.slice(0, 500)}...\n`)
      .join('\n---\n');

    // Format web results
    const webResearchText = context.webResults.length > 0
      ? context.webResults
          .map(result => `[${result.title}](${result.url})\n${result.snippet}\n`)
          .join('\n---\n')
      : 'No web research available.';

    // Format style guide (descriptive instead of JSON)
    const styleText = this.describeStyle(context.styleGuide);

    // Get SEO config and platform-specific content rules
    const seoConfig = getSEOConfig(request.seoPlatform || 'none');
    const contentRules = seoConfig.contentRules;

    // Generate style guidance for merging user style with platform requirements
    const styleGuidance = this.generateStyleGuidance(context.styleGuide, contentRules, request.seoPlatform);

    // Generate platform-specific examples
    const exampleOpening = this.generateExampleOpening(request.seoPlatform || 'none', request.topic);
    const exampleClosing = this.generateExampleClosing(request.seoPlatform || 'none');

    // Get target length (handle both number and string types)
    const desiredLength = typeof request.desiredLength === 'number'
      ? request.desiredLength
      : this.mapLengthToNumber(request.desiredLength);

    return fillTemplate(CONTENT_GENERATION_PROMPT, {
      TOPIC: request.topic,
      TARGET_AUDIENCE: request.targetAudience,
      DESIRED_LENGTH: desiredLength.toString(),
      WRITING_STYLE: styleText,
      STYLE_GUIDANCE: styleGuidance,
      TONE: contentRules.tone,
      PERSPECTIVE: contentRules.perspective,
      INTRO_STYLE: contentRules.introStyle,
      PARAGRAPH_LENGTH: contentRules.paragraphLength,
      HEADING_FORMAT: contentRules.headingFormat,
      KEYWORD_STRATEGY: contentRules.keywordStrategy,
      VOCABULARY_LEVEL: contentRules.vocabularyLevel,
      SENTENCE_COMPLEXITY: contentRules.sentenceComplexity,
      VISUAL_CUES: contentRules.visualCues.join(', '),
      ENGAGEMENT_STYLE: contentRules.engagementStyle,
      TARGET_LENGTH_MIN: contentRules.targetLength.min.toString(),
      TARGET_LENGTH_MAX: contentRules.targetLength.max.toString(),
      EXAMPLE_OPENING: exampleOpening,
      EXAMPLE_CLOSING: exampleClosing,
      MY_POSTS: myPostsText || 'No previous posts available for reference.',
      SAT_MATERIALS: satMaterialsText || 'No SAT materials provided.',
      WEB_RESEARCH: webResearchText,
      SEO_INSTRUCTIONS: seoConfig.promptInstructions
    });
  }

  /**
   * Map length string to number
   */
  private mapLengthToNumber(length: 'quick' | 'standard' | 'deep'): number {
    const mapping = {
      quick: 1000,
      standard: 1500,
      deep: 2000
    };
    return mapping[length];
  }

  /**
   * Generate platform-specific example opening
   */
  private generateExampleOpening(platform: import('../config/seo-config.js').SEOPlatform, topic: string): string {
    if (platform === 'google') {
      return `"Struggling with ${topic}? You're not alone. Research shows that many students face challenges in this area. In this comprehensive guide, we'll explore proven strategies backed by data and expert recommendations to help you master this topic."`;
    } else if (platform === 'naver') {
      return `"안녕하세요! ${topic} 때문에 고민이시죠? 저도 처음엔 막막했어요. 😭 오늘은 제가 직접 써보고 효과를 본 전략들을 공유해드릴게요! 여러분도 충분히 할 수 있어요! 🔥"`;
    }
    return `"In this article, we'll explore ${topic} and provide practical strategies for success."`;
  }

  /**
   * Generate platform-specific example closing
   */
  private generateExampleClosing(platform: import('../config/seo-config.js').SEOPlatform): string {
    if (platform === 'google') {
      return `"These evidence-based strategies have helped thousands of students improve their SAT performance. By consistently applying these techniques, you can see measurable improvement in your scores. Share your experience in the comments below and let us know which strategies worked best for you."`;
    } else if (platform === 'naver') {
      return `"오늘 알려드린 방법들로 꼭 좋은 결과 있으시길 바랄게요! 여러분도 충분히 할 수 있어요! 💪 궁금한 점이나 여러분만의 공부 팁이 있다면 댓글로 공유해주세요! 다음 포스팅에서는 더 유용한 내용으로 찾아올게요. 공감과 이웃 추가 부탁드려요! ✨"`;
    }
    return `"We hope you found these strategies helpful. Good luck with your SAT preparation!"`;
  }

  /**
   * Convert WritingStyle to descriptive text format
   */
  private describeStyle(style: import('../types.js').WritingStyle): string {
    let description = `Your writing should match the following style profile:\n\n`;

    description += `**Tone & Voice**: ${style.tone} tone, ${style.perspective} perspective\n`;
    description += `**Complexity**: ${style.complexity} vocabulary, average ${style.averageSentenceLength} words per sentence\n`;

    if (style.commonPhrases.length > 0) {
      description += `**Common Expressions**: "${style.commonPhrases.slice(0, 5).join('", "')}"\n`;
    }

    if (style.emojiUsage) {
      description += `**Emoji Usage**: ${style.emojiUsage.frequency} frequency`;
      if (style.emojiUsage.commonEmojis.length > 0) {
        description += ` (favorites: ${style.emojiUsage.commonEmojis.join(' ')})`;
      }
      description += `\n`;
    }

    if (style.koreanPatterns) {
      description += `**Korean Style**: `;
      const features = [];
      if (style.koreanPatterns.usesJondaemal) features.push('존댓말 (formal polite)');
      if (style.koreanPatterns.usesGueoChae) features.push('구어체 (conversational)');
      if (style.koreanPatterns.hasEmpathy) features.push('공감 표현 (empathy markers)');
      description += features.join(', ') + `\n`;

      if (style.koreanPatterns.commonKoreanPhrases.length > 0) {
        description += `**Korean Expressions**: "${style.koreanPatterns.commonKoreanPhrases.slice(0, 5).join('", "')}"\n`;
      }
    }

    if (style.headingStyle) {
      description += `**Heading Style**: `;
      const headingFeatures = [];
      if (style.headingStyle.usesNumbers) headingFeatures.push('numbered (1. 2. 3.)');
      if (style.headingStyle.usesEmojisInHeadings) headingFeatures.push('emojis in headings');
      headingFeatures.push(`~${style.headingStyle.averageHeadingLength} chars`);
      description += headingFeatures.join(', ') + `\n`;
    }

    if (style.engagementStyle) {
      description += `**Reader Engagement**: ~${style.engagementStyle.questionsPerSection.toFixed(1)} questions per section`;
      if (style.engagementStyle.hasCTA) {
        description += `, includes ${style.engagementStyle.ctaType} CTAs`;
      }
      description += `\n`;
    }

    if (style.structurePreferences) {
      description += `**Structure**: ${style.structurePreferences.averageParagraphLength.toFixed(1)} sentences per paragraph`;
      if (style.structurePreferences.usesBulletPoints) description += `, uses bullet points`;
      if (style.structurePreferences.usesNumberedLists) description += `, uses numbered lists`;
      if (style.structurePreferences.hasIntroGreeting) description += `, starts with greeting`;
      if (style.structurePreferences.hasClosingRemarks) description += `, ends with closing remarks`;
      description += `\n`;
    }

    return description;
  }

  /**
   * Generate style guidance for merging user style with platform requirements
   */
  private generateStyleGuidance(
    userStyle: import('../types.js').WritingStyle,
    platformRules: import('../types.js').PlatformContentRules,
    platform?: import('../config/seo-config.js').SEOPlatform
  ): string {
    if (!platform || platform === 'none') {
      return 'Follow the user\'s writing style closely. No platform-specific adjustments needed.';
    }

    let guidance = `**CRITICAL STYLE PRIORITY (in order):**\n\n`;
    guidance += `1. **Platform SEO Requirements** (MUST FOLLOW): ${platformRules.tone}, ${platformRules.perspective}\n`;
    guidance += `2. **User's Core Style Elements**: Incorporate their signature expressions, emoji preferences, and structural patterns\n`;
    guidance += `3. **Merge Strategy**: When conflicts arise, prioritize platform requirements but infuse user's voice\n\n`;

    // Naver-specific guidance
    if (platform === 'naver') {
      guidance += `**Naver-Specific Adjustments:**\n`;
      guidance += `- Use Korean conversational style (구어체) even if user's base style is formal\n`;
      guidance += `- Include emojis ${userStyle.emojiUsage?.frequency === 'heavy' ? '(user loves emojis - use liberally!)' : '(3-5 per section minimum)'}\n`;
      guidance += `- Start with greeting (안녕하세요) and end with engagement CTA (댓글로 알려주세요)\n`;

      if (userStyle.koreanPatterns?.commonKoreanPhrases && userStyle.koreanPatterns.commonKoreanPhrases.length > 0) {
        guidance += `- Incorporate user's favorite Korean expressions: "${userStyle.koreanPatterns.commonKoreanPhrases.slice(0, 3).join('", "')}"\n`;
      }

      if (userStyle.headingStyle?.usesNumbers) {
        guidance += `- Use numbered headings with emojis (user prefers this format)\n`;
      }
    }

    // Google-specific guidance
    if (platform === 'google') {
      guidance += `**Google-Specific Adjustments:**\n`;
      guidance += `- Maintain professional-conversational tone but ${userStyle.tone === 'academic' ? 'can be more formal (matches user style)' : 'keep it accessible'}\n`;
      guidance += `- Use rhetorical questions and soft CTAs\n`;

      if (userStyle.vocabulary === 'advanced') {
        guidance += `- User prefers advanced vocabulary - use it with explanations\n`;
      }

      if (userStyle.structurePreferences?.usesBulletPoints) {
        guidance += `- Include bullet points (user's preferred format)\n`;
      }
    }

    guidance += `\n**Result**: Content should feel like it was written BY the user FOR ${platform === 'naver' ? 'Naver' : 'Google'} readers.`;

    return guidance;
  }

  /**
   * Call LLM API (Anthropic or OpenAI)
   */
  private async callLLM(prompt: string): Promise<string> {
    const isOpenAI = this.provider.providerType === 'openai';
    const model = isOpenAI
      ? (this.config.openaiModel || 'gpt-4o')
      : this.config.model;

    return this.provider.generateText(prompt, {
      model,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      systemPrompt: this.config.systemPrompt
    });
  }

  /**
   * Parse Claude's response
   */
  private parseResponse(response: string, seoPlatform?: import('../config/seo-config.js').SEOPlatform): GeneratedContent {
    try {
      // Extract JSON from response (Claude might wrap it in markdown)
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/{[\s\S]*}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const json = JSON.parse(jsonMatch[1] || jsonMatch[0]);

      return {
        title: json.title,
        content: json.content,
        outline: json.outline || [],
        references: json.references || [],
        metadata: json.metadata || { category: 'SAT Prep', tags: [] },
        generatedAt: new Date(),
        seoMetadata: json.seoMetadata,
        seoPlatform: seoPlatform
      };
    } catch (error) {
      Logger.error('Failed to parse Claude response:', error);
      Logger.debug('Raw response:', response);

      // Fallback: return raw response as content
      return {
        title: 'Generated Post',
        content: response,
        outline: [],
        references: [],
        metadata: { category: 'SAT Prep', tags: [] },
        generatedAt: new Date(),
        seoPlatform: seoPlatform
      };
    }
  }
}
