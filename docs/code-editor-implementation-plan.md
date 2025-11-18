# CodeMirror 6 Implementation Plan

## Overview
Replace `OutputDisplay.tsx` and `textarea.tsx` with a unified `CodeEditor` component using CodeMirror 6. This component will support both input and output modes, line numbers, and independent theme system.

## Components to Migrate

### Using OutputDisplay:
1. `JsonFormatter.tsx`
2. `JsonYamlConverter.tsx`
3. `XmlFormatter.tsx`
4. `CronParser.tsx`
5. `UuidGenerator.tsx`
6. `UrlEncoder.tsx`
7. `IpCidrConverter.tsx`
8. `IpChecker.tsx`

### Using Textarea:
1. `JsonFormatter.tsx` (also uses OutputDisplay)
2. `JsonYamlConverter.tsx` (also uses OutputDisplay)
3. `XmlFormatter.tsx` (also uses OutputDisplay)
4. `UrlEncoder.tsx` (also uses OutputDisplay)
5. `QrCodeGenerator.tsx`
6. `LoremIpsumGenerator.tsx` (uses raw textarea, not Textarea component)

---

## Implementation Steps

### Phase 1: Setup and Dependencies

#### Step 1.1: Install CodeMirror 6 Dependencies
**Goal**: Install required packages for CodeMirror 6
**Actions**:
- Install `@codemirror/react` (React bindings)
- Install `@codemirror/state` (core state management)
- Install `@codemirror/view` (view layer)
- Install `@codemirror/lang-json` (JSON language support)
- Install `@codemirror/lang-xml` (XML language support)
- Install `@codemirror/lang-javascript` (JavaScript support)
- Install `@codemirror/theme-one-dark` (dark theme)
- Install `@codemirror/theme-one-light` (light theme)
- Install `@codemirror/commands` (editor commands)
- Install `@codemirror/search` (search functionality)

**Command**: `pnpm add @codemirror/react @codemirror/state @codemirror/view @codemirror/lang-json @codemirror/lang-xml @codemirror/lang-javascript @codemirror/theme-one-dark @codemirror/theme-one-light @codemirror/commands @codemirror/search`

**Verification**: Check `package.json` for new dependencies

---

### Phase 2: Core Component Creation

#### Step 2.1: Create Base CodeEditor Component Structure
**Goal**: Create the basic component file with TypeScript interfaces
**File**: `src/components/ui/CodeEditor.tsx`
**Actions**:
- Create file with basic component structure
- Define `CodeEditorProps` interface with all props
- Set up basic component export
- Add placeholder return statement

**Props to include**:
- `inputValue?: string`
- `outputValue?: string`
- `mode?: 'input' | 'output' | 'both'`
- `language?: string` (default: 'plaintext')
- `theme?: string` (default: 'oneDark')
- `showLineNumbers?: boolean` (default: true)
- `readOnly?: boolean` (default: false for input, true for output)
- `onInputChange?: (value: string) => void`
- `onOutputChange?: (value: string) => void`
- `onCopy?: (content: string, type: 'input' | 'output') => void`
- `title?: string`
- `inputTitle?: string`
- `outputTitle?: string`
- `placeholder?: string`
- `error?: string`
- `isLoading?: boolean`
- `showStats?: boolean`
- `className?: string`
- `height?: string`

**Verification**: File exists, TypeScript compiles without errors

---

#### Step 2.2: Implement Basic CodeMirror Editor (Input Mode)
**Goal**: Get a working CodeMirror editor for input mode
**File**: `src/components/ui/CodeEditor.tsx`
**Actions**:
- Import `useCodeMirror` from `@codemirror/react`
- Import basic CodeMirror extensions
- Create input editor instance
- Handle value changes
- Render editor in a container div
- Support basic props: `inputValue`, `onInputChange`, `language`, `readOnly`

**Verification**: Can render input editor, can type and see changes

---

#### Step 2.3: Add Language Support
**Goal**: Support different languages (JSON, XML, plaintext, etc.)
**File**: `src/components/ui/CodeEditor.tsx`
**Actions**:
- Import language packages: `json`, `xml`, `javascript`
- Create language mapping function
- Apply language extension based on `language` prop
- Support: 'json', 'xml', 'javascript', 'plaintext' (default)

