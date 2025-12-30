'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MonacoEditorInstance } from '@/components/ui/MonacoEditorInstance';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_DIFF_OPTIONS, DIFF_CHECKER_OPTIONS, DIFF_EXAMPLES } from '@/config/diff-checker-config';
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme';
import { cn } from '@/libs/utils';
import { ArrowsRightLeftIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Change, diffLines, diffWordsWithSpace } from 'diff';
import { Check, Copy, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface DiffCheckerProps {
  className?: string;
}

interface DiffOptions {
  ignoreWhitespace: boolean;
  language: string;
  wordWrap: boolean;
  syncScroll: boolean;
}

interface DiffStats {
  additions: number;
  deletions: number;
  changes: number;
}

interface InlineDecoration {
  lineNumber: number;
  startColumn: number;
  endColumn: number;
  type: 'added' | 'removed';
}

export function DiffChecker({ className }: DiffCheckerProps) {
  const { toolState, updateToolState } = useToolState('diff-checker');

  // State
  const [originalText, setOriginalText] = useState<string>('');
  const [modifiedText, setModifiedText] = useState<string>('');
  const [options, setOptions] = useState<DiffOptions>(DEFAULT_DIFF_OPTIONS);
  const [stats, setStats] = useState<DiffStats>({ additions: 0, deletions: 0, changes: 0 });
  const [isHydrated, setIsHydrated] = useState(false);
  const [originalWrapText, setOriginalWrapText] = useState(true);
  const [modifiedWrapText, setModifiedWrapText] = useState(true);
  const [copySuccess, setCopySuccess] = useState<'original' | 'modified' | null>(null);
  const [editorsReady, setEditorsReady] = useState(false);

  // Editor refs for decorations
  const originalEditorRef = useRef<any>(null);
  const modifiedEditorRef = useRef<any>(null);
  const originalDecorationsRef = useRef<string[]>([]);
  const modifiedDecorationsRef = useRef<string[]>([]);

  // Scroll sync refs
  const isSyncingScrollRef = useRef<boolean>(false);
  const originalScrollDisposableRef = useRef<any>(null);
  const modifiedScrollDisposableRef = useRef<any>(null);

  // Theme
  const [theme] = useCodeEditorTheme('basicDark');

  // Hydrate state from toolState after mount
  useEffect(() => {
    setIsHydrated(true);
    if (toolState) {
      if (toolState.originalText) setOriginalText(toolState.originalText as string);
      if (toolState.modifiedText) setModifiedText(toolState.modifiedText as string);
      if (toolState.options) setOptions(toolState.options as DiffOptions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update persistent state
  useEffect(() => {
    if (isHydrated) {
      updateToolState({
        originalText,
        modifiedText,
        options,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalText, modifiedText, options, isHydrated]);

  // Reset state when tool state is cleared
  useEffect(() => {
    if (isHydrated && (!toolState || Object.keys(toolState).length === 0)) {
      setOriginalText('');
      setModifiedText('');
      setOptions(DEFAULT_DIFF_OPTIONS);
      setStats({ additions: 0, deletions: 0, changes: 0 });
    }
  }, [toolState, isHydrated]);

  // Calculate diff and apply decorations with character-level highlighting
  const calculateDiffAndDecorate = useCallback(() => {
    const lineChanges: Change[] = diffLines(originalText, modifiedText, {
      ignoreWhitespace: options.ignoreWhitespace,
    });

    let additions = 0;
    let deletions = 0;
    const originalLineDecorations: any[] = [];
    const modifiedLineDecorations: any[] = [];
    const originalInlineDecorations: InlineDecoration[] = [];
    const modifiedInlineDecorations: InlineDecoration[] = [];

    let originalLine = 1;
    let modifiedLine = 1;
    let i = 0;

    while (i < lineChanges.length) {
      const change = lineChanges[i];
      const lineCount = change.count || 0;

      if (change.added) {
        // Check if previous was removed (paired change for inline diff)
        const prevChange = i > 0 ? lineChanges[i - 1] : null;
        if (prevChange && prevChange.removed) {
          // Already handled in removed case
        }
        additions += lineCount;
        const lines = (change.value || '').split('\n').filter((_, idx, arr) => idx < arr.length - 1 || arr[idx] !== '');
        lines.forEach((_, idx) => {
          modifiedLineDecorations.push({
            lineNumber: modifiedLine + idx,
            type: 'added',
          });
        });
        modifiedLine += lineCount;
      } else if (change.removed) {
        // Check if next is added (paired change for inline diff)
        const nextChange = i + 1 < lineChanges.length ? lineChanges[i + 1] : null;

        deletions += lineCount;
        const removedLines = (change.value || '').split('\n').filter((_, idx, arr) => idx < arr.length - 1 || arr[idx] !== '');

        if (nextChange && nextChange.added) {
          // Paired change - do character-level diff
          const addedLines = (nextChange.value || '').split('\n').filter((_, idx, arr) => idx < arr.length - 1 || arr[idx] !== '');
          const minLines = Math.min(removedLines.length, addedLines.length);

          for (let j = 0; j < minLines; j++) {
            const wordChanges = diffWordsWithSpace(removedLines[j], addedLines[j]);
            let origCol = 1;
            let modCol = 1;

            wordChanges.forEach((wordChange) => {
              const len = (wordChange.value || '').length;

              if (wordChange.removed) {
                originalInlineDecorations.push({
                  lineNumber: originalLine + j,
                  startColumn: origCol,
                  endColumn: origCol + len,
                  type: 'removed',
                });
                origCol += len;
              } else if (wordChange.added) {
                modifiedInlineDecorations.push({
                  lineNumber: modifiedLine + j,
                  startColumn: modCol,
                  endColumn: modCol + len,
                  type: 'added',
                });
                modCol += len;
              } else {
                origCol += len;
                modCol += len;
              }
            });

            // Add line-level decoration for modified lines
            originalLineDecorations.push({
              lineNumber: originalLine + j,
              type: 'removed',
            });
            modifiedLineDecorations.push({
              lineNumber: modifiedLine + j,
              type: 'added',
            });
          }

          // Handle remaining lines without pair
          for (let j = minLines; j < removedLines.length; j++) {
            originalLineDecorations.push({
              lineNumber: originalLine + j,
              type: 'removed',
            });
          }
          for (let j = minLines; j < addedLines.length; j++) {
            modifiedLineDecorations.push({
              lineNumber: modifiedLine + j,
              type: 'added',
            });
          }

          additions += nextChange.count || 0;
          modifiedLine += nextChange.count || 0;
          i++; // Skip the next (added) change since we handled it
        } else {
          // Unpaired removal
          removedLines.forEach((_, idx) => {
            originalLineDecorations.push({
              lineNumber: originalLine + idx,
              type: 'removed',
            });
          });
        }
        originalLine += lineCount;
      } else {
        // Unchanged lines
        originalLine += lineCount;
        modifiedLine += lineCount;
      }
      i++;
    }

    setStats({
      additions,
      deletions,
      changes: additions + deletions,
    });

    // Apply decorations to editors
    const monaco = (window as any).monaco;
    if (!monaco) return;

    if (originalEditorRef.current) {
      const editor = originalEditorRef.current;
      const decorations = [
        // Line decorations
        ...originalLineDecorations.map((dec) => ({
          range: new monaco.Range(dec.lineNumber, 1, dec.lineNumber, 1),
          options: {
            isWholeLine: true,
            className: 'diff-line-removed',
            glyphMarginClassName: 'diff-glyph-removed',
          },
        })),
        // Inline character decorations
        ...originalInlineDecorations.map((dec) => ({
          range: new monaco.Range(dec.lineNumber, dec.startColumn, dec.lineNumber, dec.endColumn),
          options: {
            inlineClassName: 'diff-char-removed',
          },
        })),
      ];
      originalDecorationsRef.current = editor.deltaDecorations(
        originalDecorationsRef.current,
        decorations
      );
    }

    if (modifiedEditorRef.current) {
      const editor = modifiedEditorRef.current;
      const decorations = [
        // Line decorations
        ...modifiedLineDecorations.map((dec) => ({
          range: new monaco.Range(dec.lineNumber, 1, dec.lineNumber, 1),
          options: {
            isWholeLine: true,
            className: 'diff-line-added',
            glyphMarginClassName: 'diff-glyph-added',
          },
        })),
        // Inline character decorations
        ...modifiedInlineDecorations.map((dec) => ({
          range: new monaco.Range(dec.lineNumber, dec.startColumn, dec.lineNumber, dec.endColumn),
          options: {
            inlineClassName: 'diff-char-added',
          },
        })),
      ];
      modifiedDecorationsRef.current = editor.deltaDecorations(
        modifiedDecorationsRef.current,
        decorations
      );
    }
  }, [originalText, modifiedText, options.ignoreWhitespace]);

  useEffect(() => {
    calculateDiffAndDecorate();
  }, [calculateDiffAndDecorate]);

  // Scroll sync between editors
  useEffect(() => {
    // Only sync if option is enabled and both editors are mounted
    if (!options.syncScroll || !originalEditorRef.current || !modifiedEditorRef.current) {
      // Clean up existing listeners if sync is disabled
      if (originalScrollDisposableRef.current) {
        originalScrollDisposableRef.current.dispose();
        originalScrollDisposableRef.current = null;
      }
      if (modifiedScrollDisposableRef.current) {
        modifiedScrollDisposableRef.current.dispose();
        modifiedScrollDisposableRef.current = null;
      }
      return;
    }

    const originalEditor = originalEditorRef.current;
    const modifiedEditor = modifiedEditorRef.current;

    // Helper function to calculate scroll percentage
    const getScrollPercentage = (editor: any): number => {
      const scrollTop = editor.getScrollTop();
      const scrollHeight = editor.getScrollHeight();
      const editorHeight = editor.getLayoutInfo().height;
      const maxScrollTop = Math.max(0, scrollHeight - editorHeight);

      if (maxScrollTop === 0) return 0;
      return scrollTop / maxScrollTop;
    };

    // Helper function to set scroll position by percentage
    const setScrollPercentage = (editor: any, percentage: number, scrollLeft?: number): void => {
      const scrollHeight = editor.getScrollHeight();
      const editorHeight = editor.getLayoutInfo().height;
      const maxScrollTop = Math.max(0, scrollHeight - editorHeight);
      const targetScrollTop = percentage * maxScrollTop;

      editor.setScrollTop(targetScrollTop);

      // Also sync horizontal scroll if provided
      if (scrollLeft !== undefined) {
        editor.setScrollLeft(scrollLeft);
      }
    };

    // Sync scroll from original to modified
    const syncOriginalToModified = () => {
      if (isSyncingScrollRef.current) return;
      if (!modifiedEditorRef.current || !originalEditorRef.current) return;

      isSyncingScrollRef.current = true;
      const percentage = getScrollPercentage(originalEditor);
      const scrollLeft = originalEditor.getScrollLeft();
      setScrollPercentage(modifiedEditor, percentage, scrollLeft);

      // Use requestAnimationFrame to clear the flag after scroll completes
      requestAnimationFrame(() => {
        isSyncingScrollRef.current = false;
      });
    };

    // Sync scroll from modified to original
    const syncModifiedToOriginal = () => {
      if (isSyncingScrollRef.current) return;
      if (!modifiedEditorRef.current || !originalEditorRef.current) return;

      isSyncingScrollRef.current = true;
      const percentage = getScrollPercentage(modifiedEditor);
      const scrollLeft = modifiedEditor.getScrollLeft();
      setScrollPercentage(originalEditor, percentage, scrollLeft);

      // Use requestAnimationFrame to clear the flag after scroll completes
      requestAnimationFrame(() => {
        isSyncingScrollRef.current = false;
      });
    };

    // Set up scroll listeners
    originalScrollDisposableRef.current = originalEditor.onDidScrollChange((e: any) => {
      syncOriginalToModified();
    });

    modifiedScrollDisposableRef.current = modifiedEditor.onDidScrollChange((e: any) => {
      syncModifiedToOriginal();
    });

    // Cleanup function
    return () => {
      if (originalScrollDisposableRef.current) {
        originalScrollDisposableRef.current.dispose();
        originalScrollDisposableRef.current = null;
      }
      if (modifiedScrollDisposableRef.current) {
        modifiedScrollDisposableRef.current.dispose();
        modifiedScrollDisposableRef.current = null;
      }
      isSyncingScrollRef.current = false;
    };
  }, [options.syncScroll, editorsReady]);

  // Handlers
  const handleSwap = () => {
    const temp = originalText;
    setOriginalText(modifiedText);
    setModifiedText(temp);
  };

  const handleLoadExample = (side: 'original' | 'modified', lang: 'javascript' | 'python') => {
    const example = DIFF_EXAMPLES[lang][side];
    if (side === 'original') {
      setOriginalText(example);
    } else {
      setModifiedText(example);
    }
    // Also update language to match
    setOptions((prev) => ({ ...prev, language: lang }));
  };

  const handleCopy = async (side: 'original' | 'modified') => {
    const text = side === 'original' ? originalText : modifiedText;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(side);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = (side: 'original' | 'modified') => {
    if (side === 'original') {
      setOriginalText('');
    } else {
      setModifiedText('');
    }
  };

  const handleOriginalEditorMount = (editor: any) => {
    originalEditorRef.current = editor;
    // Trigger decoration after mount
    setTimeout(calculateDiffAndDecorate, 100);
    // Check if both editors are ready
    if (modifiedEditorRef.current) {
      setEditorsReady(true);
    }
  };

  const handleModifiedEditorMount = (editor: any) => {
    modifiedEditorRef.current = editor;
    // Trigger decoration after mount
    setTimeout(calculateDiffAndDecorate, 100);
    // Check if both editors are ready
    if (originalEditorRef.current) {
      setEditorsReady(true);
    }
  };

  const getCharacterCount = (text: string): number => text.length;
  const getLineCount = (text: string): number => (text ? text.split('\n').length : 0);

  const hasOriginalContent = originalText.trim().length > 0;
  const hasModifiedContent = modifiedText.trim().length > 0;
  const hasContent = hasOriginalContent || hasModifiedContent;

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* CSS for diff highlighting */}
      <style jsx global>{`
        .diff-line-removed {
          background-color: rgba(239, 68, 68, 0.15) !important;
        }
        .diff-line-added {
          background-color: rgba(34, 197, 94, 0.15) !important;
        }
        .diff-glyph-removed {
          background-color: rgb(239, 68, 68) !important;
          width: 4px !important;
          margin-left: 3px !important;
        }
        .diff-glyph-added {
          background-color: rgb(34, 197, 94) !important;
          width: 4px !important;
          margin-left: 3px !important;
        }
        .diff-char-removed {
          background-color: rgba(239, 68, 68, 0.4) !important;
          border-radius: 2px;
        }
        .diff-char-added {
          background-color: rgba(34, 197, 94, 0.4) !important;
          border-radius: 2px;
        }
      `}</style>

      {/* Header Section */}
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="text-[32px] font-normal leading-6 tracking-normal text-neutral-900 dark:text-neutral-100 mb-3">
          Diff Checker
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Compare two texts side-by-side and highlight differences with syntax highlighting
        </p>
      </div>

      {/* Body Section */}
      <div className="flex-1 bg-background px-[24px] pt-6 pb-10">
        <div className="flex flex-col gap-4">
          {/* Controls */}
          <div className="flex flex-col gap-4">
            {/* Main Controls Row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Language Select */}
              <Select
                value={options.language}
                onValueChange={(value) =>
                  setOptions((prev) => ({ ...prev, language: value }))
                }
              >
                <SelectTrigger label="Language:">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DIFF_CHECKER_OPTIONS.languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sync Scroll Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sync Scroll:</span>
                <Switch
                  checked={options.syncScroll}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, syncScroll: checked }))
                  }
                  aria-label="Synchronize scrolling between original and modified editors"
                />
              </div>

              {/* Ignore Whitespace Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Ignore Whitespace:</span>
                <Switch
                  checked={options.ignoreWhitespace}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, ignoreWhitespace: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Side-by-side Editor Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Original Panel */}
            <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-[10px] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-0">
                <div className="px-2 py-2.5 text-sm font-medium leading-[1.5] tracking-[0.07px] text-foreground">
                  Original
                </div>
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                        Load Example
                        <ChevronDownIcon className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleLoadExample('original', 'javascript')}>
                      Load JavaScript Example
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleLoadExample('original', 'python')}>
                      Load Python Example
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                  <button
                    onClick={() => handleClear('original')}
                    disabled={!hasOriginalContent}
                    className={cn(
                      'p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors',
                      !hasOriginalContent && 'opacity-50 cursor-not-allowed'
                    )}
                    aria-label="Clear content"
                  >
                    <Trash2 className="h-4 w-4 text-neutral-900 dark:text-neutral-300" />
                  </button>
                  <button
                    onClick={() => handleCopy('original')}
                    disabled={!hasOriginalContent}
                    className={cn(
                      'p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors',
                      !hasOriginalContent && 'opacity-50 cursor-not-allowed'
                    )}
                    aria-label="Copy to clipboard"
                  >
                    {copySuccess === 'original' ? (
                      <Check className="h-4 w-4 text-orange-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-neutral-900 dark:text-neutral-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div className="pt-px pb-1 px-1">
                <div style={{ height: '500px' }} className="bg-white dark:bg-neutral-900 rounded-[8px] overflow-hidden">
                  <MonacoEditorInstance
                    height="500px"
                    language={options.language}
                    value={originalText}
                    onChange={(value) => setOriginalText(value)}
                    theme={theme}
                    wrapText={originalWrapText}
                    onMount={handleOriginalEditorMount}
                    padding={{ top: 8 }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-3 py-2 min-h-[52px] text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={originalWrapText}
                    onCheckedChange={setOriginalWrapText}
                    size="sm"
                    title="Wrap Text"
                  />
                  <span>{getCharacterCount(originalText)} characters</span>
                  <span>{getLineCount(originalText)} lines</span>
                </div>
              </div>
            </div>

            {/* Modified Panel */}
            <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-[10px] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-0">
                <div className="px-2 py-2.5 text-sm font-medium leading-[1.5] tracking-[0.07px] text-foreground">
                  Modified
                </div>
                <div className="flex items-center gap-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                        Load Example
                        <ChevronDownIcon className="h-3 w-3 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleLoadExample('modified', 'javascript')}>
                      Load JavaScript Example
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleLoadExample('modified', 'python')}>
                      Load Python Example
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                  <button
                    onClick={() => handleClear('modified')}
                    disabled={!hasModifiedContent}
                    className={cn(
                      'p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors',
                      !hasModifiedContent && 'opacity-50 cursor-not-allowed'
                    )}
                    aria-label="Clear content"
                  >
                    <Trash2 className="h-4 w-4 text-neutral-900 dark:text-neutral-300" />
                  </button>
                  <button
                    onClick={() => handleCopy('modified')}
                    disabled={!hasModifiedContent}
                    className={cn(
                      'p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors',
                      !hasModifiedContent && 'opacity-50 cursor-not-allowed'
                    )}
                    aria-label="Copy to clipboard"
                  >
                    {copySuccess === 'modified' ? (
                      <Check className="h-4 w-4 text-orange-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-neutral-900 dark:text-neutral-300" />
                    )}
                  </button>
                </div>
              </div>

              {/* Editor */}
              <div className="pt-px pb-1 px-1">
                <div style={{ height: '500px' }} className="bg-white dark:bg-neutral-900 rounded-[8px] overflow-hidden">
                  <MonacoEditorInstance
                    height="500px"
                    language={options.language}
                    value={modifiedText}
                    onChange={(value) => setModifiedText(value)}
                    theme={theme}
                    wrapText={modifiedWrapText}
                    onMount={handleModifiedEditorMount}
                    padding={{ top: 8 }}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-3 py-2 min-h-[52px] text-sm text-neutral-600 dark:text-neutral-400">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={modifiedWrapText}
                    onCheckedChange={setModifiedWrapText}
                    size="sm"
                    title="Wrap Text"
                  />
                  <span>{getCharacterCount(modifiedText)} characters</span>
                  <span>{getLineCount(modifiedText)} lines</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSwap}
                  disabled={!hasContent}
                  className="h-8 px-3 text-xs"
                >
                  <ArrowsRightLeftIcon className="h-3 w-3 mr-1" />
                  Swap
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-center gap-6 py-3 px-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-[10px]">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              -{stats.deletions} deletions
            </span>
            <span className="text-sm font-medium text-green-600 dark:text-green-400">
              +{stats.additions} additions
            </span>
            <span className="text-sm text-muted-foreground">
              {stats.changes} total changes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
