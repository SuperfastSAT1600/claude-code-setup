import type { SATMaterial } from '../types.js';
import { FileManager } from '../utils/file-manager.js';
import { Logger } from '../utils/logger.js';
import { paths } from '../config/agent-config.js';
import path from 'path';

/**
 * Loads and manages SAT official materials
 */
export class SATMaterialsLoader {
  /**
   * Load all SAT materials
   */
  static async loadAll(): Promise<SATMaterial[]> {
    Logger.info('Loading SAT materials from:', paths.satMaterials);

    const materials: SATMaterial[] = [];

    try {
      // Load from each subdirectory
      const types: Array<{ dir: string; type: SATMaterial['type'] }> = [
        { dir: 'official-guides', type: 'official-guide' },
        { dir: 'practice-tests', type: 'practice-test' },
        { dir: 'study-tips', type: 'study-tip' }
      ];

      for (const { dir, type } of types) {
        const dirPath = path.join(paths.satMaterials, dir);
        const files = await FileManager.readMarkdownFiles(dirPath);

        for (const file of files) {
          try {
            const material = this.parseMaterial(file.path, file.content, type);
            materials.push(material);
          } catch (error) {
            Logger.warn(`Failed to parse SAT material ${file.path}:`, error);
          }
        }
      }

      Logger.info(`Loaded ${materials.length} SAT materials`);
      return materials;
    } catch (error) {
      Logger.error('Failed to load SAT materials:', error);
      return [];
    }
  }

  /**
   * Load materials by type
   */
  static async loadByType(type: SATMaterial['type']): Promise<SATMaterial[]> {
    const all = await this.loadAll();
    return all.filter(m => m.type === type);
  }

  /**
   * Search materials by query
   */
  static async search(query: string): Promise<SATMaterial[]> {
    const all = await this.loadAll();
    const queryLower = query.toLowerCase();

    return all
      .map(material => ({
        material,
        relevance: this.calculateRelevance(material, queryLower)
      }))
      .filter(({ relevance }) => relevance > 0)
      .sort((a, b) => b.relevance - a.relevance)
      .map(({ material, relevance }) => ({ ...material, relevance }));
  }

  /**
   * Parse a SAT material file
   */
  private static parseMaterial(
    filePath: string,
    content: string,
    type: SATMaterial['type']
  ): SATMaterial {
    // Extract title
    let title = 'Untitled';
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      title = titleMatch[1];
    }

    // Extract frontmatter source if exists
    let source = 'College Board';
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const sourceMatch = frontmatterMatch[1].match(/source:\s*"?([^"\n]+)"?/);
      if (sourceMatch) source = sourceMatch[1];
    }

    const id = filePath.split(/[\\/]/).pop()?.replace('.md', '') || 'unknown';

    return {
      id,
      type,
      title,
      content,
      source
    };
  }

  private static escapeRegExp(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Calculate relevance score for a material based on query
   */
  private static calculateRelevance(material: SATMaterial, query: string): number {
    let score = 0;
    const titleLower = material.title.toLowerCase();
    const contentLower = material.content.toLowerCase();

    // Title match (highest weight)
    if (titleLower.includes(query)) score += 10;

    // Content matches (escape query for safe regex usage)
    const escapedQuery = this.escapeRegExp(query);
    const contentMatches = (contentLower.match(new RegExp(escapedQuery, 'g')) || []).length;
    score += Math.min(contentMatches, 5); // Cap at 5 points

    // Type bonus for study tips (usually most helpful)
    if (material.type === 'study-tip' && score > 0) score += 2;

    return score;
  }
}
