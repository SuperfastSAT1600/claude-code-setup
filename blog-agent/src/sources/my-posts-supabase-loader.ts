import type { MyPost } from '../types.js';
import { SupabasePostService } from '../services/supabase-post-service.js';
import { Logger } from '../utils/logger.js';

/**
 * Loads user's existing blog posts from Supabase database
 * Provides richer metadata than file-based loaders (writing_style JSONB)
 */
export class MyPostsSupabaseLoader {
  /**
   * Load all completed posts from database
   */
  static async loadAll(): Promise<MyPost[]> {
    try {
      Logger.info('Loading all posts from Supabase');
      // Load up to 100 most recent posts
      return await SupabasePostService.getRecentPosts(100);
    } catch (error) {
      Logger.error('Failed to load posts from Supabase:', error);
      return [];
    }
  }

  /**
   * Get N most recent posts for sampling
   * @param count Number of posts to return (default: 5)
   */
  static async getSamples(count: number = 5): Promise<MyPost[]> {
    try {
      Logger.info(`Loading ${count} sample posts from Supabase`);
      return await SupabasePostService.getRecentPosts(count);
    } catch (error) {
      Logger.error('Failed to load sample posts from Supabase:', error);
      return [];
    }
  }

  /**
   * Search posts by category for targeted style matching
   * @param category Category to search (e.g., 'SAT Math', 'SAT Reading')
   * @param limit Max number of results (default: 10)
   */
  static async searchByCategory(category: string, limit: number = 10): Promise<MyPost[]> {
    try {
      Logger.info(`Searching Supabase for posts in category: ${category}`);
      return await SupabasePostService.searchByCategory(category, limit);
    } catch (error) {
      Logger.error('Failed to search posts by category:', error);
      return [];
    }
  }
}
