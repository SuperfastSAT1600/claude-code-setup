'use client';

import * as React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Plus, X, Save, XCircle } from 'lucide-react';
import type { GeneratedContent, Reference } from '@blog-agent/types';

interface ContentEditorProps {
  content: GeneratedContent;
  onChange: (content: GeneratedContent) => void;
  onSave: () => void;
  onCancel: () => void;
}

type FormData = {
  title: string;
  content: string;
  'metadata.category': string;
  'seoMetadata.focusKeyword'?: string;
  'seoMetadata.metaDescription'?: string;
};

export function ContentEditor({
  content,
  onChange,
  onSave,
  onCancel,
}: ContentEditorProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      title: content.title,
      content: content.content,
      'metadata.category': content.metadata.category || 'SAT Preparation',
      'seoMetadata.focusKeyword': content.seoMetadata?.focusKeyword || '',
      'seoMetadata.metaDescription': content.seoMetadata?.metaDescription || '',
    },
  });

  const [references, setReferences] = React.useState<Reference[]>(
    content.references || []
  );
  const [tags, setTags] = React.useState<string>(
    content.metadata.tags?.join(', ') || ''
  );
  const [semanticKeywords, setSemanticKeywords] = React.useState<string>(
    content.seoMetadata?.semanticKeywords?.join(', ') || ''
  );

  const contentValue = watch('content');

  const handleFormSubmit: SubmitHandler<FormData> = (data) => {
    const updatedContent: GeneratedContent = {
      title: data.title,
      content: data.content,
      outline: content.outline || [],
      references,
      metadata: {
        category: data['metadata.category'],
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
        readingTime: content.metadata.readingTime,
        wordCount: contentValue.split(/\s+/).length,
      },
      generatedAt: content.generatedAt,
      seoMetadata: {
        focusKeyword: data['seoMetadata.focusKeyword'],
        metaDescription: data['seoMetadata.metaDescription'],
        semanticKeywords: semanticKeywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean),
      },
    };
    onChange(updatedContent);
    onSave();
  };

  const addReference = () => {
    const newRef: Reference = {
      type: 'web-search',
      title: '',
      url: '',
      excerpt: '',
    };
    setReferences([...references, newRef]);
  };

  const removeReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index));
  };

  const updateReference = (
    index: number,
    field: keyof Reference,
    value: string
  ) => {
    const updated = [...references];
    updated[index] = { ...updated[index], [field]: value };
    setReferences(updated);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Title</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            {...register('title')}
            placeholder="Post title..."
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('content')}
            placeholder="# Your content here..."
            className={`min-h-[400px] font-mono ${
              errors.content ? 'border-destructive' : ''
            }`}
          />
          <div className="flex justify-between items-center mt-2">
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content.message}</p>
            )}
            <p className="text-sm text-muted-foreground ml-auto">
              {contentValue?.length || 0} characters |{' '}
              {contentValue?.split(/\s+/).length || 0} words
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              {...register('metadata.category')}
              placeholder="SAT Preparation"
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="SAT, math, tips"
            />
          </div>
        </CardContent>
      </Card>

      {/* SEO Metadata */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">SEO Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="focusKeyword">Focus Keyword</Label>
            <Input
              id="focusKeyword"
              {...register('seoMetadata.focusKeyword')}
              placeholder="Primary keyword for SEO"
            />
          </div>

          <div>
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Textarea
              id="metaDescription"
              {...register('seoMetadata.metaDescription')}
              placeholder="Brief description for search engines..."
              className="min-h-[80px]"
            />
          </div>

          <div>
            <Label htmlFor="semanticKeywords">
              Semantic Keywords (comma-separated)
            </Label>
            <Input
              id="semanticKeywords"
              value={semanticKeywords}
              onChange={(e) => setSemanticKeywords(e.target.value)}
              placeholder="related, keywords, here"
            />
          </div>
        </CardContent>
      </Card>

      {/* References */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">References</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addReference}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Reference
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {references.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No references yet. Click "Add Reference" to add one.
            </p>
          ) : (
            references.map((ref, idx) => (
              <div
                key={idx}
                className="p-4 border rounded-lg space-y-3 relative"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => removeReference(idx)}
                >
                  <X className="w-4 h-4" />
                </Button>

                <div>
                  <Label htmlFor={`ref-title-${idx}`}>Title</Label>
                  <Input
                    id={`ref-title-${idx}`}
                    value={ref.title}
                    onChange={(e) =>
                      updateReference(idx, 'title', e.target.value)
                    }
                    placeholder="Reference title"
                  />
                </div>

                <div>
                  <Label htmlFor={`ref-url-${idx}`}>URL (optional)</Label>
                  <Input
                    id={`ref-url-${idx}`}
                    value={ref.url || ''}
                    onChange={(e) => updateReference(idx, 'url', e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <Label htmlFor={`ref-excerpt-${idx}`}>Excerpt</Label>
                  <Textarea
                    id={`ref-excerpt-${idx}`}
                    value={ref.excerpt}
                    onChange={(e) =>
                      updateReference(idx, 'excerpt', e.target.value)
                    }
                    placeholder="Brief excerpt or description..."
                    className="min-h-[60px]"
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 sticky bottom-4 bg-background/95 backdrop-blur-sm p-4 border rounded-lg shadow-lg">
        <Button type="submit" className="flex-1">
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Discard Changes
        </Button>
      </div>
    </form>
  );
}
