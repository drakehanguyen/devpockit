/**
 * CodeEditorCore Component
 * A minimal Monaco Editor wrapper - just the editor, no chrome
 */

'use client';

import { MonacoEditorInstance } from '@/components/ui/MonacoEditorInstance';
import { type CodeEditorTheme } from '@/config/code-editor-themes';
import { cn } from '@/libs/utils';

export interface CodeEditorCoreProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  theme?: CodeEditorTheme;
  readOnly?: boolean;
  wrapText?: boolean;
  showLineNumbers?: boolean;
  placeholder?: string;
  height?: string;
  className?: string;
}

export function CodeEditorCore({
  value,
  onChange,
  language = 'plaintext',
  theme = 'basicDark',
  readOnly = false,
  wrapText = true,
  showLineNumbers = true,
  placeholder,
  height = '100%',
  className,
}: CodeEditorCoreProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-neutral-900 rounded-[8px] overflow-hidden h-full',
        className
      )}
      style={{ height }}
    >
      <MonacoEditorInstance
        value={value}
        onChange={onChange}
        language={language}
        theme={theme}
        showLineNumbers={showLineNumbers}
        wrapText={wrapText}
        readOnly={readOnly}
        placeholder={placeholder}
        height="100%"
        className="h-full"
        padding={{ top: 8 }}
      />
    </div>
  );
}

