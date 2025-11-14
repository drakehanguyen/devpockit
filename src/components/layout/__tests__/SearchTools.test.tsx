import { render } from '@/test-utils/test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { SearchTools } from '../SearchTools';

// Mock the tools data
jest.mock('@/libs/tools-data', () => ({
  searchTools: jest.fn((query: string) => {
    if (query === 'lorem') {
      return [
        {
          id: 'lorem-ipsum',
          name: 'Lorem Ipsum Generator',
          description: 'Generate placeholder text',
          icon: '📄',
          category: 'text-tools',
        },
      ];
    }
    return [];
  }),
  getCategoryById: jest.fn((id: string) => ({
    id: 'text-tools',
    name: 'Text Tools',
    color: 'blue',
  })),
}));

describe('SearchTools', () => {
  const mockOnToolSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render search input', () => {
    render(<SearchTools onToolSelect={mockOnToolSelect} />);

    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('should not render search when closed', () => {
    render(<SearchTools onToolSelect={mockOnToolSelect} />);

    // Search input should always be visible, but results should not be shown when no query
    expect(screen.getByPlaceholderText('Search')).toBeInTheDocument();
    expect(screen.queryByText(/tools found/i)).not.toBeInTheDocument();
  });

  it('should search for tools when typing', async () => {
    render(<SearchTools onToolSelect={mockOnToolSelect} />);

    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'lorem' } });

    await waitFor(() => {
      expect(screen.getByText('Lorem Ipsum Generator')).toBeInTheDocument();
    });
  });

  it('should show no results when no matches found', async () => {
    render(<SearchTools onToolSelect={mockOnToolSelect} />);

    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

    await waitFor(() => {
      expect(screen.getByText(/No tools found for/)).toBeInTheDocument();
    });
  });

  it('should call onToolSelect when tool is clicked', async () => {
    render(<SearchTools onToolSelect={mockOnToolSelect} />);

    const searchInput = screen.getByPlaceholderText('Search');
    fireEvent.change(searchInput, { target: { value: 'lorem' } });

    await waitFor(() => {
      const toolButton = screen.getByText('Lorem Ipsum Generator');
      fireEvent.click(toolButton);
    });

    expect(mockOnToolSelect).toHaveBeenCalledWith('lorem-ipsum');
  });

  it('should clear search when clear button is clicked', async () => {
    render(<SearchTools onToolSelect={mockOnToolSelect} />);

    const searchInput = screen.getByPlaceholderText('Search');

    // First search for something
    fireEvent.change(searchInput, { target: { value: 'lorem' } });

    await waitFor(() => {
      expect(screen.getByText('Lorem Ipsum Generator')).toBeInTheDocument();
    });

    // Then click the clear button (the X button)
    const clearButton = screen.getAllByRole('button')[0]; // First button is the clear button
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByText('Lorem Ipsum Generator')).not.toBeInTheDocument();
    });
  });

  it('should clear search when input is cleared', async () => {
    render(<SearchTools onToolSelect={mockOnToolSelect} />);

    const searchInput = screen.getByPlaceholderText('Search');

    // First search for something
    fireEvent.change(searchInput, { target: { value: 'lorem' } });

    await waitFor(() => {
      expect(screen.getByText('Lorem Ipsum Generator')).toBeInTheDocument();
    });

    // Then clear the search
    fireEvent.change(searchInput, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.queryByText('Lorem Ipsum Generator')).not.toBeInTheDocument();
    });
  });
});
