'use client';

import { cn } from '@/libs/utils';
import { X } from 'lucide-react';
import { useState } from 'react';

export interface ActiveTab {
  toolId: string;
  toolName: string;
  category: string;
  isActive: boolean;
}

interface TopNavTabsProps {
  tabs: ActiveTab[];
  activeTab?: string;
  onTabSelect: (toolId: string) => void;
  onTabClose: (toolId: string) => void;
  onCloseAll?: () => void;
  className?: string;
}

export function TopNavTabs({ tabs, activeTab, onTabSelect, onTabClose, onCloseAll, className }: TopNavTabsProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);

  if (tabs.length === 0) {
    return null;
  }

  return (
    <div className={cn(
      'bg-neutral-100 dark:bg-neutral-800 border-border flex items-center',
      className
    )}>
      {/* Render all tabs horizontally */}
      {tabs.map((tab) => {
        const isSelected = tab.toolId === activeTab;
        const isHovered = hoveredTab === tab.toolId;
        const showCloseIcon = isSelected || isHovered;

        return (
          <div
            key={tab.toolId}
            className={cn(
              'flex items-center gap-2 pl-4 pr-3 py-3 border-r border-neutral-200 dark:border-neutral-700 cursor-pointer group transition-colors',
              isSelected ? 'bg-white dark:bg-neutral-900' : 'bg-transparent hover:bg-accent'
            )}
            onMouseEnter={() => setHoveredTab(tab.toolId)}
            onMouseLeave={() => setHoveredTab(null)}
            onClick={() => onTabSelect(tab.toolId)}
          >
            <h2 className={cn(
              "text-sm font-normal tracking-normal whitespace-nowrap",
              isSelected ? "text-neutral-900 dark:text-neutral-100" : "text-foreground"
            )}>
              {tab.toolName}
            </h2>
            <button
              className={cn(
                'shrink-0 transition-all duration-200 p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700',
                showCloseIcon ? 'opacity-100' : 'opacity-0'
              )}
              onClick={(e) => {
                e.stopPropagation();
                onTabClose(tab.toolId);
              }}
              title="Close tool"
            >
              <X className="h-3.5 w-3.5 text-foreground" />
            </button>
          </div>
        );
      })}

      {/* Close All button (optional, show when multiple tabs) */}
      {tabs.length > 2 && onCloseAll && (
        <div className="ml-auto flex items-center px-4 py-3">
          <button
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={onCloseAll}
            title="Close all tabs"
          >
            Close All
          </button>
        </div>
      )}
    </div>
  );
}
