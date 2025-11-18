/**
 * Code Editor Theme Configuration
 * Defines available themes for CodeMirror editor
 * Themes are independent from the website theme
 */

import { Extension } from '@codemirror/state';
import { basicDark, basicLight } from '@uiw/codemirror-theme-basic';
import { darcula } from '@uiw/codemirror-theme-darcula';
import { githubDark, githubLight } from '@uiw/codemirror-theme-github';
import { materialDark, materialLight } from '@uiw/codemirror-theme-material';
import { monokai } from '@uiw/codemirror-theme-monokai';
import { nord } from '@uiw/codemirror-theme-nord';
import { solarizedDark, solarizedLight } from '@uiw/codemirror-theme-solarized';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';

export type CodeEditorTheme =
  | 'basicLight'
  | 'basicDark'
  | 'vscodeLight'
  | 'vscodeDark'
  | 'githubLight'
  | 'githubDark'
  | 'materialLight'
  | 'materialDark'
  | 'monokai'
  | 'solarizedLight'
  | 'solarizedDark'
  | 'darcula'
  | 'nord';

export interface ThemeConfig {
  name: string;
  label: string;
  extension: Extension;
}

/**
 * Theme mapping
 */
const THEME_MAP: Record<CodeEditorTheme, Extension> = {
  basicLight: basicLight,
  basicDark: basicDark,
  vscodeLight: vscodeLight,
  vscodeDark: vscodeDark,
  githubLight: githubLight,
  githubDark: githubDark,
  materialLight: materialLight,
  materialDark: materialDark,
  monokai: monokai,
  solarizedLight: solarizedLight,
  solarizedDark: solarizedDark,
  darcula: darcula,
  nord: nord,
};

/**
 * Theme configuration with labels
 */
export const CODE_EDITOR_THEMES: Record<CodeEditorTheme, ThemeConfig> = {
  basicLight: {
    name: 'basicLight',
    label: 'Basic Light',
    extension: basicLight,
  },
  basicDark: {
    name: 'basicDark',
    label: 'Basic Dark',
    extension: basicDark,
  },
  vscodeLight: {
    name: 'vscodeLight',
    label: 'VS Code Light',
    extension: vscodeLight,
  },
  vscodeDark: {
    name: 'vscodeDark',
    label: 'VS Code Dark',
    extension: vscodeDark,
  },
  githubLight: {
    name: 'githubLight',
    label: 'GitHub Light',
    extension: githubLight,
  },
  githubDark: {
    name: 'githubDark',
    label: 'GitHub Dark',
    extension: githubDark,
  },
  materialLight: {
    name: 'materialLight',
    label: 'Material Light',
    extension: materialLight,
  },
  materialDark: {
    name: 'materialDark',
    label: 'Material Dark',
    extension: materialDark,
  },
  monokai: {
    name: 'monokai',
    label: 'Monokai',
    extension: monokai,
  },
  solarizedLight: {
    name: 'solarizedLight',
    label: 'Solarized Light',
    extension: solarizedLight,
  },
  solarizedDark: {
    name: 'solarizedDark',
    label: 'Solarized Dark',
    extension: solarizedDark,
  },
  darcula: {
    name: 'darcula',
    label: 'Darcula',
    extension: darcula,
  },
  nord: {
    name: 'nord',
    label: 'Nord',
    extension: nord,
  },
};

/**
 * Get theme extension by name
 */
export function getThemeExtension(theme: CodeEditorTheme): Extension {
  return THEME_MAP[theme] || THEME_MAP.basicDark;
}

/**
 * Get all available themes
 */
export function getAvailableThemes(): CodeEditorTheme[] {
  return Object.keys(CODE_EDITOR_THEMES) as CodeEditorTheme[];
}

/**
 * Get theme configuration
 */
export function getThemeConfig(theme: CodeEditorTheme): ThemeConfig {
  return CODE_EDITOR_THEMES[theme] || CODE_EDITOR_THEMES.basicDark;
}

