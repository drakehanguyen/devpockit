'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { OutputDisplay } from '@/components/ui/OutputDisplay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
    DEFAULT_JSON_YAML_OPTIONS,
    JSON_YAML_CATEGORIES,
    JSON_YAML_EXAMPLES,
    JSON_YAML_FORMAT_OPTIONS,
    JSON_YAML_INDENT_OPTIONS
} from '@/config/json-yaml-config';
import {
    convertFormat,
    getConversionStats,
    type JsonYamlConversionResult,
    type JsonYamlOptions
} from '@/libs/json-yaml';
import { cn } from '@/libs/utils';
import { ArrowPathIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface JsonYamlConverterProps {
  className?: string;
}

export function JsonYamlConverter({ className }: JsonYamlConverterProps) {
  const { toolState, updateToolState } = useToolState('json-yaml-converter');

  // Initialize with persistent state or defaults
  const [options, setOptions] = useState<JsonYamlOptions>(
    (toolState?.options as JsonYamlOptions) || DEFAULT_JSON_YAML_OPTIONS
  );
  const [output, setOutput] = useState<string>(toolState?.output || '');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string>(toolState?.error || '');
  const [stats, setStats] = useState<{
    inputSize: number;
    outputSize: number;
    inputLines: number;
    outputLines: number;
    compressionRatio: number;
    format: string;
  } | null>(
    (toolState?.stats as { inputSize: number; outputSize: number; inputLines: number; outputLines: number; compressionRatio: number; format: string }) || null
  );

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
      setOptions(DEFAULT_JSON_YAML_OPTIONS);
      setOutput('');
      setError('');
      setStats(null);
    }
  }, [toolState]);

  const handleConvert = async () => {
    if (!options.input.trim()) {
      setError('Please enter JSON or YAML content to convert');
      setOutput('');
      setStats(null);
      return;
    }

    setIsConverting(true);
    setError('');

    try {
      let result: JsonYamlConversionResult;

      if (options.autoDetect) {
        // Auto-detect format and convert
        result = convertFormat(options.input, options.outputFormat);
      } else {
        // Manual conversion based on selected format
        if (options.outputFormat === 'yaml') {
          const { jsonToYaml } = await import('@/libs/json-yaml');
          result = jsonToYaml(options.input);
        } else {
          const { yamlToJson } = await import('@/libs/json-yaml');
          result = yamlToJson(options.input);
        }
      }

      if (result.success) {
        setOutput(result.output);
        setStats(getConversionStats(options.input, result.output, result.format));
      } else {
        setError(result.error || 'Conversion failed');
        setOutput('');
        setStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setOutput('');
      setStats(null);
    } finally {
      setIsConverting(false);
    }
  };

  const handleFormat = async () => {
    if (!options.input.trim()) {
      setError('Please enter content to format');
      setOutput('');
      setStats(null);
      return;
    }

    setIsConverting(true);
    setError('');

    try {
      const { formatContent } = await import('@/libs/json-yaml');
      const result = formatContent(options.input, options.outputFormat);

      if (result.success) {
        setOutput(result.output);
        setStats(getConversionStats(options.input, result.output, result.format));
      } else {
        setError(result.error || 'Formatting failed');
        setOutput('');
        setStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Formatting failed');
      setOutput('');
      setStats(null);
    } finally {
      setIsConverting(false);
    }
  };

  const handleExampleSelect = (example: { json: string; yaml: string }) => {
    const input = options.outputFormat === 'json' ? example.json : example.yaml;
    setOptions(prev => ({ ...prev, input }));
    setError('');
    setOutput('');
    setStats(null);
  };

  const handleClear = () => {
    setOptions(DEFAULT_JSON_YAML_OPTIONS);
    setOutput('');
    setError('');
    setStats(null);
  };

  const handleAutoDetect = () => {
    const { detectFormat } = require('@/lib/json-yaml');
    const detectedFormat = detectFormat(options.input);

    if (detectedFormat === 'json') {
      setOptions(prev => ({ ...prev, outputFormat: 'yaml' }));
    } else if (detectedFormat === 'yaml') {
      setOptions(prev => ({ ...prev, outputFormat: 'json' }));
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header and Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CodeBracketIcon className="h-5 w-5" />
            JSON ↔ YAML Converter
          </CardTitle>
          <CardDescription>
            Convert between JSON and YAML formats with validation and formatting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Textarea */}
          <div className="space-y-2">
            <Label htmlFor="input-content">Content</Label>
            <Textarea
              id="input-content"
              placeholder="Enter JSON or YAML content here..."
              value={options.input}
              onChange={(e) => setOptions(prev => ({ ...prev, input: e.target.value }))}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="output-format">Output Format</Label>
              <Select
                value={options.outputFormat}
                onValueChange={(value: 'json' | 'yaml') => setOptions(prev => ({ ...prev, outputFormat: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JSON_YAML_FORMAT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="indent-size">Indent Size</Label>
              <Select
                value={options.indentSize.toString()}
                onValueChange={(value) => setOptions(prev => ({ ...prev, indentSize: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JSON_YAML_INDENT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auto-detect">Auto Detect</Label>
              <Select
                value={options.autoDetect ? 'true' : 'false'}
                onValueChange={(value) => setOptions(prev => ({ ...prev, autoDetect: value === 'true' }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleConvert} disabled={isConverting || !options.input.trim()}>
              {isConverting ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                'Convert'
              )}
            </Button>
            <Button variant="outline" onClick={handleFormat} disabled={isConverting || !options.input.trim()}>
              Format
            </Button>
            <Button variant="outline" onClick={handleAutoDetect} disabled={!options.input.trim()}>
              Auto Detect
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Examples Section */}
      <Card>
        <CardHeader>
          <CardTitle>Example Content</CardTitle>
          <CardDescription>
            Click on any example to load it into the input field
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {JSON_YAML_CATEGORIES.map((category) => (
              <div key={category.name} className="space-y-2">
                <h4 className="font-medium text-sm text-muted-foreground">
                  {category.icon} {category.name}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {JSON_YAML_EXAMPLES
                    .filter(example => example.category === category.name)
                    .map((example, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto p-3 text-left justify-start"
                        onClick={() => handleExampleSelect(example)}
                      >
                        <div className="space-y-1">
                          <div className="font-medium text-sm">{example.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {example.description}
                          </div>
                        </div>
                      </Button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Output Section */}
      <OutputDisplay
        content={output}
        error={error}
        isLoading={isConverting}
        stats={stats ? {
          'Input Size': `${stats.inputSize} chars`,
          'Output Size': `${stats.outputSize} chars`,
          'Input Lines': stats.inputLines.toString(),
          'Output Lines': stats.outputLines.toString(),
          'Compression': `${(stats.compressionRatio * 100).toFixed(1)}%`,
          'Format': stats.format.toUpperCase()
        } : undefined}
        placeholder="Enter JSON or YAML content and click Convert to see the converted output..."
      />
    </div>
  );
}
