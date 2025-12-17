/**
 * Monaco Editor Instance Component
 * React component wrapper for Monaco Editor with Shiki integration
 * Uses @monaco-editor/react with dynamic loading
 */

'use client';

import type { CodeEditorTheme } from '@/config/code-editor-themes';
import { getMonacoTheme } from '@/config/monaco-themes';
import { connectShikiToMonaco, isShikiConnectedToMonaco } from '@/libs/monaco-shiki-bridge';
import { createMonacoOptions, getMonacoLanguageId } from '@/libs/monaco-utils';
import { getShikiHighlighter, initializeShiki, isShikiInitialized, loadShikiTheme } from '@/libs/shiki-init';
import { cn } from '@/libs/utils';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

// Dynamic import of Monaco Editor React component
// ssr: false is required because Monaco Editor doesn't work on server
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Loading editor...</p>
        </div>
      </div>
    ),
  }
);

export interface MonacoEditorInstanceProps {
  value: string;
  onChange?: (value: string) => void;
  language?: string;
  theme?: CodeEditorTheme;
  showLineNumbers?: boolean;
  wrapText?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  height?: string;
  className?: string;
  onMount?: (editor: any, monaco: any) => void;
}

/**
 * Monaco Editor Instance Component
 * Wraps @monaco-editor/react with Shiki integration
 */
export function MonacoEditorInstance({
  value = '',
  onChange,
  language = 'plaintext',
  theme = 'basicDark',
  showLineNumbers = true,
  wrapText = true,
  readOnly = false,
  placeholder,
  height = '400px',
  className,
  onMount,
}: MonacoEditorInstanceProps) {
  const [initError, setInitError] = useState<Error | null>(null);
  const initializationRef = useRef(false);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // Get Monaco options (calculate before handleEditorDidMount)
  const monacoTheme = getMonacoTheme(theme);

  // Load theme helper function with proper fallback chain
  const loadThemeSafely = async (monaco: any, themeName: string, currentTheme: CodeEditorTheme): Promise<string> => {
    // First, check if theme is already loaded
    const highlighter = getShikiHighlighter();
    if (highlighter) {
      const loadedThemes = highlighter.getLoadedThemes();
      if (loadedThemes.includes(themeName as any)) {
        return themeName;
      }
    }

    // Try to load the requested theme
    try {
      await loadShikiTheme(themeName);
      return themeName;
    } catch (themeError) {
      // If theme loading fails, try fallback themes in order
      console.warn(`Theme ${themeName} not available, trying fallback`, themeError);

      // Determine if we need light or dark theme
      const isLight = currentTheme.includes('Light') ||
                     currentTheme === 'basicLight' ||
                     currentTheme === 'vscodeLight' ||
                     currentTheme === 'githubLight' ||
                     currentTheme === 'materialLight' ||
                     currentTheme === 'solarizedLight';

      // Fallback chain: try multiple themes in order
      const fallbackThemes = isLight
        ? ['github-light', 'light-plus'] // Light fallbacks
        : ['github-dark', 'dark-plus']; // Dark fallbacks

      for (const fallbackTheme of fallbackThemes) {
        try {
          // Check if already loaded
          if (highlighter) {
            const loaded = highlighter.getLoadedThemes();
            if (loaded.includes(fallbackTheme as any)) {
              return fallbackTheme;
            }
          }

          await loadShikiTheme(fallbackTheme);
          return fallbackTheme;
        } catch (fallbackError) {
          // Try next fallback
          continue;
        }
      }

      // Last resort: use VS Code defaults (these should always be available)
      const defaultTheme = isLight ? 'light-plus' : 'dark-plus';
      console.warn(`All fallback themes failed, using default: ${defaultTheme}`);
      return defaultTheme;
    }
  };

  // Handle editor mount - initialize Shiki and connect to Monaco here
  const handleEditorDidMount = async (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    // Call custom onMount if provided
    onMount?.(editor, monaco);

    // Prevent multiple initializations
    if (initializationRef.current) {
      return;
    }

    try {
      initializationRef.current = true;

      // Initialize Shiki if not already initialized
      if (!isShikiInitialized()) {
        await initializeShiki();
      }

      // Connect Shiki to Monaco if not already connected
      const highlighter = getShikiHighlighter();
      if (highlighter && !isShikiConnectedToMonaco()) {
        await connectShikiToMonaco(monaco, highlighter);
      }

      // Load the current theme if not already loaded
      // This ensures the theme is available before we try to use it
      const loadedTheme = await loadThemeSafely(monaco, monacoTheme, theme);
      if (loadedTheme !== monacoTheme) {
        // Update Monaco theme to the loaded theme (might be fallback)
        monaco.editor.setTheme(loadedTheme);
      }
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to initialize Shiki');
      setInitError(err);
      console.error('Shiki initialization error:', err);
      // Don't block editor from working if Shiki fails
    }

    // Additional setup if needed
    // For example, setting up placeholder
    if (placeholder && !value) {
      // Monaco doesn't have built-in placeholder, but we can add it via CSS or overlay
      // This is handled by the parent component or via styling
    }
  };

  // Handle theme changes dynamically
  useEffect(() => {
    if (!monacoRef.current || !editorRef.current) {
      return;
    }

    const updateTheme = async () => {
      const newTheme = getMonacoTheme(theme);
      try {
        const loadedTheme = await loadThemeSafely(monacoRef.current, newTheme, theme);
        monacoRef.current.editor.setTheme(loadedTheme);
      } catch (error) {
        console.warn('Failed to update theme:', error);
      }
    };

    updateTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme]);

  const monacoOptions = createMonacoOptions(
    language,
    showLineNumbers,
    wrapText,
    readOnly
  );

  // Show error state (only for critical errors)
  if (initError) {
    // Log error but don't block editor - Shiki is optional
    console.warn('Shiki initialization warning:', initError.message);
  }

  // Render Monaco Editor immediately - it will handle its own loading state
  // Shiki initialization happens in onMount callback (non-blocking)
  return (
    <div className={cn('w-full', className)} style={{ height }}>
      <MonacoEditor
        height={height}
        language={getMonacoLanguageId(language)}
        theme={monacoTheme}
        value={value}
        onChange={(newValue) => {
          if (onChange) {
            onChange(newValue || '');
          }
        }}
        options={{
          ...monacoOptions,
          readOnly,
        }}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full min-h-[200px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-sm text-muted-foreground">Loading editor...</p>
            </div>
          </div>
        }
      />
    </div>
  );
}

