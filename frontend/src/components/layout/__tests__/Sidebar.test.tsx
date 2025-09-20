import { render } from '@/test-utils/test-utils';
import { fireEvent, screen } from '@testing-library/react';
import { Sidebar } from '../Sidebar';

// Mock the tools data
jest.mock('@/lib/tools-data', () => ({
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

describe('Sidebar', () => {
  const mockOnToolSelect = jest.fn();
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render sidebar with categories', () => {
    render(
      <Sidebar
        isCollapsed={false}
        onToggle={mockOnToggle}
        selectedTool={undefined}
        onToolSelect={mockOnToolSelect}
      />
    );

    expect(screen.getByText('Text Tools')).toBeInTheDocument();
    expect(screen.getByText('DevPockit')).toBeInTheDocument();
  });

  it('should expand category when clicked', () => {
    render(
      <Sidebar
        isCollapsed={false}
        onToggle={mockOnToggle}
        selectedTool={undefined}
        onToolSelect={mockOnToolSelect}
      />
    );

    const categoryButton = screen.getByText('Text Tools');
    fireEvent.click(categoryButton);

    // Category should be expanded (tools should be visible)
    expect(screen.getByText('Lorem Ipsum Generator')).toBeInTheDocument();
  });

  it('should call onToolSelect when tool is clicked', () => {
    render(
      <Sidebar
        isCollapsed={false}
        onToggle={mockOnToggle}
        selectedTool={undefined}
        onToolSelect={mockOnToolSelect}
      />
    );

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
      <Sidebar
        isCollapsed={false}
        onToggle={mockOnToggle}
        selectedTool="lorem-ipsum"
        onToolSelect={mockOnToolSelect}
      />
    );

    // First expand the category
    const categoryButton = screen.getByText('Text Tools');
    fireEvent.click(categoryButton);

    const toolButton = screen.getByText('Lorem Ipsum Generator');
    // Check if the tool button has the selected styling
    expect(toolButton.closest('button')).toHaveClass('bg-muted');
  });

  it('should call onToggle when toggle button is clicked', () => {
    render(
      <Sidebar
        isCollapsed={false}
        onToggle={mockOnToggle}
        selectedTool={undefined}
        onToolSelect={mockOnToolSelect}
      />
    );

    const toggleButton = screen.getByRole('button', { name: /←/ });
    fireEvent.click(toggleButton);

    expect(mockOnToggle).toHaveBeenCalled();
  });
});
