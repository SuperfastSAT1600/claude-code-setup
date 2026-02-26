import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { GeneratedContent } from '@blog-agent/types';

interface RouteContext {
  params: Promise<{ filename: string }>;
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { filename } = await context.params;

    // Security: Only allow .json files
    if (!filename.endsWith('.json')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type' },
        { status: 400 }
      );
    }

    const filePath = path.join(
      process.cwd(),
      'blog-agent',
      'data',
      'outputs',
      'drafts',
      filename
    );

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Read and parse file
    const content = await fs.readFile(filePath, 'utf-8');
    const post: GeneratedContent = JSON.parse(content);

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error('Error loading post:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load post',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const { filename } = await context.params;

    // Security: Only allow .json files
    if (!filename.endsWith('.json')) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type' },
        { status: 400 }
      );
    }

    const filePath = path.join(
      process.cwd(),
      'blog-agent',
      'data',
      'outputs',
      'drafts',
      filename
    );

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Post not found' },
        { status: 404 }
      );
    }

    // Delete file
    await fs.unlink(filePath);

    return NextResponse.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete post',
      },
      { status: 500 }
    );
  }
}
