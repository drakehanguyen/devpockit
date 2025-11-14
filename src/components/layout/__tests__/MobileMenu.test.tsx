import { render } from '@/test-utils/test-utils';
import { fireEvent, screen } from '@testing-library/react';
import { MobileMenu } from '../MobileMenu';

// Mock the tools data
jest.mock('@/libs/tools-data', () => ({
  toolCategories: [
    {
      id: 'text-tools',
      name: 'Text Tools',
      icon: '📝',
      color: 'blue',
      tools: [
        {
          id: 'lorem-ipsum',
          name: 'Lorem Ipsum Generator',
          description: 'Generate placeholder text',
          icon: '📄',
          isPopular: true,
          path: '/tools/lorem-ipsum',
          component: null,
        },
      ],
    },
  ],
}));

describe('MobileMenu', () => {
  const mockOnToolSelect = jest.fn();
  const mockOnHomeClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render mobile menu trigger button', () => {
    render(
      <MobileMenu
        selectedTool={undefined}
        onToolSelect={mockOnToolSelect}
        onHomeClick={mockOnHomeClick}
      />
    );

    expect(screen.getByRole('button', { name: /open menu/i })).toBeInTheDocument();
  });

  it('should not show menu content by default', () => {
    render(
      <MobileMenu
        selectedTool={undefined}
        onToolSelect={mockOnToolSelect}
        onHomeClick={mockOnHomeClick}
      />
    );

    expect(screen.queryByText('Text Tools')).not.toBeInTheDocument();
  });

  it('should expand category when clicked', () => {
    render(
      <MobileMenu
        selectedTool={undefined}
        onToolSelect={mockOnToolSelect}
        onHomeClick={mockOnHomeClick}
      />
    );

    // Open the menu first
    const triggerButton = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(triggerButton);

    const categoryButton = screen.getByText('Text Tools');
    fireEvent.click(categoryButton);

    // Category should be expanded (tools should be visible)
    expect(screen.getByText('Lorem Ipsum Generator')).toBeInTheDocument();
  });

  it('should call onToolSelect when tool is clicked', () => {
    render(
      <MobileMenu
        selectedTool={undefined}
        onToolSelect={mockOnToolSelect}
        onHomeClick={mockOnHomeClick}
      />
    );

    // Open the menu first
    const triggerButton = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(triggerButton);

    // First expand the category
    const categoryButton = screen.getByText('Text Tools');
    fireEvent.click(categoryButton);

    // Then click the tool
    const toolButton = screen.getByText('Lorem Ipsum Generator');
    fireEvent.click(toolButton);

    expect(mockOnToolSelect).toHaveBeenCalledWith('lorem-ipsum');
  });

  it('should highlight selected tool', () => {
    render(
      <MobileMenu
        selectedTool="lorem-ipsum"
        onToolSelect={mockOnToolSelect}
        onHomeClick={mockOnHomeClick}
      />
    );

    // Open the menu first
    const triggerButton = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(triggerButton);

    // First expand the category
    const categoryButton = screen.getByText('Text Tools');
    fireEvent.click(categoryButton);

    const toolButton = screen.getByText('Lorem Ipsum Generator');
    expect(toolButton.closest('button')).toHaveClass('bg-muted');
  });

  it('should close menu when tool is selected', () => {
    render(
      <MobileMenu
        selectedTool={undefined}
        onToolSelect={mockOnToolSelect}
        onHomeClick={mockOnHomeClick}
      />
    );

    // Open the menu first
    const triggerButton = screen.getByRole('button', { name: /open menu/i });
    fireEvent.click(triggerButton);

    // Expand category and select tool
    const categoryButton = screen.getByText('Text Tools');
    fireEvent.click(categoryButton);

    const toolButton = screen.getByText('Lorem Ipsum Generator');
    fireEvent.click(toolButton);

    // Menu should close after tool selection
    expect(mockOnToolSelect).toHaveBeenCalledWith('lorem-ipsum');
  });
});
