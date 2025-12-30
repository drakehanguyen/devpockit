/**
 * CodeInputPanel Component
 * An editable code panel with header, Monaco editor, and footer
 */

'use client';

import { CodeEditorCore } from '@/components/ui/CodeEditorCore';
import { EditorSettingsMenu } from '@/components/ui/EditorSettingsMenu';
import { type CodeEditorTheme } from '@/config/code-editor-themes';
import { cn } from '@/libs/utils';
import { Check, Copy, Trash2 } from 'lucide-react';
import type * as Monaco from 'monaco-editor';
import React, { useEffect, useState } from 'react';

export interface CodeInputPanelProps {
  // Content
  title: string;
  value: string;
  onChange: (value: string) => void;
  language?: string;

  // Editor settings
  height?: string;
  theme?: CodeEditorTheme;
  wrapText?: boolean;
  onWrapTextChange?: (wrapText: boolean) => void;
  placeholder?: string;

  // Optional buttons
  showCopyButton?: boolean;
  showClearButton?: boolean;
  showWrapToggle?: boolean;

  // Custom header actions (e.g., Load Example button)
  headerActions?: React.ReactNode;

  // Footer content - left side (e.g., stats next to wrap toggle)
  footerLeftContent?: React.ReactNode;

  // Footer content - right side (e.g., generate button)
  footerRightContent?: React.ReactNode;

  // Editor mount callback
  onEditorMount?: (editor: any, monaco: any) => void;

  // Styling
  className?: string;
}

export function CodeInputPanel({
  title,
  value,
  onChange,
  language = 'plaintext',
  height = '374px',
  theme = 'basicDark',
  wrapText = true,
  onWrapTextChange,
  placeholder,
  showCopyButton = true,
  showClearButton = false,
  showWrapToggle = true,
  headerActions,
  footerLeftContent,
  footerRightContent,
  onEditorMount,
  className,
}: CodeInputPanelProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [stickyScroll, setStickyScroll] = useState(false);
  const [renderWhitespace, setRenderWhitespace] = useState(false);
  const [renderControlCharacters, setRenderControlCharacters] = useState(false);
  const [editorInstance, setEditorInstance] = useState<Monaco.editor.IStandaloneCodeEditor | null>(null);

  const hasContent = value && value.trim().length > 0;

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleClear = () => {
    onChange('');
  };

  const handleEditorMount = (editor: any, monaco: any) => {
    setEditorInstance(editor);
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

  // Update editor options when state changes (if editor is already mounted)
  useEffect(() => {
    if (editorInstance) {
      editorInstance.updateOptions({
        stickyScroll: {
          enabled: stickyScroll,
        },
        renderWhitespace: renderWhitespace ? 'all' : 'none',
        renderControlCharacters: renderControlCharacters,
      });
    }
  }, [editorInstance, stickyScroll, renderWhitespace, renderControlCharacters]);

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

  return (
    <div
      className={cn(
        'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-[10px] overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-0">
        <div className="px-2 py-2.5 text-sm font-medium leading-[1.5] tracking-[0.07px] text-foreground">
          {title}
        </div>
        <div className="flex items-center gap-3">
          {/* Custom header actions */}
          {headerActions}

          {/* Clear Button */}
          {showClearButton && (
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
            value={value}
            onChange={onChange}
            language={language}
            theme={theme}
            wrapText={wrapText}
            readOnly={false}
            placeholder={placeholder}
            height={height}
            onMount={handleEditorMount}
          />
        </div>
      </div>

      {/* Footer */}
      {(footerLeftContent || footerRightContent || (showWrapToggle && onWrapTextChange)) && (
        <div className="flex items-center justify-between px-3 py-2 min-h-[52px] text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-4">
            {/* Editor Settings Menu */}
            {showWrapToggle && onWrapTextChange && (
              <EditorSettingsMenu
                editorInstance={editorInstance}
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
            {footerLeftContent}
          </div>
          {footerRightContent}
        </div>
      )}
    </div>
  );
}

