import { fireEvent, render, screen, waitFor } from '@/test-utils/test-utils'
import { OutputDisplay } from '../OutputDisplay'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
})

describe('OutputDisplay', () => {
  const defaultProps = {
    content: 'Test output content',
    onCopy: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render output content', () => {
    render(<OutputDisplay {...defaultProps} />)

    expect(screen.getByText('Test output content')).toBeInTheDocument()
  })

  it('should display copy button', () => {
    render(<OutputDisplay {...defaultProps} />)

    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
  })

  it('should call onCopy when copy button is clicked', async () => {
    render(<OutputDisplay {...defaultProps} />)

    const copyButton = screen.getByRole('button', { name: /copy/i })
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(defaultProps.onCopy).toHaveBeenCalledWith('Test output content')
    })
  })

  it('should write to clipboard when copy button is clicked', async () => {
    render(<OutputDisplay {...defaultProps} />)

    const copyButton = screen.getByRole('button', { name: /copy/i })
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Test output content')
    })
  })

  it('should show success message after copying', async () => {
    render(<OutputDisplay {...defaultProps} />)

    const copyButton = screen.getByRole('button', { name: /copy/i })
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })
  })

  it('should hide success message after timeout', async () => {
    jest.useFakeTimers()

    render(<OutputDisplay {...defaultProps} />)

    const copyButton = screen.getByRole('button', { name: /copy/i })
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument()
    })

    jest.advanceTimersByTime(2000)

    await waitFor(() => {
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
    })

    jest.useRealTimers()
  })

  it('should handle empty content', () => {
    render(<OutputDisplay content="" onCopy={jest.fn()} />)

    expect(screen.getByText('Generated content will appear here...')).toBeInTheDocument()
  })

  it('should handle long content with scrollbar', () => {
    const longContent = 'A'.repeat(1000)
    render(<OutputDisplay content={longContent} onCopy={jest.fn()} />)

    const outputElement = screen.getByText(longContent)
    expect(outputElement).toHaveClass('custom-scrollbar')
  })

  it('should apply custom className', () => {
    render(<OutputDisplay {...defaultProps} className="custom-class" />)

    // Find the Card component which should have the custom class
    // The Card is the outer container with "rounded-lg border bg-card" classes
    const card = screen.getByText('Test output content').closest('[class*="bg-card"]')
    expect(card).toHaveClass('custom-class')
  })

  it('should handle copy error gracefully', async () => {
    // Mock clipboard error
    navigator.clipboard.writeText = jest.fn(() => Promise.reject(new Error('Clipboard error')))

    render(<OutputDisplay {...defaultProps} />)

    const copyButton = screen.getByRole('button', { name: /copy/i })
    fireEvent.click(copyButton)

    // Should not show success message on error
    await waitFor(() => {
      expect(screen.queryByText('Copied!')).not.toBeInTheDocument()
    })
  })

  it('should handle different content types', () => {
    const jsonContent = '{"name": "John", "age": 30}'
    render(<OutputDisplay content={jsonContent} onCopy={jest.fn()} />)

    expect(screen.getByText(jsonContent)).toBeInTheDocument()
  })

  it('should maintain focus after copy', async () => {
    render(<OutputDisplay {...defaultProps} />)

    const copyButton = screen.getByRole('button', { name: /copy/i })
    fireEvent.click(copyButton)

    // The button should still be in the document after clicking
    expect(copyButton).toBeInTheDocument()
  })

  it('should display error state', () => {
    render(<OutputDisplay content="" error="Something went wrong" onCopy={jest.fn()} />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('should display loading state', () => {
    render(<OutputDisplay content="" isLoading={true} onCopy={jest.fn()} />)

    expect(screen.getByText('Generating content...')).toBeInTheDocument()
  })

  it('should display word and character count', () => {
    render(<OutputDisplay content="Hello world" onCopy={jest.fn()} />)

    // Check for the presence of the statistics section
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('words')).toBeInTheDocument()
    expect(screen.getByText('11')).toBeInTheDocument()
    expect(screen.getByText('characters')).toBeInTheDocument()
  })

  it('should not show copy button when content is empty', () => {
    render(<OutputDisplay content="" onCopy={jest.fn()} />)

    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument()
  })

  it('should show copy button when content is present', () => {
    render(<OutputDisplay content="Test content" onCopy={jest.fn()} />)

    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
  })
})
