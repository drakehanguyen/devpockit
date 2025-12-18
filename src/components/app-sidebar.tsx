"use client"

import { SearchTools } from "@/components/layout/SearchTools"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { CODE_EDITOR_THEMES, type CodeEditorTheme } from '@/config/code-editor-themes'
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme'
import { toolCategories } from "@/libs/tools-data"
import { cn } from "@/libs/utils"
import {
  ArrowLeftRight,
  ChevronRight,
  Code,
  FileText,
  Globe,
  Home,
  Lock,
  Moon,
  PanelLeft,
  RefreshCw,
  Settings,
  Sun,
  type LucideIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import * as React from "react"

// Map category IDs to lucide icons
const getCategoryIcon = (categoryId: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    'text-tools': FileText,
    'formatters': Code,
    'cryptography': Lock,
    'encoders': RefreshCw,
    'converters': ArrowLeftRight,
    'network': Globe,
    'utilities': Settings,
  }
  return iconMap[categoryId] || FileText
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  selectedTool?: string
  onToolSelect?: (toolId: string) => void
  onHomeClick?: () => void
}

export function AppSidebar({
  selectedTool,
  onToolSelect,
  onHomeClick,
  ...props
}: AppSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { state, toggleSidebar } = useSidebar()
  const [codeEditorTheme, setCodeEditorTheme] = useCodeEditorTheme('basicDark')
  const [mounted, setMounted] = React.useState(false)
  const [openCategories, setOpenCategories] = React.useState<Set<string>>(new Set())
  const [isLogoHovered, setIsLogoHovered] = React.useState(false)

  // Avoid hydration mismatch by waiting for client-side mount
  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Determine which category contains the selected tool and auto-expand it
  const getExpandedCategories = React.useMemo(() => {
    if (!selectedTool) return []
    const category = toolCategories.find(cat =>
      cat.tools.some(tool => tool.id === selectedTool)
    )
    return category ? [category.id] : []
  }, [selectedTool])

  // Update open categories when selectedTool changes
  React.useEffect(() => {
    const expandedCategories = getExpandedCategories
    if (expandedCategories.length > 0) {
      setOpenCategories(prev => {
        const newSet = new Set(prev)
        expandedCategories.forEach(catId => newSet.add(catId))
        return newSet
      })
    }
  }, [getExpandedCategories])

  const handleToolSelect = (toolId: string) => {
    if (onToolSelect) {
      onToolSelect(toolId)
    } else {
      const tool = toolCategories
        .flatMap(cat => cat.tools)
        .find(t => t.id === toolId)
      if (tool) {
        router.push(`/tools/${tool.category}/${toolId}`)
      }
    }
  }

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick()
    } else {
      router.push('/')
    }
  }

  const handleCategoryToggle = (categoryId: string, isOpen: boolean) => {
    setOpenCategories(prev => {
      const newSet = new Set(prev)
      if (isOpen) {
        newSet.add(categoryId)
      } else {
        newSet.delete(categoryId)
      }
      return newSet
    })
  }

  const isCollapsed = state === "collapsed"

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  "w-8 h-8 shrink-0 flex items-center justify-center transition-all cursor-pointer",
                  isCollapsed && "hover:bg-sidebar-accent rounded-md"
                )}
                onMouseEnter={() => setIsLogoHovered(true)}
                onMouseLeave={() => setIsLogoHovered(false)}
                onClick={isCollapsed ? toggleSidebar : handleHomeClick}
              >
                {isCollapsed && isLogoHovered ? (
                  <PanelLeft className="h-4 w-4 text-sidebar-foreground" />
                ) : (
                  <Image
                    src="/assets/devpockit-logo.svg"
                    alt="DevPockit Logo"
                    width={32}
                    height={32}
                    className="w-8 h-8"
                  />
                )}
              </div>
            </TooltipTrigger>
            {isCollapsed ? (
              <TooltipContent side="right">
                Expand sidebar
              </TooltipContent>
            ) : (
              <TooltipContent side="right">
                Go to home
              </TooltipContent>
            )}
          </Tooltip>
          <div
            className="flex-1 min-w-0 group-data-[collapsible=icon]:hidden cursor-pointer"
            onClick={handleHomeClick}
          >
            <div className="font-serif text-[24px] leading-[24px] tracking-normal text-sidebar-foreground hover:opacity-80 transition-opacity">
              DevPockit
            </div>
          </div>
          <SidebarTrigger className={cn("ml-auto", isCollapsed && "hidden")} />
        </div>
        <div className="mt-1 group-data-[collapsible=icon]:hidden">
          <SearchTools onToolSelect={handleToolSelect} />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup className="mb-1">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="All tools"
                  isActive={pathname === '/'}
                  onClick={handleHomeClick}
                >
                  <Home className="h-4 w-4" />
                  <span>All tools</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="my-1" />
        {toolCategories.map((category, index) => {
          const IconComponent = getCategoryIcon(category.id)
          const isOpen = openCategories.has(category.id)

          return (
            <SidebarGroup key={category.id} className={index === 0 ? "mt-1" : ""}>
              <SidebarGroupContent>
                <Collapsible
                  asChild
                  open={isOpen}
                  onOpenChange={(open) => handleCategoryToggle(category.id, open)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={category.name}>
                        <IconComponent className="h-4 w-4" />
                        <span>{category.name}</span>
                        <ChevronRight className="ml-auto h-8 w-8 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {category.tools.map((tool) => (
                          <SidebarMenuSubItem key={tool.id}>
                            <SidebarMenuSubButton
                              isActive={tool.id === selectedTool}
                              onClick={() => handleToolSelect(tool.id)}
                            >
                              <span>{tool.name}</span>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
      <SidebarFooter className="px-2 py-2 group-data-[collapsible=icon]:hidden">
        <div className="space-y-2">
          {/* Code Editor Theme Selector */}
          <div className="bg-[#f5f5f5] dark:bg-[#262626] rounded-[10px] p-2">
            <div className="text-xs font-medium text-[#525252] dark:text-[#a3a3a3] mb-1.5 px-1">
              Code Editor Theme
            </div>
            <Select
              value={codeEditorTheme}
              onValueChange={(value) => setCodeEditorTheme(value as CodeEditorTheme)}
            >
              <SelectTrigger className="h-8 w-full text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent container={typeof document !== 'undefined' ? document.body : undefined}>
                {Object.values(CODE_EDITOR_THEMES).map((themeConfig) => (
                  <SelectItem key={themeConfig.name} value={themeConfig.name}>
                    {themeConfig.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dark/Light Mode Toggle */}
          <div className="bg-[#f5f5f5] dark:bg-[#262626] rounded-[10px] p-[3px] flex items-center">
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
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
