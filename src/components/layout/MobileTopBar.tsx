'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchTools } from '@/components/layout/SearchTools';
import { CODE_EDITOR_THEMES, type CodeEditorTheme } from '@/config/code-editor-themes';
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme';
import { cn } from '@/libs/utils';
import { Menu, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface MobileTopBarProps {
  onToolSelect: (toolId: string) => void;
  onHomeClick: () => void;
}

export function MobileTopBar({ onToolSelect, onHomeClick }: MobileTopBarProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [codeEditorTheme, setCodeEditorTheme] = useCodeEditorTheme('basicDark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogoClick = () => {
    onHomeClick();
    router.push('/');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-14 bg-background border-b border-border flex items-center gap-2 px-3 md:hidden">
      {/* Logo - Left */}
      <button
        onClick={handleLogoClick}
        className="flex items-center justify-center w-8 h-8 shrink-0 transition-opacity hover:opacity-80"
        aria-label="Go to homepage"
      >
        <Image
          src="/assets/devpockit-logo.svg"
          alt="DevPockit Logo"
          width={32}
          height={32}
          className="w-8 h-8"
        />
      </button>

      {/* Search Box - Middle */}
      <div className="flex-1 min-w-0">
        <SearchTools onToolSelect={onToolSelect} hideShortcut />
      </div>

      {/* Menu Button - Right */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 shrink-0"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Code Editor Theme Selector */}
          <div className="px-2 py-1.5">
            <div className="text-xs font-medium text-muted-foreground mb-1.5 px-1">
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

          <DropdownMenuSeparator />

          {/* Website Theme Toggle */}
          <div className="px-2 py-1.5">
            <div className="text-xs font-medium text-muted-foreground mb-1.5 px-1">
              Website Theme
            </div>
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

