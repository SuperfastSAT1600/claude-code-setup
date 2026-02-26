'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { blogFormSchema, type BlogFormData } from '@/lib/validation';
import { cn } from '@/lib/utils';

interface BlogGeneratorFormProps {
  onSubmit: (data: BlogFormData) => void;
  isGenerating: boolean;
}

export function BlogGeneratorForm({
  onSubmit,
  isGenerating,
}: BlogGeneratorFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<BlogFormData>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: {
      seoPlatform: 'google',
      desiredLength: 'standard',
    },
  });

  const selectedPlatform = watch('seoPlatform');
  const selectedLength = watch('desiredLength');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Platform Selection */}
      <div className="space-y-3">
        <Label htmlFor="seoPlatform" className="text-base font-semibold">
          Target Platform
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              value: 'google',
              label: 'Google',
              description: 'E-E-A-T focused, natural keywords',
              icon: '🔍',
            },
            {
              value: 'naver',
              label: 'Naver',
              description: 'C-Rank optimized, high keyword density',
              icon: '🇰🇷',
            },
            {
              value: 'none',
              label: 'Basic',
              description: 'No SEO optimization',
              icon: '📝',
            },
          ].map((platform) => (
            <label
              key={platform.value}
              className={cn(
                'flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50',
                selectedPlatform === platform.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              )}
            >
              <input
                type="radio"
                value={platform.value}
                {...register('seoPlatform')}
                className="sr-only"
              />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{platform.icon}</span>
                <span className="font-semibold">{platform.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {platform.description}
              </span>
            </label>
          ))}
        </div>
        {errors.seoPlatform && (
          <p className="text-sm text-destructive">
            {errors.seoPlatform.message}
          </p>
        )}
      </div>

      {/* Topic Input */}
      <div className="space-y-2">
        <Label htmlFor="topic" className="text-base font-semibold">
          Blog Topic
        </Label>
        <Textarea
          id="topic"
          placeholder="Enter your blog topic... (e.g., 'SAT Math Problem Solving Strategies')"
          className="min-h-[100px] resize-none"
          {...register('topic')}
          disabled={isGenerating}
        />
        {errors.topic && (
          <p className="text-sm text-destructive">{errors.topic.message}</p>
        )}
      </div>

      {/* Content Length Selection */}
      <div className="space-y-3">
        <Label className="text-base font-semibold">Content Length</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              value: 'quick',
              label: 'Quick',
              words: '800-1000',
              time: '~5 min read',
              icon: '⚡',
            },
            {
              value: 'standard',
              label: 'Standard',
              words: '1200-1500',
              time: '~8 min read',
              icon: '📄',
            },
            {
              value: 'deep',
              label: 'Deep Dive',
              words: '1800-2500',
              time: '~12 min read',
              icon: '📚',
            },
          ].map((length) => (
            <label
              key={length.value}
              className={cn(
                'flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary/50',
                selectedLength === length.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border'
              )}
            >
              <input
                type="radio"
                value={length.value}
                {...register('desiredLength')}
                className="sr-only"
              />
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl">{length.icon}</span>
                <span className="font-semibold">{length.label}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {length.words} words
              </span>
              <span className="text-xs text-muted-foreground">
                {length.time}
              </span>
            </label>
          ))}
        </div>
        {errors.desiredLength && (
          <p className="text-sm text-destructive">
            {errors.desiredLength.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        className="w-full"
        disabled={isGenerating}
      >
        {isGenerating ? (
          <>
            <span className="animate-spin mr-2">⏳</span>
            Generating...
          </>
        ) : (
          <>
            Generate Blog Post
            <span className="ml-2">✨</span>
          </>
        )}
      </Button>
    </form>
  );
}
