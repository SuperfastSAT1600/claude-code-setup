'use client';

import * as React from 'react';
import { BlogGeneratorForm } from '@/components/blog-generator-form';
import { GenerationProgress } from '@/components/generation-progress';
import { EditableContentPreview } from '@/components/editable-content-preview';
import { SavedPostsLibrary } from '@/components/saved-posts-library';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useBlogGeneration } from '@/hooks/use-blog-generation';
import { AlertCircle, FolderOpen } from 'lucide-react';
import type { GeneratedContent } from '@blog-agent/types';

export default function HomePage() {
  const { generate, regenerate, isGenerating, result, error, reset, canRegenerate } = useBlogGeneration();
  const [libraryOpen, setLibraryOpen] = React.useState(false);
  const [loadedPost, setLoadedPost] = React.useState<GeneratedContent | null>(null);

  const handleLoadPost = (post: GeneratedContent) => {
    setLoadedPost(post);
  };

  const displayedContent = loadedPost || result;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold mb-2">
          Generate SEO-Optimized SAT Blog Posts
        </h2>
        <p className="text-lg text-muted-foreground mb-4">
          Create platform-specific content for Google or Naver with AI-powered generation
        </p>
        <Button
          onClick={() => setLibraryOpen(true)}
          variant="outline"
          size="lg"
        >
          <FolderOpen className="w-5 h-5 mr-2" />
          Saved Drafts
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Blog Generator</CardTitle>
              <CardDescription>
                Fill in the details below to generate your blog post
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BlogGeneratorForm
                onSubmit={generate}
                isGenerating={isGenerating}
              />
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="mt-6 space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="text-2xl">🔍</div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">
                      Google Optimization
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      E-E-A-T focused content with natural keyword placement,
                      authoritative tone, and comprehensive coverage
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <div className="text-2xl">🇰🇷</div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">
                      Naver Optimization
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      C-Rank optimized with high keyword density, emojis,
                      personal tone, and engagement prompts
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column: Progress or Preview */}
        <div>
          {error && (
            <Card className="border-destructive bg-destructive/10">
              <CardContent className="pt-6">
                <div className="flex gap-3 items-start">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm mb-1 text-destructive">
                      Generation Failed
                    </h4>
                    <p className="text-sm text-destructive/90">{error}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {isGenerating && (
            <Card>
              <CardHeader>
                <CardTitle>Generating Your Content</CardTitle>
                <CardDescription>
                  Please wait while we create your blog post
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GenerationProgress />
              </CardContent>
            </Card>
          )}

          {displayedContent && !isGenerating && (
            <>
              {result && !loadedPost && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    ✅ Blog post generated successfully!
                  </p>
                </div>
              )}
              {loadedPost && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">
                    📁 Loaded from saved drafts
                  </p>
                </div>
              )}
              <EditableContentPreview
                content={displayedContent}
                onGenerateNew={() => {
                  setLoadedPost(null);
                  reset();
                }}
                onRegenerate={canRegenerate ? regenerate : undefined}
              />
            </>
          )}

          {!isGenerating && !result && !error && (
            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold mb-2">
                    Ready to Generate
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Fill out the form and click "Generate Blog Post" to get
                    started
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold mb-2">Fast Generation</h3>
            <p className="text-sm text-muted-foreground">
              Generate high-quality blog posts in 20-40 seconds with AI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-semibold mb-2">Platform Specific</h3>
            <p className="text-sm text-muted-foreground">
              Content optimized for Google E-E-A-T or Naver C-Rank algorithms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="font-semibold mb-2">SAT Focused</h3>
            <p className="text-sm text-muted-foreground">
              Specialized content for SAT preparation with accurate materials
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Saved Posts Library Modal */}
      <SavedPostsLibrary
        isOpen={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onLoadPost={handleLoadPost}
      />
    </div>
  );
}
