'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { OutputDisplay } from '@/components/ui/OutputDisplay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DEFAULT_XML_OPTIONS, XML_EXAMPLES, XML_FORMAT_OPTIONS } from '@/config/xml-formatter-config';
import { cn } from '@/libs/utils';
import { formatXml, getXmlStats, type XmlFormatOptions, type XmlFormatResult } from '@/libs/xml-formatter';
import { ArrowPathIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface XmlFormatterProps {
  className?: string;
}

export function XmlFormatter({ className }: XmlFormatterProps) {
  const { toolState, updateToolState } = useToolState('xml-formatter');

  // Initialize with persistent state or defaults
  const [options, setOptions] = useState<XmlFormatOptions>(
    (toolState?.options as XmlFormatOptions) || DEFAULT_XML_OPTIONS
  );
  const [input, setInput] = useState<string>(toolState?.input || '');
  const [output, setOutput] = useState<string>(toolState?.output || '');
  const [isFormatting, setIsFormatting] = useState(false);
  const [error, setError] = useState<string>(toolState?.error || '');
  const [stats, setStats] = useState<{ size: number; lines: number; depth: number; tags: number; attributes: number } | null>(
    (toolState?.stats as { size: number; lines: number; depth: number; tags: number; attributes: number }) || null
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
      setOptions(DEFAULT_XML_OPTIONS);
      setInput('');
      setOutput('');
      setError('');
      setStats(null);
    }
  }, [toolState]);

  const handleFormat = async () => {
    if (!input.trim()) {
      setError('Please enter XML to format');
      return;
    }

    setIsFormatting(true);
    setError('');

    try {
      // Simulate async operation for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      const result: XmlFormatResult = formatXml(input, options);

      if (result.isValid) {
        setOutput(result.formatted);
        setStats(getXmlStats(result.formatted));
      } else {
        setError(result.error || 'Invalid XML');
        setOutput('');
        setStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to format XML');
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
    setInput(XML_EXAMPLES[example]);
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
            <span className="text-2xl">{'< >'}</span>
            <span>XML Formatter</span>
          </CardTitle>
          <p className="text-muted-foreground">
            Format, minify, and validate XML with syntax highlighting and statistics
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
                  {XML_FORMAT_OPTIONS.formats.map((format) => (
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
                    {XML_FORMAT_OPTIONS.indentSizes.map((indent) => (
                      <SelectItem key={indent.value} value={indent.value.toString()}>
                        {indent.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Preserve Whitespace */}
            <div className="space-y-2">
              <Label htmlFor="whitespace-select">Whitespace</Label>
              <Select
                value={options.preserveWhitespace.toString()}
                onValueChange={(value) =>
                  setOptions(prev => ({ ...prev, preserveWhitespace: value === 'true' }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {XML_FORMAT_OPTIONS.preserveWhitespace.map((whitespace) => (
                    <SelectItem key={whitespace.value.toString()} value={whitespace.value.toString()}>
                      {whitespace.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Self-Closing Tags */}
            <div className="space-y-2">
              <Label htmlFor="selfclosing-select">Self-Closing Tags</Label>
              <Select
                value={options.selfClosingTags}
                onValueChange={(value: 'auto' | 'always' | 'never') =>
                  setOptions(prev => ({ ...prev, selfClosingTags: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {XML_FORMAT_OPTIONS.selfClosingTags.map((selfClosing) => (
                    <SelectItem key={selfClosing.value} value={selfClosing.value}>
                      {selfClosing.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              <Label htmlFor="xml-input">XML Input</Label>
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
              id="xml-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your XML here..."
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
                  <span>Format XML</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Output Display */}
      <OutputDisplay
        title="Formatted XML"
        content={output}
        error={error}
        isLoading={isFormatting}
        format="plain"
        placeholder="Formatted XML will appear here..."
        showWordCount={false}
        showCharacterCount={true}
      />

      {/* Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">XML Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                <div className="text-2xl font-bold text-primary">{stats.tags}</div>
                <div className="text-sm text-muted-foreground">Tags</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{stats.attributes}</div>
                <div className="text-sm text-muted-foreground">Attributes</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
