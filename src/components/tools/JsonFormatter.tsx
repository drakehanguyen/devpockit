'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { EditorPanel, type EditorPanelTab } from '@/components/ui/EditorPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DEFAULT_JSON_OPTIONS, JSON_FORMAT_OPTIONS } from '@/config/json-formatter-config';
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme';
import { formatJson, getJsonStats, type JsonFormatOptions, type JsonFormatResult } from '@/libs/json-formatter';
import { cn } from '@/libs/utils';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState } from 'react';

interface JsonFormatterProps {
  className?: string;
}

export function JsonFormatter({ className }: JsonFormatterProps) {
  const { toolState, updateToolState } = useToolState('json-formatter');

  // Initialize with defaults to avoid hydration mismatch
  const [options, setOptions] = useState<JsonFormatOptions>(DEFAULT_JSON_OPTIONS);
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isFormatting, setIsFormatting] = useState(false);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState<{ size: number; lines: number; depth: number; keys: number } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<'input' | 'output'>('input');

  // Editor settings
  const [theme] = useCodeEditorTheme('basicDark');
  const [wrapText, setWrapText] = useState(true);

  // Hydrate state from toolState after mount (client-side only)
  useEffect(() => {
    setIsHydrated(true);
    if (toolState) {
      if (toolState.options) setOptions(toolState.options as JsonFormatOptions);
      if (toolState.input) setInput(toolState.input as string);
      if (toolState.output) setOutput(toolState.output as string);
      if (toolState.error) setError(toolState.error as string);
      if (toolState.stats) setStats(toolState.stats as { size: number; lines: number; depth: number; keys: number });
      if (toolState.activeTab) setActiveTab(toolState.activeTab as 'input' | 'output');
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
        stats: stats || undefined,
        activeTab
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, input, output, error, stats, activeTab, isHydrated]);

  // Reset local state when tool state is cleared
  useEffect(() => {
    if (isHydrated && (!toolState || Object.keys(toolState).length === 0)) {
      setOptions(DEFAULT_JSON_OPTIONS);
      setInput('');
      setOutput('');
      setError('');
      setStats(null);
      setActiveTab('input');
    }
  }, [toolState, isHydrated]);

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
        // Switch to output tab after successful formatting
        setActiveTab('output');
      } else {
        setError(result.error || 'Invalid JSON');
        setOutput('');
        setStats(null);
        // Switch to output tab to show error
        setActiveTab('output');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to format JSON');
      setOutput('');
      setStats(null);
    } finally {
      setIsFormatting(false);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId as 'input' | 'output');
  };

  const handleContentChange = (content: string, tabId: string) => {
    if (tabId === 'input') {
      setInput(content);
    }
  };

  const handleCopy = (content: string, tabId: string) => {
    // Copy is handled by EditorPanel
  };

  // Prepare tabs for EditorPanel
  const editorTabs: EditorPanelTab[] = useMemo(
    () => [
      {
        id: 'input',
        label: 'Input',
        content: input,
        language: 'json',
        editable: true,
      },
      {
        id: 'output',
        label: 'Output',
        content: output,
        language: 'json',
        editable: false,
      },
    ],
    [input, output]
  );


  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header Section */}
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="text-[32px] font-normal leading-6 tracking-normal text-neutral-900 dark:text-neutral-100 mb-3">
          JSON Formatter
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Format, minify, and validate JSON with syntax highlighting and statistics
        </p>
      </div>

      {/* Body Section */}
      <div className="flex-1 bg-background px-[24px] pt-6 pb-10">
        <div className="flex flex-col gap-4">
          {/* Controls */}
          <div className="flex flex-col gap-4">
            {/* Main Controls Row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Format Type Select */}
              <Select
                value={options.format}
                onValueChange={(value: 'beautify' | 'minify') =>
                  setOptions(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger label="Format Type:">
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

              {/* Indent Size (only for beautify) */}
              {options.format === 'beautify' && (
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
                    {JSON_FORMAT_OPTIONS.indentSizes.map((indent) => (
                      <SelectItem key={indent.value} value={indent.value.toString()}>
                        {indent.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Sort Keys (only for beautify) */}
              {options.format === 'beautify' && (
                <Select
                  value={options.sortKeys.toString()}
                  onValueChange={(value) =>
                    setOptions(prev => ({ ...prev, sortKeys: value === 'true' }))
                  }
                >
                  <SelectTrigger label="Key Sorting:">
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
              )}

              {/* Format Button */}
              <Button
                onClick={handleFormat}
                disabled={!input.trim() || isFormatting}
                variant="default"
                size="default"
              >
                {isFormatting ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    Formatting...
                  </>
                ) : (
                  'Format'
                )}
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
          )}

          {/* Editor Panel */}
          <EditorPanel
            tabs={editorTabs}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onContentChange={handleContentChange}
            onCopy={handleCopy}
            showStats={false}
            height="374px"
            theme={theme}
            wrapText={wrapText}
            onWrapTextChange={setWrapText}
            showWrapTextToggle={true}
          />

          {/* Custom Statistics for Output Tab */}
          {activeTab === 'output' && stats && (
            <div className="px-2 py-2 text-sm text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-[10px]">
              <div className="flex items-center gap-4">
                <span>{output.length} characters</span>
                <span>{output ? output.split('\n').length : 0} lines</span>
                <span>{stats.depth} max depth</span>
                <span>{stats.keys} keys</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
