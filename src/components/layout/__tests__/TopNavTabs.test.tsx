import { render } from '@/test-utils/test-utils';
import { fireEvent, screen } from '@testing-library/react';
import { TopNavTabs } from '../TopNavTabs';

describe.skip('TopNavTabs', () => {
  const mockOnTabSelect = jest.fn();
  const mockOnTabClose = jest.fn();
  const mockOnCloseAll = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all tabs horizontally', () => {
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

    // All tabs should be visible
    expect(screen.getByText('Lorem Ipsum Generator')).toBeInTheDocument();
    expect(screen.getByText('JSON Formatter')).toBeInTheDocument();
  });

  it('should apply active styling to selected tab', () => {
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

    // Active tab should have primary-foreground background
    const loremTab = screen.getByText('Lorem Ipsum Generator').closest('div');
    expect(loremTab).toHaveClass('bg-primary-foreground');

    // Inactive tab should have card background (theme-aware)
    const jsonTab = screen.getByText('JSON Formatter').closest('div');
    expect(jsonTab).toHaveClass('bg-card');
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

  it('should show close icon on selected tab', () => {
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

    // Find all close buttons
    const closeButtons = screen.getAllByTitle('Close tool');
    expect(closeButtons.length).toBe(2); // One for each tab

    // First close button should be visible (active tab)
    expect(closeButtons[0]).toHaveClass('opacity-100');

    // Second close button should be hidden (inactive tab)
    expect(closeButtons[1]).toHaveClass('opacity-0');
  });

  it('should show close icon on hover for inactive tab', () => {
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

    // Find the inactive tab and its close button
    const jsonTab = screen.getByText('JSON Formatter').closest('div');
    const closeButtons = screen.getAllByTitle('Close tool');
    const inactiveCloseButton = closeButtons[1];

    // Initially hidden
    expect(inactiveCloseButton).toHaveClass('opacity-0');

    // Hover over the inactive tab
    if (jsonTab) {
      fireEvent.mouseEnter(jsonTab);
    }

    // Close button should now be visible
    expect(inactiveCloseButton).toHaveClass('opacity-100');

    // Mouse leave
    if (jsonTab) {
      fireEvent.mouseLeave(jsonTab);
    }

    // Close button should be hidden again
    expect(inactiveCloseButton).toHaveClass('opacity-0');
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

    // Find the close button (first one for active tab)
    const closeButtons = screen.getAllByTitle('Close tool');
    fireEvent.click(closeButtons[0]);

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

  it('should not show close all button when only 1 tab', () => {
    const tabs = [
      { toolId: 'lorem-ipsum', toolName: 'Lorem Ipsum Generator', category: 'Text Tools', isActive: true }
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
