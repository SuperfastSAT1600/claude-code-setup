'use client';

import * as React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { GeneratedContent } from '@blog-agent/types';
import { Copy, Download, RefreshCw, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { markdownToPlainText } from '@/lib/markdown-to-text';

interface ContentPreviewProps {
  content: GeneratedContent;
  onGenerateNew: () => void;
}

export function ContentPreview({
  content,
  onGenerateNew,
}: ContentPreviewProps) {
  const [copied, setCopied] = React.useState(false);

  // Determine display format based on platform
  const platform = content.seoPlatform || 'none';
  const isNaverFormat = platform === 'naver';

  // Prepare content
  const displayContent = isNaverFormat
    ? markdownToPlainText(content.content)
    : content.content;

  const fileExtension = isNaverFormat ? 'txt' : 'md';
  const contentType = isNaverFormat ? 'text/plain' : 'text/markdown';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([displayContent], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title.replace(/\s+/g, '-').toLowerCase()}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handleCopy} variant="outline" className="flex-1">
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy {isNaverFormat ? 'Plain Text' : 'Markdown'}
            </>
          )}
        </Button>
        <Button onClick={handleDownload} variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" />
          Download .{fileExtension}
        </Button>
        <Button onClick={onGenerateNew} className="flex-1">
          <RefreshCw className="w-4 h-4 mr-2" />
          Generate New
        </Button>
      </div>

      {/* Platform Indicator Badge */}
      {content.seoPlatform && (
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
          <span className="font-medium">
            {content.seoPlatform === 'naver' ? '네이버 블로그 (텍스트)' : 'Google (Markdown)'}
          </span>
        </div>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">
                Word Count:
              </span>{' '}
              <span className="font-semibold">
                {content.metadata.wordCount || 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">
                Reading Time:
              </span>{' '}
              <span className="font-semibold">
                {content.metadata.readingTime
                  ? `${content.metadata.readingTime} min`
                  : 'N/A'}
              </span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">
                Category:
              </span>{' '}
              <span className="font-semibold">
                {content.metadata.category || 'SAT Preparation'}
              </span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Tags:</span>{' '}
              <span className="font-semibold">
                {content.metadata.tags?.join(', ') || 'N/A'}
              </span>
            </div>
          </div>
          {content.seoMetadata && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                SEO Keywords
              </p>
              <div className="flex flex-wrap gap-1">
                {content.seoMetadata.semanticKeywords?.map((keyword, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Content Preview */}
      <Card>
        <CardHeader>
          <CardTitle>{content.title}</CardTitle>
        </CardHeader>
        <CardContent>
          {isNaverFormat ? (
            // Plain text display for Naver
            <div className="whitespace-pre-wrap font-sans text-foreground leading-relaxed bg-muted/30 p-6 rounded-lg border">
              {displayContent}
            </div>
          ) : (
            // Markdown display for Google/none (existing)
            <div
              className={cn(
                'prose prose-slate max-w-none',
                'prose-headings:font-bold prose-headings:text-foreground',
                'prose-p:text-foreground prose-p:leading-relaxed',
                'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
                'prose-strong:text-foreground prose-strong:font-semibold',
                'prose-code:text-primary prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded',
                'prose-pre:bg-muted prose-pre:border prose-pre:border-border',
                'prose-ul:text-foreground prose-ol:text-foreground',
                'prose-li:text-foreground prose-li:marker:text-primary'
              )}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {content.content}
              </ReactMarkdown>
            </div>
          )}
        </CardContent>
      </Card>

      {/* References */}
      {content.references && content.references.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">References</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {content.references.map((ref, idx) => (
                <li key={idx} className="text-sm">
                  <span className="font-medium">{ref.title}</span>
                  {ref.url && (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline ml-2"
                    >
                      {ref.url}
                    </a>
                  )}
                  <p className="text-muted-foreground text-xs mt-1">
                    {ref.excerpt}
                  </p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
