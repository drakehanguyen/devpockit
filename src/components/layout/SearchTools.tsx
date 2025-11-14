'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getCategoryById, searchTools } from '@/libs/tools-data';
import { cn } from '@/libs/utils';
import { type Tool } from '@/types/tools';
import { Search } from 'lucide-react';
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


  const handleSelect = () => {
    onSelect(tool.id);
    onClose();
  };

  return (
    <Button
      variant="ghost"
      className="w-full justify-start p-4 h-auto text-left hover:bg-muted rounded-lg transition-colors"
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
      <div className="relative bg-white dark:bg-[#0a0a0a] border border-[#e5e5e5] dark:border-[#262626] rounded-lg min-h-[36px] flex items-center">
        <Search className="absolute left-2 h-[15.417px] w-[15.417px] text-[#0a0a0a] dark:text-[#e5e5e5] pointer-events-none" />
        <Input
          type="text"
          placeholder="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-8 pr-12 h-[36px] border-0 bg-transparent text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        <div className="absolute right-2 text-sm font-medium text-[#111827] dark:text-[#e5e5e5] leading-[20px] tracking-[-0.28px]">
          ⌘K
        </div>
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
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tools found for &ldquo;{query}&rdquo;</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        </Card>
      )}
    </div>
  );
}
