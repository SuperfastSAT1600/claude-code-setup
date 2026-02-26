import type { SATMaterial } from '../types.js';
import { PDFLoader } from './pdf-loader.js';
import { Logger } from '../utils/logger.js';
import { paths } from '../config/agent-config.js';
import path from 'path';

/**
 * Loads SAT official materials from PDF files
 */
export class SATMaterialsPDFLoader {
  /**
   * Load all SAT PDF materials
   */
  static async loadAll(): Promise<SATMaterial[]> {
    const pdfDir = paths.satMaterials + '-pdf';
    Logger.info('Loading SAT PDF materials from:', pdfDir);

    try {
      const pdfFiles = await PDFLoader.loadRecursive(pdfDir);
      const materials: SATMaterial[] = [];

      for (const file of pdfFiles) {
        try {
          const material = this.parseSATMaterial(file.filename, file.content, file.relativePath);
          materials.push(material);
        } catch (error) {
          Logger.warn(`Failed to parse SAT PDF ${file.filename}:`, error);
        }
      }

      Logger.info(`Loaded ${materials.length} SAT PDF materials`);
      return materials;
    } catch (error) {
      Logger.error('Failed to load SAT PDF materials:', error);
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
   * Parse a SAT material PDF
   */
  private static parseSATMaterial(
    filename: string,
    content: string,
    relativePath: string
  ): SATMaterial {
    // Determine type from path
    const type = this.determineType(relativePath);

    // Extract title from filename or content
    let title = filename.replace('.pdf', '').replace(/[-_]/g, ' ');

    // Try to extract title from content (first line)
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      const firstLine = lines[0].trim();
      if (firstLine.length < 100) {
        title = firstLine;
      }
    }

    // Generate ID
    const id = filename.replace('.pdf', '').toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Determine source
    const source = this.determineSource(content);

    return {
      id,
      type,
      title,
      content,
      source
    };
  }

  /**
   * Determine material type from path
   */
  private static determineType(relativePath: string): SATMaterial['type'] {
    const lower = relativePath.toLowerCase();

    if (lower.includes('official-guide') || lower.includes('guide')) {
      return 'official-guide';
    } else if (lower.includes('practice-test') || lower.includes('test')) {
      return 'practice-test';
    } else if (lower.includes('study-tip') || lower.includes('tip')) {
      return 'study-tip';
    }

    return 'other';
  }

  /**
   * Determine source from content
   */
  private static determineSource(content: string): string {
    const lowerContent = content.toLowerCase();

    if (lowerContent.includes('college board')) {
      return 'College Board';
    } else if (lowerContent.includes('khan academy')) {
      return 'Khan Academy';
    } else if (lowerContent.includes('official')) {
      return 'Official SAT Materials';
    }

    return 'SAT Study Materials';
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

    // Split query into keywords
    const keywords = query.split(/\s+/).filter(k => k.length > 2);

    for (const keyword of keywords) {
      // Title matches (highest weight)
      if (titleLower.includes(keyword)) score += 10;

      // Content matches (escape keyword for safe regex usage)
      const escapedKeyword = this.escapeRegExp(keyword);
      const contentMatches = (contentLower.match(new RegExp(escapedKeyword, 'g')) || []).length;
      score += Math.min(contentMatches, 5);
    }

    // Type bonus
    if (material.type === 'official-guide' && score > 0) score += 3;
    if (material.type === 'study-tip' && score > 0) score += 2;

    return score;
  }
}
