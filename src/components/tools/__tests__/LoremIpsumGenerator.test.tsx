import { fireEvent, render, screen, waitFor } from '@/test-utils/test-utils'
import { LoremIpsumGenerator } from '../LoremIpsumGenerator'

describe('LoremIpsumGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all form controls', () => {
    render(<LoremIpsumGenerator />)

    expect(screen.getByText('Ipsum Type')).toBeInTheDocument()
    expect(screen.getByText('Unit')).toBeInTheDocument()
    expect(screen.getByText('Quantity (1-100)')).toBeInTheDocument()
    expect(screen.getByText('Output Format')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generate text/i })).toBeInTheDocument()
  })

  it('should have default values', () => {
    render(<LoremIpsumGenerator />)

    expect(screen.getByText('🏛️ Latin Lorem Ipsum')).toBeInTheDocument()
    expect(screen.getByText('Words')).toBeInTheDocument()
    expect(screen.getByDisplayValue('10')).toBeInTheDocument()
    expect(screen.getByText('Plain Text')).toBeInTheDocument()
  })

  it('should generate content when generate button is clicked', async () => {
    render(<LoremIpsumGenerator />)

    const generateButton = screen.getByRole('button', { name: /generate text/i })
    fireEvent.click(generateButton)

    await waitFor(() => {
      // Look for copy button which appears after generation
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should update quantity input', () => {
    render(<LoremIpsumGenerator />)

    const quantityInput = screen.getByDisplayValue('10')
    fireEvent.change(quantityInput, { target: { value: '15' } })

    expect(quantityInput).toHaveValue(15)
  })

  it('should allow quantity input changes', () => {
    render(<LoremIpsumGenerator />)

    const quantityInput = screen.getByDisplayValue('10')

    // Test changing to a valid value
    fireEvent.change(quantityInput, { target: { value: '15' } })
    expect(quantityInput).toHaveValue(15)

    // Test changing to another valid value
    fireEvent.change(quantityInput, { target: { value: '50' } })
    expect(quantityInput).toHaveValue(50)
  })

  it('should show loading state during generation', async () => {
    render(<LoremIpsumGenerator />)

    const generateButton = screen.getByRole('button', { name: /generate text/i })
    fireEvent.click(generateButton)

    // Should show loading state briefly
    expect(screen.getByText(/generating content/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText(/generating content/i)).not.toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display output in OutputDisplay component', async () => {
    render(<LoremIpsumGenerator />)

    const generateButton = screen.getByRole('button', { name: /generate text/i })
    fireEvent.click(generateButton)

    await waitFor(() => {
      // Look for copy button which appears after generation
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should handle empty output initially', () => {
    render(<LoremIpsumGenerator />)

    expect(screen.getByText("Click 'Generate Text' to create your Lorem Ipsum content")).toBeInTheDocument()
  })

  it('should render the component without crashing', () => {
    expect(() => render(<LoremIpsumGenerator />)).not.toThrow()
  })
})
