import type { WebSearchResult } from '../types.js';
import { Logger } from '../utils/logger.js';

/**
 * Web search engine for gathering current information
 * Supports multiple search providers
 */
export class WebSearchEngine {
  private apiKey?: string;
  private engine: 'serpapi' | 'google' | 'mock';

  constructor(apiKey?: string, engine: 'serpapi' | 'google' | 'mock' = 'mock') {
    this.apiKey = apiKey || process.env.SEARCH_API_KEY;
    const envEngine = process.env.SEARCH_ENGINE;
    this.engine = (envEngine === 'serpapi' || envEngine === 'google' || envEngine === 'mock')
      ? envEngine
      : engine;

    if (!this.apiKey && this.engine !== 'mock') {
      Logger.warn('No search API key provided, using mock search');
      this.engine = 'mock';
    }
  }

  /**
   * Search the web for a query
   */
  async search(query: string, maxResults: number = 10): Promise<WebSearchResult[]> {
    Logger.info(`Searching web for: "${query}" (engine: ${this.engine})`);

    try {
      switch (this.engine) {
        case 'serpapi':
          return await this.searchWithSerpAPI(query, maxResults);
        case 'google':
          return await this.searchWithGoogle(query, maxResults);
        case 'mock':
        default:
          return this.mockSearch(query, maxResults);
      }
    } catch (error) {
      Logger.error('Web search failed:', error);
      return [];
    }
  }

  /**
   * Search using SerpAPI
   */
  private async searchWithSerpAPI(query: string, maxResults: number): Promise<WebSearchResult[]> {
    if (!this.apiKey) {
      throw new Error('SerpAPI key required');
    }

    const url = new URL('https://serpapi.com/search');
    url.searchParams.set('q', query);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('num', maxResults.toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`SerpAPI error: ${response.statusText}`);
    }

    const data = await response.json();
    const results: WebSearchResult[] = [];

    if (data.organic_results) {
      for (const result of data.organic_results.slice(0, maxResults)) {
        results.push({
          title: result.title || 'Untitled',
          url: result.link || '',
          snippet: result.snippet || '',
          relevance: 0.8,
          fetchedAt: new Date()
        });
      }
    }

    Logger.info(`Found ${results.length} results via SerpAPI`);
    return results;
  }

  /**
   * Search using Google Custom Search API
   */
  private async searchWithGoogle(query: string, maxResults: number): Promise<WebSearchResult[]> {
    if (!this.apiKey) {
      throw new Error('Google API key required');
    }

    const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;
    if (!cx) {
      throw new Error('Google Search Engine ID required (GOOGLE_SEARCH_ENGINE_ID)');
    }

    const url = new URL('https://www.googleapis.com/customsearch/v1');
    url.searchParams.set('q', query);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('cx', cx);
    url.searchParams.set('num', Math.min(maxResults, 10).toString());

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`Google API error: ${response.statusText}`);
    }

    const data = await response.json();
    const results: WebSearchResult[] = [];

    if (data.items) {
      for (const item of data.items.slice(0, maxResults)) {
        results.push({
          title: item.title || 'Untitled',
          url: item.link || '',
          snippet: item.snippet || '',
          relevance: 0.8,
          fetchedAt: new Date()
        });
      }
    }

    Logger.info(`Found ${results.length} results via Google`);
    return results;
  }

  /**
   * Mock search for testing without API
   */
  private mockSearch(query: string, maxResults: number): WebSearchResult[] {
    Logger.info('Using mock search (no real API calls)');

    const mockResults: WebSearchResult[] = [
      {
        title: `SAT ${query} - Complete Guide`,
        url: 'https://www.example.com/sat-guide',
        snippet: `Comprehensive guide to ${query} for SAT preparation. Learn proven strategies and tips from expert tutors.`,
        relevance: 0.9,
        fetchedAt: new Date()
      },
      {
        title: `${query} Tips and Strategies`,
        url: 'https://www.example.com/tips',
        snippet: `Master ${query} with these effective tips and strategies. Improve your SAT score with targeted practice.`,
        relevance: 0.85,
        fetchedAt: new Date()
      },
      {
        title: `Common ${query} Mistakes to Avoid`,
        url: 'https://www.example.com/mistakes',
        snippet: `Learn about the most common mistakes students make with ${query} and how to avoid them on test day.`,
        relevance: 0.8,
        fetchedAt: new Date()
      },
      {
        title: `${query} Practice Questions`,
        url: 'https://www.example.com/practice',
        snippet: `Free practice questions for ${query}. Test your knowledge and track your progress with detailed explanations.`,
        relevance: 0.75,
        fetchedAt: new Date()
      },
      {
        title: `How to Improve Your ${query} Skills`,
        url: 'https://www.example.com/improve',
        snippet: `Step-by-step guide to improving your ${query} skills. From basics to advanced techniques.`,
        relevance: 0.7,
        fetchedAt: new Date()
      }
    ];

    return mockResults.slice(0, maxResults);
  }

  /**
   * Fetch full content from a URL (simplified version)
   */
  async fetchContent(url: string): Promise<string | null> {
    try {
      Logger.debug(`Fetching content from: ${url}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; BlogAgent/1.0)'
        }
      });

      if (!response.ok) {
        Logger.warn(`Failed to fetch ${url}: ${response.statusText}`);
        return null;
      }

      const html = await response.text();

      // Simple text extraction (remove HTML tags)
      const text = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      return text;
    } catch (error) {
      Logger.error(`Error fetching content from ${url}:`, error);
      return null;
    }
  }
}
