import type { MyPost, WritingStyle } from '../types.js';
import { PDFLoader } from './pdf-loader.js';
import { Logger } from '../utils/logger.js';
import { paths } from '../config/agent-config.js';

/**
 * Loads user's existing blog posts from PDF files
 */
export class MyPostsPDFLoader {
  /**
   * Load all user's PDF posts
   */
  static async loadAll(): Promise<MyPost[]> {
    const pdfDir = paths.myPosts + '-pdf';
    Logger.info('Loading user PDF posts from:', pdfDir);

    try {
      const pdfFiles = await PDFLoader.loadRecursive(pdfDir);
      const posts: MyPost[] = [];

      for (const file of pdfFiles) {
        try {
          const post = this.parsePDFPost(file.filename, file.content, file.relativePath);
          posts.push(post);
        } catch (error) {
          Logger.warn(`Failed to parse PDF post ${file.filename}:`, error);
        }
      }

      Logger.info(`Loaded ${posts.length} user PDF posts`);
      return posts;
    } catch (error) {
      Logger.error('Failed to load user PDF posts:', error);
      return [];
    }
  }

  /**
   * Get sample posts for style analysis
   */
  static async getSamples(count: number = 5): Promise<MyPost[]> {
    const posts = await this.loadAll();
    return posts.slice(0, Math.min(count, posts.length));
  }

