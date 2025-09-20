import { render, RenderOptions } from '@testing-library/react'
import React, { ReactElement } from 'react'

// Mock ThemeProvider for tests
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="theme-provider">{children}</div>
}

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockThemeProvider>
      {children}
    </MockThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Test data helpers
export const mockToolCategories = [
  {
    id: 'text-tools',
    name: 'Text Tools',
    icon: '📝',
    color: 'blue',
    description: 'Text generation and manipulation tools',
    tools: [
      {
        id: 'lorem-ipsum',
        name: 'Lorem Ipsum Generator',
        description: 'Generate placeholder text in Latin or Bacon Ipsum',
        category: 'text-tools',
        icon: '📄',
        isPopular: true,
        path: '/tools/lorem-ipsum',
        component: () => <div>Lorem Ipsum Tool</div>,
      },
    ],
  },
]

export const mockTools = [
  {
    id: 'lorem-ipsum',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text in Latin or Bacon Ipsum',
    category: 'text-tools',
    icon: '📄',
    isPopular: true,
    path: '/tools/lorem-ipsum',
    component: () => <div>Lorem Ipsum Tool</div>,
  },
]

// Mock functions
export const mockOnToolSelect = jest.fn()
export const mockOnTabSelect = jest.fn()
export const mockOnTabClose = jest.fn()
export const mockOnCloseAll = jest.fn()
export const mockOnSearch = jest.fn()
