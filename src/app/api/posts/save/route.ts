import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { generatedContentSchema } from '@/lib/validation/saved-post';
import { SupabasePostService } from '../../../../../blog-agent/src/services/supabase-post-service.js';
import { PatternExtractor } from '../../../../../blog-agent/src/services/pattern-extractor.js';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate with Zod
    const validated = generatedContentSchema.parse(body);

    // Generate filename
    const slug = slugify(validated.title);
    const timestamp = formatTimestamp(new Date());
    const filename = `${slug}-${timestamp}.json`;

    // Ensure output directory exists
    const outputDir = path.join(
      process.cwd(),
      'blog-agent',
      'data',
      'outputs',
      'drafts'
    );
    await fs.mkdir(outputDir, { recursive: true });

    // 1. Save to filesystem (existing - backup)
    const filePath = path.join(outputDir, filename);
    await fs.writeFile(
      filePath,
      JSON.stringify(validated, null, 2),
      'utf-8'
    );

    // 2. Save to Supabase (new - primary)
    let supabaseId: string | null = null;
    try {
      supabaseId = await SupabasePostService.savePost(validated);

      // 3. Extract patterns (async, non-blocking)
      const posts = await SupabasePostService.getRecentPosts(20);
      PatternExtractor.extractPatterns(posts).catch(err =>
        console.error('Pattern extraction failed:', err)
      );
    } catch (supabaseError) {
      console.error('Supabase save failed (filesystem backup exists):', supabaseError);
      // Don't fail the request - filesystem save succeeded
    }

    return NextResponse.json({
      success: true,
      filename,
      path: filePath,
      supabaseId, // Database UUID (may be null if DB failed)
    });
  } catch (error) {
    console.error('Error saving post:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save post',
      },
      { status: 500 }
    );
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-') // Support Korean characters
    .replace(/^-|-$/g, '')
    .substring(0, 50);
}

function formatTimestamp(date: Date): string {
  // Format: YYYYMMdd-HHmmss
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}-${hours}${minutes}${seconds}`;
}
