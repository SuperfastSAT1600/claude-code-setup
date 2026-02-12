import type { GeneratedContent, MyPost, WritingStyle } from '../types.js';
import type { Database } from '../../../src/types/database.js';
import { createServerClient } from '../../../src/lib/supabase.js';
import { MyPostsPDFLoader } from '../sources/my-posts-pdf-loader.js';
import { Logger } from '../utils/logger.js';

/**
 * Supabase Post Service
 * Handles all database operations for blog posts using Supabase JS client
 */
export class SupabasePostService {
  /**
   * Get Supabase client (server-side with service role)
   */
  private static getClient() {
    return createServerClient();
  }

  /**
   * Save a generated post to Supabase with writing style extraction
   * @returns UUID of the saved post
   */
  static async savePost(content: GeneratedContent): Promise<string> {
    try {
      Logger.info('Saving post to Supabase:', content.title);

      const client = this.getClient();

      // Extract writing style from content
      const writingStyle = this.extractStyleFromContent(content.content);

      // Calculate word count and reading time
      const wordCount = content.content.split(/\s+/).length;
      const readingTime = Math.ceil(wordCount / 200); // ~200 words per minute

      // Prepare insert data
      const insertData: Database['public']['Tables']['posts']['Insert'] = {
        title: content.title,
        content: content.content,
        outline: content.outline,
        category: content.metadata.category,
        tags: content.metadata.tags || [],
        author: content.metadata.author || null,
        reading_time: readingTime,
        word_count: wordCount,
        seo_platform: content.seoPlatform || 'none',
        topic: this.extractTopicFromContent(content),
        target_audience: this.extractAudienceFromContent(content),
        seo_metadata: content.seoMetadata as any || null,
        references: content.references as any || [],
        completion_status: content.completionStatus as any || null,
        generated_at: content.generatedAt.toISOString(),
        completed_at: new Date().toISOString(),
        writing_style: writingStyle as any, // JSONB
        performance_metrics: null
      };

      // Insert post to database
      const { data, error } = await client
        .from('posts')
        .insert(insertData)
        .select('id')
        .single();

      if (error) {
        throw new Error(`Supabase insert error: ${error.message}`);
      }

      if (!data) {
        throw new Error('No data returned from insert');
      }

      const postId = data.id;
      Logger.info('Post saved to Supabase with ID:', postId);

      // Create initial version record
      await this.createVersion(
        postId,
        content.content,
        'generated',
        1,
        content.title,
        content.outline
      );

      Logger.info('Post and version saved successfully:', postId);
      return postId;
    } catch (error) {
      Logger.error('Failed to save post to Supabase:', error);
      throw error;
    }
  }

  /**
   * Load recent posts from Supabase for style reference
   */
  static async getRecentPosts(limit: number = 10): Promise<MyPost[]> {
    try {
      Logger.info('Loading recent posts from Supabase, limit:', limit);

      const client = this.getClient();

      const { data, error } = await client
        .from('posts')
        .select('id, title, content, writing_style, category, tags, word_count, reading_time, author')
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Supabase query error: ${error.message}`);
      }

      const posts = (data || []).map(row => this.rowToMyPost(row));
      Logger.info(`Loaded ${posts.length} recent posts from Supabase`);

      return posts;
    } catch (error) {
      Logger.error('Failed to load recent posts from Supabase:', error);
      return [];
    }
  }

  /**
   * Create a version record for post history tracking
   */
  static async createVersion(
    postId: string,
    content: string,
    changeType: 'generated' | 'edited' | 'completed',
    versionNumber: number,
    title?: string,
    outline?: string[]
  ): Promise<void> {
    try {
      Logger.info('Creating version record:', { postId, changeType, versionNumber });

      const client = this.getClient();

      // Extract title and outline if not provided
      const lines = content.split('\n').filter(l => l.trim());
      const versionTitle = title || lines[0]?.replace(/^#\s*/, '') || 'Untitled';
      const versionOutline = outline || lines.filter(l => /^#{1,3}\s/.test(l)).map(l => l.replace(/^#{1,3}\s/, ''));

      const { error } = await client
        .from('post_versions')
        .insert({
          post_id: postId,
          version_number: versionNumber,
          title: versionTitle,
          content: content,
          outline: versionOutline,
          change_type: changeType
        });

      if (error) {
        throw new Error(`Version insert error: ${error.message}`);
      }

      Logger.info('Version record created successfully');
    } catch (error) {
      Logger.error('Failed to create version record:', error);
      // Don't throw - version creation is non-critical
    }
  }

  /**
   * Search posts by category
   */
  static async searchByCategory(category: string, limit: number = 10): Promise<MyPost[]> {
    try {
      Logger.info('Searching posts by category:', category);

      const client = this.getClient();

      const { data, error } = await client
        .from('posts')
        .select('id, title, content, writing_style, category, tags, word_count, reading_time, author')
        .eq('category', category)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Supabase query error: ${error.message}`);
      }

      const posts = (data || []).map(row => this.rowToMyPost(row));
      Logger.info(`Found ${posts.length} posts in category ${category}`);

      return posts;
    } catch (error) {
      Logger.error('Failed to search posts by category:', error);
      return [];
    }
  }

  /**
   * Convert database row to MyPost format
   */
  private static rowToMyPost(row: any): MyPost {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      style: (row.writing_style as WritingStyle) || this.getDefaultStyle(), // Parse JSONB
      metadata: {
        category: row.category,
        tags: row.tags || [],
        author: row.author || undefined,
        wordCount: row.word_count || undefined,
        readingTime: row.reading_time || undefined
      }
    };
  }

  /**
   * Get default writing style (fallback if DB has none)
   */
  private static getDefaultStyle(): WritingStyle {
    return {
      tone: 'conversational',
      complexity: 'medium',
      perspective: 'second-person',
      averageSentenceLength: 15,
      commonPhrases: [],
      vocabulary: 'intermediate'
    };
  }

  /**
   * Extract writing style from content (reuses existing analyzer)
   */
  private static extractStyleFromContent(content: string): WritingStyle {
    // Leverage existing PDF loader's style analysis
    // Access private static method via bracket notation
    return (MyPostsPDFLoader as any).analyzeStyle(content);
  }

  /**
   * Extract topic from content (helper for database storage)
   */
  private static extractTopicFromContent(content: GeneratedContent): string {
    // Use title as topic, or extract from first paragraph
    if (content.title) {
      return content.title.slice(0, 100); // Limit length
    }

    // Fallback: first line of content
    const firstLine = content.content.split('\n').find(l => l.trim().length > 0);
    return firstLine?.slice(0, 100) || 'Untitled';
  }

  /**
   * Extract target audience from content
   */
  private static extractAudienceFromContent(content: GeneratedContent): string {
    // Check metadata first
    if (content.metadata.author) {
      return 'SAT Students'; // Default for this blog
    }

    // Heuristic detection from content
    const lowerContent = content.content.toLowerCase();
    if (lowerContent.includes('student') || lowerContent.includes('학생')) {
      return 'SAT Students';
    }

    return 'General SAT Preparation Audience';
  }
}
