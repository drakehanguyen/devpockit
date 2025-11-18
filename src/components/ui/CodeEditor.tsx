/**
 * Unified Code Editor Component
 * Replaces OutputDisplay and Textarea with CodeMirror 6 editor
 * Supports input, output, and both modes with line numbers and themes
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { CODE_EDITOR_THEMES, getThemeExtension as getThemeExtensionFromConfig, type CodeEditorTheme } from '@/config/code-editor-themes';
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme';
import { cn } from '@/libs/utils';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { EditorState } from '@codemirror/state';
import { EditorView, lineNumbers } from '@codemirror/view';
import { CheckIcon, ClipboardDocumentIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useEffect, useMemo, useRef, useState } from 'react';

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
}

/**
 * Custom hook to use CodeMirror editor
 */
function useCodeMirror(
  value: string,
  onChange: ((value: string) => void) | undefined,
  options: {
    language?: string;
    theme?: CodeEditorTheme;
    showLineNumbers?: boolean;
    wrapText?: boolean;
    readOnly?: boolean;
    placeholder?: string;
  }
) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

  // Keep refs updated
  useEffect(() => {
    onChangeRef.current = onChange;
    valueRef.current = value;
  }, [onChange, value]);

  useEffect(() => {
    if (!editorRef.current) return;

    // Destroy existing view if it exists
    if (viewRef.current) {
      viewRef.current.destroy();
      viewRef.current = null;
    }

    // Get language extension
    const getLanguageExtension = () => {
      switch (options.language) {
        case 'json':
          return json();
        case 'xml':
          return xml();
        case 'javascript':
        case 'js':
          return javascript();
        default:
          return null;
      }
    };

    // Get theme extension from configuration
    const getThemeExt = () => {
      return getThemeExtensionFromConfig((options.theme || 'basicDark') as CodeEditorTheme);
    };

    // Build extensions
    const languageExt = getLanguageExtension();
    const themeExt = getThemeExt();

    const extensions = [
      EditorState.readOnly.of(options.readOnly ?? false),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && onChangeRef.current) {
          const newValue = update.state.doc.toString();
          if (newValue !== valueRef.current) {
            valueRef.current = newValue;
            onChangeRef.current(newValue);
          }
        }
      }),
      EditorView.theme({
        '&': {
          fontSize: '14px',
          fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
        '.cm-content': {
          padding: '12px',
          minHeight: '100px',
        },
        '.cm-focused': {
          outline: 'none',
        },
        '.cm-editor': {
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        },
        // Custom scrollbar styling to match OutputDisplay
        '.cm-scroller': {
          overflow: 'auto !important',
          scrollbarWidth: 'thin',
          scrollbarColor: 'hsl(var(--muted-foreground) / 0.3) transparent',
          height: '100%',
          flex: '1 1 auto',
        },
        '.cm-scroller::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '.cm-scroller::-webkit-scrollbar-track': {
          background: 'hsl(var(--muted) / 0.5)',
          borderRadius: '4px',
        },
        '.cm-scroller::-webkit-scrollbar-thumb': {
          backgroundColor: 'hsl(var(--muted-foreground) / 0.4)',
          borderRadius: '4px',
          border: '1px solid hsl(var(--muted) / 0.8)',
          transition: 'all 0.2s ease',
        },
        '.cm-scroller::-webkit-scrollbar-thumb:hover': {
          backgroundColor: 'hsl(var(--muted-foreground) / 0.6)',
          borderColor: 'hsl(var(--muted-foreground) / 0.3)',
        },
        '.cm-scroller::-webkit-scrollbar-corner': {
          background: 'hsl(var(--muted) / 0.5)',
        },
        '&[data-placeholder] .cm-line:first-child::before': {
          content: 'attr(data-placeholder)',
          color: 'var(--muted-foreground, #6b7280)',
          opacity: 0.6,
          pointerEvents: 'none',
          position: 'absolute',
        },
        // Responsive font sizes
        '@media (max-width: 640px)': {
          '&': {
            fontSize: '13px',
          },
          '.cm-content': {
            padding: '10px',
          },
        },
      }),
    ];

    // Add language extension if available
    if (languageExt) {
      extensions.push(languageExt);
    }

    // Add theme extension if available
    if (themeExt) {
      extensions.push(themeExt);
    }

    // Add line numbers if enabled
    if (options.showLineNumbers !== false) {
      extensions.push(lineNumbers());
    }

    // Add text wrapping if enabled
    if (options.wrapText) {
      extensions.push(EditorView.lineWrapping);
    }

    // Add placeholder if provided
    if (options.placeholder) {
      extensions.push(placeholderExtension(options.placeholder));
    }

    // Create editor state
    const state = EditorState.create({
      doc: value,
      extensions,
    });

    // Create editor view
    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    // Cleanup
    return () => {
      if (viewRef.current) {
        viewRef.current.destroy();
        viewRef.current = null;
      }
    };
    // value is handled in a separate useEffect to avoid recreating the editor
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.language, options.theme, options.showLineNumbers, options.wrapText, options.readOnly]);

  // Update editor content when value changes externally
  useEffect(() => {
    if (viewRef.current) {
      const currentValue = viewRef.current.state.doc.toString();
      if (value !== currentValue) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentValue.length,
            insert: value,
          },
        });
        valueRef.current = value;
      }
    }
  }, [value]);

  return editorRef;
}

