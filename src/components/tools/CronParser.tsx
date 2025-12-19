'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { CodeOutputPanel } from '@/components/ui/CodeOutputPanel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LabeledInput } from '@/components/ui/labeled-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  CRON_EXAMPLES,
  DEFAULT_CRON_OPTIONS
} from '@/config/cron-parser-config';
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme';
import { parseCronExpression, type CronParseResult } from '@/libs/cron-parser';
import { cn } from '@/libs/utils';
import { ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface CronParserProps {
  className?: string;
}

export function CronParser({ className }: CronParserProps) {
  const { toolState, updateToolState } = useToolState('cron-parser');

  // Initialize with defaults to avoid hydration mismatch
  const [options, setOptions] = useState(DEFAULT_CRON_OPTIONS);
  const [output, setOutput] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState<{
    isValid: boolean;
    nextRunCount: number;
    humanReadable: string;
  } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Editor settings
  const [theme] = useCodeEditorTheme('basicDark');
  const [wrapText, setWrapText] = useState(true);

  // Hydrate state from toolState after mount (client-side only)
  useEffect(() => {
    setIsHydrated(true);
    if (toolState) {
      if (toolState.options) setOptions(toolState.options as typeof DEFAULT_CRON_OPTIONS);
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
        output,
        error,
        stats: stats || undefined
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, output, error, stats, isHydrated]);

  // Reset local state when tool state is cleared
  useEffect(() => {
    if (isHydrated && (!toolState || Object.keys(toolState).length === 0)) {
      setOptions(DEFAULT_CRON_OPTIONS);
      setOutput('');
      setError('');
      setStats(null);
    }
  }, [toolState, isHydrated]);

  const handleParse = async () => {
    if (!options.expression.trim()) {
      setError('Please enter a cron expression');
      setOutput('');
      setStats(null);
      return;
    }

    setIsParsing(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const result: CronParseResult = parseCronExpression(options.expression, options.nextRunCount);

      if (result.isValid) {
        let outputText = `📅 Human Readable:\n${result.humanReadable}\n\n`;

        if (options.showNextRuns && result.nextRuns.length > 0) {
          outputText += `⏰ Next ${result.nextRuns.length} Execution Times:\n`;
          result.nextRuns.forEach((run, index) => {
            const date = new Date(run);
            const formatted = date.toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              timeZoneName: 'short'
            });
            outputText += `${index + 1}. ${formatted}\n`;
          });
        }

        setOutput(outputText);
        setStats({
          isValid: true,
          nextRunCount: result.nextRuns.length,
          humanReadable: result.humanReadable
        });
      } else {
        setError(result.error || 'Invalid cron expression');
        setOutput('');
        setStats({
          isValid: false,
          nextRunCount: 0,
          humanReadable: ''
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse cron expression');
      setOutput('');
      setStats(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleLoadExample = (expression: string) => {
    setOptions(prev => ({ ...prev, expression }));
    setError('');
    setOutput('');
    setStats(null);
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
          Cron Expression Parser
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Parse and validate cron expressions with human-readable descriptions and next execution times
        </p>
      </div>

      {/* Body Section */}
      <div className="flex-1 bg-background px-[24px] pt-6 pb-10">
        <div className="flex flex-col gap-4">
          {/* Controls */}
          <div className="flex flex-col gap-4">
            {/* Expression Input Row */}
            <div className="flex items-center gap-3">
              <LabeledInput
                label="Expression:"
                value={options.expression}
                onChange={(value) => setOptions(prev => ({ ...prev, expression: value }))}
                placeholder="e.g., 0 9 * * *"
                containerClassName="flex-1"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-3 text-xs"
                  >
                    Load Examples
                    <ChevronDownIcon className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto">
                  {CRON_EXAMPLES.map((example, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => handleLoadExample(example.expression)}
                    >
                      <div className="flex flex-col">
                        <span>{example.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">{example.expression}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Options Row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Next Runs Configuration */}
              <Select
                value={options.showNextRuns ? options.nextRunCount.toString() : 'none'}
                onValueChange={(value) => {
                  if (value === 'none') {
                    setOptions(prev => ({ ...prev, showNextRuns: false }));
                  } else {
                    setOptions(prev => ({
                      ...prev,
                      showNextRuns: true,
                      nextRunCount: parseInt(value)
                    }));
                  }
                }}
              >
                <SelectTrigger label="Next Runs:" className="min-w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="3">3 runs</SelectItem>
                  <SelectItem value="5">5 runs</SelectItem>
                  <SelectItem value="10">10 runs</SelectItem>
                  <SelectItem value="20">20 runs</SelectItem>
                </SelectContent>
              </Select>

              {/* Parse Button */}
              <Button
                onClick={handleParse}
                disabled={isParsing || !options.expression.trim()}
                variant="default"
                size="default"
              >
                {isParsing ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                    Parsing...
                  </>
                ) : (
                  'Parse'
                )}
              </Button>
            </div>
          </div>

          {/* Output Panel */}
          <CodeOutputPanel
            title="Parsed Result"
            value={output}
            language="plaintext"
            height="500px"
            theme={theme}
            wrapText={wrapText}
            onWrapTextChange={setWrapText}
            footerLeftContent={
              output && (
                <>
                  <span>{getLineCount(output)} lines</span>
                  {stats && stats.isValid && <span>{stats.nextRunCount} scheduled runs</span>}
                </>
              )
            }
          />

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
