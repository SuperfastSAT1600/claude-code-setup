'use client';

import { useState } from 'react';
import type { BlogFormData } from '@/lib/validation';
import type { GeneratedContent } from '@blog-agent/types';

interface UseBlogGenerationReturn {
  generate: (data: BlogFormData) => Promise<void>;
  regenerate: () => Promise<void>;
  isGenerating: boolean;
  result: GeneratedContent | null;
  error: string | null;
  reset: () => void;
  canRegenerate: boolean;
}

export function useBlogGeneration(): UseBlogGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastRequest, setLastRequest] = useState<BlogFormData | null>(null);

  const generate = async (data: BlogFormData) => {
    setIsGenerating(true);
    setError(null);
    setResult(null);
    setLastRequest(data); // Store for regeneration

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.error || 'Failed to generate blog post');
      }

      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerate = async () => {
    if (lastRequest) {
      await generate(lastRequest);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setIsGenerating(false);
  };

  return {
    generate,
    regenerate,
    isGenerating,
    result,
    error,
    reset,
    canRegenerate: lastRequest !== null,
  };
}
