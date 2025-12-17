/**
 * EditorPanel Component
 * A reusable editor panel with tabs, code editor, and statistics
 * Supports both input (editable) and output (read-only) modes
 * Based on Figma design specifications
 */

'use client';

import { CodeEditor } from '@/components/ui/CodeEditor';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { type CodeEditorTheme } from '@/config/code-editor-themes';
import { cn } from '@/libs/utils';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export interface EditorPanelTab {
  id: string;
  label: string;
  content: string;
  language?: string; // 'json', 'xml', 'javascript', 'plaintext'
  editable?: boolean; // If true, tab content can be edited (input mode)
}

export interface EditorPanelProps {
  tabs: EditorPanelTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onContentChange?: (content: string, tabId: string) => void; // Called when editable tab content changes
  onCopy?: (content: string, tabId: string) => void;
  showStats?: boolean;
  height?: string; // Default: 374px from Figma
  theme?: CodeEditorTheme;
  wrapText?: boolean;
  onWrapTextChange?: (wrapText: boolean) => void;
  showWrapTextToggle?: boolean;
  className?: string;
}

export function EditorPanel({
  tabs,
  activeTab,
  onTabChange,
  onContentChange,
  onCopy,
  showStats = true,
  height = '374px',
  theme = 'basicDark',
  wrapText = true,
  onWrapTextChange,
  showWrapTextToggle = false,
  className,
}: EditorPanelProps) {
  const [copySuccess, setCopySuccess] = useState(false);

  // Find active tab data
  const activeTabData = tabs.find((tab) => tab.id === activeTab) || tabs[0];
  const isEditable = activeTabData?.editable ?? false;

  const handleCopy = async () => {
    if (!activeTabData?.content) return;

    try {
      await navigator.clipboard.writeText(activeTabData.content);
      setCopySuccess(true);
      onCopy?.(activeTabData.content, activeTabData.id);

      // Reset success state after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter((word) => word.length > 0).length;
  };

  const getCharacterCount = (text: string): number => {
    return text.length;
  };

  const getLineCount = (text: string): number => {
    if (!text) return 0;
    return text.split('\n').length;
  };

  const hasContent = activeTabData?.content && activeTabData.content.trim().length > 0;

  return (
    <div
      className={cn(
        'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-[10px] overflow-hidden',
        className
      )}
    >
      {/* Header with Tabs and Copy Button */}
      <div className="flex items-center justify-between px-3 py-0">
        {/* Tabs */}
        <div className="flex items-center gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'px-2 py-2.5 text-sm font-medium leading-[1.5] tracking-[0.07px] transition-colors border-b-2 -mb-[1px]',
                activeTab === tab.id
                  ? 'text-foreground border-orange-600'
                  : 'text-neutral-600 dark:text-neutral-400 border-transparent hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Wrap Text Toggle */}
          {showWrapTextToggle && onWrapTextChange && (
            <div className="flex items-center gap-2">
              <Label htmlFor="wrap-text" className="text-sm text-muted-foreground cursor-pointer whitespace-nowrap">
                Wrap Text:
              </Label>
              <Switch
                id="wrap-text"
                checked={wrapText}
                onCheckedChange={onWrapTextChange}
                className="h-5 w-9"
              />
            </div>
          )}

          {/* Copy Button */}
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
        </div>
      </div>

      {/* Editor Area */}
      <div className="pt-px pb-1 px-1">
        <div
          className="bg-white dark:bg-neutral-900 rounded-[8px] overflow-hidden"
          style={{ height }}
        >
          <div className="h-full [&>div]:border-0 [&>div]:shadow-none [&>div]:bg-transparent [&>div>div:first-child]:hidden [&>div>div:last-child]:!p-0 [&_div.rounded-lg]:border-0 [&_.cm-scroller]:border-0 [&_.cm-gutter]:border-r-0">
            <CodeEditor
              key={`${activeTab}-${theme}-${wrapText}-${isEditable}`}
              mode={isEditable ? 'input' : 'output'}
              inputValue={isEditable ? activeTabData?.content || '' : undefined}
              outputValue={!isEditable ? activeTabData?.content || '' : undefined}
              onInputChange={isEditable && onContentChange ? (value) => onContentChange(value, activeTab) : undefined}
              language={activeTabData?.language || 'plaintext'}
              theme={theme}
              wrapText={wrapText}
              showStats={false}
              height={height}
              showLineNumbers={true}
              readOnly={!isEditable}
              className="h-full"
              editorPadding={{ top: 8 }}
            />
          </div>
        </div>
      </div>

      {/* Footer with Statistics */}
      {showStats && (
        <div className="px-2 py-2 text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-4">
            <span>{getWordCount(activeTabData?.content || '')} words</span>
            <span>{getCharacterCount(activeTabData?.content || '')} characters</span>
            <span>{getLineCount(activeTabData?.content || '')} lines</span>
          </div>
        </div>
      )}
    </div>
  );
}

