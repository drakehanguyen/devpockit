'use client';

import { ToolStateProvider, useToolStateContext } from '@/components/providers/ToolStateProvider';
import { SidebarInset, SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { getToolComponent } from '@/libs/tool-components';
import { getToolById } from '@/libs/tools-data';
import { cn } from '@/libs/utils';
import { isValidCategoryUrl, isValidToolUrl, parseToolUrl } from '@/libs/url-utils';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, startTransition } from 'react';
import { AppSidebar } from '../app-sidebar';
import { WelcomePage } from '../pages/WelcomePage';
import { MobileTopBar } from './MobileTopBar';
import { TopNavTabs, type ActiveTab } from './TopNavTabs';

interface AppLayoutProps {
  children?: React.ReactNode;
}

// Dynamic tool renderer component
function DynamicToolRenderer({ toolId }: { toolId: string }) {
  const [ToolComponent, setToolComponent] = useState<React.ComponentType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const tool = getToolById(toolId);
        if (!tool) {
          setError('Tool not found');
          return;
        }
        const component = await getToolComponent(tool.component);
        setToolComponent(() => component as React.ComponentType);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load component');
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [toolId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading tool...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!ToolComponent) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-muted-foreground">Component not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto min-h-0">
      <ToolComponent />
    </div>
  );
}

// Inner component that has access to ToolStateContext
function AppLayoutInner({ children }: AppLayoutProps) {
  const { clearToolState, clearAllToolStates, toolStates } = useToolStateContext();
  const { isMobile } = useSidebar();
  const [activeTabs, setActiveTabs] = useState<ActiveTab[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | undefined>();
  const pathname = usePathname();
  const router = useRouter();

  // Sync URL with selected tool and tabs
  useEffect(() => {
    if (isValidToolUrl(pathname)) {
      const parsed = parseToolUrl(pathname);
      if (parsed) {
        // Update selectedTool and tabs using startTransition for non-urgent updates
        startTransition(() => {
          setSelectedTool(parsed.toolId);

          // Update tabs to reflect the current tool
          if (!isMobile) {
            const tool = getToolById(parsed.toolId);
            if (tool) {
              setActiveTabs(currentTabs => {
                const existingTab = currentTabs.find(tab => tab.toolId === parsed.toolId);
                if (!existingTab) {
                  // Add new tab if it doesn't exist
                  const newTab: ActiveTab = {
                    toolId: parsed.toolId,
                    toolName: tool.name,
                    category: tool.category,
                    isActive: true,
                  };
                  // Keep existing tabs open but inactive, add new active tab
                  const updatedTabs = currentTabs.map(tab => ({ ...tab, isActive: false }));
                  return [...updatedTabs, newTab];
                } else {
                  // Just activate the existing tab - don't modify other tabs
                  return currentTabs.map(tab => ({ ...tab, isActive: tab.toolId === parsed.toolId }));
                }
              });
            }
          }
        });
      }
    } else if (isValidCategoryUrl(pathname)) {
      // Category page - show welcome page for that category
      startTransition(() => {
        setSelectedTool(undefined);
      });
    } else if (pathname === '/') {
      // Home page
      startTransition(() => {
        setSelectedTool(undefined);
      });
    } else {
      // Invalid URL, redirect to home
      router.push('/');
    }
  }, [pathname, router, isMobile]);

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
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
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

    // Navigate to the tool URL - the useEffect will handle tab management
    router.push(`/tools/${tool.category}/${toolId}`);
  };

  const handleTabSelect = (toolId: string) => {
    const tool = getToolById(toolId);
    if (!tool) return;

    // Only navigate if we're not already on this tool's URL
    const currentToolUrl = `/tools/${tool.category}/${toolId}`;
    if (pathname !== currentToolUrl) {
      router.push(currentToolUrl);
    }

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
        // Navigate to the last tab's URL
        const tool = getToolById(lastTab.toolId);
        if (tool) {
          router.push(`/tools/${tool.category}/${lastTab.toolId}`);
        }
      } else {
        setSelectedTool(undefined);
        // Navigate to home when no tabs are left
        router.push('/');
      }
    }
  };

  const handleCloseAllTabs = () => {
    setActiveTabs([]);
    setSelectedTool(undefined);
    // Clear all tool states when closing all tabs
    clearAllToolStates();
    // Navigate to home when closing all tabs
    router.push('/');
  };

  const handleHomeClick = () => {
    router.push('/');
    if (!isMobile) {
      setActiveTabs(tabs => tabs.map(tab => ({ ...tab, isActive: false })));
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Mobile Top Bar */}
      {isMobile && (
        <MobileTopBar
          onToolSelect={handleToolSelect}
          onHomeClick={handleHomeClick}
        />
      )}
      <div className="flex-1 flex overflow-hidden">
        <AppSidebar
          selectedTool={selectedTool}
          onToolSelect={handleToolSelect}
          onHomeClick={handleHomeClick}
        />
        <SidebarInset>
          <div className={cn(
            "flex flex-1 flex-col gap-4 pb-4 min-h-0 overflow-hidden",
            isMobile && "pt-14"
          )}>
            {selectedTool ? (
              <>
                {/* Tool Header with Tabs (Desktop only) */}
                {!isMobile && activeTabs.length > 0 && (
                  <TopNavTabs
                    tabs={activeTabs}
                    activeTab={selectedTool}
                    onTabSelect={handleTabSelect}
                    onTabClose={handleTabClose}
                    onCloseAll={handleCloseAllTabs}
                    onTabsReorder={setActiveTabs}
                  />
                )}
                <DynamicToolRenderer toolId={selectedTool} />
              </>
            ) : (
              <WelcomePage
                onToolSelect={handleToolSelect}
                activeToolIds={activeTabs.map(tab => tab.toolId)}
              />
            )}
          </div>
        </SidebarInset>
      </div>
    </div>
  );
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <ToolStateProvider>
      <SidebarProvider>
        <AppLayoutInner>{children}</AppLayoutInner>
      </SidebarProvider>
    </ToolStateProvider>
  );
}
