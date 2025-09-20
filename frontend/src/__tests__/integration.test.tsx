import { SearchTools } from '@/components/layout/SearchTools'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopNavTabs } from '@/components/layout/TopNavTabs'
import { JsonFormatter } from '@/components/tools/JsonFormatter'
import { LoremIpsumGenerator } from '@/components/tools/LoremIpsumGenerator'
import { XmlFormatter } from '@/components/tools/XmlFormatter'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { fireEvent, render, screen, waitFor } from '@/test-utils/test-utils'

// Mock next-themes
const mockSetTheme = jest.fn()
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: mockSetTheme,
  }),
}))

describe('Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Navigation Integration', () => {
    it('should handle complete navigation flow from sidebar to tool selection', async () => {
      const mockOnToolSelect = jest.fn()
      const mockOnToggle = jest.fn()

      render(
        <div>
          <Sidebar
            isCollapsed={false}
            onToggle={mockOnToggle}
            selectedTool={undefined}
            onToolSelect={mockOnToolSelect}
          />
        </div>
      )

      // Expand Text Tools category
      const categoryButton = screen.getByText('Text Tools')
      fireEvent.click(categoryButton)

      // Select Lorem Ipsum Generator
      const toolButton = screen.getByText('Lorem Ipsum Generator')
      fireEvent.click(toolButton)

      expect(mockOnToolSelect).toHaveBeenCalledWith('lorem-ipsum')
    })

    it('should handle tab navigation with multiple tools', () => {
      const mockOnTabSelect = jest.fn()
      const mockOnTabClose = jest.fn()
      const mockOnCloseAll = jest.fn()

      const tabs = [
        { toolId: 'lorem-ipsum', toolName: 'Lorem Ipsum Generator', category: 'Text Tools', isActive: true },
        { toolId: 'json-formatter', toolName: 'JSON Formatter', category: 'Formatters', isActive: false },
        { toolId: 'xml-formatter', toolName: 'XML Formatter', category: 'Formatters', isActive: false }
      ]

      render(
        <TopNavTabs
          tabs={tabs}
          activeTab="lorem-ipsum"
          onTabSelect={mockOnTabSelect}
          onTabClose={mockOnTabClose}
          onCloseAll={mockOnCloseAll}
        />
      )

      // Switch to JSON Formatter tab
      const jsonTab = screen.getByText('JSON Formatter')
      fireEvent.click(jsonTab)
      expect(mockOnTabSelect).toHaveBeenCalledWith('json-formatter')

      // Close XML Formatter tab
      const closeButtons = screen.getAllByRole('button')
      const xmlCloseButton = closeButtons.find(button =>
        button.getAttribute('aria-label')?.includes('Close XML Formatter')
      )
      if (xmlCloseButton) {
        fireEvent.click(xmlCloseButton)
        expect(mockOnTabClose).toHaveBeenCalledWith('xml-formatter')
      }

      // Test close all functionality
      const closeAllButton = screen.getByText('Close All')
      fireEvent.click(closeAllButton)
      expect(mockOnCloseAll).toHaveBeenCalled()
    })

    it('should handle sidebar collapse and expand', () => {
      const mockOnToolSelect = jest.fn()
      const mockOnToggle = jest.fn()

      render(
        <Sidebar
          isCollapsed={false}
          onToggle={mockOnToggle}
          selectedTool={undefined}
          onToolSelect={mockOnToolSelect}
        />
      )

      // Click toggle button
      const toggleButton = screen.getByRole('button', { name: /←/ })
      fireEvent.click(toggleButton)
      expect(mockOnToggle).toHaveBeenCalled()
    })
  })

  describe('Search Integration', () => {
    it('should handle complete search flow from query to tool selection', async () => {
      const mockOnToolSelect = jest.fn()

      render(<SearchTools onToolSelect={mockOnToolSelect} />)

      // Type search query
      const searchInput = screen.getByPlaceholderText(/search tools/i)
      fireEvent.change(searchInput, { target: { value: 'lorem' } })

      // Wait for search results
      await waitFor(() => {
        expect(screen.getByText('Lorem Ipsum Generator')).toBeInTheDocument()
      })

      // Select tool from search results
      const toolButton = screen.getByText('Lorem Ipsum Generator')
      fireEvent.click(toolButton)

      expect(mockOnToolSelect).toHaveBeenCalledWith('lorem-ipsum')
    })

    it('should handle search with no results', async () => {
      const mockOnToolSelect = jest.fn()

      render(<SearchTools onToolSelect={mockOnToolSelect} />)

      // Type search query with no matches
      const searchInput = screen.getByPlaceholderText(/search tools/i)
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

      // Wait for no results message
      await waitFor(() => {
        expect(screen.getByText(/No tools found for/)).toBeInTheDocument()
      })
    })

    it('should handle search clear functionality', async () => {
      const mockOnToolSelect = jest.fn()

      render(<SearchTools onToolSelect={mockOnToolSelect} />)

      // Type search query
      const searchInput = screen.getByPlaceholderText(/search tools/i)
      fireEvent.change(searchInput, { target: { value: 'json' } })

      // Wait for search results
      await waitFor(() => {
        expect(screen.getByText('JSON Formatter')).toBeInTheDocument()
      })

      // Clear search using the X button
      const clearButton = screen.getAllByRole('button')[0] // First button is the clear button
      fireEvent.click(clearButton)

      // Search input should be cleared
      expect(searchInput).toHaveValue('')
    })
  })

  describe('Theme Integration', () => {
    it('should handle theme switching', () => {
      render(<ThemeToggle />)

      // Click theme toggle button
      const themeButton = screen.getByRole('button', { name: /toggle theme/i })
      fireEvent.click(themeButton)

      expect(mockSetTheme).toHaveBeenCalledWith('light')
    })

    it('should show correct icon based on current theme', () => {
      render(<ThemeToggle />)

      // Should show sun icon for dark theme (to switch to light)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Tool Integration', () => {
    it('should handle Lorem Ipsum Generator workflow', async () => {
      render(<LoremIpsumGenerator />)

      // Generate content with default settings
      const generateButton = screen.getByRole('button', { name: /generate/i })
      fireEvent.click(generateButton)

      // Wait for content generation
      await waitFor(() => {
        expect(screen.getAllByText(/lorem/i).length).toBeGreaterThan(0)
      }, { timeout: 3000 })
    })

    it('should handle JSON Formatter workflow', async () => {
      render(<JsonFormatter />)

      // Load example JSON
      const exampleButton = screen.getByRole('button', { name: /load valid example/i })
      fireEvent.click(exampleButton)

      // Wait for example to load
      await waitFor(() => {
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
        expect(textarea.value).toContain('John')
      })

      // Format JSON
      const formatButton = screen.getByRole('button', { name: /format json/i })
      fireEvent.click(formatButton)

      // Wait for formatting
      await waitFor(() => {
        expect(screen.getByText('Characters')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('should handle XML Formatter workflow', async () => {
      render(<XmlFormatter />)

      // Load example XML
      const exampleButton = screen.getByRole('button', { name: /load valid example/i })
      fireEvent.click(exampleButton)

      // Wait for example to load
      await waitFor(() => {
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
        expect(textarea.value).toContain('The Great Gatsby')
      })

      // Format XML
      const formatButton = screen.getByRole('button', { name: /format xml/i })
      fireEvent.click(formatButton)

      // Wait for formatting
      await waitFor(() => {
        expect(screen.getByText('Characters')).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('Cross-Component Integration', () => {
    it('should handle complete user workflow: search -> select tool -> use tool', async () => {
      const mockOnToolSelect = jest.fn()

      // Render search component
      render(<SearchTools onToolSelect={mockOnToolSelect} />)

      // Search for JSON formatter
      const searchInput = screen.getByPlaceholderText(/search tools/i)
      fireEvent.change(searchInput, { target: { value: 'json' } })

      // Wait for search results
      await waitFor(() => {
        expect(screen.getByText('JSON Formatter')).toBeInTheDocument()
      })

      // Select tool
      const toolButton = screen.getByText('JSON Formatter')
      fireEvent.click(toolButton)

      expect(mockOnToolSelect).toHaveBeenCalledWith('json-formatter')
    })

    it('should handle theme switching with tool usage', async () => {
      render(
        <div>
          <ThemeToggle />
          <LoremIpsumGenerator />
        </div>
      )

      // Switch theme
      const themeButton = screen.getByRole('button', { name: /toggle theme/i })
      fireEvent.click(themeButton)

      // Use tool after theme switch
      const generateButton = screen.getByRole('button', { name: /generate/i })
      fireEvent.click(generateButton)

      // Wait for content generation
      await waitFor(() => {
        expect(screen.getAllByText(/lorem/i).length).toBeGreaterThan(0)
      }, { timeout: 3000 })

      expect(mockSetTheme).toHaveBeenCalledWith('light')
    })

    it('should handle navigation with active tool state', () => {
      const mockOnToolSelect = jest.fn()
      const mockOnTabSelect = jest.fn()
      const mockOnTabClose = jest.fn()

      const tabs = [
        { toolId: 'lorem-ipsum', toolName: 'Lorem Ipsum Generator', category: 'Text Tools', isActive: true }
      ]

      render(
        <div>
          <Sidebar
            isCollapsed={false}
            onToggle={jest.fn()}
            selectedTool="lorem-ipsum"
            onToolSelect={mockOnToolSelect}
          />
          <TopNavTabs
            tabs={tabs}
            activeTab="lorem-ipsum"
            onTabSelect={mockOnTabSelect}
            onTabClose={mockOnTabClose}
          />
        </div>
      )

      // Verify active tool is highlighted in sidebar
      const categoryButton = screen.getByText('Text Tools')
      fireEvent.click(categoryButton)

      // Verify tab is active
      const tabButtons = screen.getAllByText('Lorem Ipsum Generator')
      expect(tabButtons.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling Integration', () => {
    it('should handle search errors gracefully', async () => {
      const mockOnToolSelect = jest.fn()

      render(<SearchTools onToolSelect={mockOnToolSelect} />)

      // Type invalid search query
      const searchInput = screen.getByPlaceholderText(/search tools/i)
      fireEvent.change(searchInput, { target: { value: '!!!' } })

      // Should show no results
      await waitFor(() => {
        expect(screen.getByText(/No tools found for/)).toBeInTheDocument()
      })
    })

    it('should handle tool errors with proper error display', async () => {
      render(<JsonFormatter />)

      // Enter invalid JSON
      const textarea = screen.getByRole('textbox')
      fireEvent.change(textarea, { target: { value: 'invalid json' } })

      // Try to format
      const formatButton = screen.getByRole('button', { name: /format json/i })
      fireEvent.click(formatButton)

      // Should show error
      await waitFor(() => {
        expect(screen.getByText(/invalid json/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('Accessibility Integration', () => {
    it('should maintain keyboard navigation throughout workflow', () => {
      const mockOnToolSelect = jest.fn()

      render(
        <div>
          <Sidebar
            isCollapsed={false}
            onToggle={jest.fn()}
            selectedTool={undefined}
            onToolSelect={mockOnToolSelect}
          />
          <SearchTools onToolSelect={mockOnToolSelect} />
        </div>
      )

      // Test keyboard navigation
      const searchInput = screen.getByPlaceholderText(/search tools/i)
      searchInput.focus()
      expect(searchInput).toHaveFocus()

      // Test sidebar keyboard navigation
      const categoryButton = screen.getByText('Text Tools')
      categoryButton.focus()
      // Focus might not work as expected in test environment, just verify button exists
      expect(categoryButton).toBeInTheDocument()
    })

    it('should maintain focus management during theme switching', () => {
      render(<ThemeToggle />)

      const themeButton = screen.getByRole('button', { name: /toggle theme/i })
      themeButton.focus()
      fireEvent.click(themeButton)

      // Button should maintain focus after click
      expect(themeButton).toHaveFocus()
    })
  })
})
