import type { MyPost, WritingStyle } from '../types.js';
import { FileManager } from '../utils/file-manager.js';
import { Logger } from '../utils/logger.js';
import { paths } from '../config/agent-config.js';

/**
 * Loads and manages user's existing blog posts for style analysis
 */
export class MyPostsLoader {
  /**
   * Load all user's posts from the my-posts directory
   */
  static async loadAll(): Promise<MyPost[]> {
    Logger.info('Loading user posts from:', paths.myPosts);

    try {
      const files = await FileManager.readMarkdownFiles(paths.myPosts);
      const posts: MyPost[] = [];

      for (const file of files) {
        try {
          const post = this.parsePost(file.path, file.content);
          posts.push(post);
        } catch (error) {
          Logger.warn(`Failed to parse post ${file.path}:`, error);
        }
      }

      Logger.info(`Loaded ${posts.length} user posts`);
      return posts;
    } catch (error) {
      Logger.error('Failed to load user posts:', error);
      return [];
    }
  }

  /**
   * Load a specific post by ID
   */
  static async loadById(id: string): Promise<MyPost | null> {
    const posts = await this.loadAll();
    return posts.find(p => p.id === id) || null;
  }

  /**
   * Get sample posts for style analysis (most recent N posts)
   */
  static async getSamples(count: number = 5): Promise<MyPost[]> {
    const posts = await this.loadAll();
    return posts.slice(0, Math.min(count, posts.length));
  }

  /**
   * Parse a markdown post file into a MyPost object
   */
  private static parsePost(filePath: string, content: string): MyPost {
    // Extract frontmatter if exists
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    let metadata = {
      category: 'SAT Prep',
      tags: [] as string[]
    };
    let postContent = content;
    let title = 'Untitled';

    if (frontmatterMatch) {
      const [, frontmatter, body] = frontmatterMatch;
      postContent = body;

      // Parse frontmatter (simple YAML parsing)
      const titleMatch = frontmatter.match(/title:\s*"?([^"\n]+)"?/);
      if (titleMatch) title = titleMatch[1];

      const categoryMatch = frontmatter.match(/category:\s*"?([^"\n]+)"?/);
      if (categoryMatch) metadata.category = categoryMatch[1];

      const tagsMatch = frontmatter.match(/tags:\s*\[(.*?)\]/);
      if (tagsMatch) {
        metadata.tags = tagsMatch[1]
          .split(',')
          .map(t => t.trim().replace(/["']/g, ''));
      }
    } else {
      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch) title = titleMatch[1];
    }

    // Generate ID from filename
    const id = filePath.split(/[\\/]/).pop()?.replace('.md', '') || 'unknown';

    // Analyze basic style (placeholder - will be enhanced)
    const style = this.analyzeBasicStyle(postContent);

    return {
      id,
      title,
      content: postContent,
      style,
      metadata
    };
  }

  /**
   * Basic style analysis (placeholder - will be enhanced with AI)
   */
  private static analyzeBasicStyle(content: string): WritingStyle {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;

    // Simple heuristics
    const hasFirstPerson = /\b(I|we|me|us|my|our)\b/i.test(content);
    const hasSecondPerson = /\b(you|your)\b/i.test(content);

    return {
      tone: 'conversational',
      complexity: avgSentenceLength > 20 ? 'advanced' : avgSentenceLength > 15 ? 'medium' : 'simple',
      perspective: hasSecondPerson ? 'second-person' : hasFirstPerson ? 'first-person' : 'third-person',
      averageSentenceLength: Math.round(avgSentenceLength),
      commonPhrases: [],
      vocabulary: 'intermediate'
    };
  }
}
