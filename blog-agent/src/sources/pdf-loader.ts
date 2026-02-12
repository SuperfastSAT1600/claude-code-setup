import { promises as fs } from 'fs';
import path from 'path';
import { Logger } from '../utils/logger.js';

/**
 * PDF file loader and text extractor
 */
export class PDFLoader {
  /**
   * Extract text from a single PDF file
   */
  static async extractText(filePath: string): Promise<string> {
    try {
      // Dynamic import for CommonJS module
      const pdfParseModule = await import('pdf-parse');
      // Type assertion for CommonJS default export
      const pdfParse = (pdfParseModule as any).default || pdfParseModule;
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      Logger.error(`Failed to extract text from PDF ${filePath}:`, error);
      throw error;
    }
  }

  /**
   * Load all PDF files from a directory
   */
  static async loadFromDirectory(dirPath: string): Promise<Array<{ path: string; content: string; filename: string }>> {
    try {
      const files = await fs.readdir(dirPath);
      const pdfFiles = files.filter(file => file.toLowerCase().endsWith('.pdf'));

      Logger.info(`Found ${pdfFiles.length} PDF files in ${dirPath}`);

      const results = await Promise.all(
        pdfFiles.map(async (file) => {
          const filePath = path.join(dirPath, file);
          try {
            const content = await this.extractText(filePath);
            Logger.debug(`Extracted ${content.length} characters from ${file}`);
            return {
              path: filePath,
              content,
              filename: file
            };
          } catch (error) {
            Logger.warn(`Failed to process PDF ${file}:`, error);
            return null;
          }
        })
      );

      return results.filter((result): result is { path: string; content: string; filename: string } => result !== null);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        Logger.warn(`Directory ${dirPath} does not exist`);
        return [];
      }
      Logger.error(`Failed to load PDFs from ${dirPath}:`, error);
      return [];
    }
  }

  /**
   * Load PDFs recursively from directory and subdirectories
   */
  static async loadRecursive(dirPath: string): Promise<Array<{ path: string; content: string; filename: string; relativePath: string }>> {
    const results: Array<{ path: string; content: string; filename: string; relativePath: string }> = [];

    async function scanDirectory(currentPath: string, basePath: string): Promise<void> {
      try {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(currentPath, entry.name);

          if (entry.isDirectory()) {
            await scanDirectory(fullPath, basePath);
          } else if (entry.name.toLowerCase().endsWith('.pdf')) {
            try {
              const content = await PDFLoader.extractText(fullPath);
              const relativePath = path.relative(basePath, fullPath);
              results.push({
                path: fullPath,
                content,
                filename: entry.name,
                relativePath
              });
              Logger.debug(`Loaded PDF: ${relativePath}`);
            } catch (error) {
              Logger.warn(`Failed to process PDF ${fullPath}:`, error);
            }
          }
        }
      } catch (error) {
        Logger.warn(`Failed to scan directory ${currentPath}:`, error);
      }
    }

    try {
      await scanDirectory(dirPath, dirPath);
      Logger.info(`Loaded ${results.length} PDFs from ${dirPath}`);
    } catch (error) {
      Logger.error(`Failed to load PDFs recursively from ${dirPath}:`, error);
    }

    return results;
  }
}
