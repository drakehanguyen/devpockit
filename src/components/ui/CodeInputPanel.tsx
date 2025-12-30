/**
 * CodeInputPanel Component
 * An editable code panel with header, Monaco editor, and footer
 * Wrapper around CodePanel for backward compatibility
 */

'use client';

import { CodePanel } from '@/components/ui/CodePanel';
import { type CodeEditorTheme } from '@/config/code-editor-themes';
import React from 'react';

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
  return (
    <CodePanel
      title={title}
      value={value}
      onChange={onChange}
      language={language}
      height={height}
      theme={theme}
      wrapText={wrapText}
      onWrapTextChange={onWrapTextChange}
      placeholder={placeholder}
      readOnly={false}
      showCopyButton={showCopyButton}
      showClearButton={showClearButton}
      showWrapToggle={showWrapToggle}
      headerActions={headerActions}
      footerLeftContent={footerLeftContent}
      footerRightContent={footerRightContent}
      onEditorMount={onEditorMount}
      className={className}
    />
  );
}

