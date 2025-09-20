import { fireEvent, render, screen } from '@/test-utils/test-utils'
import { ThemeToggle } from '../ThemeToggle'

// Mock next-themes
const mockSetTheme = jest.fn()
jest.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'dark',
    setTheme: mockSetTheme,
    systemTheme: 'dark',
  }),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render theme toggle button', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toBeInTheDocument()
  })

  it('should call setTheme when clicked', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })
    fireEvent.click(button)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
  })

  it('should have correct title attribute', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toHaveAttribute('title', 'Switch to light mode')
  })

  it('should have correct styling classes', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toHaveClass('w-10', 'h-8', 'px-2')
  })

  it('should handle hover states', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toHaveClass('hover:bg-accent', 'hover:text-accent-foreground')
  })

  it('should be accessible', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })
    expect(button).toHaveAttribute('title', 'Switch to light mode')
    expect(screen.getByText('Toggle theme')).toBeInTheDocument()
  })

  it('should render the component without crashing', () => {
    expect(() => render(<ThemeToggle />)).not.toThrow()
  })
})
