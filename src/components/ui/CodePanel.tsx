/**
 * CodePanel Component
 * A unified code panel component that supports both input (editable) and output (read-only) modes
 * Supports single content or tabbed outputs
 */

'use client';

import { CodeEditorCore } from '@/components/ui/CodeEditorCore';
import { EditorSettingsMenu } from '@/components/ui/EditorSettingsMenu';
import { type CodeEditorTheme } from '@/config/code-editor-themes';
import { cn } from '@/libs/utils';
import { Check, Copy, Trash2 } from 'lucide-react';
import type * as Monaco from 'monaco-editor';
import React, { useEffect, useState } from 'react';

export interface CodePanelTab {
  id: string;
  label: string;
  value: string;
  language?: string;
}

export interface CodePanelProps {
  // Content (single mode)
  title?: string;
  value?: string;
  onChange?: (value: string) => void; // If provided, editable mode
  language?: string;

  // Tabbed mode
  tabs?: CodePanelTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;

  // Editor settings
  height?: string;
  theme?: CodeEditorTheme;
  wrapText?: boolean;
  onWrapTextChange?: (wrapText: boolean) => void;
  placeholder?: string;
  readOnly?: boolean; // If not provided, auto-detect from onChange

  // Optional features
  showCopyButton?: boolean;
  showClearButton?: boolean;
  showWrapToggle?: boolean;
  showStats?: boolean; // words, characters, lines

  // Custom content
  headerActions?: React.ReactNode;
  footerLeftContent?: React.ReactNode;
  footerRightContent?: React.ReactNode;

  // Editor mount callback
  onEditorMount?: (editor: any, monaco: any) => void;

  // Styling
  className?: string;
}

