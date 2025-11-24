'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { SearchTools } from '@/components/layout/SearchTools';
import { toolCategories } from '@/libs/tools-data';
import { cn } from '@/libs/utils';
import { 
  Menu, 
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

interface MobileMenuProps {
  selectedTool?: string;
  onToolSelect: (toolId: string) => void;
  onHomeClick: () => void;
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

export function MobileMenu({ selectedTool, onToolSelect, onHomeClick }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { theme, setTheme } = useTheme();

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleToolSelect = (toolId: string) => {
    onToolSelect(toolId);
    setIsOpen(false);
  };

  const handleHomeClick = () => {
    onHomeClick();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="fixed top-4 left-4 z-50 p-2 bg-card border shadow-sm"
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-80 p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="p-4 border-b shrink-0">
          <div className="flex items-center gap-0.5">
            {/* Logo */}
            <div className="w-10 h-10 bg-[#ccd0da] dark:bg-[#4c4f69] rounded-[10px] flex items-center justify-center shrink-0">
              <span className="font-bold text-[17.5px] text-[#4c4f69] dark:text-[#ccd0da] leading-[25px]">
                DP
              </span>
            </div>
            {/* Name */}
            <div className="pl-2">
              <SheetTitle className="font-semibold text-[18px] leading-[24px] tracking-normal">
                DevPockit
              </SheetTitle>
              <p className="font-normal text-[14px] leading-[20px] tracking-normal text-[#737373] dark:text-[#a3a3a3]">
                Developer Tools
              </p>
            </div>
          </div>
        </SheetHeader>

        {/* Search Bar */}
        <div className="px-4 py-3 shrink-0">
          <SearchTools onToolSelect={handleToolSelect} />
        </div>

        {/* Categories */}
        <div className="flex-1 overflow-y-auto px-4">
          <div className="space-y-2">
            {/* All tools button */}
            <button
              onClick={handleHomeClick}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md transition-colors hover:bg-muted text-[#171717] dark:text-[#e5e5e5]"
            >
              <Home className="h-[13.25px] w-[13.25px] shrink-0" />
              <span className="flex-1 text-left text-sm font-normal">All tools</span>
            </button>
            
            {/* Separator */}
            <div className="h-px bg-[#f3f4f6] dark:bg-[#262626] my-2" />

            {/* Categories */}
            <div className="space-y-1">
              {toolCategories.map((category) => {
                const isExpanded = expandedCategories.includes(category.id);
                const IconComponent = getCategoryIcon(category.id);

                return (
                  <div key={category.id} className="space-y-1">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-md transition-colors hover:bg-muted text-[#171717] dark:text-[#e5e5e5]"
                    >
                      <IconComponent className="h-[13.25px] w-[13.25px] shrink-0" />
                      <span className="flex-1 text-left text-sm font-normal">{category.name}</span>
                      {isExpanded ? (
                        <ChevronRight className="h-[9.25px] w-[9.25px] shrink-0 rotate-90 transition-transform" />
                      ) : (
                        <ChevronRight className="h-[9.25px] w-[9.25px] shrink-0 transition-transform" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="space-y-1">
                        {category.tools.map((tool) => (
                          <button
                            key={tool.id}
                            onClick={() => handleToolSelect(tool.id)}
                            className={cn(
                              'w-full flex items-center gap-2 px-2 py-2 rounded-md transition-colors text-[#171717] dark:text-[#e5e5e5]',
                              selectedTool === tool.id
                                ? 'bg-muted'
                                : 'hover:bg-muted/50'
                            )}
                          >
                            {/* Tree structure */}
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
              })}
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <div className="p-4 border-t shrink-0">
          <div className="bg-[#f5f5f5] dark:bg-[#262626] rounded-[10px] p-[3px] flex items-center">
            {/* Light mode tab */}
            <button
              onClick={() => setTheme('light')}
              className={cn(
                'flex-1 flex items-center justify-center min-h-[29px] min-w-[29px] px-2 py-1 rounded-[10px] transition-colors',
                theme === 'light' 
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
                theme === 'dark' 
                  ? 'bg-white dark:bg-[#171717] shadow-sm' 
                  : 'bg-transparent'
              )}
              title="Dark mode"
            >
              <Moon className="h-4 w-4 text-[#525252]" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
