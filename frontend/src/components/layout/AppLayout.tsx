'use client';

import { ToolStateProvider, useToolStateContext } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { getToolById } from '@/lib/tools-data';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { WelcomePage } from '../pages/WelcomePage';
import { MobileMenu } from './MobileMenu';
import { SearchTools } from './SearchTools';
import { Sidebar } from './Sidebar';
import { TopNavTabs, type ActiveTab } from './TopNavTabs';

interface AppLayoutProps {
  children?: React.ReactNode;
}

// Inner component that has access to ToolStateContext
function AppLayoutInner({ children }: AppLayoutProps) {
  const { clearToolState, clearAllToolStates, toolStates } = useToolStateContext();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTabs, setActiveTabs] = useState<ActiveTab[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | undefined>();
  const [isMobile, setIsMobile] = useState(false);
  const [componentKey, setComponentKey] = useState(0);

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+C for copy (when implemented in tools)
      if (e.ctrlKey && e.key === 'c') {
        // This will be handled by individual tools
        return;
      }

      // Escape to close current tool or go to welcome
      if (e.key === 'Escape') {
        if (selectedTool) {
          setSelectedTool(undefined);
        }
      }

      // Ctrl+K for search focus
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder="Search tools..."]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedTool]);

  const handleToolSelect = (toolId: string) => {
    const tool = getToolById(toolId);
    if (!tool) return;

    setSelectedTool(toolId);

    // Add to tabs if not mobile and not already open
    if (!isMobile) {
      const existingTab = activeTabs.find(tab => tab.toolId === toolId);
      if (!existingTab) {
        const newTab: ActiveTab = {
          toolId: toolId,
          toolName: tool.name,
          category: tool.category,
          isActive: true,
        };

        // Set all other tabs as inactive
        const updatedTabs = activeTabs.map(tab => ({ ...tab, isActive: false }));
        setActiveTabs([...updatedTabs, newTab]);
      } else {
        // Just activate the existing tab
        setActiveTabs(tabs =>
          tabs.map(tab => ({ ...tab, isActive: tab.toolId === toolId }))
        );
      }
    }
  };

  const handleTabSelect = (toolId: string) => {
    setSelectedTool(toolId);
    setActiveTabs(tabs =>
      tabs.map(tab => ({ ...tab, isActive: tab.toolId === toolId }))
    );
  };

  const handleTabClose = (toolId: string) => {
    // Clear the tool state when tab is closed (before unmounting)
    clearToolState(toolId);

    const updatedTabs = activeTabs.filter(tab => tab.toolId !== toolId);
    setActiveTabs(updatedTabs);

    if (selectedTool === toolId) {
      if (updatedTabs.length > 0) {
        const lastTab = updatedTabs[updatedTabs.length - 1];
        setSelectedTool(lastTab.toolId);
        setActiveTabs(tabs =>
          tabs.map(tab => ({ ...tab, isActive: tab.toolId === lastTab.toolId }))
        );
      } else {
        setSelectedTool(undefined);
      }
    }

    // Force component remount by changing key
    setComponentKey(prev => prev + 1);
  };

  const handleCloseAllTabs = () => {
    setActiveTabs([]);
    setSelectedTool(undefined);
    // Clear all tool states when closing all tabs
    clearAllToolStates();
    // Force component remount by changing key
    setComponentKey(prev => prev + 1);
  };

  const handleHomeClick = () => {
    setSelectedTool(undefined);
    if (!isMobile) {
      setActiveTabs(tabs => tabs.map(tab => ({ ...tab, isActive: false })));
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mobile menu */}
          {isMobile && (
            <MobileMenu
              selectedTool={selectedTool}
              onToolSelect={handleToolSelect}
            />
          )}

          {/* Logo/Home button */}
          <Button
            variant="ghost"
            onClick={handleHomeClick}
            className="flex items-center space-x-2 px-3"
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">DP</span>
            </div>
            {!isMobile && (
              <div>
                <span className="font-bold">DevPockit</span>
              </div>
            )}
          </Button>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-4">
          <SearchTools onToolSelect={handleToolSelect} />
        </div>

        {/* Header actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
        </div>
      </header>

      {/* Top Navigation Tabs (Desktop only) */}
      {!isMobile && activeTabs.length > 0 && (
        <TopNavTabs
          tabs={activeTabs}
          activeTab={selectedTool}
          onTabSelect={handleTabSelect}
          onTabClose={handleTabClose}
          onCloseAll={handleCloseAllTabs}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar (Desktop only) */}
        {!isMobile && (
          <Sidebar
            isCollapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            selectedTool={selectedTool}
            onToolSelect={handleToolSelect}
          />
        )}

        {/* Content Area */}
        <main className={cn(
          'flex-1 overflow-auto',
          !isMobile && !sidebarCollapsed && 'ml-0',
          !isMobile && sidebarCollapsed && 'ml-0'
        )}>
          {selectedTool ? (
            <div className="h-full">
              {(() => {
                const tool = getToolById(selectedTool);
                if (!tool) return null;

                const ToolComponent = tool.component;
                return (
                  <div className="h-full overflow-auto" key={`${selectedTool}-${componentKey}`}>
                    <ToolComponent />
                  </div>
                );
              })()}
            </div>
          ) : (
            <WelcomePage onToolSelect={handleToolSelect} />
          )}
        </main>
      </div>
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ToolStateProvider>
      <AppLayoutInner>{children}</AppLayoutInner>
    </ToolStateProvider>
  );
}
