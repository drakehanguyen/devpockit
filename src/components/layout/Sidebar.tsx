'use client';

import { Button } from '@/components/ui/button';
import { SearchTools } from '@/components/layout/SearchTools';
import { toolCategories } from '@/libs/tools-data';
import { cn } from '@/libs/utils';
import { type ToolCategory } from '@/types/tools';
import { 
  ArrowLeftToLine, 
  ChevronRight,
  Home,
  Sun,
  Moon,
  FileText,
  Code,
  Lock,
  RefreshCw,
  ArrowLeftRight,
  Globe,
  Settings
} from 'lucide-react';
import React, { useState } from 'react';
import { useTheme } from 'next-themes';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  selectedTool?: string;
  onToolSelect: (toolId: string) => void;
  onHomeClick: () => void;
  className?: string;
}

interface CategoryItemProps {
  category: ToolCategory;
  isCollapsed: boolean;
  selectedTool?: string;
  onToolSelect: (toolId: string) => void;
}

// Map category IDs to lucide icons
const getCategoryIcon = (categoryId: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'text-tools': FileText,
    'formatters': Code,
    'cryptography': Lock,
    'encoders': RefreshCw,
    'converters': ArrowLeftRight,
    'network': Globe,
    'utilities': Settings,
  };
  return iconMap[categoryId] || FileText;
};

const CategoryItem = ({ category, isCollapsed, selectedTool, onToolSelect }: CategoryItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = getCategoryIcon(category.id);

  // Auto-expand category if it contains the selected tool
  React.useEffect(() => {
    if (selectedTool && !isCollapsed) {
      const hasSelectedTool = category.tools.some(tool => tool.id === selectedTool);
      if (hasSelectedTool) {
        setIsExpanded(true);
      }
    }
  }, [selectedTool, category.tools, isCollapsed]);

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center">
        <Button
          variant="ghost"
          size="sm"
          className="w-10 h-10 p-0 rounded-md hover:bg-muted"
          title={category.name}
        >
          <IconComponent className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center gap-2 px-2 py-2.5 rounded-md transition-colors hover:bg-muted',
          'text-[#171717] dark:text-[#e5e5e5]'
        )}
      >
        <IconComponent className="h-4 w-4 shrink-0" />
        <span className="flex-1 text-left text-sm font-normal whitespace-nowrap overflow-hidden text-ellipsis">{category.name}</span>
        {isExpanded ? (
          <ChevronRight className="h-4 w-4 shrink-0 rotate-90 transition-transform" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 transition-transform" />
        )}
      </button>
      
      {isExpanded && (
        <div className="mt-1 space-y-1">
          {category.tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolSelect(tool.id)}
              className={cn(
                'w-full flex items-center gap-2 px-2 py-2 rounded-md transition-colors',
                'text-[#171717] dark:text-[#e5e5e5]',
                selectedTool === tool.id
                  ? 'bg-muted'
                  : 'hover:bg-muted/50'
              )}
            >
              {/* Tree structure - vertical line and leaf */}
              <div className="relative w-5 h-5 shrink-0">
                <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#e5e5e5] dark:bg-[#404040] -translate-x-1/2" />
              </div>
              <span className="flex-1 text-left text-sm font-normal overflow-ellipsis overflow-hidden whitespace-nowrap">
                {tool.name}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export function Sidebar({ isCollapsed, onToggle, selectedTool, onToolSelect, onHomeClick, className }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for client-side mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className={cn(
      'h-full border-r border-[#e5e5e5] dark:border-[#262626] bg-white dark:bg-[#0a0a0a] transition-all duration-300 overflow-hidden flex flex-col',
      isCollapsed ? 'w-16' : 'w-[280px]',
      className
    )}>
      {/* Header with Logo and Collapse button */}
      <div className="flex items-center justify-between px-3 pt-3 pb-4 shrink-0">
        {!isCollapsed && (
          <div className="flex items-center gap-0.5">
            {/* Logo */}
            <div className="w-10 h-10 bg-[#ccd0da] dark:bg-[#4c4f69] rounded-[10px] flex items-center justify-center shrink-0">
              <span className="font-bold text-[17.5px] text-[#4c4f69] dark:text-[#ccd0da] leading-[25px]">
                DP
              </span>
            </div>
            {/* Name */}
            <div className="pl-2">
              <div className="font-semibold text-[18px] leading-[24px] tracking-[-0.36px] text-black dark:text-white">
                DevPockit
              </div>
              <div className="font-normal text-[14px] leading-[20px] tracking-[-0.28px] text-[#737373] dark:text-[#a3a3a3]">
                Developer Tools
              </div>
            </div>
          </div>
        )}
        {/* Collapse button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className={cn(
            'p-0 h-4 w-4 hover:bg-transparent',
            isCollapsed && 'w-full'
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ArrowLeftToLine className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Search Bar */}
      {!isCollapsed && (
        <div className="px-3 pb-4 shrink-0">
          <SearchTools onToolSelect={onToolSelect} />
        </div>
      )}

      {/* Menu */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="space-y-2">
          {/* All tools button */}
          {!isCollapsed && (
            <>
              <button
                onClick={onHomeClick}
                className="w-full flex items-center gap-2 px-2 py-2.5 rounded-md transition-colors hover:bg-muted text-[#171717] dark:text-[#e5e5e5]"
              >
                <Home className="h-4 w-4 shrink-0" />
                <span className="flex-1 text-left text-sm font-normal">All tools</span>
              </button>
              
              {/* Separator */}
              <div className="h-px bg-[#f3f4f6] dark:bg-[#262626] my-2" />
            </>
          )}

          {/* Categories */}
          <div className="space-y-1">
            {toolCategories.map((category) => (
              <CategoryItem
                key={category.id}
                category={category}
                isCollapsed={isCollapsed}
                selectedTool={selectedTool}
                onToolSelect={onToolSelect}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Theme Toggle */}
      {!isCollapsed && (
        <div className="px-3 py-3 shrink-0">
          <div className="bg-[#f5f5f5] dark:bg-[#262626] rounded-[10px] p-[3px] flex items-center">
            {/* Light mode tab */}
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'flex-1 flex items-center justify-center min-h-[29px] min-w-[29px] px-2 py-1 rounded-[10px] transition-colors',
                mounted && theme === 'light' 
                  ? 'bg-white dark:bg-[#171717] shadow-sm' 
                  : 'bg-transparent'
              )}
              title="Light mode"
            >
              <Sun className="h-4 w-4 text-[#525252]" />
            </button>
            {/* Dark mode tab */}
            <button
              onClick={() => setTheme('dark')}
              className={cn(
                'flex-1 flex items-center justify-center min-h-[29px] min-w-[29px] px-2 py-1 rounded-[10px] transition-colors',
                mounted && theme === 'dark' 
                  ? 'bg-white dark:bg-[#171717] shadow-sm' 
                  : 'bg-transparent'
              )}
              title="Dark mode"
            >
              <Moon className="h-4 w-4 text-[#525252]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
