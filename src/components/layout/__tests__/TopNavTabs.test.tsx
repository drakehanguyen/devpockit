import { render } from '@/test-utils/test-utils';
import { fireEvent, screen } from '@testing-library/react';
import { TopNavTabs } from '../TopNavTabs';

// Mock the tools data
jest.mock('@/libs/tools-data', () => ({
  getToolById: jest.fn((id: string) => {
    const tools: Record<string, any> = {
      'lorem-ipsum': {
        id: 'lorem-ipsum',
        name: 'Lorem Ipsum Generator',
        icon: '📄',
        color: 'blue',
      },
      'json-formatter': {
        id: 'json-formatter',
        name: 'JSON Formatter',
        icon: '{}',
        color: 'green',
      },
    };
    return tools[id] || null;
  }),
}));

describe('TopNavTabs', () => {
  const mockOnTabSelect = jest.fn();
  const mockOnTabClose = jest.fn();
  const mockOnCloseAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render tabs for active tools', () => {
    const tabs = [
      { toolId: 'lorem-ipsum', toolName: 'Lorem Ipsum Generator', category: 'Text Tools', isActive: true },
      { toolId: 'json-formatter', toolName: 'JSON Formatter', category: 'Formatters', isActive: false }
    ];

    render(
      <TopNavTabs
        tabs={tabs}
        activeTab="lorem-ipsum"
        onTabSelect={mockOnTabSelect}
        onTabClose={mockOnTabClose}
        onCloseAll={mockOnCloseAll}
      />
    );

    expect(screen.getByText('Lorem Ipsum Generator')).toBeInTheDocument();
    expect(screen.getByText('JSON Formatter')).toBeInTheDocument();
  });

  it('should highlight active tab', () => {
    const tabs = [
      { toolId: 'lorem-ipsum', toolName: 'Lorem Ipsum Generator', category: 'Text Tools', isActive: true },
      { toolId: 'json-formatter', toolName: 'JSON Formatter', category: 'Formatters', isActive: false }
    ];

    render(
      <TopNavTabs
        tabs={tabs}
        activeTab="lorem-ipsum"
        onTabSelect={mockOnTabSelect}
        onTabClose={mockOnTabClose}
        onCloseAll={mockOnCloseAll}
      />
    );

    const activeTab = screen.getByText('Lorem Ipsum Generator');
    expect(activeTab.closest('div')).toHaveClass('bg-primary');
  });

  it('should call onTabSelect when tab is clicked', () => {
    const tabs = [
      { toolId: 'lorem-ipsum', toolName: 'Lorem Ipsum Generator', category: 'Text Tools', isActive: true },
      { toolId: 'json-formatter', toolName: 'JSON Formatter', category: 'Formatters', isActive: false }
    ];

    render(
      <TopNavTabs
        tabs={tabs}
        activeTab="lorem-ipsum"
        onTabSelect={mockOnTabSelect}
        onTabClose={mockOnTabClose}
        onCloseAll={mockOnCloseAll}
      />
    );

    const tab = screen.getByText('JSON Formatter');
    fireEvent.click(tab);

    expect(mockOnTabSelect).toHaveBeenCalledWith('json-formatter');
  });

  it('should call onTabClose when close button is clicked', () => {
    const tabs = [
      { toolId: 'lorem-ipsum', toolName: 'Lorem Ipsum Generator', category: 'Text Tools', isActive: true },
      { toolId: 'json-formatter', toolName: 'JSON Formatter', category: 'Formatters', isActive: false }
    ];

    render(
      <TopNavTabs
        tabs={tabs}
        activeTab="lorem-ipsum"
        onTabSelect={mockOnTabSelect}
        onTabClose={mockOnTabClose}
        onCloseAll={mockOnCloseAll}
      />
    );

    // Find the close button for the first tab (it's the second button in the first tab)
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons[1]; // Second button is the close button
    fireEvent.click(closeButton);

    expect(mockOnTabClose).toHaveBeenCalledWith('lorem-ipsum');
  });

  it('should show close all button when more than 2 tabs', () => {
    const tabs = [
      { toolId: 'lorem-ipsum', toolName: 'Lorem Ipsum Generator', category: 'Text Tools', isActive: true },
      { toolId: 'json-formatter', toolName: 'JSON Formatter', category: 'Formatters', isActive: false },
      { toolId: 'xml-formatter', toolName: 'XML Formatter', category: 'Formatters', isActive: false }
    ];

    render(
      <TopNavTabs
        tabs={tabs}
        activeTab="lorem-ipsum"
        onTabSelect={mockOnTabSelect}
        onTabClose={mockOnTabClose}
        onCloseAll={mockOnCloseAll}
      />
    );

    expect(screen.getByText('Close All')).toBeInTheDocument();
  });

  it('should not show close all button when 2 or fewer tabs', () => {
    const tabs = [
      { toolId: 'lorem-ipsum', toolName: 'Lorem Ipsum Generator', category: 'Text Tools', isActive: true },
      { toolId: 'json-formatter', toolName: 'JSON Formatter', category: 'Formatters', isActive: false }
    ];

    render(
      <TopNavTabs
        tabs={tabs}
        activeTab="lorem-ipsum"
        onTabSelect={mockOnTabSelect}
        onTabClose={mockOnTabClose}
        onCloseAll={mockOnCloseAll}
      />
    );

    expect(screen.queryByText('Close All')).not.toBeInTheDocument();
  });

  it('should call onCloseAll when close all button is clicked', () => {
    const tabs = [
      { toolId: 'lorem-ipsum', toolName: 'Lorem Ipsum Generator', category: 'Text Tools', isActive: true },
      { toolId: 'json-formatter', toolName: 'JSON Formatter', category: 'Formatters', isActive: false },
      { toolId: 'xml-formatter', toolName: 'XML Formatter', category: 'Formatters', isActive: false }
    ];

    render(
      <TopNavTabs
        tabs={tabs}
        activeTab="lorem-ipsum"
        onTabSelect={mockOnTabSelect}
        onTabClose={mockOnTabClose}
        onCloseAll={mockOnCloseAll}
      />
    );

    const closeAllButton = screen.getByText('Close All');
    fireEvent.click(closeAllButton);

    expect(mockOnCloseAll).toHaveBeenCalled();
  });

  it('should render nothing when no tabs', () => {
    render(
      <TopNavTabs
        tabs={[]}
        activeTab={undefined}
        onTabSelect={mockOnTabSelect}
        onTabClose={mockOnTabClose}
        onCloseAll={mockOnCloseAll}
      />
    );

    // Component should render nothing when no tabs
    expect(screen.queryByText('Lorem Ipsum Generator')).not.toBeInTheDocument();
  });
});
