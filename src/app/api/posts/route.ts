import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { GeneratedContent } from '@blog-agent/types';

interface SavedPostMetadata {
  filename: string;
  title: string;
  category: string;
  savedAt: Date;
  wordCount: number;
}

export async function GET() {
  try {
    const outputDir = path.join(
      process.cwd(),
      'blog-agent',
      'data',
      'outputs',
      'drafts'
    );

    // Ensure directory exists
    try {
      await fs.access(outputDir);
    } catch {
      await fs.mkdir(outputDir, { recursive: true });
      return NextResponse.json({ success: true, posts: [] });
    }

    // Read all JSON files
    const files = await fs.readdir(outputDir);
    const jsonFiles = files.filter((file) => file.endsWith('.json'));

    // Parse each file and extract metadata
    const posts: SavedPostMetadata[] = [];

    for (const filename of jsonFiles) {
      try {
        const filePath = path.join(outputDir, filename);
        const content = await fs.readFile(filePath, 'utf-8');
        const data: GeneratedContent = JSON.parse(content);

        // Get file stats for saved date
        const stats = await fs.stat(filePath);

        posts.push({
          filename,
          title: data.title,
          category: data.metadata.category || 'SAT Preparation',
          savedAt: stats.mtime,
          wordCount: data.metadata.wordCount || 0,
        });
      } catch (error) {
        console.error(`Error parsing ${filename}:`, error);
        // Skip invalid files
        continue;
      }
    }

    // Sort by savedAt descending (newest first)
    posts.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());

    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error('Error listing posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to list posts',
      },
      { status: 500 }
    );
  }
}
