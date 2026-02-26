import type { MyPost } from '../types.js';
import type { Database } from '../../../src/types/database.js';
import { createServerClient } from '../../../src/lib/supabase.js';
import { Logger } from '../utils/logger.js';

/**
 * Pattern Extractor Service
 * Automatically extracts and saves successful patterns from completed posts
 */
export class PatternExtractor {
  /**
   * Get Supabase client
   */
  private static getClient() {
    return createServerClient();
  }

  /**
   * Analyze posts and extract all pattern types
   * Runs async (non-blocking) - errors are logged but not thrown
   */
  static async extractPatterns(posts: MyPost[]): Promise<void> {
    try {
      if (posts.length === 0) {
        Logger.info('No posts to extract patterns from');
        return;
      }

      Logger.info(`Extracting patterns from ${posts.length} posts`);

      // Extract different pattern types in parallel
      await Promise.all([
        this.extractKoreanPatterns(posts),
        this.extractHeadingPatterns(posts),
        this.extractEmojiPatterns(posts),
        this.extractParagraphLengthPatterns(posts),
        this.extractEngagementPatterns(posts)
      ]);

      Logger.info('Pattern extraction complete');
    } catch (error) {
      Logger.error('Failed to extract patterns:', error);
      // Don't throw - pattern extraction is non-blocking background task
    }
  }

  /**
   * Extract Korean ending patterns (formal/conversational ratios)
   */
  private static async extractKoreanPatterns(posts: MyPost[]): Promise<void> {
    try {
      const platforms = ['google', 'naver', 'none'] as const;

      for (const platform of platforms) {
        const platformPosts = posts.filter(p =>
          p.style.koreanPatterns?.endingStyle &&
          (p.metadata.category?.toLowerCase().includes(platform) || platform === 'none')
        );

        if (platformPosts.length < 2) continue; // Need at least 2 posts for pattern

        // Calculate average ratios
        const avgFormalRatio = platformPosts.reduce(
          (sum, p) => sum + (p.style.koreanPatterns?.endingStyle?.formalRatio || 0),
          0
        ) / platformPosts.length;

        const avgConversationalRatio = platformPosts.reduce(
          (sum, p) => sum + (p.style.koreanPatterns?.endingStyle?.conversationalRatio || 0),
          0
        ) / platformPosts.length;

        // Collect most common contexts
        const formalContexts = new Set<string>();
        const conversationalContexts = new Set<string>();

        platformPosts.forEach(p => {
          p.style.koreanPatterns?.usageContext?.formalContexts.forEach(c => formalContexts.add(c));
          p.style.koreanPatterns?.usageContext?.conversationalContexts.forEach(c => conversationalContexts.add(c));
        });

        const patternData = {
          formalRatio: avgFormalRatio,
          conversationalRatio: avgConversationalRatio,
          formalContexts: Array.from(formalContexts),
          conversationalContexts: Array.from(conversationalContexts),
          sampleSize: platformPosts.length
        };

        await this.savePattern(
          'korean_ending_mix',
          patternData,
          platform,
          platformPosts.map(p => p.id)
        );
      }

      Logger.info('Korean ending patterns extracted');
    } catch (error) {
      Logger.error('Failed to extract Korean patterns:', error);
    }
  }

  /**
   * Extract heading structure patterns
   */
  private static async extractHeadingPatterns(posts: MyPost[]): Promise<void> {
    try {
      const validPosts = posts.filter(p => p.style.headingStyle);

      if (validPosts.length < 2) return;

      const usesNumbersCount = validPosts.filter(p => p.style.headingStyle?.usesNumbers).length;
      const usesEmojisCount = validPosts.filter(p => p.style.headingStyle?.usesEmojisInHeadings).length;
      const avgHeadingLength = validPosts.reduce(
        (sum, p) => sum + (p.style.headingStyle?.averageHeadingLength || 0),
        0
      ) / validPosts.length;

      const patternData = {
        usesNumbers: usesNumbersCount / validPosts.length > 0.5,
        usesEmojis: usesEmojisCount / validPosts.length > 0.5,
        averageHeadingLength: Math.round(avgHeadingLength),
        sampleSize: validPosts.length
      };

      await this.savePattern(
        'heading_structure',
        patternData,
        null,
        validPosts.map(p => p.id)
      );

      Logger.info('Heading structure patterns extracted');
    } catch (error) {
      Logger.error('Failed to extract heading patterns:', error);
    }
  }

