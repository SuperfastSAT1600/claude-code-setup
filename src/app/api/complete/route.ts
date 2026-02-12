import { NextRequest, NextResponse } from 'next/server';
import { BlogGenerationService } from '@/lib/blog-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, incompleteContent, seoPlatform, metadata } = body;

    if (!incompleteContent) {
      return NextResponse.json(
        { error: 'Incomplete content is required' },
        { status: 400 }
      );
    }

    const service = new BlogGenerationService();

    // Call completion method
    const result = await service.complete({
      title,
      incompleteContent,
      seoPlatform,
      metadata
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Completion error:', error);
    return NextResponse.json(
      {
        error: 'Failed to complete content',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
