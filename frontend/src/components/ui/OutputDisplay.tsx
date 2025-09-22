/**
 * Reusable Output Display Component
 * Professional display for generated content with copy functionality
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/libs/utils';
import { CheckIcon, ClipboardDocumentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface OutputDisplayProps {
  title?: string;
  content: string;
  placeholder?: string;
  error?: string;
  isLoading?: boolean;
  className?: string;
  showWordCount?: boolean;
  showCharacterCount?: boolean;
  format?: 'plain' | 'html';
  onCopy?: (content: string) => void;
}

export function OutputDisplay({
  title = 'Output',
  content,
  placeholder = 'Generated content will appear here...',
  error,
  isLoading = false,
  className,
  showWordCount = true,
  showCharacterCount = true,
  format = 'plain',
  onCopy
}: OutputDisplayProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = async () => {
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      onCopy?.(content);

      // Reset success state after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharacterCount = (text: string): number => {
    return text.length;
  };

  const hasContent = content && content.trim().length > 0;

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">{title}</CardTitle>
          {hasContent && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="h-8 px-3 text-xs"
            >
              {copySuccess ? (
                <>
                  <CheckIcon className="h-3 w-3 mr-1" />
                  Copied!
                </>
              ) : (
                <>
                  <ClipboardDocumentIcon className="h-3 w-3 mr-1" />
                  Copy
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {error ? (
          <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 flex-shrink-0" />
            <div className="text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-muted-foreground border-t-transparent"></div>
              <span className="text-sm">Generating content...</span>
            </div>
          </div>
        ) : hasContent ? (
          <div className="space-y-3">
            {/* Content Display */}
            <div className="relative">
              <pre className="whitespace-pre-wrap break-words font-mono text-sm p-4 bg-muted/30 rounded-lg border min-h-[300px] max-h-[600px] overflow-auto custom-scrollbar">
                {content}
              </pre>
            </div>

            {/* Statistics */}
            {(showWordCount || showCharacterCount) && (
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <div className="flex items-center space-x-4">
                  {showWordCount && (
                    <span>
                      <span className="font-medium">{getWordCount(content)}</span> words
                    </span>
                  )}
                  {showCharacterCount && (
                    <span>
                      <span className="font-medium">{getCharacterCount(content)}</span> characters
                    </span>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {format === 'html' ? 'HTML format' : 'Plain text'}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center p-8 text-muted-foreground">
            <div className="text-center">
              <div className="text-4xl mb-2">📄</div>
              <div className="text-sm">{placeholder}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
