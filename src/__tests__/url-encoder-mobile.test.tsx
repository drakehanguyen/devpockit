import { UrlEncoder } from '@/components/tools/UrlEncoder';
import { fireEvent, render, screen, waitFor } from '@/test-utils/test-utils';

// Mock the URL encoder utility functions
jest.mock('@/libs/url-encoder', () => ({
  encodeUrl: jest.fn(),
  decodeUrl: jest.fn(),
}));

import { encodeUrl } from '@/libs/url-encoder';

const mockEncodeUrl = encodeUrl as jest.MockedFunction<typeof encodeUrl>;

describe.skip('URL Encoder Mobile Responsiveness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375, // iPhone width
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 667, // iPhone height
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render on mobile viewport', () => {
    render(<UrlEncoder />);

    expect(screen.getByText('URL Encoder/Decoder')).toBeInTheDocument();
    expect(screen.getByText('Encode and decode URLs with multiple encoding types including URL, URI, and custom character sets.')).toBeInTheDocument();
  });

  it('should have mobile-friendly input controls', () => {
    render(<UrlEncoder />);

    // Check that textarea is present and accessible
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveAttribute('placeholder', 'Enter URL to encode...');
  });

  it('should have mobile-friendly buttons', () => {
    render(<UrlEncoder />);

    // Check that buttons are present and have appropriate text
    expect(screen.getByText('Decode URL')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();
    expect(screen.getAllByText('Encode URL')).toHaveLength(2); // Mode switch + action button
  });

  it('should have mobile-friendly example buttons', () => {
    render(<UrlEncoder />);

    // Check that example buttons are present
    expect(screen.getByText('Examples')).toBeInTheDocument();
    expect(screen.getByText('simple')).toBeInTheDocument();
    expect(screen.getByText('with params')).toBeInTheDocument();
    expect(screen.getByText('special chars')).toBeInTheDocument();
    expect(screen.getByText('unicode')).toBeInTheDocument();
    expect(screen.getByText('complex')).toBeInTheDocument();
  });

  it('should handle mobile touch interactions', () => {
    mockEncodeUrl.mockReturnValue({
      encoded: 'https%3A%2F%2Fexample.com',
      decoded: 'https://example.com',
      isValid: true,
      originalLength: 19,
      encodedLength: 25,
      compressionRatio: 31.6,
      characterAnalysis: {
        total: 25,
        spaces: 0,
        specialChars: 0,
        encodedSpaces: 0,
        encodedSpecialChars: 0
      }
    });

    render(<UrlEncoder />);

    // Test touch interaction with example button
    const simpleExampleButton = screen.getByText('simple');
    fireEvent.click(simpleExampleButton);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('https://example.com');
  });

  it('should handle mobile form interactions', () => {
    mockEncodeUrl.mockReturnValue({
      encoded: 'https%3A%2F%2Fexample.com',
      decoded: 'https://example.com',
      isValid: true,
      originalLength: 19,
      encodedLength: 25,
      compressionRatio: 31.6,
      characterAnalysis: {
        total: 25,
        spaces: 0,
        specialChars: 0,
        encodedSpaces: 0,
        encodedSpecialChars: 0
      }
    });

    render(<UrlEncoder />);

    // Test mobile form input
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'https://example.com' } });

    expect(textarea).toHaveValue('https://example.com');
  });

  it('should handle mobile select interactions', () => {
    render(<UrlEncoder />);

    // Test mobile select interaction
    const encodingTypeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.click(encodingTypeSelect);

    // Should show options
    expect(screen.getByText('URI Encoding (encodeURI)')).toBeInTheDocument();
    expect(screen.getByText('Custom Character Set')).toBeInTheDocument();
  });


  it('should display mobile-friendly statistics', async () => {
    mockEncodeUrl.mockReturnValue({
      encoded: 'https%3A%2F%2Fexample.com',
      decoded: 'https://example.com',
      isValid: true,
      originalLength: 19,
      encodedLength: 25,
      compressionRatio: 31.6,
      characterAnalysis: {
        total: 25,
        spaces: 0,
        specialChars: 0,
        encodedSpaces: 0,
        encodedSpecialChars: 0
      }
    });

    render(<UrlEncoder />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'https://example.com' } });

    const processButtons = screen.getAllByText('Encode URL');
    const processButton = processButtons[1]; // Action button is the second one
    fireEvent.click(processButton);

    // Check that statistics are displayed
    await screen.findByText('Statistics');
    expect(screen.getByText('Original Length:')).toBeInTheDocument();
    expect(screen.getByText('Encoded Length:')).toBeInTheDocument();
    expect(screen.getByText('Size Change:')).toBeInTheDocument();
  });

  it('should handle mobile error display', async () => {
    mockEncodeUrl.mockReturnValue({
      encoded: 'invalid-url',
      decoded: 'invalid-url',
      isValid: false,
      error: 'Invalid URL format',
      originalLength: 12,
      encodedLength: 12,
      compressionRatio: 0,
      characterAnalysis: {
        total: 12,
        spaces: 0,
        specialChars: 0,
        encodedSpaces: 0,
        encodedSpecialChars: 0
      }
    });

    render(<UrlEncoder />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'invalid-url' } });

    const processButtons = screen.getAllByText('Encode URL');
    const processButton = processButtons[1]; // Action button is the second one
    fireEvent.click(processButton);

    // Check that error is displayed
    await waitFor(() => {
      expect(screen.getAllByText('Invalid URL format')).toHaveLength(2); // Error appears in multiple places
    });
  });

  it('should handle mobile mode switching', () => {
    render(<UrlEncoder />);

    // Test mobile mode switching
    const decodeButton = screen.getByText('Decode URL');
    fireEvent.click(decodeButton);

    expect(screen.getByText('Encoded URL to Decode')).toBeInTheDocument();
    expect(screen.getByText('Encode URL')).toBeInTheDocument();

    // Switch back
    const encodeButton = screen.getByText('Encode URL');
    fireEvent.click(encodeButton);

    expect(screen.getByText('URL to Encode')).toBeInTheDocument();
    expect(screen.getByText('Decode URL')).toBeInTheDocument();
  });

  it('should handle mobile clear functionality', () => {
    render(<UrlEncoder />);

    // Test mobile clear functionality
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'https://example.com' } });

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(textarea).toHaveValue('');
  });

  it('should handle mobile custom encoding', () => {
    render(<UrlEncoder />);

    // Switch to custom encoding
    const encodingTypeSelect = screen.getAllByRole('combobox')[0];
    fireEvent.click(encodingTypeSelect);
    const customOption = screen.getByText('Custom Character Set');
    fireEvent.click(customOption);

    // Test mobile custom character input
    const customCharsInput = screen.getByPlaceholderText("Enter characters to encode (e.g., ' &?=#/:;,')");
    fireEvent.change(customCharsInput, { target: { value: ' ' } });

    expect(customCharsInput).toHaveValue(' ');
  });

  it('should handle mobile space handling options', () => {
    render(<UrlEncoder />);

    // Test mobile space handling select
    const spaceHandlingSelect = screen.getAllByRole('combobox')[1];
    fireEvent.click(spaceHandlingSelect);

    // Should show space handling options
    expect(screen.getByText('Preserve spaces (not recommended)')).toBeInTheDocument();
  });
});
