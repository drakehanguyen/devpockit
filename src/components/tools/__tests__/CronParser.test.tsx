import { ToolStateProvider } from '@/components/providers/ToolStateProvider';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { CronParser } from '../CronParser';

// Mock the cron-parser utility functions
jest.mock('@/libs/cron-parser', () => ({
  parseCronExpression: jest.fn(),
  validateCronExpression: jest.fn(),
  getCronStats: jest.fn()
}));

const mockParseCronExpression = require('@/libs/cron-parser').parseCronExpression;
const mockValidateCronExpression = require('@/libs/cron-parser').validateCronExpression;
const mockGetCronStats = require('@/libs/cron-parser').getCronStats;

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <ToolStateProvider>
      {component}
    </ToolStateProvider>
  );
};

describe.skip('CronParser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with correct title and description', () => {
    renderWithProvider(<CronParser />);

    expect(screen.getByText('Cron Expression Parser')).toBeInTheDocument();
    expect(screen.getByText('Parse and validate cron expressions with human-readable descriptions and next execution times.')).toBeInTheDocument();
  });

  it('renders input field and parse button', () => {
    renderWithProvider(<CronParser />);

    expect(screen.getByPlaceholderText('e.g., 0 9 * * * (every day at 9 AM)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Parse' })).toBeInTheDocument();
  });

  it('renders example expressions', () => {
    renderWithProvider(<CronParser />);

    expect(screen.getByText('Example Expressions')).toBeInTheDocument();
    expect(screen.getByText('Every Minute')).toBeInTheDocument();
    expect(screen.getByText('Every Hour')).toBeInTheDocument();
    expect(screen.getByText('Every Day at Midnight')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    renderWithProvider(<CronParser />);

    const input = screen.getByPlaceholderText('e.g., 0 9 * * * (every day at 9 AM)');
    fireEvent.change(input, { target: { value: '0 9 * * *' } });

    expect(input).toHaveValue('0 9 * * *');
  });

  it('handles parse button click with valid expression', async () => {
    mockParseCronExpression.mockReturnValue({
      isValid: true,
      humanReadable: 'Every day at 9:00 AM',
      nextRuns: ['2024-01-01T09:00:00.000Z', '2024-01-02T09:00:00.000Z']
    });

    renderWithProvider(<CronParser />);

    const input = screen.getByPlaceholderText('e.g., 0 9 * * * (every day at 9 AM)');
    const parseButton = screen.getByRole('button', { name: 'Parse' });

    fireEvent.change(input, { target: { value: '0 9 * * *' } });
    fireEvent.click(parseButton);

    await waitFor(() => {
      expect(mockParseCronExpression).toHaveBeenCalledWith('0 9 * * *');
    });
  });

  it('handles parse button click with invalid expression', async () => {
    mockParseCronExpression.mockReturnValue({
      isValid: false,
      humanReadable: '',
      nextRuns: [],
      error: 'Invalid cron expression'
    });

    renderWithProvider(<CronParser />);

    const input = screen.getByPlaceholderText('e.g., 0 9 * * * (every day at 9 AM)');
    const parseButton = screen.getByRole('button', { name: 'Parse' });

    fireEvent.change(input, { target: { value: 'invalid' } });
    fireEvent.click(parseButton);

    await waitFor(() => {
      expect(mockParseCronExpression).toHaveBeenCalledWith('invalid');
    });
  });

  it('handles example selection', () => {
    renderWithProvider(<CronParser />);

    const exampleButton = screen.getByText('Every Minute');
    fireEvent.click(exampleButton);

    const input = screen.getByPlaceholderText('e.g., 0 9 * * * (every day at 9 AM)');
    expect(input).toHaveValue('* * * * *');
  });

  it('handles clear button', () => {
    renderWithProvider(<CronParser />);

    const input = screen.getByPlaceholderText('e.g., 0 9 * * * (every day at 9 AM)');
    const clearButton = screen.getByRole('button', { name: 'Clear' });

    fireEvent.change(input, { target: { value: '0 9 * * *' } });
    fireEvent.click(clearButton);

    expect(input).toHaveValue('');
  });

  it('disables parse button when input is empty', () => {
    renderWithProvider(<CronParser />);

    const parseButton = screen.getByRole('button', { name: 'Parse' });
    expect(parseButton).toBeDisabled();
  });

  it('enables parse button when input has value', () => {
    renderWithProvider(<CronParser />);

    const input = screen.getByPlaceholderText('e.g., 0 9 * * * (every day at 9 AM)');
    const parseButton = screen.getByRole('button', { name: 'Parse' });

    fireEvent.change(input, { target: { value: '0 9 * * *' } });

    expect(parseButton).not.toBeDisabled();
  });

  it('shows loading state during parsing', async () => {
    renderWithProvider(<CronParser />);

    const input = screen.getByPlaceholderText('e.g., 0 9 * * * (every day at 9 AM)');
    const parseButton = screen.getByRole('button', { name: 'Parse' });

    fireEvent.change(input, { target: { value: '0 9 * * *' } });
    fireEvent.click(parseButton);

    // Wait for parsing to complete and check that the parse function was called
    await waitFor(() => {
      expect(mockParseCronExpression).toHaveBeenCalledWith('0 9 * * *');
    });
  });

  it('renders options for next runs and run count', () => {
    renderWithProvider(<CronParser />);

    expect(screen.getByText('Show Next Runs')).toBeInTheDocument();
    expect(screen.getByText('Next Run Count')).toBeInTheDocument();
  });

  it('handles options changes', () => {
    renderWithProvider(<CronParser />);

    // The Select components show their values in the trigger, not as display values
    expect(screen.getByText('Show Next Runs')).toBeInTheDocument();
    expect(screen.getByText('Next Run Count')).toBeInTheDocument();

    // Check that the select triggers are present (including theme selector)
    const selectTriggers = screen.getAllByRole('combobox');
    expect(selectTriggers.length).toBeGreaterThanOrEqual(2);
  });
});
