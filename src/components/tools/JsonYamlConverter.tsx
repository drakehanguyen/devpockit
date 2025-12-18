'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { CodeInputPanel } from '@/components/ui/CodeInputPanel';
import { CodeOutputPanel } from '@/components/ui/CodeOutputPanel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DEFAULT_JSON_YAML_OPTIONS,
  JSON_YAML_EXAMPLES,
  JSON_YAML_FORMAT_OPTIONS,
  JSON_YAML_INDENT_OPTIONS,
  type JsonYamlOptions
} from '@/config/json-yaml-config';
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme';
import {
  convertFormat,
  getConversionStats,
  type JsonYamlConversionResult
} from '@/libs/json-yaml';
import { cn } from '@/libs/utils';
import { ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface JsonYamlConverterProps {
  className?: string;
}

export function JsonYamlConverter({ className }: JsonYamlConverterProps) {
  const { toolState, updateToolState } = useToolState('json-yaml-converter');

  // Initialize with defaults to avoid hydration mismatch
  const [options, setOptions] = useState<JsonYamlOptions>(DEFAULT_JSON_YAML_OPTIONS);
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState<{
    inputSize: number;
    outputSize: number;
    inputLines: number;
    outputLines: number;
    compressionRatio: number;
    format: string;
  } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Editor settings
  const [theme] = useCodeEditorTheme('basicDark');
  const [inputWrapText, setInputWrapText] = useState(true);
  const [outputWrapText, setOutputWrapText] = useState(true);

  // Hydrate state from toolState after mount (client-side only)
  useEffect(() => {
    setIsHydrated(true);
    if (toolState) {
      if (toolState.options) setOptions(toolState.options as JsonYamlOptions);
      if (toolState.input) setInput(toolState.input as string);
      if (toolState.output) setOutput(toolState.output as string);
      if (toolState.error) setError(toolState.error as string);
      if (toolState.stats) setStats(toolState.stats as typeof stats);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update persistent state whenever local state changes
  useEffect(() => {
    if (isHydrated) {
      updateToolState({
        options,
        input,
        output,
        error,
        stats: stats || undefined
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, input, output, error, stats, isHydrated]);

  // Reset local state when tool state is cleared
  useEffect(() => {
    if (isHydrated && (!toolState || Object.keys(toolState).length === 0)) {
      setOptions(DEFAULT_JSON_YAML_OPTIONS);
      setInput('');
      setOutput('');
      setError('');
      setStats(null);
    }
  }, [toolState, isHydrated]);

  const handleConvert = async () => {
    if (!input.trim()) {
      setError('Please enter JSON or YAML content to convert');
      setOutput('');
      setStats(null);
      return;
    }

    setIsConverting(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      let result: JsonYamlConversionResult;

      if (options.autoDetect) {
        result = convertFormat(input, options.outputFormat);
      } else {
        if (options.outputFormat === 'yaml') {
          const { jsonToYaml } = await import('@/libs/json-yaml');
          result = jsonToYaml(input);
        } else {
          const { yamlToJson } = await import('@/libs/json-yaml');
          result = yamlToJson(input);
        }
      }

      if (result.success) {
        setOutput(result.output);
        setStats(getConversionStats(input, result.output, result.format));
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

  const handleLoadExample = (example: { json: string; yaml: string }) => {
    const exampleInput = options.outputFormat === 'yaml' ? example.json : example.yaml;
    setInput(exampleInput);
    setError('');
    setOutput('');
    setStats(null);
  };

  const getCharacterCount = (text: string): number => {
    return text.length;
  };

  const getLineCount = (text: string): number => {
    if (!text) return 0;
    return text.split('\n').length;
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header Section */}
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="text-[32px] font-normal leading-6 tracking-normal text-neutral-900 dark:text-neutral-100 mb-3">
          JSON ↔ YAML Converter
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Convert between JSON and YAML formats with validation and formatting
        </p>
      </div>

      {/* Body Section */}
      <div className="flex-1 bg-background px-[24px] pt-6 pb-10">
        <div className="flex flex-col gap-4">
          {/* Controls */}
          <div className="flex flex-col gap-4">
            {/* Main Controls Row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Output Format Select */}
              <Select
                value={options.outputFormat}
                onValueChange={(value: 'json' | 'yaml') =>
                  setOptions(prev => ({ ...prev, outputFormat: value }))
                }
              >
                <SelectTrigger label="Output Format:">
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

              {/* Indent Size */}
              <Select
                value={options.indentSize.toString()}
                onValueChange={(value) =>
                  setOptions(prev => ({ ...prev, indentSize: parseInt(value) }))
                }
              >
                <SelectTrigger label="Indent Size:">
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

              {/* Auto Detect */}
              <Select
                value={options.autoDetect ? 'true' : 'false'}
                onValueChange={(value) =>
                  setOptions(prev => ({ ...prev, autoDetect: value === 'true' }))
                }
              >
                <SelectTrigger label="Auto Detect:">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Yes</SelectItem>
                  <SelectItem value="false">No</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Side-by-side Editor Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input Panel */}
            <CodeInputPanel
              title="Input (JSON/YAML)"
              value={input}
              onChange={setInput}
              language={options.outputFormat === 'yaml' ? 'json' : 'yaml'}
              height="500px"
              theme={theme}
              wrapText={inputWrapText}
              onWrapTextChange={setInputWrapText}
              showCopyButton={false}
              showClearButton={true}
              headerActions={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs"
                    >
                      Load Examples
                      <ChevronDownIcon className="h-3 w-3 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                    {JSON_YAML_EXAMPLES.map((example, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => handleLoadExample(example)}
                      >
                        {example.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              }
              footerLeftContent={
                <span>{getCharacterCount(input)} characters</span>
              }
              footerRightContent={
                <Button
                  onClick={handleConvert}
                  disabled={!input.trim() || isConverting}
                  variant="default"
                  size="sm"
                  className="h-8 px-4"
                >
                  {isConverting ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                      Converting...
                    </>
                  ) : (
                    'Convert'
                  )}
                </Button>
              }
            />

            {/* Output Panel */}
            <CodeOutputPanel
              title={`Output (${options.outputFormat.toUpperCase()})`}
              value={output}
              language={options.outputFormat === 'json' ? 'json' : 'yaml'}
              height="500px"
              theme={theme}
              wrapText={outputWrapText}
              onWrapTextChange={setOutputWrapText}
              footerLeftContent={
                output && (
                  <>
                    <span>{getCharacterCount(output)} characters</span>
                    <span>{getLineCount(output)} lines</span>
                  </>
                )
              }
            />
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