/**
 * Create placeholder extension for CodeMirror
 * Uses a simple approach with data attribute for styling
 */
function placeholderExtension(placeholderText: string) {
  return EditorView.updateListener.of((update) => {
    if (update.docChanged || update.viewportChanged) {
      const isEmpty = update.state.doc.length === 0;
      const editorElement = update.view.dom;

      if (isEmpty && placeholderText) {
        editorElement.setAttribute('data-placeholder', placeholderText);
      } else {
        editorElement.removeAttribute('data-placeholder');
      }
    }
  });
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
}: CodeEditorProps) {
  const [copySuccess, setCopySuccess] = useState<'input' | 'output' | null>(null);
  const [internalWrapText, setInternalWrapText] = useState(wrapText ?? true);

  // Use theme hook for persistence - always use persisted theme for user control
  const [persistedTheme, setPersistedTheme] = useCodeEditorTheme(theme);
  const currentTheme = persistedTheme;

  // Determine if wrapText is controlled by parent (check if prop was explicitly passed)
  // Since wrapText has a default value, we need to track if it was explicitly provided
  // For now, we'll always allow internal state management unless there's an onChange callback
  const currentWrapText = internalWrapText;

  // Sync internal state when wrapText prop changes (only on mount or when prop actually changes)
  useEffect(() => {
    if (wrapText !== undefined) {
      setInternalWrapText(wrapText);
    }
  }, [wrapText]);

  // Determine read-only state based on mode
  const inputReadOnly = readOnly ?? (mode === 'output');
  const outputReadOnly = readOnly ?? true;

  const handleWrapTextToggle = (checked: boolean) => {
    setInternalWrapText(checked);
  };

  const handleThemeChange = (newTheme: string) => {
    setPersistedTheme(newTheme as CodeEditorTheme);
  };

  // Memoize options to ensure proper change detection
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

  // Input editor
  const inputEditorRef = useCodeMirror(inputValue, onInputChange, inputOptions);

  // Output editor
  const outputEditorRef = useCodeMirror(outputValue, onOutputChange, outputOptions);

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

  const hasInputContent = inputValue && inputValue.trim().length > 0;
  const hasOutputContent = outputValue && outputValue.trim().length > 0;
  const hasContent = hasInputContent || hasOutputContent;

  // Render single editor (input or output)
  const renderSingleEditor = (type: 'input' | 'output') => {
    const value = type === 'input' ? inputValue : outputValue;
    const editorRef = type === 'input' ? inputEditorRef : outputEditorRef;
    const hasContent = type === 'input' ? hasInputContent : hasOutputContent;
    const displayTitle = type === 'input' ? inputTitle : (title || outputTitle);

    return (
      <Card className={cn('w-full', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base md:text-lg font-semibold">{displayTitle}</CardTitle>
            <div className="flex items-center gap-2">
              {/* Theme Selector */}
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
              {/* Wrap Text Toggle */}
              <div className="flex items-center gap-2">
                <Label htmlFor={`wrap-text-${type}`} className="text-xs text-muted-foreground cursor-pointer">
                  Wrap
                </Label>
                <Switch
                  id={`wrap-text-${type}`}
                  checked={currentWrapText}
                  onCheckedChange={handleWrapTextToggle}
                  className="h-5 w-9"
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
              <div className="relative" style={{ height, minHeight: minHeight || height, maxHeight: maxHeight || 'none' }}>
                <div
                  ref={editorRef}
                  className="rounded-lg border overflow-hidden custom-scrollbar"
                  style={{
                    height: '100%',
                    width: '100%',
                  }}
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
                {/* Theme Selector */}
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
                {/* Wrap Text Toggle */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="wrap-text-input" className="text-xs text-muted-foreground cursor-pointer">
                    Wrap
                  </Label>
                  <Switch
                    id="wrap-text-input"
                    checked={currentWrapText}
                    onCheckedChange={handleWrapTextToggle}
                    className="h-5 w-9"
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
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="relative" style={{ height, minHeight: minHeight || height, maxHeight: maxHeight || 'none' }}>
              <div
                ref={inputEditorRef}
                className="rounded-lg border overflow-hidden custom-scrollbar"
                style={{
                  height: '100%',
                  width: '100%',
                }}
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
                {/* Theme Selector */}
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
                {/* Wrap Text Toggle */}
                <div className="flex items-center gap-2">
                  <Label htmlFor="wrap-text-output" className="text-xs text-muted-foreground cursor-pointer">
                    Wrap
                  </Label>
                  <Switch
                    id="wrap-text-output"
                    checked={currentWrapText}
                    onCheckedChange={handleWrapTextToggle}
                    className="h-5 w-9"
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
                <div className="relative" style={{ height, minHeight: minHeight || height, maxHeight: maxHeight || 'none' }}>
                  <div
                    ref={outputEditorRef}
                    className="rounded-lg border overflow-hidden custom-scrollbar"
                    style={{
                      height: '100%',
                      width: '100%',
                    }}
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

