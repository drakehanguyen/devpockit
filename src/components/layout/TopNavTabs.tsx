'use client';

import { cn } from '@/libs/utils';
import { X } from 'lucide-react';
import { useRef, useState } from 'react';

export interface ActiveTab {
  toolId: string;
  instanceId: string;  // REQUIRED - always present
  toolName: string;
  category: string;
  isActive: boolean;
  displayName: string;  // "JSON Formatter" or "JSON Formatter (2)"
  customName?: string;  // Optional: User-renamed tab name
}

interface TopNavTabsProps {
  tabs: ActiveTab[];
  activeTab?: string;  // toolId of active tab
  onTabSelect: (toolId: string, instanceId: string) => void;
  onTabClose: (toolId: string, instanceId: string) => void;
  onCloseAll?: () => void;
  onTabsReorder?: (tabs: ActiveTab[]) => void;
  className?: string;
}

export function TopNavTabs({ tabs, activeTab, onTabSelect, onTabClose, onCloseAll, onTabsReorder, className }: TopNavTabsProps) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);  // key: toolId:instanceId
  const [draggedTab, setDraggedTab] = useState<string | null>(null);  // key: toolId:instanceId
  const [dragOverTab, setDragOverTab] = useState<string | null>(null);  // key: toolId:instanceId
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper to create unique tab key
  const getTabKey = (toolId: string, instanceId: string) => `${toolId}:${instanceId}`;

  if (tabs.length === 0) {
    return null;
  }

  const handleDragStart = (e: React.DragEvent, toolId: string, instanceId: string) => {
    const tabKey = getTabKey(toolId, instanceId);
    setDraggedTab(tabKey);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tabKey);
  };

  const handleDragOver = (e: React.DragEvent, toolId: string, instanceId: string) => {
    e.preventDefault();
    const tabKey = getTabKey(toolId, instanceId);
    if (draggedTab && draggedTab !== tabKey) {
      setDragOverTab(tabKey);
    }
  };

  const handleDragLeave = () => {
    setDragOverTab(null);
  };

  const handleDrop = (e: React.DragEvent, targetToolId: string, targetInstanceId: string) => {
    e.preventDefault();
    const targetTabKey = getTabKey(targetToolId, targetInstanceId);
    if (!draggedTab || draggedTab === targetTabKey) {
      setDraggedTab(null);
      setDragOverTab(null);
      return;
    }

    const draggedIndex = tabs.findIndex(t => getTabKey(t.toolId, t.instanceId) === draggedTab);
    const targetIndex = tabs.findIndex(t => getTabKey(t.toolId, t.instanceId) === targetTabKey);

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
          const tabKey = getTabKey(tab.toolId, tab.instanceId);
          const isSelected = tab.toolId === activeTab && tab.isActive;
          const isHovered = hoveredTab === tabKey;
          const isDragging = draggedTab === tabKey;
          const isDragOver = dragOverTab === tabKey;
          const showCloseIcon = isSelected || isHovered;
          // Use customName if available, otherwise use displayName
          const tabLabel = tab.customName || tab.displayName;

          return (
            <div
              key={tabKey}
              draggable
              onDragStart={(e) => handleDragStart(e, tab.toolId, tab.instanceId)}
              onDragOver={(e) => handleDragOver(e, tab.toolId, tab.instanceId)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, tab.toolId, tab.instanceId)}
              onDragEnd={handleDragEnd}
              className={cn(
                'flex items-center gap-2 pl-4 pr-3 py-3 border-r border-neutral-200 dark:border-neutral-700 cursor-pointer group transition-all shrink-0',
                isSelected ? 'bg-white dark:bg-neutral-900' : 'bg-transparent hover:bg-accent',
                isDragging && 'opacity-50',
                isDragOver && 'border-l-2 border-l-primary'
              )}
              onMouseEnter={() => setHoveredTab(tabKey)}
              onMouseLeave={() => setHoveredTab(null)}
              onClick={() => onTabSelect(tab.toolId, tab.instanceId)}
            >
              <h2 className={cn(
                "text-sm font-normal tracking-normal whitespace-nowrap select-none",
                isSelected ? "text-neutral-900 dark:text-neutral-100" : "text-foreground"
              )}>
                {tabLabel}
              </h2>
              <button
                className={cn(
                  'shrink-0 transition-all duration-200 p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-700',
                  showCloseIcon ? 'opacity-100' : 'opacity-0'
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onTabClose(tab.toolId, tab.instanceId);
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
