'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { CodePanel } from '@/components/ui/code-panel';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DEFAULT_JSON_PATH_OPTIONS,
  JSON_PATH_EXAMPLES,
  JSON_PATH_COMMON_PATTERNS,
  type JsonPathFinderOptions
} from '@/config/json-path-finder-config';
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme';
import {
  evaluateJsonPath,
  formatJsonPathResults,
  validateJsonPath,
  type JsonPathResult
} from '@/libs/json-path-finder';
import { cn } from '@/libs/utils';
import { ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface JsonPathFinderProps {
  className?: string;
}

export function JsonPathFinder({ className }: JsonPathFinderProps) {
  const { toolState, updateToolState } = useToolState('json-path-finder');

  // Initialize with defaults to avoid hydration mismatch
  const [options, setOptions] = useState<JsonPathFinderOptions>(DEFAULT_JSON_PATH_OPTIONS);
  const [jsonInput, setJsonInput] = useState<string>('');
  const [pathInput, setPathInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string>('');
  const [result, setResult] = useState<JsonPathResult | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  // Editor settings
  const [theme] = useCodeEditorTheme('basicDark');
  const [inputWrapText, setInputWrapText] = useState(true);
  const [outputWrapText, setOutputWrapText] = useState(true);

  // Hydrate state from toolState after mount (client-side only)
  useEffect(() => {
    setIsHydrated(true);
    if (toolState) {
      if (toolState.options) setOptions(toolState.options as JsonPathFinderOptions);
      if (toolState.jsonInput) setJsonInput(toolState.jsonInput as string);
      if (toolState.pathInput) setPathInput(toolState.pathInput as string);
      if (toolState.output) setOutput(toolState.output as string);
      if (toolState.error) setError(toolState.error as string);
      if (toolState.result) setResult(toolState.result as JsonPathResult);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update persistent state whenever local state changes
  useEffect(() => {
    if (isHydrated) {
      updateToolState({
        options,
        jsonInput,
        pathInput,
        output,
        error,
        result: result || undefined
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, jsonInput, pathInput, output, error, result, isHydrated]);

  // Reset local state when tool state is cleared
  useEffect(() => {
    if (isHydrated && (!toolState || Object.keys(toolState).length === 0)) {
      setOptions(DEFAULT_JSON_PATH_OPTIONS);
      setJsonInput('');
      setPathInput('');
      setOutput('');
      setError('');
      setResult(null);
    }
  }, [toolState, isHydrated]);

  const handleEvaluate = async () => {
    if (!jsonInput.trim()) {
      setError('Please enter JSON data');
      setOutput('');
      setResult(null);
      return;
    }

    if (!pathInput.trim()) {
      setError('Please enter a JSONPath expression');
      setOutput('');
      setResult(null);
      return;
    }

    setIsEvaluating(true);
    setError('');

    try {
      // Validate JSONPath syntax
      const pathValidation = validateJsonPath(pathInput);
      if (!pathValidation.isValid) {
        setError(pathValidation.error || 'Invalid JSONPath expression');
        setOutput('');
        setResult(null);
        return;
      }

      // Parse JSON
      let jsonData: any;
      try {
        jsonData = JSON.parse(jsonInput);
      } catch (parseError) {
        setError(parseError instanceof Error ? parseError.message : 'Invalid JSON format');
        setOutput('');
        setResult(null);
        return;
      }

      // Simulate async operation for better UX
      await new Promise(resolve => setTimeout(resolve, 300));

      // Evaluate JSONPath
      const pathResult = evaluateJsonPath(jsonData, pathInput);

      if (pathResult.success) {
        setResult(pathResult);
        setOutput(formatJsonPathResults(pathResult));
      } else {
        setError(pathResult.error || 'JSONPath evaluation failed');
        setOutput('');
        setResult(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Evaluation failed');
      setOutput('');
      setResult(null);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleLoadExample = (example: typeof JSON_PATH_EXAMPLES[0]) => {
    setJsonInput(example.json);
    setPathInput(example.path);
    setError('');
    setOutput('');
    setResult(null);
  };

  const handleLoadPattern = (pattern: typeof JSON_PATH_COMMON_PATTERNS[0]) => {
    setPathInput(pattern.example);
    // Focus on path input
    setTimeout(() => {
      const pathInputElement = document.querySelector('input[placeholder*="JSONPath"]') as HTMLInputElement;
      if (pathInputElement) {
        pathInputElement.focus();
      }
    }, 100);
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
          JSON Path Finder
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Query and extract data from JSON using JSONPath expressions
        </p>
      </div>

      {/* Body Section */}
      <div className="flex-1 bg-background px-[24px] pt-6 pb-10">
        <div className="flex flex-col gap-4">
          {/* JSONPath Input */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="jsonpath-input" className="text-sm font-medium">
              JSONPath Expression
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="jsonpath-input"
                placeholder="Enter JSONPath (e.g., $.users[*].name)"
                value={pathInput}
                onChange={(e) => setPathInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleEvaluate();
                  }
                }}
                className="flex-1 font-mono text-sm"
              />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 px-3 text-xs"
                  >
                    Patterns
                    <ChevronDownIcon className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="max-h-[300px] overflow-y-auto w-64">
                  {JSON_PATH_COMMON_PATTERNS.map((pattern, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => handleLoadPattern(pattern)}
                      className="flex flex-col items-start gap-1"
                    >
                      <span className="font-mono text-xs">{pattern.pattern}</span>
                      <span className="text-xs text-muted-foreground">{pattern.description}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <p className="text-xs text-muted-foreground">
              Press Ctrl+Enter (Cmd+Enter on Mac) to evaluate
            </p>
          </div>

          {/* Side-by-side Editor Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Input Panel */}
            <CodePanel
              title="JSON Input"
              value={jsonInput}
              onChange={setJsonInput}
              language="json"
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
                    {JSON_PATH_EXAMPLES.map((example, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => handleLoadExample(example)}
                        className="flex flex-col items-start gap-1"
                      >
                        <span className="font-medium">{example.name}</span>
                        <span className="text-xs text-muted-foreground font-mono">
                          {example.path}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {example.description}
                        </span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              }
              footerLeftContent={
                <span>{getCharacterCount(jsonInput)} characters</span>
              }
              footerRightContent={
                <Button
                  onClick={handleEvaluate}
                  disabled={!jsonInput.trim() || !pathInput.trim() || isEvaluating}
                  variant="default"
                  size="sm"
                  className="h-8 px-4"
                >
                  {isEvaluating ? (
                    <>
                      <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                      Evaluating...
                    </>
                  ) : (
                    'Evaluate'
                  )}
                </Button>
              }
            />

            {/* Output Panel */}
            <CodePanel
              title="Results"
              value={output}
              language="json"
              height="500px"
              theme={theme}
              wrapText={outputWrapText}
              onWrapTextChange={setOutputWrapText}
              footerLeftContent={
                output && result && (
                  <>
                    <span>{result.count} match{result.count !== 1 ? 'es' : ''}</span>
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

          {/* Results Summary */}
          {result && result.success && result.count > 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="text-sm text-green-700 dark:text-green-300">
                <strong>Found {result.count} match{result.count !== 1 ? 'es' : ''}</strong>
                {result.paths.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="font-medium">Paths:</div>
                    <div className="font-mono text-xs space-y-1 max-h-32 overflow-y-auto">
                      {result.paths.slice(0, 10).map((path, index) => (
                        <div key={index}>{path}</div>
                      ))}
                      {result.paths.length > 10 && (
                        <div className="text-muted-foreground">
                          ... and {result.paths.length - 10} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
