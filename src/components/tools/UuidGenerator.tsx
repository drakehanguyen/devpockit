'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OutputDisplay } from '@/components/ui/OutputDisplay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    DEFAULT_UUID_OPTIONS,
    UUID_EXAMPLE_SETS,
    UUID_FORMATS,
    UUID_HYPHENS,
    UUID_NAMESPACE_OPTIONS,
    UUID_QUANTITY_LIMITS,
    UUID_VERSIONS
} from '@/config/uuid-generator-config';
import { cn } from '@/libs/utils';
import { generateUuids, getUuidStats, type UuidGenerationOptions } from '@/libs/uuid-generator';
import { ArrowPathIcon, ClipboardDocumentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface UuidGeneratorProps {
  className?: string;
}

export function UuidGenerator({ className }: UuidGeneratorProps) {
  const { toolState, updateToolState } = useToolState('uuid-generator');

  // Initialize with persistent state or defaults
  const [options, setOptions] = useState<UuidGenerationOptions>(
    (toolState?.options as UuidGenerationOptions) || DEFAULT_UUID_OPTIONS
  );
  const [output, setOutput] = useState<string>(toolState?.output || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>(toolState?.error || '');
  const [stats, setStats] = useState<{ count: number; totalLength: number; averageLength: number; uniqueCount: number; duplicates: number } | null>(
    (toolState?.stats as { count: number; totalLength: number; averageLength: number; uniqueCount: number; duplicates: number }) || null
  );
  const [copySuccess, setCopySuccess] = useState(false);

  // Update persistent state whenever local state changes
  useEffect(() => {
    updateToolState({
      options,
      output,
      error,
      stats: stats || undefined
    });
  }, [options, output, error, stats]);

  // Reset local state when tool state is cleared
  useEffect(() => {
    if (!toolState || Object.keys(toolState).length === 0) {
      setOptions(DEFAULT_UUID_OPTIONS);
      setOutput('');
      setError('');
      setStats(null);
    }
  }, [toolState]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'Enter':
            event.preventDefault();
            if (!isGenerating) {
              handleGenerate();
            }
            break;
          case 'k':
            event.preventDefault();
            handleClear();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isGenerating]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');

    try {
      // Validate options
      if (options.quantity < UUID_QUANTITY_LIMITS.min || options.quantity > UUID_QUANTITY_LIMITS.max) {
        setError(`Quantity must be between ${UUID_QUANTITY_LIMITS.min} and ${UUID_QUANTITY_LIMITS.max}`);
        return;
      }

      if (options.version === 'v5' && (!options.namespace || !options.name)) {
        setError('Namespace and name are required for v5 UUIDs');
        return;
      }

      // Simulate async operation for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      const result = generateUuids(options);
      setOutput(result.uuids.join('\n'));
      setStats(getUuidStats(result.uuids));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate UUIDs');
      setOutput('');
      setStats(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setOutput('');
    setError('');
    setStats(null);
    setCopySuccess(false);
  };

  const handleCopyToClipboard = async () => {
    if (!output) return;

    try {
      await navigator.clipboard.writeText(output);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleLoadExample = (version: 'v1' | 'v4' | 'v5' | 'v7') => {
    const examples = UUID_EXAMPLE_SETS[version];
    setOutput(examples.join('\n'));
    setStats(getUuidStats(examples));
    setError('');
  };

  const handleOptionChange = (key: keyof UuidGenerationOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Input Controls */}
      <Card>
        <CardHeader>
          <CardTitle>UUID Generator</CardTitle>
          <CardDescription>
            Generate UUIDs in different versions and formats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Version Selection */}
            <div className="space-y-2">
              <Label htmlFor="version">UUID Version</Label>
              <Select
                value={options.version}
                onValueChange={(value) => handleOptionChange('version', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  {UUID_VERSIONS.map((version) => (
                    <SelectItem key={version.value} value={version.value}>
                      {version.symbol} {version.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Format Toggle */}
            <div className="space-y-2">
              <Label>Format</Label>
              <div className="flex rounded-lg border p-1">
                {UUID_FORMATS.map((format) => (
                  <Button
                    key={format.value}
                    variant={options.format === format.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleOptionChange('format', format.value)}
                    className="flex-1"
                  >
                    {format.symbol} {format.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Hyphens Toggle */}
            <div className="space-y-2">
              <Label>Hyphens</Label>
              <div className="flex rounded-lg border p-1">
                {UUID_HYPHENS.map((hyphen) => (
                  <Button
                    key={hyphen.value}
                    variant={options.hyphens === hyphen.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleOptionChange('hyphens', hyphen.value)}
                    className="flex-1"
                  >
                    {hyphen.symbol} {hyphen.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Quantity Input */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOptionChange('quantity', Math.max(UUID_QUANTITY_LIMITS.min, options.quantity - 1))}
                  disabled={options.quantity <= UUID_QUANTITY_LIMITS.min}
                >
                  -
                </Button>
                <Input
                  id="quantity"
                  type="number"
                  min={UUID_QUANTITY_LIMITS.min}
                  max={UUID_QUANTITY_LIMITS.max}
                  value={options.quantity}
                  onChange={(e) => handleOptionChange('quantity', parseInt(e.target.value) || 1)}
                  className="text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOptionChange('quantity', Math.min(UUID_QUANTITY_LIMITS.max, options.quantity + 1))}
                  disabled={options.quantity >= UUID_QUANTITY_LIMITS.max}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Namespace (for v5) */}
            {options.version === 'v5' && (
              <div className="space-y-2">
                <Label htmlFor="namespace">Namespace</Label>
                <Select
                  value={options.namespace}
                  onValueChange={(value) => handleOptionChange('namespace', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select namespace" />
                  </SelectTrigger>
                  <SelectContent>
                    {UUID_NAMESPACE_OPTIONS.map((namespace) => (
                      <SelectItem key={namespace.value} value={namespace.value}>
                        {namespace.label} - {namespace.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Name (for v5) */}
            {options.version === 'v5' && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={options.name || ''}
                  onChange={(e) => handleOptionChange('name', e.target.value)}
                  placeholder="Enter name for v5 UUID"
                />
              </div>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive">
              <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2"
            >
              <ArrowPathIcon className={cn('h-4 w-4', isGenerating && 'animate-spin')} />
              {isGenerating ? 'Generating...' : 'Generate UUIDs'}
            </Button>

            <Button variant="outline" onClick={handleClear} disabled={isGenerating}>
              Clear Output
            </Button>

            {output && (
              <Button
                variant="outline"
                onClick={handleCopyToClipboard}
                disabled={isGenerating}
                className={cn(
                  'flex items-center gap-2',
                  copySuccess && 'bg-green-50 border-green-200 text-green-700'
                )}
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
                {copySuccess ? 'Copied!' : 'Copy All'}
              </Button>
            )}

            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLoadExample('v1')}
                disabled={isGenerating}
              >
                v1 Examples
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLoadExample('v4')}
                disabled={isGenerating}
              >
                v4 Examples
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLoadExample('v5')}
                disabled={isGenerating}
              >
                v5 Examples
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleLoadExample('v7')}
                disabled={isGenerating}
              >
                v7 Examples
              </Button>
            </div>
          </div>

          {/* Keyboard Shortcuts Help */}
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Keyboard shortcuts:</span> Ctrl+Enter to generate, Ctrl+K to clear
          </div>
        </CardContent>
      </Card>

      {/* Output Display */}
      <OutputDisplay
        title="Generated UUIDs"
        content={output}
        error={error}
        isLoading={isGenerating}
        format="plain"
        placeholder="Generated UUIDs will appear here..."
        showWordCount={false}
        showCharacterCount={true}
      />

      {/* Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowPathIcon className="h-4 w-4" />
              UUID Statistics
            </CardTitle>
            <CardDescription>
              Analysis of generated UUIDs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="font-medium text-muted-foreground">Count</div>
                <div className="text-2xl font-bold">{stats.count}</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="font-medium text-muted-foreground">Total Length</div>
                <div className="text-2xl font-bold">{stats.totalLength}</div>
                <div className="text-xs text-muted-foreground">characters</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="font-medium text-muted-foreground">Average Length</div>
                <div className="text-2xl font-bold">{Math.round(stats.averageLength)}</div>
                <div className="text-xs text-muted-foreground">chars per UUID</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="font-medium text-muted-foreground">Unique</div>
                <div className="text-2xl font-bold text-green-600">{stats.uniqueCount}</div>
                <div className="text-xs text-muted-foreground">distinct UUIDs</div>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <div className="font-medium text-muted-foreground">Duplicates</div>
                <div className={cn(
                  "text-2xl font-bold",
                  stats.duplicates > 0 ? "text-orange-600" : "text-green-600"
                )}>
                  {stats.duplicates}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.duplicates > 0 ? "duplicate UUIDs" : "no duplicates"}
                </div>
              </div>
            </div>

            {stats.duplicates > 0 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span className="font-medium">Warning: Duplicate UUIDs detected</span>
                </div>
                <p className="text-sm text-orange-600 mt-1">
                  This is extremely rare for v4 UUIDs. Consider regenerating.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
