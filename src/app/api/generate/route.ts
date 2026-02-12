import { NextRequest, NextResponse } from 'next/server';
import { BlogGenerationService } from '@/lib/blog-service';
import { blogFormSchema } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validatedData = blogFormSchema.parse(body);

    // Create service instance
    const service = new BlogGenerationService();

    // Generate blog post
    const result = await service.generate({
      topic: validatedData.topic,
      seoPlatform: validatedData.seoPlatform,
      desiredLength: validatedData.desiredLength,
    });

    // Return success response
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Blog generation error:', error);

    // Handle validation errors
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid request data',
          details: error.message,
        },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}
