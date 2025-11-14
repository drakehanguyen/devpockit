import { fireEvent, render, screen, waitFor } from '@/test-utils/test-utils'
import { LoremIpsumGenerator } from '../LoremIpsumGenerator'

describe('LoremIpsumGenerator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all form controls', () => {
    render(<LoremIpsumGenerator />)

    // Note: Labels don't exist in the component - it uses Select components without visible labels
    // Verify the form controls exist by checking for the button and selects
    expect(screen.getByRole('button', { name: 'Generate' })).toBeInTheDocument()
    expect(screen.getAllByRole('combobox').length).toBeGreaterThan(0) // Type and Unit selects
    expect(screen.getByRole('spinbutton')).toBeInTheDocument() // Quantity input
  })

  it('should have default values', () => {
    render(<LoremIpsumGenerator />)

    expect(screen.getByText('🏛️ Latin Lorem Ipsum')).toBeInTheDocument()
    expect(screen.getByText('Sentences')).toBeInTheDocument()
    expect(screen.getByDisplayValue('5')).toBeInTheDocument()
    expect(screen.getByText('Plain text')).toBeInTheDocument()
  })

  it('should generate content when generate button is clicked', async () => {
    render(<LoremIpsumGenerator />)

    const generateButton = screen.getByRole('button', { name: 'Generate' })
    fireEvent.click(generateButton)

    await waitFor(() => {
      // Look for copy button which appears after generation
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should update quantity input', () => {
    render(<LoremIpsumGenerator />)

    const quantityInput = screen.getByDisplayValue('5')
    fireEvent.change(quantityInput, { target: { value: '15' } })

    expect(quantityInput).toHaveValue(15)
  })

  it('should allow quantity input changes', () => {
    render(<LoremIpsumGenerator />)

    const quantityInput = screen.getByDisplayValue('5')

    // Test changing to a valid value
    fireEvent.change(quantityInput, { target: { value: '15' } })
    expect(quantityInput).toHaveValue(15)

    // Test changing to another valid value
    fireEvent.change(quantityInput, { target: { value: '50' } })
    expect(quantityInput).toHaveValue(50)
  })

  it('should show loading state during generation', async () => {
    render(<LoremIpsumGenerator />)

    const generateButton = screen.getByRole('button', { name: 'Generate' })
    fireEvent.click(generateButton)

    // Should show loading state briefly - button text changes to "Generating..."
    expect(screen.getByText(/Generating/i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText(/Generating/i)).not.toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should display output in OutputDisplay component', async () => {
    render(<LoremIpsumGenerator />)

    const generateButton = screen.getByRole('button', { name: 'Generate' })
    fireEvent.click(generateButton)

    await waitFor(() => {
      // Look for copy button which appears after generation
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
    }, { timeout: 3000 })
  })

  it('should handle empty output initially', () => {
    render(<LoremIpsumGenerator />)

    expect(screen.getByPlaceholderText(/Click "Generate" to create your Lorem Ipsum content/i)).toBeInTheDocument()
  })

  it('should render the component without crashing', () => {
    expect(() => render(<LoremIpsumGenerator />)).not.toThrow()
  })
})