**Verification**: Syntax highlighting works for different languages

---

#### Step 2.4: Add Line Numbers Extension
**Goal**: Display line numbers in the editor
**File**: `src/components/ui/CodeEditor.tsx`
**Actions**:
- Import `lineNumbers` from `@codemirror/view`
- Conditionally add line numbers extension based on `showLineNumbers` prop
- Style line numbers appropriately

**Verification**: Line numbers appear on the left side of editor

---

#### Step 2.5: Implement Output Mode
**Goal**: Add read-only output editor
**File**: `src/components/ui/CodeEditor.tsx`
**Actions**:
- Create separate CodeMirror instance for output
- Set read-only mode for output
- Handle `outputValue` prop
- Render output editor when `mode` is 'output' or 'both'

**Verification**: Can display read-only output content

---

#### Step 2.6: Implement Both Mode (Side-by-Side)
**Goal**: Display input and output side-by-side when `mode='both'`
**File**: `src/components/ui/CodeEditor.tsx`
**Actions**:
- Add conditional rendering for both mode
- Use flexbox or grid layout for side-by-side display
- Add responsive design (stack on mobile)
- Add titles for each editor section

**Verification**: Both editors display correctly side-by-side, responsive

---

### Phase 3: Theme System

#### Step 3.1: Create Theme Configuration
**Goal**: Set up theme system independent from site theme
**File**: `src/config/code-editor-themes.ts`
**Actions**:
- Create theme configuration file
- Define available themes: 'oneDark', 'oneLight', 'githubDark', 'githubLight', 'dracula', 'monokai'
- Export theme mapping function
- Import and apply themes from CodeMirror packages

**Verification**: Theme config file exists with proper exports

---

#### Step 3.2: Implement Theme Selector
**Goal**: Add theme selection functionality to CodeEditor
**File**: `src/components/ui/CodeEditor.tsx`
**Actions**:
- Import theme configuration
- Add theme extension to editor instances
- Apply theme based on `theme` prop
- Support theme switching

**Verification**: Editor themes change independently from site theme

---

#### Step 3.3: Add Theme Persistence (Optional Enhancement)
**Goal**: Remember user's theme preference
**File**: `src/components/ui/CodeEditor.tsx` or `src/hooks/useCodeEditorTheme.ts`
**Actions**:
- Create hook to persist theme in localStorage
- Load saved theme on mount
- Allow theme to be changed via prop or hook

**Verification**: Theme preference persists across page reloads

---

### Phase 4: UI Features

#### Step 4.1: Add Copy Functionality
**Goal**: Copy button for input/output content
**File**: `src/components/ui/CodeEditor.tsx`
**Actions**:
- Add copy button in header/toolbar
- Implement copy to clipboard
- Show success feedback (checkmark icon)
- Support copying from both input and output
- Call `onCopy` callback when provided

**Verification**: Copy button works, shows feedback, calls callback

---

#### Step 4.2: Add Statistics Display
**Goal**: Show word count, character count, line count
**File**: `src/components/ui/CodeEditor.tsx`
**Actions**:
- Calculate statistics (words, characters, lines)
- Display stats below editor when `showStats={true}`
- Show stats for both input and output when in 'both' mode
- Style statistics appropriately

**Verification**: Statistics display correctly, update on content change

---

#### Step 4.3: Add Error Display
**Goal**: Show error messages in the component
**File**: `src/components/ui/CodeEditor.tsx`
**Actions**:
- Add error display section
- Style error messages (red background, icon)
- Show error above or below editor
- Clear error when content changes (optional)

**Verification**: Errors display correctly with proper styling

---

#### Step 4.4: Add Loading State
**Goal**: Show loading indicator
**File**: `src/components/ui/CodeEditor.tsx`
**Actions**:
- Add loading spinner/indicator
- Display when `isLoading={true}`
- Overlay or replace editor content during loading
- Style loading state appropriately

**Verification**: Loading state displays correctly

---

