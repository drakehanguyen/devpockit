'use client';

import { cn } from '@/libs/utils';
import { X } from 'lucide-react';
import { useRef, useState } from 'react';

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
  onTabsReorder?: (tabs: ActiveTab[]) => void;
  className?: string;
}

export function TopNavTabs({ tabs, activeTab, onTabSelect, onTabClose, onCloseAll, onTabsReorder, className }: TopNavTabsProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [draggedTab, setDraggedTab] = useState<string | null>(null);
  const [dragOverTab, setDragOverTab] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (tabs.length === 0) {
    return null;
  }

  const handleDragStart = (e: React.DragEvent, toolId: string) => {
    setDraggedTab(toolId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', toolId);
  };

  const handleDragOver = (e: React.DragEvent, toolId: string) => {
    e.preventDefault();
    if (draggedTab && draggedTab !== toolId) {
      setDragOverTab(toolId);
    }
  };

  const handleDragLeave = () => {
    setDragOverTab(null);
  };

  const handleDrop = (e: React.DragEvent, targetToolId: string) => {
    e.preventDefault();
    if (!draggedTab || draggedTab === targetToolId) {
      setDraggedTab(null);
      setDragOverTab(null);
      return;
    }

    const draggedIndex = tabs.findIndex(t => t.toolId === draggedTab);
    const targetIndex = tabs.findIndex(t => t.toolId === targetToolId);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const newTabs = [...tabs];
      const [removed] = newTabs.splice(draggedIndex, 1);
      newTabs.splice(targetIndex, 0, removed);
      onTabsReorder?.(newTabs);
    }

    setDraggedTab(null);
    setDragOverTab(null);
  };

  const handleDragEnd = () => {
    setDraggedTab(null);
    setDragOverTab(null);
  };

  return (
    <div className={cn(
      'bg-neutral-100 dark:bg-neutral-800 border-border flex items-center',
      className
    )}>
      {/* Scrollable tabs container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex items-center overflow-x-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600 scrollbar-track-transparent"
        style={{ scrollbarWidth: 'thin' }}
      >
        {tabs.map((tab) => {
          const isSelected = tab.toolId === activeTab;
          const isHovered = hoveredTab === tab.toolId;
          const isDragging = draggedTab === tab.toolId;
          const isDragOver = dragOverTab === tab.toolId;
          const showCloseIcon = isSelected || isHovered;

          return (
            <div
              key={tab.toolId}
              draggable
              onDragStart={(e) => handleDragStart(e, tab.toolId)}
              onDragOver={(e) => handleDragOver(e, tab.toolId)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, tab.toolId)}
              onDragEnd={handleDragEnd}
              className={cn(
                'flex items-center gap-2 pl-4 pr-3 py-3 border-r border-neutral-200 dark:border-neutral-700 cursor-pointer group transition-all shrink-0',
                isSelected ? 'bg-white dark:bg-neutral-900' : 'bg-transparent hover:bg-accent',
                isDragging && 'opacity-50',
                isDragOver && 'border-l-2 border-l-primary'
              )}
              onMouseEnter={() => setHoveredTab(tab.toolId)}
              onMouseLeave={() => setHoveredTab(null)}
              onClick={() => onTabSelect(tab.toolId)}
            >
              <h2 className={cn(
                "text-sm font-normal tracking-normal whitespace-nowrap select-none",
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
      </div>

      {/* Close All button - fixed on the right */}
      {tabs.length > 2 && onCloseAll && (
        <div className="shrink-0 flex items-center px-4 py-3 border-l border-neutral-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800">
          <button
            className="text-xs text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
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
