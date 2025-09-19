'use client';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toolCategories } from '@/lib/tools-data';
import { cn } from '@/lib/utils';
import { Bars3Icon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface MobileMenuProps {
  selectedTool?: string;
  onToolSelect: (toolId: string) => void;
}

export function MobileMenu({ selectedTool, onToolSelect }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

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

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="p-2">
          <Bars3Icon className="h-6 w-6" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>

      <SheetContent side="left" className="w-80 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">DP</span>
              </div>
              <div>
                <SheetTitle className="text-xl font-bold">DevPockit</SheetTitle>
                <p className="text-sm text-muted-foreground">Developer Tools</p>
              </div>
            </div>
          </SheetHeader>

          {/* Categories */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Tool Categories
              </h2>
              <Separator />
            </div>

            <div className="space-y-3">
              {toolCategories.map((category) => {
                const isExpanded = expandedCategories.includes(category.id);

                return (
                  <div key={category.id} className="space-y-2">
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start p-4 h-auto rounded-lg transition-colors',
                        getCategoryColorClasses(category.color)
                      )}
                      onClick={() => toggleCategory(category.id)}
                    >
                      <span className="text-xl mr-3">{category.icon}</span>
                      <span className="font-medium flex-1 text-left">{category.name}</span>
                      {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5" />
                      ) : (
                        <ChevronRightIcon className="h-5 w-5" />
                      )}
                    </Button>

                    {isExpanded && (
                      <div className="space-y-1 pl-4">
                        {category.tools.map((tool) => (
                          <Button
                            key={tool.id}
                            variant="ghost"
                            size="sm"
                            className={cn(
                              'w-full justify-start pl-4 py-3 h-auto text-sm transition-colors rounded-lg',
                              selectedTool === tool.id
                                ? 'bg-muted text-foreground dark:bg-muted/50'
                                : 'hover:bg-secondary hover:text-foreground'
                            )}
                            onClick={() => handleToolSelect(tool.id)}
                          >
                            <span className="text-lg mr-3">{tool.icon}</span>
                            <span className="flex-1 text-left font-medium">{tool.name}</span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t">
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p className="font-medium">DevPockit v1.0</p>
              <p>Built with Next.js & Tailwind CSS</p>
              <p className="text-xs">Frontend-only tools for optimal performance</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