#### Step 4.5: Add Placeholder Support
**Goal**: Show placeholder text when editor is empty
**File**: `src/components/ui/CodeEditor.tsx`
**Actions**:
- Use CodeMirror placeholder extension
- Show placeholder when content is empty
- Support different placeholders for input/output

**Verification**: Placeholder appears when editor is empty

---

### Phase 5: Styling and Polish

#### Step 5.1: Match Existing Design System
**Goal**: Style CodeEditor to match current UI components
**File**: `src/components/ui/CodeEditor.tsx`
**Actions**:
- Use existing Card components for container
- Match button styles from existing components
- Use consistent spacing and typography
- Apply Tailwind classes matching project style
- Ensure dark/light mode compatibility (for container, not editor theme)

**Verification**: Component matches existing design system

---

#### Step 5.2: Add Responsive Design
**Goal**: Ensure component works on mobile devices
**File**: `src/components/ui/CodeEditor.tsx`
**Actions**:
- Stack editors vertically on mobile in 'both' mode
- Adjust font sizes for mobile
- Ensure touch interactions work
- Test on various screen sizes

**Verification**: Component is responsive and mobile-friendly

---

#### Step 5.3: Add Custom Scrollbar Styling
**Goal**: Match custom scrollbar styles from OutputDisplay
**File**: `src/components/ui/CodeEditor.tsx` or global CSS
**Actions**:
- Apply custom scrollbar classes
- Ensure scrollbars match existing design
- Test scrollbar appearance

**Verification**: Scrollbars match existing design

---

### Phase 6: Component Migration

#### Step 6.1: Migrate JsonFormatter
**Goal**: Replace Textarea and OutputDisplay in JsonFormatter
**File**: `src/components/tools/JsonFormatter.tsx`
**Actions**:
- Replace `Textarea` import with `CodeEditor`
- Replace `OutputDisplay` import with `CodeEditor`
- Update component to use `CodeEditor` with `mode='both'`
- Set `language='json'`
- Map existing props to new CodeEditor props
- Test functionality

**Verification**: JsonFormatter works with CodeEditor, all features functional

---

#### Step 6.2: Migrate JsonYamlConverter
**Goal**: Replace Textarea and OutputDisplay in JsonYamlConverter
**File**: `src/components/tools/JsonYamlConverter.tsx`
**Actions**:
- Replace imports
- Update to use `CodeEditor` with `mode='both'`
- Set appropriate language based on conversion direction
- Test conversion functionality

**Verification**: JsonYamlConverter works with CodeEditor

---

#### Step 6.3: Migrate XmlFormatter
**Goal**: Replace Textarea and OutputDisplay in XmlFormatter
**File**: `src/components/tools/XmlFormatter.tsx`
**Actions**:
- Replace imports
- Update to use `CodeEditor` with `mode='both'`
- Set `language='xml'`
- Test formatting functionality

**Verification**: XmlFormatter works with CodeEditor

---

#### Step 6.4: Migrate CronParser
**Goal**: Replace OutputDisplay in CronParser
**File**: `src/components/tools/CronParser.tsx`
**Actions**:
- Replace `OutputDisplay` import with `CodeEditor`
- Update to use `CodeEditor` with `mode='output'`
- Set `language='plaintext'`
- Test parsing functionality

**Verification**: CronParser works with CodeEditor

---

#### Step 6.5: Migrate UuidGenerator
**Goal**: Replace OutputDisplay in UuidGenerator
**File**: `src/components/tools/UuidGenerator.tsx`
**Actions**:
- Replace `OutputDisplay` import with `CodeEditor`
- Update to use `CodeEditor` with `mode='output'`
- Set `language='plaintext'`
- Test UUID generation

**Verification**: UuidGenerator works with CodeEditor

---

#### Step 6.6: Migrate UrlEncoder
**Goal**: Replace Textarea and OutputDisplay in UrlEncoder
**File**: `src/components/tools/UrlEncoder.tsx`
**Actions**:
- Replace imports
- Update to use `CodeEditor` with `mode='both'`
- Set `language='plaintext'`
- Test encoding/decoding functionality

