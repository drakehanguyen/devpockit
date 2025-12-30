/**
 * ContentPanel Component
 * A flexible panel with header, custom content area, and footer
 * Can be used for input or output panels with custom content
 * Follows the same structure as CodePanel but allows custom content
 */

'use client';

import { cn } from '@/libs/utils';
import React from 'react';

export interface ContentPanelProps {
  // Content
  title: string;

  // Custom header actions (e.g., Load Example button, camera controls, copy buttons)
  headerActions?: React.ReactNode;

  // Custom body content (children)
  children: React.ReactNode;

  // Footer content - left side
  footerLeftContent?: React.ReactNode;

  // Footer content - right side (e.g., generate button, export buttons)
  footerRightContent?: React.ReactNode;

  // Styling
  className?: string;
  height?: string;

  // Whether to always show footer (default: false, only shows if content exists)
  alwaysShowFooter?: boolean;
}

export function ContentPanel({
  title,
  headerActions,
  children,
  footerLeftContent,
  footerRightContent,
  className,
  height = '500px',
  alwaysShowFooter = false,
}: ContentPanelProps) {
  return (
    <div
      className={cn(
        'bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-[10px] overflow-hidden flex flex-col',
        className
      )}
      style={{ height }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-0">
        <div className="px-2 py-2.5 text-sm font-medium leading-[1.5] tracking-[0.07px] text-foreground">
          {title}
        </div>
        <div className="flex items-center gap-3">
          {/* Custom header actions */}
          {headerActions}
        </div>
      </div>

      {/* Body Area - Custom Content */}
      <div className="pt-px pb-1 px-1 flex-1 overflow-hidden">
        <div className="h-full overflow-auto bg-white dark:bg-neutral-900 rounded-md p-4">
          {children}
        </div>
      </div>

      {/* Footer */}
      {(alwaysShowFooter || footerLeftContent || footerRightContent) && (
        <div className="flex items-center justify-between px-3 py-2 min-h-[52px] text-sm text-neutral-600 dark:text-neutral-400">
          <div className="flex items-center gap-4">
            {footerLeftContent}
          </div>
          {footerRightContent}
        </div>
      )}
    </div>
  );
}

