/**
 * CodeOutputPanel Component
 * A read-only code panel with header, Monaco editor, and footer
 * Supports single output or tabbed outputs
 * Wrapper around CodePanel for backward compatibility
 */

'use client';

import { CodePanel, type CodePanelTab } from '@/components/ui/CodePanel';
import { type CodeEditorTheme } from '@/config/code-editor-themes';
import React from 'react';

// Re-export for backward compatibility
export type CodeOutputTab = CodePanelTab;

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

  // Editor mount callback
  onEditorMount?: (editor: any, monaco: any) => void;
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
  onEditorMount,
}: CodeOutputPanelProps) {
  return (
    <CodePanel
      title={title}
      value={value}
      language={language}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      height={height}
      theme={theme}
      wrapText={wrapText}
      onWrapTextChange={onWrapTextChange}
      readOnly={true}
      showCopyButton={showCopyButton}
      showWrapToggle={showWrapToggle}
      showStats={showStats}
      headerActions={headerActions}
      footerLeftContent={footerLeftContent}
      footerRightContent={footerRightContent}
      onEditorMount={onEditorMount}
      className={className}
    />
  );
}

