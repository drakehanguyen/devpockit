# YAML Path Finder Implementation Plan - Approach 2 (YAML-Native)

## Overview
This document outlines the detailed step-by-step implementation plan for creating a YAML Path Finder tool with native YAML path syntax support. This approach will handle YAML-specific features like anchors, aliases, tags, and multi-document YAML files.

## Table of Contents
1. [Phase 1: Core Library Development](#phase-1-core-library-development)
2. [Phase 2: Configuration & Examples](#phase-2-configuration--examples)
3. [Phase 3: UI Component Development](#phase-3-ui-component-development)
4. [Phase 4: Tree View Component](#phase-4-tree-view-component)
5. [Phase 5: Integration & Routing](#phase-5-integration--routing)

---

## Phase 1: Core Library Development

### Step 1.1: Create YAML Path Finder Library Structure
**File**: `src/libs/yaml-path-finder.ts`

**Deliverables**:
- Create base file with TypeScript interfaces
- Define `YamlPathResult` interface (similar to `JsonPathResult`)
- Define `YamlPathOptions` interface
- Export placeholder functions

**Interfaces to define**:
```typescript
export interface YamlPathResult {
  success: boolean;
  matches: any[];
  paths: string[];
  count: number;
  error?: string;
  anchors?: Map<string, any>; // YAML-specific: anchor definitions
  aliases?: Map<string, string>; // YAML-specific: alias references
}

export interface YamlPathOptions {
  returnPaths: boolean;
  returnValues: boolean;
  formatOutput: boolean;
  handleAnchors: boolean; // YAML-specific option
  handleAliases: boolean; // YAML-specific option
  handleTags: boolean; // YAML-specific option
}

export interface YamlDocument {
  content: any;
  anchors: Map<string, any>;
  aliases: Map<string, string>;
  tags: Map<string, string>;
  lineNumber?: number; // For multi-document support
}
```

**Estimated Time**: 30 minutes

---

### Step 1.2: Implement YAML Parser with Metadata Extraction
**File**: `src/libs/yaml-path-finder.ts` (continued)

**Deliverables**:
- Function to parse YAML and extract anchors, aliases, tags
- Handle multi-document YAML (separated by `---`)
- Store metadata for path evaluation

**Functions to implement**:
```typescript
/**
 * Parse YAML string and extract metadata (anchors, aliases, tags)
 */
export function parseYamlWithMetadata(yamlString: string): {
  documents: YamlDocument[];
  error?: string;
}

/**
 * Extract anchors from parsed YAML document
 */
function extractAnchors(data: any, currentPath: string, anchors: Map<string, any>): void

/**
 * Extract aliases from parsed YAML document
 */
function extractAliases(data: any, currentPath: string, aliases: Map<string, string>): void

/**
 * Extract tags from parsed YAML document
 */
function extractTags(data: any, currentPath: string, tags: Map<string, string>): void
```

**Key Considerations**:
- Use `yaml` library's `parseDocument` API to access anchors/aliases
- Handle both single and multi-document YAML
- Preserve line numbers for better error reporting

**Estimated Time**: 2-3 hours

---

### Step 1.3: Implement YAML Path Parser
**File**: `src/libs/yaml-path-finder.ts` (continued)

**Deliverables**:
- Tokenize YAML path expressions
- Parse path syntax into AST (Abstract Syntax Tree)
- Support YAML-specific path operators

**Path Syntax to Support**:
- `$` - root selector
- `$.key` - property access
- `$.array[0]` - array index
- `$.array[*]` - wildcard
- `$..key` - recursive descent
- `$["key with spaces"]` - bracket notation
- `$.*anchor` - anchor reference (YAML-specific)
- `$.*alias` - alias reference (YAML-specific)
- `$..!!str` - tag selector (YAML-specific)
- `$[0:3]` - array slice

**Functions to implement**:
```typescript
/**
 * Tokenize YAML path expression
 */
function tokenizeYamlPath(path: string): Token[]

/**
 * Parse tokens into AST
 */
function parseYamlPathTokens(tokens: Token[]): PathNode

/**
 * Validate YAML path syntax
 */
export function validateYamlPath(path: string): { isValid: boolean; error?: string }
```

**Token Types**:
```typescript
type TokenType =
  | 'ROOT'           // $
  | 'DOT'            // .
  | 'DOUBLE_DOT'     // ..
  | 'BRACKET_OPEN'   // [
  | 'BRACKET_CLOSE'  // ]
  | 'WILDCARD'       // *
  | 'ANCHOR'         // *anchor (YAML-specific)
  | 'ALIAS'          // *alias (YAML-specific)
  | 'TAG'            // !!str (YAML-specific)
  | 'IDENTIFIER'     // property name
  | 'STRING'         // quoted string
  | 'NUMBER'         // array index
  | 'SLICE'          // [start:end]
```

**Estimated Time**: 4-5 hours

---

### Step 1.4: Implement Core Path Evaluation Engine
**File**: `src/libs/yaml-path-finder.ts` (continued)

**Deliverables**:
- Main evaluation function
- Handle all path operators
- Support YAML-specific features (anchors, aliases, tags)

**Functions to implement**:
```typescript
/**
 * Main function to evaluate YAML path expression
 */
export function evaluateYamlPath(
  yamlData: any,
  path: string,
  options?: YamlPathOptions,
  metadata?: { anchors: Map<string, any>, aliases: Map<string, string>, tags: Map<string, string> }
): YamlPathResult

/**
 * Evaluate path node against data
 */
function evaluatePathNode(
  data: any,
  node: PathNode,
  currentPath: string,
  metadata?: YamlMetadata
): PathEvaluationResult

/**
 * Handle anchor references
 */
function evaluateAnchor(
  data: any,
  anchorName: string,
  remainingPath: string,
  currentPath: string,
  anchors: Map<string, any>
): PathEvaluationResult

/**
 * Handle alias references
 */
function evaluateAlias(
  data: any,
  aliasName: string,
  remainingPath: string,
  currentPath: string,
  aliases: Map<string, string>,
  anchors: Map<string, any>
): PathEvaluationResult

/**
 * Handle tag selectors
 */
function evaluateTag(
  data: any,
  tagName: string,
  remainingPath: string,
  currentPath: string
): PathEvaluationResult

/**
 * Recursive descent operator
 */
function evaluateRecursiveDescent(
  data: any,
  remainingPath: string,
  currentPath: string,
  metadata?: YamlMetadata
): PathEvaluationResult
```

**Key Logic**:
- Similar to JSONPath but with YAML-specific handlers
- Resolve anchors/aliases before path evaluation
- Handle tag matching for YAML types
- Support multi-document YAML (evaluate across all documents)

**Estimated Time**: 6-8 hours

---

### Step 1.5: Implement Result Formatting
**File**: `src/libs/yaml-path-finder.ts` (continued)

**Deliverables**:
- Format results for display
- Support YAML and JSON output formats
- Include metadata in results

**Functions to implement**:
```typescript
/**
 * Format YAML path results for display
 */
export function formatYamlPathResults(
  result: YamlPathResult,
  format: 'json' | 'yaml' = 'json'
): string

/**
 * Format single match with path
 */
function formatMatch(match: any, path: string, index: number): any
```

**Output Format**:
```json
{
  "count": 2,
  "matches": [
    {
      "path": "$.users[0].name",
      "value": "John Doe"
    },
    {
      "path": "$.users[1].name",
      "value": "Jane Smith"
    }
  ],
  "anchors": { ... }, // if options.handleAnchors
  "aliases": { ... }  // if options.handleAliases
}
```

**Estimated Time**: 1-2 hours

---

### Step 1.6: Add Helper Functions
**File**: `src/libs/yaml-path-finder.ts` (continued)

**Deliverables**:
- Reverse lookup (find path for a value)
- Path validation utilities
- YAML-specific utilities

**Functions to implement**:
```typescript
/**
 * Find YAML path for a specific value (reverse lookup)
 */
export function findYamlPath(
  data: any,
  targetValue: any,
  currentPath: string = '$'
): string | null

/**
 * Get all paths in YAML document
 */
export function getAllYamlPaths(data: any, currentPath: string = '$'): string[]

/**
 * Check if path exists in YAML document
 */
export function yamlPathExists(data: any, path: string): boolean
```

**Estimated Time**: 2 hours

**Phase 1 Total Estimated Time**: 16-21 hours

---

## Phase 2: Configuration & Examples

### Step 2.1: Create Configuration File
**File**: `src/config/yaml-path-finder-config.ts`

**Deliverables**:
- Default options
- Common path patterns
- Example YAML documents with paths
- Tips and descriptions

**Content Structure**:
```typescript
export interface YamlPathFinderOptions {
  returnPaths: boolean;
  returnValues: boolean;
  formatOutput: boolean;
  handleAnchors: boolean;
  handleAliases: boolean;
  handleTags: boolean;
}

export const DEFAULT_YAML_PATH_OPTIONS: YamlPathFinderOptions = {
  returnPaths: true,
  returnValues: true,
  formatOutput: true,
  handleAnchors: true,
  handleAliases: true,
  handleTags: false // Optional, less common
};

export const YAML_PATH_EXAMPLES = [
  {
    name: 'Kubernetes ConfigMap',
    yaml: `apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
data:
  key1: value1
  key2: value2`,
    path: '$.data.key1',
    description: 'Access ConfigMap data property'
  },
  {
    name: 'Docker Compose',
    yaml: `services:
  web:
    image: nginx
    ports:
      - "80:80"
  db:
    image: postgres`,
    path: '$..image',
    description: 'Find all image names recursively'
  },
  {
    name: 'YAML with Anchors',
    yaml: `defaults: &defaults
  timeout: 30
  retries: 3

service:
  <<: *defaults
  name: api`,
    path: '$.*defaults',
    description: 'Access anchor definition'
  },
  // ... more examples
];

export const YAML_PATH_COMMON_PATTERNS = [
  {
    pattern: '$.property',
    description: 'Access root property',
    example: '$.name'
  },
  {
    pattern: '$.parent.child',
    description: 'Access nested property',
    example: '$.user.profile.name'
  },
  {
    pattern: '$.array[0]',
    description: 'Access array element by index',
    example: '$.items[0]'
  },
  {
    pattern: '$.array[*]',
    description: 'Access all array elements',
    example: '$.users[*]'
  },
  {
    pattern: '$..property',
    description: 'Recursive descent - find all properties',
    example: '$..name'
  },
  {
    pattern: '$.*anchor',
    description: 'Access anchor definition (YAML-specific)',
    example: '$.*defaults'
  },
  {
    pattern: '$["property"]',
    description: 'Bracket notation for property',
    example: '$["user-name"]'
  }
];

export const YAML_PATH_TIPS = [
  {
    tip: 'Root Selector',
    description: 'Always start with $ to reference the root of the YAML document',
    example: '$.property'
  },
  {
    tip: 'YAML Anchors',
    description: 'Use $.*anchorName to access anchor definitions',
    example: '$.*defaults'
  },
  {
    tip: 'Recursive Descent',
    description: 'Use .. to search recursively through all levels',
    example: '$..image (finds all image properties)'
  }
];
```

**Estimated Time**: 2-3 hours

---

### Step 2.2: Create Example Data
**File**: `src/config/yaml-path-finder-config.ts` (continued)

**Deliverables**:
- Comprehensive example YAML documents
- Cover all YAML features (anchors, aliases, tags, multi-doc)
- Edge cases (empty documents, special characters, etc.)

**Example Cases to Include**:
- Simple key-value pairs
- Nested objects
- Arrays (list and inline)
- Multi-document YAML
- Anchors and aliases
- Tags (!!str, !!int, !!bool, etc.)
- Special characters in keys
- Empty values
- Null values
- Complex nested structures

**Estimated Time**: 1-2 hours

**Phase 2 Total Estimated Time**: 3-5 hours

---

## Phase 3: UI Component Development

### Step 3.1: Create Base Component Structure
**File**: `src/components/tools/YamlPathFinder.tsx`

**Deliverables**:
- Component shell with TypeScript interfaces
- State management setup
- Tool state integration

**Initial Structure**:
```typescript
'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { CodePanel } from '@/components/ui/code-panel';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DEFAULT_YAML_PATH_OPTIONS,
  YAML_PATH_EXAMPLES,
  YAML_PATH_COMMON_PATTERNS,
  type YamlPathFinderOptions
} from '@/config/yaml-path-finder-config';
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme';
import {
  evaluateYamlPath,
  formatYamlPathResults,
  validateYamlPath,
  type YamlPathResult
} from '@/libs/yaml-path-finder';
import { cn } from '@/libs/utils';
import { ArrowPathIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

interface YamlPathFinderProps {
  className?: string;
}

export function YamlPathFinder({ className }: YamlPathFinderProps) {
  // State management
  // Tool state integration
  // Event handlers
  // Render
}
```

**State Variables**:
- `options`: YamlPathFinderOptions
- `yamlInput`: string
- `pathInput`: string
- `output`: string
- `error`: string
- `result`: YamlPathResult | null
- `isEvaluating`: boolean
- `activeTab`: string ('tree' | 'results')
- `isHydrated`: boolean

**Estimated Time**: 1 hour

---

### Step 3.2: Implement Input Section
**File**: `src/components/tools/YamlPathFinder.tsx` (continued)

**Deliverables**:
- YAML input editor (Monaco with YAML language)
- Path input field
- Evaluate button
- Patterns dropdown
- Examples dropdown

**UI Elements**:
- Header with title and description
- Path input with label
- Evaluate button with loading state
- Patterns dropdown menu
- YAML input CodePanel
- Examples dropdown in CodePanel header

**Key Features**:
- YAML syntax highlighting
- Line numbers
- Word wrap toggle
- Clear button
- Character/line count
- Keyboard shortcuts (Ctrl+Enter to evaluate)

**Estimated Time**: 2-3 hours

---

### Step 3.3: Implement Output Section
**File**: `src/components/tools/YamlPathFinder.tsx` (continued)

**Deliverables**:
- Output CodePanel with tabs
- Tree view tab
- Results tab
- Error display
- Match count badge

**Output Tabs**:
1. **Tree View**: Visual representation with highlighted paths
2. **Results**: Formatted JSON/YAML output with matches

**Features**:
- Tab switching
- Copy functionality
- Format toggle (JSON/YAML)
- Match count display
- Highlight matched paths in tree view

**Estimated Time**: 2-3 hours

---

### Step 3.4: Implement Evaluation Logic
**File**: `src/components/tools/YamlPathFinder.tsx` (continued)

**Deliverables**:
- `handleEvaluate` function
- Path validation
- YAML parsing
- Path evaluation
- Error handling
- Result formatting

**Function Flow**:
1. Validate inputs (YAML and path)
2. Parse YAML with metadata extraction
3. Validate path syntax
4. Evaluate path expression
5. Format results
6. Update state
7. Handle errors gracefully

**Error Handling**:
- Invalid YAML format
- Invalid path syntax
- Path not found
- Evaluation errors
- Display user-friendly error messages

**Estimated Time**: 2-3 hours

---

### Step 3.5: Add Example Loading
**File**: `src/components/tools/YamlPathFinder.tsx` (continued)

**Deliverables**:
- Load example button handler
- Load pattern button handler
- Auto-focus path input after pattern load

**Functions**:
```typescript
const handleLoadExample = (example: typeof YAML_PATH_EXAMPLES[0]) => {
  setYamlInput(example.yaml);
  setPathInput(example.path);
  setError('');
  setOutput('');
  setResult(null);
};

const handleLoadPattern = (pattern: typeof YAML_PATH_COMMON_PATTERNS[0]) => {
  setPathInput(pattern.example);
  // Focus path input
};
```

**Estimated Time**: 1 hour

---

### Step 3.6: Add Tool State Persistence
**File**: `src/components/tools/YamlPathFinder.tsx` (continued)

**Deliverables**:
- Hydrate state from toolState on mount
- Update toolState on state changes
- Clear state when tool state is cleared

**Implementation**:
- Use `useToolState` hook
- Sync all state variables
- Handle hydration mismatch
- Persist across navigation

**Estimated Time**: 1 hour

**Phase 3 Total Estimated Time**: 9-12 hours

---

## Phase 4: Tree View Component

### Step 4.1: Create YAML Tree View Component
**File**: `src/components/ui/yaml-tree-view.tsx`

**Deliverables**:
- Component structure similar to JsonTreeView
- YAML-specific node types
- Anchor/alias visualization
- Tag display

**Interfaces**:
```typescript
export interface YamlTreeNode {
  key: string | number;
  value: any;
  path: string;
  type: 'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | 'anchor' | 'alias' | 'tag';
  level: number;
  isExpanded?: boolean;
  children?: YamlTreeNode[];
  parent?: YamlTreeNode;
  anchor?: string; // YAML-specific
  alias?: string; // YAML-specific
  tag?: string; // YAML-specific
  lineNumber?: number; // YAML-specific
}

export interface YamlTreeViewProps {
  data: any;
  highlightedPaths?: string[];
  onPathClick?: (path: string) => void;
  onGetExpandedYaml?: (getExpandedYaml: () => string) => void;
  maxDepth?: number;
  className?: string;
  height?: string;
  anchors?: Map<string, any>; // YAML-specific
  aliases?: Map<string, string>; // YAML-specific
}
```

**Estimated Time**: 1-2 hours

---

### Step 4.2: Implement Tree Transformation
**File**: `src/components/ui/yaml-tree-view.tsx` (continued)

**Deliverables**:
- Transform YAML data to tree nodes
- Handle anchors and aliases
- Display tags
- Preserve line numbers

**Functions**:
```typescript
function transformToYamlTreeNodes(
  data: any,
  key: string | number = 'root',
  path: string = '$',
  level: number = 0,
  maxDepth: number = 3,
  parent?: YamlTreeNode,
  anchors?: Map<string, any>,
  aliases?: Map<string, string>
): YamlTreeNode[]
```

**Key Features**:
- Detect anchor definitions (`&anchor`)
- Detect alias references (`*alias`)
- Detect tags (`!!str`, `!!int`, etc.)
- Handle multi-document YAML
- Preserve YAML structure

**Estimated Time**: 3-4 hours

---

### Step 4.3: Implement Tree Rendering
**File**: `src/components/ui/yaml-tree-view.tsx` (continued)

**Deliverables**:
- Render tree nodes with expand/collapse
- Highlight matched paths
- Display anchor/alias indicators
- Show tags
- Line number display

**Visual Indicators**:
- Anchor: `&anchor` badge
- Alias: `*alias` badge with link
- Tag: `!!tag` badge
- Highlighted path: Background color
- Matched node: Border highlight

**Estimated Time**: 3-4 hours

---

### Step 4.4: Add Interactive Features
**File**: `src/components/ui/yaml-tree-view.tsx` (continued)

**Deliverables**:
- Click path to copy
- Expand/collapse nodes
- Search functionality
- Scroll to highlighted path

**Features**:
- Click handler for path copying
- Keyboard navigation
- Search/filter nodes
- Auto-scroll to matches

**Estimated Time**: 2-3 hours

**Phase 4 Total Estimated Time**: 9-13 hours

---

## Phase 5: Integration & Routing

### Step 5.1: Register Tool in Tools Data
**File**: `src/libs/tools-data.ts`

**Deliverables**:
- Add YAML Path Finder to appropriate category
- Set icon, description, metadata
- Mark as popular (optional)

**Add to Category**:
- Category: `data-tools` or `text-tools`
- Icon: Search or similar
- Description: "Query and extract data from YAML using YAMLPath expressions"
- Path: `/tools/data-tools/yaml-path-finder`
- Component: `YamlPathFinder`

**Code Addition**:
```typescript
{
  id: 'yaml-path-finder',
  name: 'YAML Path Finder',
  description: 'Query and extract data from YAML using YAMLPath expressions',
  category: 'data-tools',
  icon: '🔍',
  isPopular: true,
  path: '/tools/data-tools/yaml-path-finder',
  component: 'YamlPathFinder',
  supportsDesktop: true,
  supportsMobile: true,
}
```

**Estimated Time**: 30 minutes

---

### Step 5.2: Register Component Loader
**File**: `src/libs/tool-components.ts`

**Deliverables**:
- Add dynamic import for YamlPathFinder component

**Code Addition**:
```typescript
'YamlPathFinder': () => import('@/components/tools/YamlPathFinder').then(m => m.YamlPathFinder),
```

**Estimated Time**: 15 minutes

---

### Step 5.3: Add Icon Mapping
**File**: `src/libs/tools-data.ts` (icon mapping section)

**Deliverables**:
- Add icon for YAML Path Finder

**Code Addition**:
```typescript
'yaml-path-finder': ScanSearch, // or appropriate icon
```

**Estimated Time**: 15 minutes

---

### Step 5.4: Test Routing
**Deliverables**:
- Verify tool appears in sidebar
- Test navigation to tool
- Verify URL routing works
- Test tool state persistence

**Estimated Time**: 30 minutes

**Phase 5 Total Estimated Time**: 1.5 hours

---

## Summary

### Total Estimated Time
- **Phase 1**: 16-21 hours
- **Phase 2**: 3-5 hours
- **Phase 3**: 9-12 hours
- **Phase 4**: 9-13 hours
- **Phase 5**: 1.5 hours

**Grand Total**: 38.5-52.5 hours (~5-7 working days)

### Dependencies
- `yaml` library (already installed)
- Monaco Editor (already configured)
- Existing UI components (CodePanel, Button, Input, etc.)
- Tool state provider (already exists)

### Risk Factors
1. **YAML Path Syntax Complexity**: Creating a custom parser is complex
   - **Mitigation**: Start with JSONPath-compatible syntax, add YAML features incrementally

2. **Anchor/Alias Handling**: YAML anchors and aliases are complex
   - **Mitigation**: Use `yaml` library's document API for metadata extraction

3. **Multi-Document Support**: Handling multiple YAML documents
   - **Mitigation**: Parse each document separately, evaluate across all

4. **Performance**: Large YAML files may be slow
   - **Mitigation**: Use virtualization for tree view, optimize path evaluation

### Success Criteria
- ✅ All path syntax features work correctly
- ✅ YAML-specific features (anchors, aliases, tags) are supported
- ✅ UI matches JSON Path Finder design
- ✅ No linting errors
- ✅ TypeScript strict mode passes
- ✅ Responsive design works on mobile/tablet/desktop
- ✅ Performance is acceptable for large files

### Next Steps After Implementation
1. Gather user feedback
2. Add advanced features (filter expressions, path suggestions)
3. Add export functionality (export results as YAML/JSON)
4. Add path history/bookmarks
5. Add path validation with suggestions

---

## Implementation Order Recommendation

**Week 1**:
- Phase 1 (Core Library) - Days 1-3
- Phase 2 (Configuration) - Day 4
- Phase 3 (UI Component) - Day 5

**Week 2**:
- Phase 4 (Tree View) - Days 1-2
- Phase 5 (Integration) - Day 2

---

## Questions to Consider

1. **Path Syntax**: Should we use JSONPath-compatible syntax or create YAML-native syntax?
   - **Recommendation**: Start JSONPath-compatible, add YAML extensions

2. **Multi-Document**: How should we handle multiple YAML documents?
   - **Recommendation**: Evaluate across all documents, show document index in paths

3. **Anchors/Aliases**: Should we resolve aliases automatically or show them as references?
   - **Recommendation**: Resolve automatically, but show indicator in tree view

4. **Tags**: Should we support tag-based selection?
   - **Recommendation**: Yes, but make it optional (advanced feature)

5. **Performance**: What's the maximum file size we should support?
   - **Recommendation**: Start with 1MB, optimize later if needed

---

**End of Implementation Plan**

