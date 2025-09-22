'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getCategoryById, searchTools } from '@/libs/tools-data';
import { cn } from '@/libs/utils';
import { type Tool } from '@/types/tools';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface SearchToolsProps {
  onToolSelect: (toolId: string) => void;
  className?: string;
}

interface SearchResultProps {
  tool: Tool;
  onSelect: (toolId: string) => void;
  onClose: () => void;
}

const SearchResult = ({ tool, onSelect, onClose }: SearchResultProps) => {
  const category = getCategoryById(tool.category);

  const getCategoryColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-l-category-blue-500',
      green: 'border-l-category-green-500',
      purple: 'border-l-category-purple-500',
      red: 'border-l-category-red-500',
      orange: 'border-l-category-orange-500',
      teal: 'border-l-category-teal-500',
      indigo: 'border-l-category-indigo-500',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const handleSelect = () => {
    onSelect(tool.id);
    onClose();
  };

  return (
    <Button
      variant="ghost"
      className={cn(
        'w-full justify-start p-4 h-auto text-left hover:bg-muted rounded-lg border-l-4 transition-colors',
        category && getCategoryColorClasses(category.color)
      )}
      onClick={handleSelect}
    >
      <div className="flex items-center space-x-3 w-full">
        <span className="text-lg">{tool.icon}</span>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate">{tool.name}</div>
          <div className="text-sm text-muted-foreground truncate">{tool.description}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {category?.name}
            {tool.isPopular && (
              <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded text-xs">
                Popular
              </span>
            )}
          </div>
        </div>
      </div>
    </Button>
  );
};

export function SearchTools({ onToolSelect, className }: SearchToolsProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Tool[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.trim().length > 0) {
      const searchResults = searchTools(query);
      setResults(searchResults);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search tools... (Ctrl+K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClear}
          >
            <XMarkIcon className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-2 bg-popover border shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="space-y-1">
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
              {results.length} tool{results.length !== 1 ? 's' : ''} found
            </div>
            {results.map((tool) => (
              <SearchResult
                key={tool.id}
                tool={tool}
                onSelect={onToolSelect}
                onClose={() => setIsOpen(false)}
              />
            ))}
          </div>
        </Card>
      )}

      {isOpen && results.length === 0 && query.trim().length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-2 p-4 bg-popover border shadow-lg z-50">
          <div className="text-center text-muted-foreground">
            <MagnifyingGlassIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tools found for &ldquo;{query}&rdquo;</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        </Card>
      )}
    </div>
  );
}