export function CodePanel({
  title,
  value,
  onChange,
  language = 'plaintext',
  tabs,
  activeTab,
  onTabChange,
  height = '374px',
  theme = 'basicDark',
  wrapText = true,
  onWrapTextChange,
  placeholder,
  readOnly: readOnlyProp,
  showCopyButton = true,
  showClearButton = false,
  showWrapToggle = true,
  showStats = false,
  headerActions,
  footerLeftContent,
  footerRightContent,
  onEditorMount,
  className,
}: CodePanelProps) {
  // Auto-detect read-only mode: if onChange is not provided, it's read-only
  const readOnly = readOnlyProp !== undefined ? readOnlyProp : !onChange;

  // State
  const [copySuccess, setCopySuccess] = useState(false);
  const [stickyScroll, setStickyScroll] = useState(false);
  const [renderWhitespace, setRenderWhitespace] = useState(false);
  const [renderControlCharacters, setRenderControlCharacters] = useState(false);
  // For tabbed mode: store editors by tab ID. For single mode: use 'single' as key
  const [editorInstances, setEditorInstances] = useState<Map<string, Monaco.editor.IStandaloneCodeEditor>>(new Map());

  // Determine if we're in tabbed mode
  const isTabbedMode = tabs && tabs.length > 0;

  // Get current content based on mode
  const currentTab = isTabbedMode ? tabs.find(t => t.id === activeTab) || tabs[0] : null;
  const currentValue = isTabbedMode ? (currentTab?.value || '') : (value || '');
  const currentLanguage = isTabbedMode ? (currentTab?.language || 'plaintext') : language;
  const currentEditorKey = isTabbedMode ? (activeTab || tabs[0]?.id || '') : 'single';
  const currentEditorInstance = editorInstances.get(currentEditorKey) || null;

  const hasContent = currentValue && currentValue.trim().length > 0;

  // Copy handler
  const handleCopy = async () => {
    if (!currentValue) return;
    try {
      await navigator.clipboard.writeText(currentValue);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Clear handler (only for editable mode)
  const handleClear = () => {
    if (onChange) {
      onChange('');
    }
  };

  // Editor mount handler
  const handleEditorMount = (editor: any, monaco: any) => {
    // Calculate the editor key based on current mode (tab ID or 'single')
    const editorKey = isTabbedMode ? (activeTab || tabs?.[0]?.id || '') : 'single';
    // Store editor instance for the current key (tab ID or 'single')
    setEditorInstances(prev => {
      const newMap = new Map(prev);
      newMap.set(editorKey, editor);
      return newMap;
    });
    // Apply initial editor settings
    editor.updateOptions({
      stickyScroll: {
        enabled: stickyScroll,
      },
      renderWhitespace: renderWhitespace ? 'all' : 'none',
      renderControlCharacters: renderControlCharacters,
    });
    // Call the original onEditorMount if provided
    onEditorMount?.(editor, monaco);
  };

  // Update editor options when state changes (for all editors in tabbed mode, or single editor)
  useEffect(() => {
    if (editorInstances.size > 0) {
      editorInstances.forEach((editor) => {
        editor.updateOptions({
          stickyScroll: {
            enabled: stickyScroll,
          },
          renderWhitespace: renderWhitespace ? 'all' : 'none',
          renderControlCharacters: renderControlCharacters,
        });
      });
    }
  }, [editorInstances, stickyScroll, renderWhitespace, renderControlCharacters]);

  // Settings change handlers
  const handleStickyScrollChange = (enabled: boolean) => {
    setStickyScroll(enabled);
  };

  const handleRenderWhitespaceChange = (enabled: boolean) => {
    setRenderWhitespace(enabled);
  };

  const handleRenderControlCharactersChange = (enabled: boolean) => {
    setRenderControlCharacters(enabled);
  };

  const handleZoomIn = () => {
    // Zoom is handled by the menu component via editor actions
  };

  const handleZoomOut = () => {
    // Zoom is handled by the menu component via editor actions
  };

  const handleResetZoom = () => {
    // Zoom is handled by the menu component via editor actions
  };

  // Stats helpers
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

  // Handle value change (for editable mode)
  const handleValueChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <div
      className={cn(
        'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-[10px] overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-0">
        {/* Title or Tabs */}
        <div className="flex items-center gap-4">
          {isTabbedMode ? (
            tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={cn(
                  'px-2 py-2.5 text-sm font-medium leading-[1.5] tracking-[0.07px] transition-colors border-b-2 -mb-[1px]',
                  activeTab === tab.id
                    ? 'text-foreground border-orange-600'
                    : 'text-neutral-600 dark:text-neutral-400 border-transparent hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))
          ) : (
            title && (
              <div className="px-2 py-2.5 text-sm font-medium leading-[1.5] tracking-[0.07px] text-foreground">
                {title}
              </div>
            )
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Custom header actions */}
          {headerActions}

          {/* Clear Button (only for editable mode) */}
          {showClearButton && !readOnly && (
            <button
              onClick={handleClear}
              disabled={!hasContent}
              className={cn(
                'p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors',
                !hasContent && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Clear content"
            >
              <Trash2 className="h-4 w-4 text-neutral-900 dark:text-neutral-300" />
            </button>
          )}

          {/* Copy Button */}
          {showCopyButton && (
            <button
              onClick={handleCopy}
              disabled={!hasContent}
              className={cn(
                'p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors',
                !hasContent && 'opacity-50 cursor-not-allowed'
              )}
              aria-label="Copy to clipboard"
            >
              {copySuccess ? (
                <Check className="h-4 w-4 text-orange-600" />
              ) : (
                <Copy className="h-4 w-4 text-neutral-900 dark:text-neutral-300" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Editor Area */}
      <div className="pt-px pb-1 px-1">
        <div style={{ height }}>
          <CodeEditorCore
            key={isTabbedMode ? activeTab : 'single'}
            value={currentValue}
            onChange={readOnly ? undefined : handleValueChange}
            language={currentLanguage}
            theme={theme}
            wrapText={wrapText}
            readOnly={readOnly}
            placeholder={placeholder}
            height={height}
            onMount={handleEditorMount}
          />
        </div>
      </div>

      {/* Footer */}
      {(footerLeftContent || footerRightContent || showStats || (showWrapToggle && onWrapTextChange)) && (
        <div className="flex items-center justify-between px-3 py-2 min-h-[52px] text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-4">
            {/* Editor Settings Menu */}
            {showWrapToggle && onWrapTextChange && (
              <EditorSettingsMenu
                editorInstance={currentEditorInstance}
                wrapText={wrapText}
                onWrapTextChange={onWrapTextChange}
                stickyScroll={stickyScroll}
                onStickyScrollChange={handleStickyScrollChange}
                renderWhitespace={renderWhitespace}
                onRenderWhitespaceChange={handleRenderWhitespaceChange}
                renderControlCharacters={renderControlCharacters}
                onRenderControlCharactersChange={handleRenderControlCharactersChange}
                onZoomIn={handleZoomIn}
                onZoomOut={handleZoomOut}
                onResetZoom={handleResetZoom}
              />
            )}
            {/* Stats */}
            {showStats && (
              <>
                <span>{getWordCount(currentValue)} words</span>
                <span>{getCharacterCount(currentValue)} characters</span>
                <span>{getLineCount(currentValue)} lines</span>
              </>
            )}
            {footerLeftContent}
          </div>
          {footerRightContent}
        </div>
      )}
    </div>
  );
}

