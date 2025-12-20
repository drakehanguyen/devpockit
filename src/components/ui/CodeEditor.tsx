/**
 * Unified Code Editor Component (Monaco Editor + Shiki)
 * Monaco Editor component for displaying and editing code
 * Supports input, output, and both modes with line numbers and themes
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { MonacoEditorInstance } from '@/components/ui/MonacoEditorInstance';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CODE_EDITOR_THEMES, type CodeEditorTheme } from '@/config/code-editor-themes';
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme';
import { cn } from '@/libs/utils';
import { CheckIcon, ClipboardDocumentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useState, startTransition } from 'react';

export interface CodeEditorProps {
  // Content
  inputValue?: string;
  outputValue?: string;
  mode?: 'input' | 'output' | 'both';

  // Editor settings
  language?: string; // 'json', 'xml', 'javascript', 'plaintext'
  theme?: CodeEditorTheme;
  showLineNumbers?: boolean;
  wrapText?: boolean; // Enable text wrapping (default: false)
  readOnly?: boolean; // For output or read-only input

  // Callbacks
  onInputChange?: (value: string) => void;
  onOutputChange?: (value: string) => void;
  onCopy?: (content: string, type: 'input' | 'output') => void;

  // UI
  title?: string;
  inputTitle?: string;
  outputTitle?: string;
  placeholder?: string;
  error?: string;
  isLoading?: boolean;

  // Statistics
  showStats?: boolean; // word count, character count, etc.

  // Styling
  className?: string;
  height?: string; // e.g., '400px', '50vh'
  minHeight?: string; // e.g., '200px', '30vh'
  maxHeight?: string; // e.g., '600px', '80vh'
  editorPadding?: { top?: number; bottom?: number };
}

export function CodeEditor({
  inputValue = '',
  outputValue = '',
  mode = 'output',
  language = 'plaintext',
  theme = 'basicDark',
  showLineNumbers = true,
  wrapText = true,
  readOnly,
  onInputChange,
  onOutputChange,
  onCopy,
  title,
  inputTitle = 'Input',
  outputTitle = 'Output',
  placeholder = 'Enter or paste your content here...',
  error,
  isLoading = false,
  showStats = false,
  className,
  height = '400px',
  minHeight,
  maxHeight,
  editorPadding,
}: CodeEditorProps) {
  // State management
  const [copySuccess, setCopySuccess] = useState<'input' | 'output' | null>(null);
  const [internalWrapText, setInternalWrapText] = useState(wrapText ?? true);

  // Theme management - use persisted theme for user control
  // The hook loads from localStorage first, so persisted theme takes precedence over the prop
  // The theme prop is only used as a fallback default if no persisted theme exists
  const [persistedTheme, setPersistedTheme] = useCodeEditorTheme(theme);
  const currentTheme = persistedTheme;

  // Determine current wrap text state
  const currentWrapText = internalWrapText;

  // Sync internal state when wrapText prop changes
  useEffect(() => {
    if (wrapText !== undefined) {
      startTransition(() => {
        setInternalWrapText(wrapText);
      });
    }
  }, [wrapText]);

  // Determine read-only state based on mode
  const inputReadOnly = readOnly ?? (mode === 'output');
  const outputReadOnly = readOnly ?? true;

  // Handlers
  const handleWrapTextToggle = (checked: boolean) => {
    setInternalWrapText(checked);
  };

  const handleThemeChange = (newTheme: string) => {
    setPersistedTheme(newTheme as CodeEditorTheme);
  };

  const handleCopy = async (type: 'input' | 'output') => {
    const content = type === 'input' ? inputValue : outputValue;
    if (!content) return;

    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(type);
      onCopy?.(content, type);

      // Reset success state after 2 seconds
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // Statistics calculation functions
  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const getCharacterCount = (text: string): number => {
    return text.length;
  };

  const getLineCount = (text: string): number => {
    if (!text) return 0;
    return text.split('\n').length;
  };

  // Content checks
  const hasInputContent = inputValue && inputValue.trim().length > 0;
  const hasOutputContent = outputValue && outputValue.trim().length > 0;
  const hasContent = hasInputContent || hasOutputContent;

  // Memoize editor options to ensure proper change detection
  const inputOptions = useMemo(
    () => ({
      language,
      theme: currentTheme,
      showLineNumbers,
      wrapText: currentWrapText,
      readOnly: inputReadOnly,
      placeholder: mode === 'input' || mode === 'both' ? placeholder : undefined,
    }),
    [language, currentTheme, showLineNumbers, currentWrapText, inputReadOnly, mode, placeholder]
  );

  const outputOptions = useMemo(
    () => ({
      language,
      theme: currentTheme,
      showLineNumbers,
      wrapText: currentWrapText,
      readOnly: outputReadOnly,
      placeholder: mode === 'output' || mode === 'both' ? placeholder : undefined,
    }),
    [language, currentTheme, showLineNumbers, currentWrapText, outputReadOnly, mode, placeholder]
  );

  // Render single editor (input or output)
  const renderSingleEditor = (type: 'input' | 'output') => {
    const value = type === 'input' ? inputValue : outputValue;
    const hasContent = type === 'input' ? hasInputContent : hasOutputContent;
    const displayTitle = type === 'input' ? inputTitle : (title || outputTitle);
    const options = type === 'input' ? inputOptions : outputOptions;

    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base md:text-lg font-semibold">{displayTitle}</CardTitle>
            <div className="flex items-center gap-2">
              {/* Wrap Text Toggle */}
              <div className="flex items-center gap-2">
                <Label htmlFor={`wrap-text-${type}`} className="text-xs text-muted-foreground cursor-pointer">
                  Wrap
                </Label>
                <Switch
                  id={`wrap-text-${type}`}
                  checked={currentWrapText}
                  onCheckedChange={handleWrapTextToggle}
                  size="sm"
                />
              </div>
              {/* Copy Button */}
              {hasContent && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(type)}
                  className="h-8 px-2 md:px-3 text-xs"
                >
                  {copySuccess === type ? (
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
              {/* Theme Selector - Right aligned */}
              <div className="ml-auto">
                <Select value={currentTheme} onValueChange={handleThemeChange}>
                  <SelectTrigger className="h-8 w-[140px] text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CODE_EDITOR_THEMES).map((themeConfig) => (
                      <SelectItem key={themeConfig.name} value={themeConfig.name}>
                        {themeConfig.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
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
          ) : (
            <div className="space-y-3">
              {/* Editor Display */}
              <div className="relative rounded-lg border overflow-hidden" style={{ height, minHeight: minHeight || height, maxHeight: maxHeight || 'none' }}>
                <MonacoEditorInstance
                  value={value}
                  onChange={type === 'input' ? onInputChange : onOutputChange}
                  language={options.language}
                  theme={options.theme}
                  showLineNumbers={options.showLineNumbers}
                  wrapText={options.wrapText}
                  readOnly={options.readOnly}
                  placeholder={options.placeholder}
                  height="100%"
                  className="h-full"
                  padding={editorPadding}
                />
              </div>

              {/* Statistics */}
              {showStats && hasContent && (
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                  <div className="flex items-center space-x-4">
                    <span>
                      <span className="font-medium">{getWordCount(value)}</span> words
                    </span>
                    <span>
                      <span className="font-medium">{getCharacterCount(value)}</span> characters
                    </span>
                    <span>
                      <span className="font-medium">{getLineCount(value)}</span> lines
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {language === 'plaintext' ? 'Plain text' : language.toUpperCase()}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render both editors side-by-side
  const renderBothEditors = () => {
    return (
      <div className={cn('w-full space-y-6 md:space-y-6', className)}>
        {/* Input Editor */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg font-semibold">{inputTitle}</CardTitle>
              <div className="flex items-center gap-2">
                {/* Wrap Text Toggle */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="wrap-text-input" className="text-xs text-muted-foreground cursor-pointer">
                    Wrap
                  </Label>
                  <Switch
                    id="wrap-text-input"
                    checked={currentWrapText}
                    onCheckedChange={handleWrapTextToggle}
                    size="sm"
                  />
                </div>
                {/* Copy Button */}
                {hasInputContent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy('input')}
                    className="h-8 px-2 md:px-3 text-xs"
                  >
                    {copySuccess === 'input' ? (
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
                {/* Theme Selector - Right aligned */}
                <div className="ml-auto">
                  <Select value={currentTheme} onValueChange={handleThemeChange}>
                    <SelectTrigger className="h-8 w-[140px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CODE_EDITOR_THEMES).map((themeConfig) => (
                        <SelectItem key={themeConfig.name} value={themeConfig.name}>
                          {themeConfig.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="relative rounded-lg border overflow-hidden" style={{ height, minHeight: minHeight || height, maxHeight: maxHeight || 'none' }}>
              <MonacoEditorInstance
                value={inputValue}
                onChange={onInputChange}
                language={inputOptions.language}
                theme={inputOptions.theme}
                showLineNumbers={inputOptions.showLineNumbers}
                wrapText={inputOptions.wrapText}
                readOnly={inputOptions.readOnly}
                placeholder={inputOptions.placeholder}
                height="100%"
                className="h-full"
                padding={editorPadding}
              />
            </div>

            {/* Statistics */}
            {showStats && hasInputContent && (
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t mt-3">
                <div className="flex items-center space-x-4">
                  <span>
                    <span className="font-medium">{getWordCount(inputValue)}</span> words
                  </span>
                  <span>
                    <span className="font-medium">{getCharacterCount(inputValue)}</span> characters
                  </span>
                  <span>
                    <span className="font-medium">{getLineCount(inputValue)}</span> lines
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Output Editor */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg font-semibold">{outputTitle}</CardTitle>
              <div className="flex items-center gap-2">
                {/* Wrap Text Toggle */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="wrap-text-output" className="text-xs text-muted-foreground cursor-pointer">
                    Wrap
                  </Label>
                  <Switch
                    id="wrap-text-output"
                    checked={currentWrapText}
                    onCheckedChange={handleWrapTextToggle}
                    size="sm"
                  />
                </div>
                {/* Copy Button */}
                {hasOutputContent && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy('output')}
                    className="h-8 px-2 md:px-3 text-xs"
                  >
                    {copySuccess === 'output' ? (
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
                {/* Theme Selector - Right aligned */}
                <div className="ml-auto">
                  <Select value={currentTheme} onValueChange={handleThemeChange}>
                    <SelectTrigger className="h-8 w-[140px] text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(CODE_EDITOR_THEMES).map((themeConfig) => (
                        <SelectItem key={themeConfig.name} value={themeConfig.name}>
                          {themeConfig.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
              <div className="flex items-center justify-center p-8" style={{ minHeight: height }}>
                <div className="flex items-center space-x-2 text-muted-foreground">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-muted-foreground border-t-transparent"></div>
                  <span className="text-sm">Generating content...</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-lg border overflow-hidden" style={{ height, minHeight: minHeight || height, maxHeight: maxHeight || 'none' }}>
                  <MonacoEditorInstance
                    value={outputValue}
                    onChange={onOutputChange}
                    language={outputOptions.language}
                    theme={outputOptions.theme}
                    showLineNumbers={outputOptions.showLineNumbers}
                    wrapText={outputOptions.wrapText}
                    readOnly={outputOptions.readOnly}
                    placeholder={outputOptions.placeholder}
                    height="100%"
                    className="h-full"
                    padding={editorPadding}
                  />
                </div>

                {/* Statistics */}
                {showStats && hasOutputContent && (
                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                    <div className="flex items-center space-x-4">
                      <span>
                        <span className="font-medium">{getWordCount(outputValue)}</span> words
                      </span>
                      <span>
                        <span className="font-medium">{getCharacterCount(outputValue)}</span> characters
                      </span>
                      <span>
                        <span className="font-medium">{getLineCount(outputValue)}</span> lines
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {language === 'plaintext' ? 'Plain text' : language.toUpperCase()}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  // Render based on mode
  if (mode === 'input') {
    return renderSingleEditor('input');
  }

  if (mode === 'output') {
    return renderSingleEditor('output');
  }

  // mode === 'both'
  return renderBothEditors();
}

