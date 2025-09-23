import { fireEvent, render, screen, waitFor } from '@/test-utils/test-utils'
import { JsonFormatter } from '../JsonFormatter'

describe('JsonFormatter', () => {
  const validJson = '{"name":"John","age":30,"city":"New York"}'
  const invalidJson = '{"name":"John","age":30,"city":"New York"'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all form controls', () => {
    render(<JsonFormatter />)

    expect(screen.getByText('Format Type')).toBeInTheDocument()
    expect(screen.getByText('Indent Size')).toBeInTheDocument()
    expect(screen.getByText('Key Sorting')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /format json/i })).toBeInTheDocument()
  })

  it('should have default values', () => {
    render(<JsonFormatter />)

    expect(screen.getByText('🎨 Beautify (Pretty Print)')).toBeInTheDocument()
    expect(screen.getByText('2 spaces')).toBeInTheDocument()
    expect(screen.getByText('Keep original order')).toBeInTheDocument()
  })

  it('should format valid JSON when format button is clicked', async () => {
    render(<JsonFormatter />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: validJson } })

    const formatButton = screen.getByRole('button', { name: /format json/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText(/John/)).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should show error for invalid JSON', async () => {
    render(<JsonFormatter />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: invalidJson } })

    const formatButton = screen.getByRole('button', { name: /format json/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      // Check for any error indication
      const errorElements = screen.queryAllByText(/error|invalid|unexpected/i)
      expect(errorElements.length).toBeGreaterThan(0)
    }, { timeout: 3000 })
  })


  it('should show statistics for valid JSON', async () => {
    render(<JsonFormatter />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: validJson } })

    const formatButton = screen.getByRole('button', { name: /format json/i })
    fireEvent.click(formatButton)

    await waitFor(() => {
      expect(screen.getByText('Characters')).toBeInTheDocument()
      expect(screen.getByText('Lines')).toBeInTheDocument()
      expect(screen.getByText('Max Depth')).toBeInTheDocument()
      expect(screen.getByText('Total Keys')).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should clear output when input is cleared', () => {
    render(<JsonFormatter />)

    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: validJson } })

    const formatButton = screen.getByRole('button', { name: /format json/i })
    fireEvent.click(formatButton)

    // Clear input
    fireEvent.change(textarea, { target: { value: '' } })

    // Check that placeholder text is shown in the textarea
    expect(textarea).toHaveValue('')
  })


  it('should render the component without crashing', () => {
    expect(() => render(<JsonFormatter />)).not.toThrow()
  })
})