  /**
   * Parse a PDF post into MyPost object
   */
  private static parsePDFPost(filename: string, content: string, _relativePath: string): MyPost {
    // Extract title from filename or first line
    let title = filename.replace('.pdf', '').replace(/[-_]/g, ' ');

    // Try to extract title from content (first non-empty line)
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.length < 100) { // Likely a title
        title = firstLine;
      }
    }

    // Generate ID from filename
    const id = filename.replace('.pdf', '').toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Analyze style
    const style = this.analyzeStyle(content);

    return {
      id,
      title,
      content,
      style,
      metadata: {
        category: 'SAT Prep',
        tags: this.extractTags(content),
        wordCount: content.split(/\s+/).length
      }
    };
  }

  /**
   * Analyze writing style from content
   */
  private static analyzeStyle(content: string): WritingStyle {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = content.split(/\s+/);
    const avgSentenceLength = words.length / sentences.length;

    // Detect perspective
    const hasFirstPerson = /\b(I|we|me|us|my|our)\b/i.test(content);
    const hasSecondPerson = /\b(you|your)\b/i.test(content);

    // Detect tone
    const casualMarkers = /\b(hey|cool|awesome|basically|kind of|sort of)\b/i.test(content);
    const formalMarkers = /\b(furthermore|consequently|nevertheless|therefore)\b/i.test(content);

    // Enhanced analysis
    const emojiUsage = this.analyzeEmojiUsage(content);
    const koreanPatterns = this.analyzeKoreanPatterns(content);
    const headingStyle = this.analyzeHeadingStyle(content);
    const engagementStyle = this.analyzeEngagementStyle(content);
    const structurePreferences = this.analyzeStructure(content);

    return {
      tone: casualMarkers ? 'conversational' : formalMarkers ? 'formal' : 'casual',
      complexity: avgSentenceLength > 20 ? 'advanced' : avgSentenceLength > 15 ? 'medium' : 'simple',
      perspective: hasSecondPerson ? 'second-person' : hasFirstPerson ? 'first-person' : 'third-person',
      averageSentenceLength: Math.round(avgSentenceLength),
      commonPhrases: this.extractCommonPhrases(content),
      vocabulary: avgSentenceLength > 20 ? 'advanced' : 'intermediate',
      emojiUsage,
      koreanPatterns,
      headingStyle,
      engagementStyle,
      structurePreferences
    };
  }

  /**
   * Extract common phrases (3-4 word sequences that appear multiple times)
   */
  private static extractCommonPhrases(content: string): string[] {
    const words = content.toLowerCase().split(/\s+/);
    const phraseMap = new Map<string, number>();

    // Extract 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (phrase.length > 10) { // Avoid very short phrases
        phraseMap.set(phrase, (phraseMap.get(phrase) || 0) + 1);
      }
    }

    // Return phrases that appear 2+ times
    return Array.from(phraseMap.entries())
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([phrase]) => phrase);
  }

  /**
   * Extract relevant tags from content
   */
  private static extractTags(content: string): string[] {
    const tags: string[] = [];
    const lowerContent = content.toLowerCase();

    // SAT section tags
    if (lowerContent.includes('reading')) tags.push('reading');
    if (lowerContent.includes('math')) tags.push('math');
    if (lowerContent.includes('writing')) tags.push('writing');
    if (lowerContent.includes('grammar')) tags.push('grammar');

    // Topic tags
    if (lowerContent.includes('strateg')) tags.push('strategies');
    if (lowerContent.includes('tip')) tags.push('tips');
    if (lowerContent.includes('mistake')) tags.push('mistakes');
    if (lowerContent.includes('practice')) tags.push('practice');
    if (lowerContent.includes('time management')) tags.push('time-management');

    return tags.length > 0 ? tags : ['SAT', 'prep'];
  }

  /**
   * Analyze emoji usage patterns
   */
  private static analyzeEmojiUsage(content: string): WritingStyle['emojiUsage'] {
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojis = content.match(emojiRegex) || [];
    const totalChars = content.length;

    // Calculate frequency (emojis per 100 characters)
    const emojiPer100Chars = (emojis.length / totalChars) * 100;

    let frequency: 'none' | 'rare' | 'moderate' | 'heavy';
    if (emojiPer100Chars === 0) frequency = 'none';
    else if (emojiPer100Chars < 0.5) frequency = 'rare';
    else if (emojiPer100Chars < 1.5) frequency = 'moderate';
    else frequency = 'heavy';

    // Extract most common emojis
    const emojiCounts = new Map<string, number>();
    emojis.forEach(emoji => {
      emojiCounts.set(emoji, (emojiCounts.get(emoji) || 0) + 1);
    });

    const commonEmojis = Array.from(emojiCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([emoji]) => emoji);

    return { frequency, commonEmojis };
  }

  /**
   * Extract Korean sentences from content
   */
  private static extractKoreanSentences(content: string): string[] {
    // Split on Korean and Western sentence endings: . ! ? 。
    return content
      .split(/[.!?。]/g)
      .map(s => s.trim())
      .filter(s => /[가-힣]/.test(s) && s.length > 3);
  }

  /**
   * Classify sentence ending as formal or conversational
   */
  private static classifySentenceEndings(sentences: string[]): {
    formal: string[];
    conversational: string[];
  } {
    const formal: string[] = [];
    const conversational: string[] = [];

    // FORMAL patterns: ~다, ~ㄴ다, ~는다, ~ㅂ니다, ~습니다
    const formalRegex = /(한다|된다|있다|없다|이다|간다|온다|본다|만든다|한다|ㄴ다|는다|ㅂ니다|습니다)$/;

    // CONVERSATIONAL patterns: ~요, ~어요, ~아요
    const conversationalRegex = /(해요|되요|에요|네요|예요|세요|드려요|거예요|했어요|가요|왔어요|봤어요|같아요|죠|요)$/;

    sentences.forEach(sentence => {
      if (formalRegex.test(sentence)) {
        formal.push(sentence);
      } else if (conversationalRegex.test(sentence)) {
        conversational.push(sentence);
      }
    });

    return { formal, conversational };
  }

  /**
   * Analyze WHERE each ending type appears (context detection)
   */
  private static analyzeEndingContext(
    _content: string,
    classified: { formal: string[]; conversational: string[] }
  ): {
    formalContexts: string[];
    conversationalContexts: string[];
  } {
    const formalContexts = new Set<string>();
    const conversationalContexts = new Set<string>();

    // Heuristic detection based on surrounding text patterns
    classified.formal.forEach(sentence => {
      // Check if sentence contains definition markers
      if (/(이란|라는 것은|의미는|정의|설명하면)/g.test(sentence)) {
        formalContexts.add('definitions');
      }
      // Check if sentence contains explanation markers
      if (/(때문|이유|따라서|그러므로|즉)/g.test(sentence)) {
        formalContexts.add('explanations');
      }
      // Check if sentence is stating main points
      if (/(핵심|중요|포인트|전략|방법)/g.test(sentence)) {
        formalContexts.add('main_points');
      }
    });

    classified.conversational.forEach(sentence => {
      // Check if sentence contains examples
      if (/(예를 들어|예시|예컨대|보면)/g.test(sentence)) {
        conversationalContexts.add('examples');
      }
      // Check if sentence is reassuring/encouraging
      if (/(할 수 있|괜찮|걱정|충분|도움)/g.test(sentence)) {
        conversationalContexts.add('reassurance');
      }
      // Check if sentence is a question
      if (/[?？]$/.test(sentence)) {
        conversationalContexts.add('questions');
      }
    });

    return {
      formalContexts: Array.from(formalContexts),
      conversationalContexts: Array.from(conversationalContexts)
    };
  }

  /**
   * Extract unique ending patterns (remove duplicates)
   */
  private static extractUniqueEndings(sentences: string[]): string[] {
    const endingPattern = /[가-힣]{2,4}$/; // Last 2-4 Korean characters
    const endings = new Set<string>();

    sentences.forEach(sentence => {
      const match = sentence.match(endingPattern);
      if (match) endings.add(match[0]);
    });

    return Array.from(endings);
  }

  /**
   * Analyze Korean language patterns (ENHANCED with ratio-based mixing detection)
   */
  private static analyzeKoreanPatterns(content: string): WritingStyle['koreanPatterns'] {
    // PHASE 1: Extract Korean sentences
    const sentences = this.extractKoreanSentences(content);

    // PHASE 2: Classify each sentence ending
    const classified = this.classifySentenceEndings(sentences);

    // PHASE 3: Calculate ratios
    const totalEndings = classified.formal.length + classified.conversational.length;
    const formalRatio = totalEndings > 0 ? classified.formal.length / totalEndings : 0;
    const conversationalRatio = totalEndings > 0 ? classified.conversational.length / totalEndings : 0;

    // PHASE 4: Determine dominant pattern
    let dominantEnding: 'formal' | 'conversational' | 'mixed';
    if (formalRatio >= 0.8) dominantEnding = 'formal';
    else if (conversationalRatio >= 0.8) dominantEnding = 'conversational';
    else dominantEnding = 'mixed';

    // PHASE 5: Analyze contextual usage (WHERE each ending appears)
    const usageContext = this.analyzeEndingContext(content, classified);

    // PHASE 6: Extract examples
    const detectedEndings = {
      formal: {
        count: classified.formal.length,
        examples: this.extractUniqueEndings(classified.formal).slice(0, 5)
      },
      conversational: {
        count: classified.conversational.length,
        examples: this.extractUniqueEndings(classified.conversational).slice(0, 5)
      }
    };

    // PHASE 7: Legacy empathy/phrases detection (for backwards compatibility)
    const empathyRegex = /(그쵸|맞죠|그렇죠|죠\?|나요\?|가요\?|인가요\?)/g;
    const hasEmpathy = empathyRegex.test(content);

    // Extract common Korean phrases (2-3 word sequences)
    const koreanWords = content.match(/[가-힣]+(\s+[가-힣]+){1,2}/g) || [];
    const phraseMap = new Map<string, number>();
    koreanWords.forEach(phrase => {
      if (phrase.length >= 4) {
        phraseMap.set(phrase, (phraseMap.get(phrase) || 0) + 1);
      }
    });

    const commonKoreanPhrases = Array.from(phraseMap.entries())
      .filter(([, count]) => count >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([phrase]) => phrase);

    // Legacy flags for backwards compatibility
    const usesJondaemal = formalRatio > 0.2;  // More than 20% formal
    const usesGueoChae = conversationalRatio > 0.2;  // More than 20% conversational

    return {
      endingStyle: {
        formalRatio,
        conversationalRatio,
        dominantEnding
      },
      usageContext,
      detectedEndings,
      usesJondaemal,
      usesGueoChae,
      hasEmpathy,
      commonKoreanPhrases
    };
  }

  /**
   * Analyze heading style patterns
   */
  private static analyzeHeadingStyle(content: string): WritingStyle['headingStyle'] {
    const lines = content.split('\n');
    const headings = lines.filter(line => {
      const trimmed = line.trim();
      return /^#{1,6}\s/.test(trimmed) ||  // Markdown headings
             /^\d+\.\s/.test(trimmed) ||   // Numbered headings
             /^[●○■□]\s/.test(trimmed);    // Bullet headings
    });

    if (headings.length === 0) {
      return {
        usesNumbers: false,
        usesEmojisInHeadings: false,
        averageHeadingLength: 0
      };
    }

    const usesNumbers = headings.some(h => /^\d+\./.test(h.trim()));
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]/gu;
    const usesEmojisInHeadings = headings.some(h => emojiRegex.test(h));

    const totalLength = headings.reduce((sum, h) => sum + h.replace(/^#{1,6}\s/, '').trim().length, 0);
    const averageHeadingLength = Math.round(totalLength / headings.length);

    return {
      usesNumbers,
      usesEmojisInHeadings,
      averageHeadingLength
    };
  }

  /**
   * Analyze reader engagement style
   */
  private static analyzeEngagementStyle(content: string): WritingStyle['engagementStyle'] {
    const sections = content.split(/\n#{1,6}\s/).length;
    const questionRegex = /[?？]/g;
    const questions = content.match(questionRegex) || [];
    const questionsPerSection = sections > 0 ? questions.length / sections : 0;

    // Detect CTA patterns
    const commentCTA = /(댓글|코멘트|의견|생각|알려주세요|공유해주세요)/gi.test(content);
    const shareCTA = /(공유|이웃추가|구독|팔로우)/gi.test(content);
    const subscribeCTA = /(구독|팔로우|이웃추가)/gi.test(content);
    const questionCTA = /(궁금한|질문|물어보|어떠|어떤가요)/gi.test(content);

    let ctaType: 'comment' | 'share' | 'subscribe' | 'question' | undefined;
    if (commentCTA) ctaType = 'comment';
    else if (shareCTA) ctaType = 'share';
    else if (subscribeCTA) ctaType = 'subscribe';
    else if (questionCTA) ctaType = 'question';

    return {
      questionsPerSection: Math.round(questionsPerSection * 10) / 10,
      hasCTA: ctaType !== undefined,
      ctaType
    };
  }

  /**
   * Analyze structure preferences
   */
  private static analyzeStructure(content: string): WritingStyle['structurePreferences'] {
    const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
    const totalSentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
    const averageParagraphLength = paragraphs.length > 0 ? totalSentences / paragraphs.length : 0;

    const usesBulletPoints = /^[\s]*[-*•]\s/m.test(content);
    const usesNumberedLists = /^[\s]*\d+\.\s/m.test(content);

    const hasIntroGreeting = /^(안녕하세요|여러분|반가워요|오늘은)/m.test(content);
    const hasClosingRemarks = /(화이팅|궁금한|감사합니다|다음에|또\s*만나요)/gi.test(content);

    return {
      averageParagraphLength: Math.round(averageParagraphLength * 10) / 10,
      usesBulletPoints,
      usesNumberedLists,
      hasIntroGreeting,
      hasClosingRemarks
    };
  }
}
