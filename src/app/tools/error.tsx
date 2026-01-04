'use client';

import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect } from 'react';

interface ToolsErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ToolsError({ error, reset }: ToolsErrorProps) {
  useEffect(() => {
    console.error('Tools error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-full min-h-[400px] p-4">
      <div className="w-full max-w-md space-y-4 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-3 dark:bg-destructive/20">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Failed to load tools</h2>
          <p className="text-sm text-muted-foreground">
            An error occurred while loading the tools. Please try again.
          </p>
        </div>

        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-left">
            <p className="text-xs font-medium text-destructive">Error:</p>
            <p className="mt-1 text-xs text-muted-foreground font-mono break-all">
              {error.message}
            </p>
          </div>
        )}

        <Button onClick={reset} variant="default" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try again
        </Button>
      </div>
    </div>
  );
}