**Verification**: UrlEncoder works with CodeEditor

---

#### Step 6.7: Migrate IpCidrConverter
**Goal**: Replace OutputDisplay in IpCidrConverter
**File**: `src/components/tools/IpCidrConverter.tsx`
**Actions**:
- Replace `OutputDisplay` import with `CodeEditor`
- Update to use `CodeEditor` with `mode='output'`
- Set `language='plaintext'`
- Test conversion functionality

**Verification**: IpCidrConverter works with CodeEditor

---

#### Step 6.8: Migrate IpChecker
**Goal**: Replace OutputDisplay in IpChecker
**File**: `src/components/tools/IpChecker.tsx`
**Actions**:
- Replace `OutputDisplay` import with `CodeEditor`
- Update to use `CodeEditor` with `mode='output'`
- Set `language='plaintext'` or 'json' if output is JSON
- Test IP checking functionality

**Verification**: IpChecker works with CodeEditor

---

#### Step 6.9: Migrate QrCodeGenerator
**Goal**: Replace Textarea in QrCodeGenerator
**File**: `src/components/tools/QrCodeGenerator.tsx`
**Actions**:
- Replace `Textarea` import with `CodeEditor`
- Update to use `CodeEditor` with `mode='input'` or 'both' if it has output
- Set appropriate language
- Test QR code generation

**Verification**: QrCodeGenerator works with CodeEditor

---

#### Step 6.10: Migrate LoremIpsumGenerator
**Goal**: Replace raw textarea in LoremIpsumGenerator
**File**: `src/components/tools/LoremIpsumGenerator.tsx`
**Actions**:
- Replace raw `<textarea>` elements with `CodeEditor`
- Update to use `CodeEditor` with `mode='output'`
- Handle tab switching (plain/HTML) appropriately
- Set `language='plaintext'` for plain, `language='html'` for HTML tab
- Test generation functionality

**Verification**: LoremIpsumGenerator works with CodeEditor, tabs work correctly

---

### Phase 7: Cleanup

#### Step 7.1: Remove Old Components
**Goal**: Delete unused components
**Files to delete**:
- `src/components/ui/OutputDisplay.tsx`
- `src/components/ui/textarea.tsx`
- `src/components/ui/__tests__/OutputDisplay.test.tsx` (if exists)

**Actions**:
- Verify all components have been migrated
- Delete OutputDisplay.tsx
- Delete textarea.tsx
- Check for any remaining imports and remove them

**Verification**: No broken imports, old files removed

---

#### Step 7.2: Update Exports (if needed)
**Goal**: Ensure component exports are correct
**File**: `src/components/ui/index.ts` (if exists)
**Actions**:
- Remove OutputDisplay and Textarea exports
- Add CodeEditor export if using barrel exports

**Verification**: Exports are correct

---

#### Step 7.3: Final Testing and Verification
**Goal**: Ensure everything works correctly
**Actions**:
- Test each migrated tool component
- Verify all features work (copy, stats, error handling)
- Check responsive design on mobile
- Verify theme switching works
- Check for console errors
- Verify TypeScript compilation

**Verification**: All tools work correctly, no errors

---

## Summary

**Total Steps**: 28 steps across 7 phases

**Estimated Complexity**:
- Phase 1: Low (package installation)
- Phase 2: Medium (core component)
- Phase 3: Low-Medium (theme system)
- Phase 4: Medium (UI features)
- Phase 5: Low (styling)
- Phase 6: Low-Medium (migration, repetitive)
- Phase 7: Low (cleanup)

**Key Files to Create/Modify**:
- New: `src/components/ui/CodeEditor.tsx`
- New: `src/config/code-editor-themes.ts`
- Modify: 10 tool components
- Delete: 2 old components

**Dependencies to Add**: 10 CodeMirror packages

---

## Notes

- Each step should be small enough for an AI agent to complete in one go
- Steps are ordered to build upon previous work
- Migration steps (Phase 6) can be done in parallel after core component is ready
- Theme system is independent from site theme as requested
- Line numbers are optional but default to true
- Component supports both input and output modes, or both simultaneously

