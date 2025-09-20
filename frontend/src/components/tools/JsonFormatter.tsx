'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { OutputDisplay } from '@/components/ui/OutputDisplay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_JSON_OPTIONS, JSON_EXAMPLES, JSON_FORMAT_OPTIONS } from '@/config/json-formatter-config';
import { formatJson, getJsonStats, type JsonFormatOptions, type JsonFormatResult } from '@/lib/json-formatter';
import { cn } from '@/lib/utils';
import { ArrowPathIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface JsonFormatterProps {
  className?: string;
}

export function JsonFormatter({ className }: JsonFormatterProps) {
  const { toolState, updateToolState } = useToolState('json-formatter');

  // Initialize with persistent state or defaults
  const [options, setOptions] = useState<JsonFormatOptions>(
    (toolState?.options as JsonFormatOptions) || DEFAULT_JSON_OPTIONS
  );
  const [input, setInput] = useState<string>(toolState?.input || '');
  const [output, setOutput] = useState<string>(toolState?.output || '');
  const [isFormatting, setIsFormatting] = useState(false);
  const [error, setError] = useState<string>(toolState?.error || '');
  const [stats, setStats] = useState<{ size: number; lines: number; depth: number; keys: number } | null>(
    (toolState?.stats as { size: number; lines: number; depth: number; keys: number }) || null
  );

  // Update persistent state whenever local state changes
  useEffect(() => {
    updateToolState({
      options,
      input,
      output,
      error,
      stats: stats || undefined
    });
  }, [options, input, output, error, stats]);

  // Reset local state when tool state is cleared
  useEffect(() => {
    if (!toolState || Object.keys(toolState).length === 0) {
      setOptions(DEFAULT_JSON_OPTIONS);
      setInput('');
      setOutput('');
      setError('');
      setStats(null);
    }
  }, [toolState]);

  const handleFormat = async () => {
    if (!input.trim()) {
      setError('Please enter JSON to format');
      return;
    }

    setIsFormatting(true);
    setError('');

    try {
      // Simulate async operation for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      const result: JsonFormatResult = formatJson(input, options);

      if (result.isValid) {
        setOutput(result.formatted);
        setStats(getJsonStats(result.formatted));
      } else {
        setError(result.error || 'Invalid JSON');
        setOutput('');
        setStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to format JSON');
      setOutput('');
      setStats(null);
    } finally {
      setIsFormatting(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setStats(null);
  };

  const handleLoadExample = (example: 'valid' | 'invalid' | 'minified') => {
    setInput(JSON_EXAMPLES[example]);
    setOutput('');
    setError('');
    setStats(null);
  };

  const handleCopyInput = async () => {
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input);
    } catch (err) {
      console.error('Failed to copy input:', err);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span className="text-2xl">{'{ }'}</span>
            <span>JSON Formatter</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Format, minify, and validate JSON with syntax highlighting and statistics
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label htmlFor="format-select">Format Type</Label>
              <Select
                value={options.format}
                onValueChange={(value: 'beautify' | 'minify') =>
                  setOptions(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JSON_FORMAT_OPTIONS.formats.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Indent Size (only for beautify) */}
            {options.format === 'beautify' && (
              <div className="space-y-2">
                <Label htmlFor="indent-select">Indent Size</Label>
                <Select
                  value={options.indentSize.toString()}
                  onValueChange={(value) =>
                    setOptions(prev => ({ ...prev, indentSize: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JSON_FORMAT_OPTIONS.indentSizes.map((indent) => (
                      <SelectItem key={indent.value} value={indent.value.toString()}>
                        {indent.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Sort Keys (only for beautify) */}
            {options.format === 'beautify' && (
              <div className="space-y-2">
                <Label htmlFor="sort-select">Key Sorting</Label>
                <Select
                  value={options.sortKeys.toString()}
                  onValueChange={(value) =>
                    setOptions(prev => ({ ...prev, sortKeys: value === 'true' }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JSON_FORMAT_OPTIONS.sortKeys.map((sort) => (
                      <SelectItem key={sort.value.toString()} value={sort.value.toString()}>
                        {sort.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Example Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLoadExample('valid')}
            >
              Load Valid Example
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLoadExample('minified')}
            >
              Load Minified Example
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleLoadExample('invalid')}
            >
              Load Invalid Example
            </Button>
          </div>

          {/* Input Area */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="json-input">JSON Input</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyInput}
                  disabled={!input}
                >
                  <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              </div>
            </div>
            <Textarea
              id="json-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your JSON here..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleFormat}
              disabled={!input.trim() || isFormatting}
              className="flex items-center space-x-2"
            >
              {isFormatting ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  <span>Formatting...</span>
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-4 w-4" />
                  <span>Format JSON</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Output Display */}
      <OutputDisplay
        title="Formatted JSON"
        content={output}
        error={error}
        isLoading={isFormatting}
        format="plain"
        placeholder="Formatted JSON will appear here..."
        showWordCount={false}
        showCharacterCount={true}
      />

      {/* Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">JSON Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.size}</div>
                <div className="text-sm text-muted-foreground">Characters</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.lines}</div>
                <div className="text-sm text-muted-foreground">Lines</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.depth}</div>
                <div className="text-sm text-muted-foreground">Max Depth</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.keys}</div>
                <div className="text-sm text-muted-foreground">Total Keys</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