  /**
   * Extract emoji usage patterns
   */
  private static async extractEmojiPatterns(posts: MyPost[]): Promise<void> {
    try {
      const validPosts = posts.filter(p => p.style.emojiUsage);

      if (validPosts.length < 2) return;

      // Count frequency distribution
      const frequencyCounts = new Map<string, number>();
      validPosts.forEach(p => {
        const freq = p.style.emojiUsage?.frequency || 'none';
        frequencyCounts.set(freq, (frequencyCounts.get(freq) || 0) + 1);
      });

      // Most common frequency
      const mostCommonFrequency = Array.from(frequencyCounts.entries())
        .sort((a, b) => b[1] - a[1])[0][0];

      // Collect all common emojis
      const allEmojis = validPosts.flatMap(p => p.style.emojiUsage?.commonEmojis || []);
      const emojiCounts = new Map<string, number>();
      allEmojis.forEach(emoji => {
        emojiCounts.set(emoji, (emojiCounts.get(emoji) || 0) + 1);
      });

      const topEmojis = Array.from(emojiCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([emoji]) => emoji);

      const patternData = {
        frequency: mostCommonFrequency,
        commonEmojis: topEmojis,
        sampleSize: validPosts.length
      };

      await this.savePattern(
        'emoji_usage',
        patternData,
        null,
        validPosts.map(p => p.id)
      );

      Logger.info('Emoji usage patterns extracted');
    } catch (error) {
      Logger.error('Failed to extract emoji patterns:', error);
    }
  }

  /**
   * Extract paragraph length patterns
   */
  private static async extractParagraphLengthPatterns(posts: MyPost[]): Promise<void> {
    try {
      const validPosts = posts.filter(p => p.style.structurePreferences);

      if (validPosts.length < 2) return;

      const avgParagraphLength = validPosts.reduce(
        (sum, p) => sum + (p.style.structurePreferences?.averageParagraphLength || 0),
        0
      ) / validPosts.length;

      const avgSentenceLength = validPosts.reduce(
        (sum, p) => sum + p.style.averageSentenceLength,
        0
      ) / validPosts.length;

      const patternData = {
        averageParagraphLength: Math.round(avgParagraphLength * 10) / 10,
        averageSentenceLength: Math.round(avgSentenceLength),
        sampleSize: validPosts.length
      };

      await this.savePattern(
        'paragraph_length',
        patternData,
        null,
        validPosts.map(p => p.id)
      );

      Logger.info('Paragraph length patterns extracted');
    } catch (error) {
      Logger.error('Failed to extract paragraph length patterns:', error);
    }
  }

  /**
   * Extract engagement style patterns
   */
  private static async extractEngagementPatterns(posts: MyPost[]): Promise<void> {
    try {
      const validPosts = posts.filter(p => p.style.engagementStyle);

      if (validPosts.length < 2) return;

      const avgQuestionsPerSection = validPosts.reduce(
        (sum, p) => sum + (p.style.engagementStyle?.questionsPerSection || 0),
        0
      ) / validPosts.length;

      const hasCTACount = validPosts.filter(p => p.style.engagementStyle?.hasCTA).length;

      // Count CTA types
      const ctaTypes = new Map<string, number>();
      validPosts.forEach(p => {
        const ctaType = p.style.engagementStyle?.ctaType;
        if (ctaType) {
          ctaTypes.set(ctaType, (ctaTypes.get(ctaType) || 0) + 1);
        }
      });

      const mostCommonCTA = Array.from(ctaTypes.entries())
        .sort((a, b) => b[1] - a[1])[0]?.[0];

      const patternData = {
        avgQuestionsPerSection: Math.round(avgQuestionsPerSection * 10) / 10,
        usesCTA: hasCTACount / validPosts.length > 0.5,
        mostCommonCTAType: mostCommonCTA,
        sampleSize: validPosts.length
      };

      await this.savePattern(
        'engagement_style',
        patternData,
        null,
        validPosts.map(p => p.id)
      );

      Logger.info('Engagement style patterns extracted');
    } catch (error) {
      Logger.error('Failed to extract engagement patterns:', error);
    }
  }

  /**
   * Save pattern to successful_patterns table
   */
  private static async savePattern(
    type: Database['public']['Tables']['successful_patterns']['Row']['pattern_type'],
    data: any,
    platform: string | null,
    examplePostIds: string[]
  ): Promise<void> {
    try {
      const client = this.getClient();

      // Check if pattern already exists for this type/platform combo
      const { data: existing } = await client
        .from('successful_patterns')
        .select('id, usage_count')
        .eq('pattern_type', type)
        .eq('seo_platform', platform)
        .single();

      if (existing) {
        // Update existing pattern
        await client
          .from('successful_patterns')
          .update({
            pattern_data: data as any,
            usage_count: existing.usage_count + 1,
            example_post_ids: examplePostIds,
            last_updated_at: new Date().toISOString()
          })
          .eq('id', existing.id);

        Logger.info(`Updated pattern: ${type} (${platform || 'all'})`);
      } else {
        // Insert new pattern
        await client
          .from('successful_patterns')
          .insert({
            pattern_type: type,
            seo_platform: platform,
            pattern_data: data as any,
            usage_count: 1,
            example_post_ids: examplePostIds
          });

        Logger.info(`Created new pattern: ${type} (${platform || 'all'})`);
      }
    } catch (error) {
      Logger.error(`Failed to save pattern ${type}:`, error);
    }
  }
}
