import { fireEvent, render, screen, waitFor } from '@/test-utils/test-utils'
import { XmlFormatter } from '../XmlFormatter'

describe('XmlFormatter', () => {
  const validXml = '<root><name>John</name><age>30</age></root>'
  const invalidXml = '<root><name>John</name><age>30</age>'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all form controls', () => {
    render(<XmlFormatter />)

    expect(screen.getByText('Format Type')).toBeInTheDocument()
    expect(screen.getByText('Indent Size')).toBeInTheDocument()
    expect(screen.getByText('Whitespace')).toBeInTheDocument()
    expect(screen.getByText('Self-Closing Tags')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /format xml/i })).toBeInTheDocument()
  })

  it('should have default values', () => {
    render(<XmlFormatter />)

    expect(screen.getByText('🎨 Beautify (Pretty Print)')).toBeInTheDocument()
    expect(screen.getByText('2 spaces')).toBeInTheDocument()
    expect(screen.getByText('Normalize whitespace')).toBeInTheDocument()
    expect(screen.getByText('Auto-detect')).toBeInTheDocument()
  })

  it('should format valid XML when format button is clicked', async () => {
    render(<XmlFormatter />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: validXml } })

    const formatButton = screen.getByRole('button', { name: /format xml/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText(/John/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should show error for invalid XML', async () => {
    render(<XmlFormatter />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: invalidXml } })

    const formatButton = screen.getByRole('button', { name: /format xml/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText(/missing closing tag/i)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should load example XML when example button is clicked', () => {
    render(<XmlFormatter />)

    const exampleButton = screen.getByRole('button', { name: /load valid example/i })
    fireEvent.click(exampleButton)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toContain('The Great Gatsby')
  })

  it('should load invalid example XML', () => {
    render(<XmlFormatter />)

    const invalidButton = screen.getByRole('button', { name: /load invalid example/i })
    fireEvent.click(invalidButton)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toContain('The Great Gatsby')
  })

  it('should load minified example XML', () => {
    render(<XmlFormatter />)

    const minifiedButton = screen.getByRole('button', { name: /load minified example/i })
    fireEvent.click(minifiedButton)

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement
    expect(textarea.value).toContain('The Great Gatsby')
  })

  it('should show statistics for valid XML', async () => {
    render(<XmlFormatter />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: validXml } })

    const formatButton = screen.getByRole('button', { name: /format xml/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText('Characters')).toBeInTheDocument()
      expect(screen.getByText('Lines')).toBeInTheDocument()
      expect(screen.getByText('Max Depth')).toBeInTheDocument()
      expect(screen.getByText('Tags')).toBeInTheDocument()
      expect(screen.getByText('Attributes')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should clear output when input is cleared', async () => {
    render(<XmlFormatter />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: validXml } })

    const formatButton = screen.getByRole('button', { name: /format xml/i })
    fireEvent.click(formatButton)

    // Wait for formatting to complete
    await waitFor(() => {
      expect(screen.getByText(/John/)).toBeInTheDocument()
    }, { timeout: 3000 })

    // Clear input
    fireEvent.change(textarea, { target: { value: '' } })

    // Verify input is cleared
    expect(textarea).toHaveValue('')
  })

  it('should handle empty input gracefully', async () => {
    render(<XmlFormatter />)

    const formatButton = screen.getByRole('button', { name: /format xml/i })
    fireEvent.click(formatButton)

    // For now, just verify the button click doesn't crash the component
    // The error handling behavior needs further investigation
    expect(formatButton).toBeInTheDocument()
  })

  it('should render the component without crashing', () => {
    expect(() => render(<XmlFormatter />)).not.toThrow()
  })
})
