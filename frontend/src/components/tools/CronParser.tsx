'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OutputDisplay } from '@/components/ui/OutputDisplay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    CRON_EXAMPLES,
    DEFAULT_CRON_OPTIONS
} from '@/config/cron-parser-config';
import { parseCronExpression, type CronParseResult } from '@/libs/cron-parser';
import { cn } from '@/libs/utils';
import { ArrowPathIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface CronParserProps {
  className?: string;
}

export function CronParser({ className }: CronParserProps) {
  const { toolState, updateToolState } = useToolState('cron-parser');

  // Initialize with persistent state or defaults
  const [options, setOptions] = useState(
    (toolState?.options as typeof DEFAULT_CRON_OPTIONS) || DEFAULT_CRON_OPTIONS
  );
  const [output, setOutput] = useState<string>(toolState?.output || '');
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string>(toolState?.error || '');
  const [stats, setStats] = useState<{
    isValid: boolean;
    nextRunCount: number;
    humanReadable: string;
  } | null>(
    (toolState?.stats as { isValid: boolean; nextRunCount: number; humanReadable: string }) || null
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
      setOptions(DEFAULT_CRON_OPTIONS);
      setOutput('');
      setError('');
      setStats(null);
    }
  }, [toolState]);

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
      const result: CronParseResult = parseCronExpression(options.expression);

      if (result.isValid) {
        let outputText = `📅 **Human Readable:**\n${result.humanReadable}\n\n`;

        if (options.showNextRuns && result.nextRuns.length > 0) {
          outputText += `⏰ **Next ${result.nextRuns.length} Execution Times:**\n`;
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

  const handleExampleSelect = (expression: string) => {
    setOptions(prev => ({ ...prev, expression }));
    setError('');
    setOutput('');
    setStats(null);
  };

  const handleClear = () => {
    setOptions(DEFAULT_CRON_OPTIONS);
    setOutput('');
    setError('');
    setStats(null);
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header and Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5" />
            Cron Expression Parser
          </CardTitle>
          <CardDescription>
            Parse and validate cron expressions with human-readable descriptions and next execution times.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Expression Input */}
          <div className="space-y-2">
            <Label htmlFor="cron-expression">Cron Expression</Label>
            <div className="flex gap-2">
              <Input
                id="cron-expression"
                placeholder="e.g., 0 9 * * * (every day at 9 AM)"
                value={options.expression}
                onChange={(e) => setOptions(prev => ({ ...prev, expression: e.target.value }))}
                className="font-mono"
              />
              <Button onClick={handleParse} disabled={isParsing || !options.expression.trim()}>
                {isParsing ? (
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                ) : (
                  'Parse'
                )}
              </Button>
            </div>
          </div>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="next-runs">Show Next Runs</Label>
              <Select
                value={options.showNextRuns ? 'true' : 'false'}
                onValueChange={(value) => setOptions(prev => ({ ...prev, showNextRuns: value === 'true' }))}
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

            <div className="space-y-2">
              <Label htmlFor="run-count">Next Run Count</Label>
              <Select
                value={options.nextRunCount.toString()}
                onValueChange={(value) => setOptions(prev => ({ ...prev, nextRunCount: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 runs</SelectItem>
                  <SelectItem value="5">5 runs</SelectItem>
                  <SelectItem value="10">10 runs</SelectItem>
                  <SelectItem value="20">20 runs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Examples Section */}
      <Card>
        <CardHeader>
          <CardTitle>Example Expressions</CardTitle>
          <CardDescription>
            Click on any example to load it into the input field
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CRON_EXAMPLES.map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-3 text-left justify-start"
                onClick={() => handleExampleSelect(example.expression)}
              >
                <div className="space-y-1">
                  <div className="font-medium text-sm">{example.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {example.expression}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {example.description}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Output Section */}
      <OutputDisplay
        content={output}
        error={error}
        isLoading={isParsing}
        stats={stats ? {
          'Valid': stats.isValid ? 'Yes' : 'No',
          'Next Runs': stats.nextRunCount.toString(),
          'Description': stats.humanReadable || 'N/A'
        } : undefined}
        placeholder="Enter a cron expression and click Parse to see the human-readable description and next execution times..."
      />
    </div>
  );
}
