/**
 * Hook for managing CodeEditor theme persistence
 * Persists theme preference in localStorage
 */

import { type CodeEditorTheme, CODE_EDITOR_THEMES } from '@/config/code-editor-themes';
import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'code-editor-theme';

/**
 * Hook to manage CodeEditor theme with persistence
 * @param defaultTheme - Default theme if none is stored
 * @returns [currentTheme, setTheme] tuple
 */
export function useCodeEditorTheme(defaultTheme: CodeEditorTheme = 'basicDark'): [CodeEditorTheme, (theme: CodeEditorTheme) => void] {
  const [theme, setThemeState] = useState<CodeEditorTheme>(() => {
    // Try to load from localStorage on mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored && stored in CODE_EDITOR_THEMES) {
        return stored as CodeEditorTheme;
      }
    }
    return defaultTheme;
  });

  // Persist theme changes to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    }
  }, [theme]);

  const setTheme = (newTheme: CodeEditorTheme) => {
    setThemeState(newTheme);
  };

  return [theme, setTheme];
}

/**
 * Get the stored theme from localStorage
 * @param defaultTheme - Default theme if none is stored
 * @returns The stored theme or default
 */
export function getStoredTheme(defaultTheme: CodeEditorTheme = 'basicDark'): CodeEditorTheme {
  if (typeof window === 'undefined') {
    return defaultTheme;
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored && stored in CODE_EDITOR_THEMES) {
    return stored as CodeEditorTheme;
  }

  return defaultTheme;
}

/**
 * Clear the stored theme preference
 */
export function clearStoredTheme(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(THEME_STORAGE_KEY);
  }
}

