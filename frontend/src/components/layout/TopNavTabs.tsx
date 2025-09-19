'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getToolById } from '@/lib/tools-data';
import { cn } from '@/lib/utils';
import { XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
  if (tabs.length === 0) {
    return null;
  }

  return (
    <Card className={cn('border-b bg-card', className)}>
      <div className="flex items-center">
        <div className="flex items-center overflow-x-auto scrollbar-hide flex-1">
          <div className="flex space-x-1 p-2 min-w-max">
            {tabs.map((tab) => {
              const tool = getToolById(tab.toolId);
              const isActive = activeTab === tab.toolId;

              return (
                <div
                  key={tab.toolId}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 min-w-max border-2 transform',
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary shadow-xl ring-2 ring-primary/30 scale-105 z-10'
                      : 'bg-muted/50 hover:bg-muted border-border hover:scale-102'
                  )}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'p-0 h-auto font-semibold text-sm hover:bg-transparent',
                      isActive ? 'text-primary-foreground hover:text-primary-foreground/80' : 'text-foreground'
                    )}
                    onClick={() => onTabSelect(tab.toolId)}
                  >
                    <span className="mr-2 text-lg">{tool?.icon}</span>
                    <span>{tab.toolName}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'p-0 h-4 w-4 hover:bg-transparent',
                      isActive
                        ? 'text-primary-foreground hover:text-primary-foreground/80'
                        : 'text-muted-foreground hover:text-foreground/80'
                    )}
                    onClick={() => onTabClose(tab.toolId)}
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {tabs.length > 2 && onCloseAll && (
          <div className="flex items-center space-x-2 px-2 flex-shrink-0">
            <div className="text-xs text-muted-foreground">
              {tabs.length} tools open
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={onCloseAll}
              title="Close all tabs"
            >
              <XCircleIcon className="h-3 w-3 mr-1" />
              Close All
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
