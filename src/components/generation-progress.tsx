'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface GenerationProgressProps {
  className?: string;
}

export function GenerationProgress({ className }: GenerationProgressProps) {
  const [progress, setProgress] = React.useState(0);
  const [status, setStatus] = React.useState('Initializing...');

  React.useEffect(() => {
    // Simulated progress updates (MVP approach)
    const stages = [
      { progress: 0, status: 'Initializing...', delay: 0 },
      { progress: 20, status: 'Gathering context...', delay: 500 },
      { progress: 40, status: 'Loading SAT materials...', delay: 2000 },
      { progress: 60, status: 'Searching the web...', delay: 4000 },
      { progress: 80, status: 'Generating content...', delay: 8000 },
      { progress: 95, status: 'Finalizing...', delay: 15000 },
    ];

    stages.forEach(({ progress, status, delay }) => {
      setTimeout(() => {
        setProgress(progress);
        setStatus(status);
      }, delay);
    });

    return () => {
      // Cleanup timeouts if component unmounts
      setProgress(0);
      setStatus('Initializing...');
    };
  }, []);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Status Message */}
      <div className="text-center">
        <p className="text-lg font-medium text-foreground mb-1">{status}</p>
        <p className="text-sm text-muted-foreground">
          {progress}% complete
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
          style={{ width: `${progress}%` }}
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
        </div>
      </div>

      {/* Loading Animation */}
      <div className="flex justify-center items-center gap-2 pt-2">
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
      </div>

      {/* Helpful Tips */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold">💡 Tip:</span> This process typically
          takes 20-40 seconds depending on content length and platform
          complexity.
        </p>
      </div>
    </div>
  );
}
