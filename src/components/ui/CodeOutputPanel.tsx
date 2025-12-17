/**
 * CodeOutputPanel Component
 * A read-only code panel with header, Monaco editor, and footer
 * Supports single output or tabbed outputs
 */

'use client';

import { CodeEditorCore } from '@/components/ui/CodeEditorCore';
import { Switch } from '@/components/ui/switch';
import { type CodeEditorTheme } from '@/config/code-editor-themes';
import { cn } from '@/libs/utils';
import { Check, Copy } from 'lucide-react';
import React, { useState } from 'react';

export interface CodeOutputTab {
  id: string;
  label: string;
  value: string;
  language?: string;
}

export interface CodeOutputPanelProps {
  // Single output mode
  title?: string;
  value?: string;
  language?: string;

  // Tabbed output mode
  tabs?: CodeOutputTab[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;

  // Editor settings
  height?: string;
  theme?: CodeEditorTheme;
  wrapText?: boolean;
  onWrapTextChange?: (wrapText: boolean) => void;

  // Optional buttons
  showCopyButton?: boolean;
  showWrapToggle?: boolean;

  // Custom header actions
  headerActions?: React.ReactNode;

  // Footer content - left side (e.g., stats next to wrap toggle)
  footerLeftContent?: React.ReactNode;

  // Footer content - right side
  footerRightContent?: React.ReactNode;

  // Show default stats (words, characters, lines)
  showStats?: boolean;

  // Styling
  className?: string;
}

export function CodeOutputPanel({
  title,
  value,
  language = 'plaintext',
  tabs,
  activeTab,
  onTabChange,
  height = '374px',
  theme = 'basicDark',
  wrapText = true,
  onWrapTextChange,
  showCopyButton = true,
  showWrapToggle = true,
  headerActions,
  footerLeftContent,
  footerRightContent,
  showStats = false,
  className,
}: CodeOutputPanelProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  // Determine if we're in tabbed mode
  const isTabbedMode = tabs && tabs.length > 0;

  // Get current content based on mode
  const currentTab = isTabbedMode ? tabs.find(t => t.id === activeTab) || tabs[0] : null;
  const currentValue = isTabbedMode ? (currentTab?.value || '') : (value || '');
  const currentLanguage = isTabbedMode ? (currentTab?.language || 'plaintext') : language;

  const hasContent = currentValue && currentValue.trim().length > 0;

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
            <div className="px-2 py-2.5 text-sm font-medium leading-[1.5] tracking-[0.07px] text-foreground">
              {title}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Custom header actions */}
          {headerActions}

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
            language={currentLanguage}
            theme={theme}
            wrapText={wrapText}
            readOnly={true}
            height={height}
          />
        </div>
      </div>

      {/* Footer */}
      {(footerLeftContent || footerRightContent || showStats || (showWrapToggle && onWrapTextChange)) && (
        <div className="flex items-center justify-between px-3 py-2 min-h-[52px] text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-4">
            {/* Wrap Text Toggle */}
            {showWrapToggle && onWrapTextChange && (
              <Switch
                checked={wrapText}
                onCheckedChange={onWrapTextChange}
                className="h-5 w-9"
                title="Wrap Text"
              />
            )}
            {/* Stats next to toggle */}
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

