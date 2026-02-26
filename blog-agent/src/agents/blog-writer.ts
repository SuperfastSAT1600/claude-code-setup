import type { ContentRequest, GeneratedContent, PromptContext } from '../types.js';
import type { LLMProvider, LLMProviderType, LLMResponse } from '../providers/llm-provider.js';
import { createLLMProvider } from '../providers/index.js';
import { defaultBlogWriterConfig } from '../config/agent-config.js';
import { MyPostsLoader } from '../sources/my-posts-loader.js';
import { MyPostsPDFLoader } from '../sources/my-posts-pdf-loader.js';
import { MyPostsSupabaseLoader } from '../sources/my-posts-supabase-loader.js';
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
      const llmResponse = await this.callLLM(prompt);

      // 4. Parse and return result
      const generated = this.parseResponse(llmResponse.text, request.seoPlatform);

      // 5. Add completion status
      generated.completionStatus = {
        isComplete: llmResponse.stopReason === 'end_turn',
        stopReason: llmResponse.stopReason,
        tokenUsage: llmResponse.tokenUsage
      };

      if (llmResponse.stopReason === 'max_tokens') {
        Logger.warn('⚠️  Post may be incomplete - hit max_tokens limit');
      }

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

    // Load from Supabase (primary), markdown, and PDF sources
    const [supabasePosts, mdPosts, pdfPosts, mdSAT, pdfSAT, webResults] = await Promise.all([
      this.config.enableMyPostsAnalysis
        ? MyPostsSupabaseLoader.getSamples(5)
        : Promise.resolve([]),
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

    // Prioritize Supabase posts (richer metadata), deduplicate file-based posts
    const myPosts = [
      ...supabasePosts,
      ...mdPosts.filter(p => !supabasePosts.some(sp => sp.title === p.title)),
      ...pdfPosts.filter(p => !supabasePosts.some(sp => sp.title === p.title))
    ].slice(0, 10); // Top 10 posts

    const satMaterials = [...mdSAT, ...pdfSAT]
      .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
      .slice(0, 5); // Top 5 most relevant

    Logger.info(`Loaded ${myPosts.length} user posts (${supabasePosts.length} DB, ${mdPosts.length} MD, ${pdfPosts.length} PDF)`);
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
   * Calculate average ratio from multiple styles
   */
  private averageRatio(styles: import('../types.js').WritingStyle[], field: 'formalRatio' | 'conversationalRatio'): number {
    const ratios = styles
      .map(s => s.koreanPatterns?.endingStyle?.[field])
      .filter((r): r is number => r !== undefined);

    if (ratios.length === 0) return 0;
    return ratios.reduce((sum, r) => sum + r, 0) / ratios.length;
  }

  /**
   * Get the most common dominant ending pattern
   */
  private getMostCommonDominantEnding(styles: import('../types.js').WritingStyle[]): 'formal' | 'conversational' | 'mixed' {
    const endings = styles
      .map(s => s.koreanPatterns?.endingStyle?.dominantEnding)
      .filter((e): e is 'formal' | 'conversational' | 'mixed' => e !== undefined);

    if (endings.length === 0) return 'mixed';

    const counts = new Map<'formal' | 'conversational' | 'mixed', number>();
    endings.forEach(e => counts.set(e, (counts.get(e) || 0) + 1));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0][0];
  }

  /**
   * Merge usage contexts from multiple styles
   */
  private mergeUsageContexts(styles: import('../types.js').WritingStyle[]): {
    formalContexts: string[];
    conversationalContexts: string[];
  } {
    const formalContextsSet = new Set<string>();
    const conversationalContextsSet = new Set<string>();

    styles.forEach(s => {
      s.koreanPatterns?.usageContext?.formalContexts.forEach(c => formalContextsSet.add(c));
      s.koreanPatterns?.usageContext?.conversationalContexts.forEach(c => conversationalContextsSet.add(c));
    });

    return {
      formalContexts: Array.from(formalContextsSet),
      conversationalContexts: Array.from(conversationalContextsSet)
    };
  }

  /**
   * Merge detected endings from multiple styles
   */
  private mergeDetectedEndings(styles: import('../types.js').WritingStyle[]): {
    formal: { count: number; examples: string[] };
    conversational: { count: number; examples: string[] };
  } {
    const formalExamples = new Set<string>();
    const conversationalExamples = new Set<string>();
    let formalCount = 0;
    let conversationalCount = 0;

    styles.forEach(s => {
      const endings = s.koreanPatterns?.detectedEndings;
      if (endings) {
        formalCount += endings.formal?.count || 0;
        conversationalCount += endings.conversational?.count || 0;
        endings.formal?.examples.forEach(e => formalExamples.add(e));
        endings.conversational?.examples.forEach(e => conversationalExamples.add(e));
      }
    });

    return {
      formal: {
        count: formalCount,
        examples: Array.from(formalExamples).slice(0, 5)
      },
      conversational: {
        count: conversationalCount,
        examples: Array.from(conversationalExamples).slice(0, 5)
      }
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

    // Merge Korean patterns (ENHANCED with ratio-based mixing + preference override)
    const hasNewKoreanPatterns = styles.some(s => s.koreanPatterns?.endingStyle);

    let koreanPatterns;
    if (hasNewKoreanPatterns) {
      // Calculate detected ratios from existing posts
      const detectedFormalRatio = this.averageRatio(styles, 'formalRatio');
      const detectedConversationalRatio = this.averageRatio(styles, 'conversationalRatio');

      // NEW: Apply user preference override if set
      const koreanPref = this.config.stylePreferences.koreanPreferences;
      let finalFormalRatio = detectedFormalRatio;
      let finalConversationalRatio = detectedConversationalRatio;

      if (koreanPref?.preferFormalEndings) {
        // Override to target ratio
        finalFormalRatio = koreanPref.targetFormalRatio || 0.85;
        finalConversationalRatio = 1.0 - finalFormalRatio;

        Logger.info(`Korean preference override: ${Math.round(finalFormalRatio * 100)}% formal (detected: ${Math.round(detectedFormalRatio * 100)}%)`);
      } else if (koreanPref?.enforceMinimumFormalRatio) {
        // Enforce minimum if detected is too low
        if (detectedFormalRatio < koreanPref.enforceMinimumFormalRatio) {
          finalFormalRatio = koreanPref.enforceMinimumFormalRatio;
          finalConversationalRatio = 1.0 - finalFormalRatio;

          Logger.info(`Enforcing minimum formal ratio: ${Math.round(finalFormalRatio * 100)}% (detected: ${Math.round(detectedFormalRatio * 100)}%)`);
        }
      }

      koreanPatterns = {
        // New structure: ratio-based mixing pattern (with override)
        endingStyle: {
          formalRatio: finalFormalRatio,
          conversationalRatio: finalConversationalRatio,
          dominantEnding: finalFormalRatio >= 0.8 ? 'formal' as const : 'mixed' as const
        },
        usageContext: this.mergeUsageContexts(styles),
        detectedEndings: this.mergeDetectedEndings(styles),
        // Legacy fields for backwards compatibility
        usesJondaemal: styles.filter(s => s.koreanPatterns?.usesJondaemal).length > styles.length / 2,
        usesGueoChae: styles.filter(s => s.koreanPatterns?.usesGueoChae).length > styles.length / 2,
        hasEmpathy: styles.filter(s => s.koreanPatterns?.hasEmpathy).length > styles.length / 2,
        commonKoreanPhrases: [...new Set(styles.flatMap(s => s.koreanPatterns?.commonKoreanPhrases || []))].slice(0, 8)
      };
    } else {
      // Fallback: Use user preference if no detected patterns
      const koreanPref = this.config.stylePreferences.koreanPreferences;
      const targetRatio = koreanPref?.targetFormalRatio || 0.85;

      koreanPatterns = {
        endingStyle: {
          formalRatio: targetRatio,
          conversationalRatio: 1.0 - targetRatio,
          dominantEnding: targetRatio >= 0.8 ? 'formal' as const : 'mixed' as const
        },
        usageContext: {
          formalContexts: ['definitions', 'explanations', 'main_points', 'strategies'],
          conversationalContexts: ['examples', 'reassurance']
        },
        detectedEndings: {
          formal: { count: 0, examples: [] },
          conversational: { count: 0, examples: [] }
        },
        usesJondaemal: styles.filter(s => s.koreanPatterns?.usesJondaemal).length > styles.length / 2,
        usesGueoChae: styles.filter(s => s.koreanPatterns?.usesGueoChae).length > styles.length / 2,
        hasEmpathy: styles.filter(s => s.koreanPatterns?.hasEmpathy).length > styles.length / 2,
        commonKoreanPhrases: [...new Set(styles.flatMap(s => s.koreanPatterns?.commonKoreanPhrases || []))].slice(0, 8)
      };
    }

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
      koreanPreferences: this.config.stylePreferences.koreanPreferences, // NEW: Include preference
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
      // ENHANCED: Show detailed mixing pattern if available
      if (style.koreanPatterns.endingStyle) {
        const es = style.koreanPatterns.endingStyle;
        description += `**Korean Sentence Ending Pattern (CRITICAL)**:\n`;

        // NEW: Highlight if user preference is overriding
        if (style.koreanPreferences?.preferFormalEndings) {
          description += `- **USER PREFERENCE ENFORCED**: Use FORMAL endings (not conversational)\n`;
        }

        description += `- Mixing Ratio: ${Math.round(es.formalRatio * 100)}% formal (~다, ~습니다, ~입니다) + ${Math.round(es.conversationalRatio * 100)}% conversational (~요, ~어요)\n`;
        description += `- Dominant Style: ${es.dominantEnding}\n`;

        // NEW: Add explicit formal ending examples if formal preference is high
        if (es.formalRatio >= 0.7) {
          description += `- **Use these formal endings predominantly**: ~다, ~ㄴ다, ~습니다, ~입니다, ~한다, ~된다, ~있다\n`;
          description += `- **Minimize conversational endings**: Limit ~요, ~어요, ~이에요 to only ${Math.round(es.conversationalRatio * 100)}% of sentences\n`;
        }

        // Show contextual usage rules
        if (style.koreanPatterns.usageContext) {
          const uc = style.koreanPatterns.usageContext;
          if (uc.formalContexts.length > 0) {
            description += `- Use FORMAL (~다, ~습니다) for: ${uc.formalContexts.join(', ')}\n`;
          }
          if (uc.conversationalContexts.length > 0) {
            description += `- Use CONVERSATIONAL (~요) SPARINGLY for: ${uc.conversationalContexts.join(', ')}\n`;
          }
        }

        // Show detected patterns
        if (style.koreanPatterns.detectedEndings) {
          const de = style.koreanPatterns.detectedEndings;
          if (de.formal.count > 0) {
            description += `- Formal Endings (${de.formal.count} found): ${de.formal.examples.join(', ')}\n`;
          }
          if (de.conversational.count > 0) {
            description += `- Conversational Endings (${de.conversational.count} found): ${de.conversational.examples.join(', ')}\n`;
          }
        }

        // Legacy empathy/phrases
        if (style.koreanPatterns.hasEmpathy) {
          description += `- Empathy Expressions: Yes (그쵸?, 맞죠?, etc.)\n`;
        }
      } else {
        // Fallback to legacy format
        description += `**Korean Style**: `;
        const features = [];
        if (style.koreanPatterns.usesJondaemal) features.push('존댓말 (formal polite)');
        if (style.koreanPatterns.usesGueoChae) features.push('구어체 (conversational)');
        if (style.koreanPatterns.hasEmpathy) features.push('공감 표현 (empathy markers)');
        description += features.join(', ') + `\n`;
      }

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

    // Add mandatory TOC structure rule
    guidance += `**MANDATORY STRUCTURE:**\n`;
    guidance += `- Table of Contents: MUST have exactly 3 items (no more, no less)\n`;
    guidance += `- Each TOC item should be a distinct main section of the content\n\n`;

    // Add Expert-Teacher tone guidance
    guidance += `**EXPERT-TEACHER TONE (CRITICAL):**\n`;
    guidance += `- Write as a patient, knowledgeable teacher explaining to students who want to learn\n`;
    guidance += `- For complex concepts: Break down into steps, provide context, explain WHY not just WHAT\n`;
    guidance += `- Use transitional phrases: "Let me explain why this matters", "Here's the key point", "To understand this better"\n`;
    guidance += `- Include concrete examples for abstract concepts\n`;
    guidance += `- Reassure readers: "This might seem difficult at first, but...", "Don't worry if this feels complex..."\n`;
    guidance += `- Use more sentences to elaborate thoroughly - clarity over brevity\n\n`;

    // Naver-specific guidance
    if (platform === 'naver') {
      guidance += `**Naver-Specific Adjustments:**\n`;

      // ENHANCED: Strong formal Korean enforcement
      if (userStyle.koreanPatterns?.endingStyle) {
        const kr = userStyle.koreanPatterns;
        const es = kr.endingStyle!; // Non-null assertion - we're in the if block

        // NEW: Check if user prefers formal
        const preferFormal = userStyle.koreanPreferences?.preferFormalEndings;

        if (preferFormal) {
          guidance += `- **Sentence Ending Pattern** (USER PREFERENCE - STRICTLY ENFORCE):\n`;
          guidance += `  * TARGET: ${Math.round(es.formalRatio * 100)}% FORMAL ENDINGS (~다, ~습니다, ~입니다)\n`;
          guidance += `  * Examples: "이것은 중요한 개념이다", "첫 번째 전략은 키워드 찾기다", "연습이 필요합니다"\n`;
          guidance += `  * LIMIT conversational to ${Math.round(es.conversationalRatio * 100)}% only (examples, reassurance)\n`;
          guidance += `  * DO NOT use conversational endings for main explanations or core concepts\n`;

          // Contextual guidance
          if (kr.usageContext && kr.usageContext.formalContexts.length > 0) {
            guidance += `  * Use FORMAL when: ${kr.usageContext.formalContexts.join(', ')}\n`;
          }
          if (kr.usageContext && kr.usageContext.conversationalContexts.length > 0) {
            guidance += `  * Use CONVERSATIONAL SPARINGLY when: ${kr.usageContext.conversationalContexts.join(', ')}\n`;
          }

          // Add paragraph-level example
          guidance += `\n  **Example Paragraph Structure (${Math.round(es.formalRatio * 100)}% formal)**:\n`;
          guidance += `  - SAT Reading에서 시간 관리가 가장 중요하다. [FORMAL]\n`;
          guidance += `  - 각 지문당 13분을 배분하는 것이 이상적이다. [FORMAL]\n`;
          guidance += `  - 첫 번째 전략은 키워드 미리 파악하기다. [FORMAL]\n`;
          guidance += `  - 예를 들어, 제목과 첫 문장을 먼저 읽어보세요. [CONVERSATIONAL - example only]\n`;
          guidance += `  * This maintains professional, authoritative tone\n`;
        } else {
          // Original logic for respecting detected ratio
          guidance += `- **Sentence Ending Pattern** (maintain user's exact ratio):\n`;
          guidance += `  * ${Math.round(es.formalRatio * 100)}% formal endings (~다, ~ㄴ다, ~습니다)\n`;
          guidance += `  * ${Math.round(es.conversationalRatio * 100)}% conversational endings (~요, ~어요)\n`;

          // Provide contextual guidance
          if (kr.usageContext && kr.usageContext.formalContexts.length > 0) {
            guidance += `  * Use FORMAL when: ${kr.usageContext.formalContexts.join(', ')}\n`;
          }
          if (kr.usageContext && kr.usageContext.conversationalContexts.length > 0) {
            guidance += `  * Use CONVERSATIONAL when: ${kr.usageContext.conversationalContexts.join(', ')}\n`;
          }

          guidance += `  * This maintains your expert-but-approachable tone\n`;
        }
      } else {
        // Fallback if no Korean patterns detected
        guidance += `- Use Korean conversational style (구어체) as default\n`;
      }

      // Check if user actually uses emojis
      if (userStyle.emojiUsage?.frequency === 'none') {
        guidance += `- **CRITICAL**: User does NOT use emojis - do not include any emojis despite platform norms\n`;
      } else {
        guidance += `- Include emojis ${userStyle.emojiUsage?.frequency === 'heavy' ? '(user loves emojis - use liberally!)' : '(3-5 per section minimum)'}\n`;
      }

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

      // Apply same formal enforcement logic as Naver
      if (userStyle.koreanPatterns?.endingStyle) {
        const kr = userStyle.koreanPatterns;
        const es = kr.endingStyle!; // Non-null assertion - we're in the if block

        // NEW: Check if user prefers formal
        const preferFormal = userStyle.koreanPreferences?.preferFormalEndings;

        if (preferFormal) {
          guidance += `- **Sentence Ending Pattern** (USER PREFERENCE - STRICTLY ENFORCE):\n`;
          guidance += `  * TARGET: ${Math.round(es.formalRatio * 100)}% FORMAL ENDINGS (~다, ~습니다, ~입니다)\n`;
          guidance += `  * Examples: "이것은 중요한 개념이다", "첫 번째 전략은 키워드 찾기다", "연습이 필요합니다"\n`;
          guidance += `  * LIMIT conversational to ${Math.round(es.conversationalRatio * 100)}% only (examples, reassurance)\n`;
          guidance += `  * DO NOT use conversational endings for main explanations or core concepts\n`;

          if (kr.usageContext && kr.usageContext.formalContexts.length > 0) {
            guidance += `  * Use FORMAL when: ${kr.usageContext.formalContexts.join(', ')}\n`;
          }
          if (kr.usageContext && kr.usageContext.conversationalContexts.length > 0) {
            guidance += `  * Use CONVERSATIONAL SPARINGLY when: ${kr.usageContext.conversationalContexts.join(', ')}\n`;
          }

          guidance += `  * This maintains professional, authoritative tone\n`;
        } else {
          // Original logic for respecting detected ratio
          guidance += `- **Sentence Ending Pattern** (maintain user's exact ratio):\n`;
          guidance += `  * ${Math.round(es.formalRatio * 100)}% formal endings (~다, ~ㄴ다, ~습니다)\n`;
          guidance += `  * ${Math.round(es.conversationalRatio * 100)}% conversational endings (~요, ~어요)\n`;

          if (kr.usageContext && kr.usageContext.formalContexts.length > 0) {
            guidance += `  * Use FORMAL when: ${kr.usageContext.formalContexts.join(', ')}\n`;
          }
          if (kr.usageContext && kr.usageContext.conversationalContexts.length > 0) {
            guidance += `  * Use CONVERSATIONAL when: ${kr.usageContext.conversationalContexts.join(', ')}\n`;
          }
        }
      }

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
  private async callLLM(prompt: string): Promise<LLMResponse> {
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
