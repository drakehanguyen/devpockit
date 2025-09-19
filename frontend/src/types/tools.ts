export interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon?: string;
  isPopular?: boolean;
  isActive?: boolean;
}

export interface ToolCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  tools: Tool[];
  isExpanded?: boolean;
}

export interface ActiveTab {
  toolId: string;
  toolName: string;
  category: string;
  isActive: boolean;
}

export type ToolUnit = 'words' | 'sentences' | 'paragraphs';
export type ToolFormat = 'plain' | 'html';
export type IpsumType = 'latin' | 'bacon';

export interface LoremIpsumConfig {
  type: IpsumType;
  unit: ToolUnit;
  count: number;
  format: ToolFormat;
}

export interface ToolResult {
  success: boolean;
  data?: string;
  error?: string;
}
