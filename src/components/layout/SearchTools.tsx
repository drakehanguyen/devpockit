'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getCategoryById, searchTools, toolIcons } from '@/libs/tools-data';
import { cn } from '@/libs/utils';
import { type Tool } from '@/types/tools';
import { Search } from 'lucide-react';
import * as React from 'react';
import { startTransition, useEffect, useState } from 'react';

interface SearchToolsProps {
  onToolSelect: (toolId: string) => void;
  className?: string;
  hideShortcut?: boolean;
  onSearchClick?: () => void;
}

interface SearchResultProps {
  tool: Tool;
  onSelect: (toolId: string) => void;
  onClose: () => void;
  isSelected?: boolean;
}

const SearchResult = ({ tool, onSelect, onClose, isSelected = false }: SearchResultProps) => {
  const category = getCategoryById(tool.category);
  const IconComponent = toolIcons[tool.id];
  const [isHovered, setIsHovered] = useState(false);

  const handleSelect = () => {
    onSelect(tool.id);
    onClose();
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            'group bg-white dark:bg-neutral-800 border rounded-md cursor-pointer transition-all duration-200',
            isHovered || isSelected
              ? 'border-orange-600 hover:shadow-md'
              : 'border-neutral-200 dark:border-neutral-700 hover:shadow-md'
          )}
          onClick={handleSelect}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="flex items-center gap-2 p-1.5">
            {/* Icon Section */}
            <div
              className={cn(
                'flex items-center justify-center w-6 h-6 rounded transition-colors duration-200 shrink-0',
                isHovered || isSelected
                  ? 'bg-orange-50 dark:bg-orange-950'
                  : 'bg-neutral-100 dark:bg-neutral-900'
              )}
            >
              {IconComponent ? (
                <IconComponent
                  className={cn(
                    'w-3.5 h-3.5 transition-colors duration-200',
                    isHovered || isSelected
                      ? 'text-orange-600 dark:text-orange-500'
                      : 'text-neutral-400 dark:text-neutral-400'
                  )}
                  strokeWidth={1.5}
                />
              ) : (
                <span className="text-xs">{tool.icon}</span>
              )}
            </div>

            {/* Content Section */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-xs leading-4 text-neutral-900 dark:text-neutral-100 truncate">
                {tool.name}
              </div>
              <div className="mt-0.5">
                <div className="bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded px-1 py-0.5 inline-block">
                  <p className="font-normal text-[9px] leading-3 text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                    {category?.name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs">
        <p>{tool.description}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export function SearchTools({ onToolSelect, className, hideShortcut = false, onSearchClick }: SearchToolsProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tool[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (query.trim().length > 0) {
      const searchResults = searchTools(query);
      startTransition(() => {
        setResults(searchResults);
        setIsOpen(true);
        setSelectedIndex(0); // Reset to first result when query changes
      });
    } else {
      startTransition(() => {
        setResults([]);
        setIsOpen(false);
        setSelectedIndex(0);
      });
    }
  }, [query]);

  // Handle ⌘K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(0);
  };

  const handleSelectTool = (toolId: string) => {
    onToolSelect(toolId);
    handleClear();
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
      inputRef.current?.blur();
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      const toolToSelect = results[selectedIndex];
      if (toolToSelect) {
        handleSelectTool(toolToSelect.id);
      }
    } else if (e.key === 'ArrowDown' && results.length > 0) {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp' && results.length > 0) {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
    }
  };

  const handleInputClick = () => {
    if (onSearchClick) {
      onSearchClick();
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#262626] rounded-lg min-h-[36px] flex items-center">
        <Search className="absolute left-2 h-[15.417px] w-[15.417px] text-[#0a0a0a] dark:text-[#e5e5e5] pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onClick={handleInputClick}
          className={cn(
            "h-[36px] border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer",
            hideShortcut ? "pl-8 pr-2" : "pl-8 pr-12"
          )}
        />
        {!hideShortcut && (
          <div className="absolute right-2 text-sm font-medium text-[#111827] dark:text-[#e5e5e5] leading-[20px] tracking-normal">
            ⌘K
          </div>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <TooltipProvider delayDuration={300}>
          <Card className="absolute top-full left-0 right-0 mt-2 p-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg z-50 max-h-96 overflow-y-auto rounded-md">
            <div className="space-y-0.5">
              <div className="px-2 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {results.length} tool{results.length !== 1 ? 's' : ''} found
              </div>
              {results.map((tool, index) => (
                <SearchResult
                  key={tool.id}
                  tool={tool}
                  onSelect={handleSelectTool}
                  onClose={() => setIsOpen(false)}
                  isSelected={index === selectedIndex}
                />
              ))}
            </div>
          </Card>
        </TooltipProvider>
      )}

      {isOpen && results.length === 0 && query.trim().length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-4 bg-popover border shadow-lg z-50">
          <div className="text-center text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tools found for &ldquo;{query}&rdquo;</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        </Card>
      )}
    </div>
  );
}
