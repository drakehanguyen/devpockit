'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { toolCategories } from '@/lib/tools-data';
import { cn } from '@/lib/utils';
import { type ToolCategory } from '@/types/tools';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  selectedTool?: string;
  onToolSelect: (toolId: string) => void;
  className?: string;
}

interface CategoryItemProps {
  category: ToolCategory;
  isCollapsed: boolean;
  selectedTool?: string;
  onToolSelect: (toolId: string) => void;
}

const CategoryItem = ({ category, isCollapsed, selectedTool, onToolSelect }: CategoryItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getCategoryColorClasses = (color: string) => {
    const colorMap = {
      blue: 'text-category-blue-600 bg-category-blue-50 hover:bg-category-blue-100 hover:text-category-blue-700 dark:text-category-blue-400 dark:bg-category-blue-950/50 dark:hover:bg-category-blue-900/50 dark:hover:text-category-blue-300',
      green: 'text-category-green-600 bg-category-green-50 hover:bg-category-green-100 hover:text-category-green-700 dark:text-category-green-400 dark:bg-category-green-950/50 dark:hover:bg-category-green-900/50 dark:hover:text-category-green-300',
      purple: 'text-category-purple-600 bg-category-purple-50 hover:bg-category-purple-100 hover:text-category-purple-700 dark:text-category-purple-400 dark:bg-category-purple-950/50 dark:hover:bg-category-purple-900/50 dark:hover:text-category-purple-300',
      red: 'text-category-red-600 bg-category-red-50 hover:bg-category-red-100 hover:text-category-red-700 dark:text-category-red-400 dark:bg-category-red-950/50 dark:hover:bg-category-red-900/50 dark:hover:text-category-red-300',
      orange: 'text-category-orange-600 bg-category-orange-50 hover:bg-category-orange-100 hover:text-category-orange-700 dark:text-category-orange-400 dark:bg-category-orange-950/50 dark:hover:bg-category-orange-900/50 dark:hover:text-category-orange-300',
      teal: 'text-category-teal-600 bg-category-teal-50 hover:bg-category-teal-100 hover:text-category-teal-700 dark:text-category-teal-400 dark:bg-category-teal-950/50 dark:hover:bg-category-teal-900/50 dark:hover:text-category-teal-300',
      indigo: 'text-category-indigo-600 bg-category-indigo-50 hover:bg-category-indigo-100 hover:text-category-indigo-700 dark:text-category-indigo-400 dark:bg-category-indigo-950/50 dark:hover:bg-category-indigo-900/50 dark:hover:text-category-indigo-300',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'w-10 h-10 p-0 rounded-lg transition-colors',
            getCategoryColorClasses(category.color)
          )}
          title={category.name}
        >
          <span className="text-lg">{category.icon}</span>
        </Button>
      </div>
    );
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start p-3 h-auto rounded-lg transition-colors',
            getCategoryColorClasses(category.color)
          )}
        >
          <span className="text-lg mr-3">{category.icon}</span>
          <span className="font-medium flex-1 text-left">{category.name}</span>
          {isExpanded ? (
            <ChevronDownIcon className="h-4 w-4" />
          ) : (
            <ChevronRightIcon className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-1">
        {category.tools.map((tool) => (
          <Button
            key={tool.id}
            variant="ghost"
            size="sm"
            className={cn(
              'w-full justify-start pl-6 py-2 h-auto text-sm transition-colors rounded-md',
              selectedTool === tool.id
                ? 'bg-muted text-foreground dark:bg-muted/50'
                : 'hover:bg-secondary hover:text-foreground'
            )}
            onClick={() => onToolSelect(tool.id)}
          >
            <span className="mr-2">{tool.icon}</span>
            <span className="flex-1 text-left">{tool.name}</span>
          </Button>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
};

export function Sidebar({ isCollapsed, onToggle, selectedTool, onToolSelect, className }: SidebarProps) {
  return (
    <Card className={cn(
      'h-full border-r bg-card transition-all duration-300 overflow-hidden',
      isCollapsed ? 'w-16' : 'w-72',
      className
    )}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">DP</span>
                </div>
                <div>
                  <h1 className="font-bold text-lg">DevPockit</h1>
                  <p className="text-xs text-muted-foreground">Developer Tools</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className={cn(
                'p-2',
                isCollapsed && 'w-full'
              )}
            >
              <span className="text-lg">
                {isCollapsed ? '→' : '←'}
              </span>
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {!isCollapsed && (
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Tool Categories
              </h2>
              <Separator />
            </div>
          )}

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

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t">
            <div className="text-xs text-muted-foreground text-center">
              <p>DevPockit v1.0</p>
              <p>Built with Next.js</p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
