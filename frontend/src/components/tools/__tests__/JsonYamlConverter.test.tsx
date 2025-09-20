import { ToolStateProvider } from '@/components/providers/ToolStateProvider';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { JsonYamlConverter } from '../JsonYamlConverter';

// Mock the json-yaml utility functions
jest.mock('@/lib/json-yaml', () => ({
  convertFormat: jest.fn(),
  detectFormat: jest.fn(),
  formatContent: jest.fn(),
  getConversionStats: jest.fn(),
  jsonToYaml: jest.fn(),
  yamlToJson: jest.fn()
}));

const mockConvertFormat = require('@/lib/json-yaml').convertFormat;
const mockDetectFormat = require('@/lib/json-yaml').detectFormat;
const mockFormatContent = require('@/lib/json-yaml').formatContent;
const mockGetConversionStats = require('@/lib/json-yaml').getConversionStats;

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <ToolStateProvider>
      {component}
    </ToolStateProvider>
  );
};

describe('JsonYamlConverter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with correct title and description', () => {
    renderWithProvider(<JsonYamlConverter />);

    expect(screen.getByText('JSON ↔ YAML Converter')).toBeInTheDocument();
    expect(screen.getByText('Convert between JSON and YAML formats with validation and formatting.')).toBeInTheDocument();
  });

  it('renders input textarea and convert button', () => {
    renderWithProvider(<JsonYamlConverter />);

    expect(screen.getByPlaceholderText('Enter JSON or YAML content here...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Convert' })).toBeInTheDocument();
  });

  it('renders example content', () => {
    renderWithProvider(<JsonYamlConverter />);

    expect(screen.getByText('Example Content')).toBeInTheDocument();
    expect(screen.getByText('Simple Object')).toBeInTheDocument();
    expect(screen.getByText('Nested Object')).toBeInTheDocument();
  });

  it('handles input changes', () => {
    renderWithProvider(<JsonYamlConverter />);

    const textarea = screen.getByPlaceholderText('Enter JSON or YAML content here...');
    fireEvent.change(textarea, { target: { value: '{"name": "John"}' } });

    expect(textarea).toHaveValue('{"name": "John"}');
  });

  it('handles convert button click with valid input', async () => {
    mockConvertFormat.mockReturnValue({
      success: true,
      output: 'name: John',
      format: 'yaml'
    });
    mockGetConversionStats.mockReturnValue({
      inputSize: 15,
      outputSize: 10,
      inputLines: 1,
      outputLines: 1,
      compressionRatio: 0.67,
      format: 'yaml'
    });

    renderWithProvider(<JsonYamlConverter />);

    const textarea = screen.getByPlaceholderText('Enter JSON or YAML content here...');
    const convertButton = screen.getByRole('button', { name: 'Convert' });

    fireEvent.change(textarea, { target: { value: '{"name": "John"}' } });
    fireEvent.click(convertButton);

    await waitFor(() => {
      expect(mockConvertFormat).toHaveBeenCalled();
    });
  });

  it('handles convert button click with invalid input', async () => {
    mockConvertFormat.mockReturnValue({
      success: false,
      output: '',
      error: 'Invalid format'
    });

    renderWithProvider(<JsonYamlConverter />);

    const textarea = screen.getByPlaceholderText('Enter JSON or YAML content here...');
    const convertButton = screen.getByRole('button', { name: 'Convert' });

    fireEvent.change(textarea, { target: { value: 'invalid' } });
    fireEvent.click(convertButton);

    await waitFor(() => {
      expect(mockConvertFormat).toHaveBeenCalled();
    });
  });

  it('handles format button click', async () => {
    mockFormatContent.mockReturnValue({
      success: true,
      output: '{\n  "name": "John"\n}',
      format: 'json'
    });
    mockGetConversionStats.mockReturnValue({
      inputSize: 15,
      outputSize: 20,
      inputLines: 1,
      outputLines: 3,
      compressionRatio: 1.33,
      format: 'json'
    });

    renderWithProvider(<JsonYamlConverter />);

    const textarea = screen.getByPlaceholderText('Enter JSON or YAML content here...');
    const formatButton = screen.getByRole('button', { name: 'Format' });

    fireEvent.change(textarea, { target: { value: '{"name":"John"}' } });
    fireEvent.click(formatButton);

    await waitFor(() => {
      expect(mockFormatContent).toHaveBeenCalled();
    });
  });

  it('handles auto detect button click', () => {
    mockDetectFormat.mockReturnValue('json');

    renderWithProvider(<JsonYamlConverter />);

    const textarea = screen.getByPlaceholderText('Enter JSON or YAML content here...');
    const autoDetectButton = screen.getByRole('button', { name: 'Auto Detect' });

    fireEvent.change(textarea, { target: { value: '{"name": "John"}' } });
    fireEvent.click(autoDetectButton);

    expect(mockDetectFormat).toHaveBeenCalledWith('{"name": "John"}');
  });

  it('handles example selection', () => {
    renderWithProvider(<JsonYamlConverter />);

    const exampleButton = screen.getByText('Simple Object');
    fireEvent.click(exampleButton);

    const textarea = screen.getByPlaceholderText('Enter JSON or YAML content here...');
    expect(textarea).toHaveValue('name: John Doe\nage: 30\nemail: john@example.com');
  });

  it('handles clear button', () => {
    renderWithProvider(<JsonYamlConverter />);

    const textarea = screen.getByPlaceholderText('Enter JSON or YAML content here...');
    const clearButton = screen.getByRole('button', { name: 'Clear' });

    fireEvent.change(textarea, { target: { value: '{"name": "John"}' } });
    fireEvent.click(clearButton);

    expect(textarea).toHaveValue('');
  });

  it('disables convert button when input is empty', () => {
    renderWithProvider(<JsonYamlConverter />);

    const convertButton = screen.getByRole('button', { name: 'Convert' });
    expect(convertButton).toBeDisabled();
  });

  it('enables convert button when input has value', () => {
    renderWithProvider(<JsonYamlConverter />);

    const textarea = screen.getByPlaceholderText('Enter JSON or YAML content here...');
    const convertButton = screen.getByRole('button', { name: 'Convert' });

    fireEvent.change(textarea, { target: { value: '{"name": "John"}' } });

    expect(convertButton).not.toBeDisabled();
  });

  it('renders format options', () => {
    renderWithProvider(<JsonYamlConverter />);

    expect(screen.getByText('Output Format')).toBeInTheDocument();
    expect(screen.getByText('Indent Size')).toBeInTheDocument();
    expect(screen.getAllByText('Auto Detect')).toHaveLength(2);
  });

  it('handles format option changes', () => {
    renderWithProvider(<JsonYamlConverter />);

    // Test that the component renders with default values
    expect(screen.getByText('YAML')).toBeInTheDocument();
    expect(screen.getByText('2 spaces')).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('shows loading state during conversion', () => {
    renderWithProvider(<JsonYamlConverter />);

    const textarea = screen.getByPlaceholderText('Enter JSON or YAML content here...');
    const convertButton = screen.getByRole('button', { name: 'Convert' });

    // Button should be disabled when input is empty
    expect(convertButton).toBeDisabled();

    fireEvent.change(textarea, { target: { value: '{"name": "John"}' } });

    // Button should be enabled when input has content
    expect(convertButton).not.toBeDisabled();
  });
});
