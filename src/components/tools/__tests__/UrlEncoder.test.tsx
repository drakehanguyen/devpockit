import { fireEvent, render, screen, waitFor } from '@/test-utils/test-utils';
import { UrlEncoder } from '../UrlEncoder';

// Mock the URL encoder utility functions
jest.mock('@/libs/url-encoder', () => ({
  encodeUrl: jest.fn(),
  decodeUrl: jest.fn(),
}));

import { decodeUrl, encodeUrl } from '@/libs/url-encoder';

const mockEncodeUrl = encodeUrl as jest.MockedFunction<typeof encodeUrl>;
const mockDecodeUrl = decodeUrl as jest.MockedFunction<typeof decodeUrl>;

describe('UrlEncoder Component', () => {
  const validUrl = 'https://example.com/path?param=value with spaces';
  const encodedUrl = 'https%3A//example.com/path%3Fparam%3Dvalue%20with%20spaces';
  const invalidUrl = 'not-a-valid-url';

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should render the component', () => {
    render(<UrlEncoder />);

    expect(screen.getByText('URL Encoder/Decoder')).toBeInTheDocument();
    expect(screen.getByText('Encode and decode URLs with multiple encoding types including URL, URI, and custom character sets.')).toBeInTheDocument();
  });

  it('should render configuration section', () => {
    render(<UrlEncoder />);

    expect(screen.getByText('Configuration')).toBeInTheDocument();
    expect(screen.getByText('Encoding Type')).toBeInTheDocument();
    expect(screen.getByText('Space Handling')).toBeInTheDocument();
  });

  it('should render input section', () => {
    render(<UrlEncoder />);

    expect(screen.getByText('Input')).toBeInTheDocument();
    expect(screen.getByText('URL to Encode')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter URL to encode...')).toBeInTheDocument();
  });

  it('should render action buttons', () => {
    render(<UrlEncoder />);

    // Check mode switch buttons (always visible)
    expect(screen.getAllByText('Encode URL')).toHaveLength(2); // Mode switch + action button
    expect(screen.getByText('Decode URL')).toBeInTheDocument();
    expect(screen.getByText('Clear')).toBeInTheDocument();

    // Add input to enable action button
    const textarea = screen.getByPlaceholderText('Enter URL to encode...');
    fireEvent.change(textarea, { target: { value: 'https://example.com' } });

    // Now check for action button (should be enabled now)
    const actionButtons = screen.getAllByRole('button', { name: 'Encode URL' });
    expect(actionButtons).toHaveLength(2); // Mode switch + action button
    expect(actionButtons[1]).not.toBeDisabled(); // Action button should be enabled
  });

  it('should render example buttons', () => {
    render(<UrlEncoder />);

    expect(screen.getByText('Examples')).toBeInTheDocument();
    expect(screen.getByText('simple')).toBeInTheDocument();
    expect(screen.getByText('with params')).toBeInTheDocument();
    expect(screen.getByText('special chars')).toBeInTheDocument();
    expect(screen.getByText('unicode')).toBeInTheDocument();
    expect(screen.getByText('complex')).toBeInTheDocument();
  });

  it('should have default encoding type selected', () => {
    render(<UrlEncoder />);

    expect(screen.getByText('URL Encoding (encodeURIComponent)')).toBeInTheDocument();
  });

  it('should change encoding type when selected', async () => {
    render(<UrlEncoder />);

    const encodingTypeSelect = screen.getAllByRole('combobox')[0]; // First combobox is encoding type
    fireEvent.click(encodingTypeSelect);

    const uriOption = screen.getByText('URI Encoding (encodeURI)');
    fireEvent.click(uriOption);

    await waitFor(() => {
      expect(screen.getByText('URI Encoding (encodeURI)')).toBeInTheDocument();
    });
  });

  it('should show custom character input when custom encoding is selected', async () => {
    render(<UrlEncoder />);

    const encodingTypeSelect = screen.getAllByRole('combobox')[0]; // First combobox is encoding type
    fireEvent.click(encodingTypeSelect);

    const customOption = screen.getByText('Custom Character Set');
    fireEvent.click(customOption);

    await waitFor(() => {
      expect(screen.getByText('Custom Characters to Encode')).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Enter characters to encode (e.g., ' &?=#/:;,')")).toBeInTheDocument();
    });
  });


  it('should change space handling option', async () => {
    render(<UrlEncoder />);

    const spaceHandlingSelect = screen.getAllByRole('combobox')[1];
    fireEvent.click(spaceHandlingSelect);

    const preserveOption = screen.getByText('Preserve spaces (not recommended)');
    fireEvent.click(preserveOption);

    await waitFor(() => {
      expect(screen.getByText('Preserve spaces (not recommended)')).toBeInTheDocument();
    });
  });

  it('should load example when clicked', () => {
    render(<UrlEncoder />);

    const simpleExampleButton = screen.getByText('simple');
    fireEvent.click(simpleExampleButton);

    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveValue('https://example.com');
  });

  it('should process URL encoding when button is clicked', async () => {
    mockEncodeUrl.mockReturnValue({
      encoded: encodedUrl,
      decoded: validUrl,
      isValid: true,
      originalLength: validUrl.length,
      encodedLength: encodedUrl.length,
      compressionRatio: 20,
      characterAnalysis: {
        total: encodedUrl.length,
        spaces: 2,
        specialChars: 5,
        encodedSpaces: 2,
        encodedSpecialChars: 5
      }
    });

    render(<UrlEncoder />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: validUrl } });

    const processButtons = screen.getAllByText('Encode URL');
    const processButton = processButtons[1]; // Action button is the second one
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(mockEncodeUrl).toHaveBeenCalledWith(validUrl, expect.any(Object));
    });
  });


  it('should show error for invalid URL', async () => {
    mockEncodeUrl.mockReturnValue({
      encoded: invalidUrl,
      decoded: invalidUrl,
      isValid: false,
      error: 'Invalid URL format',
      originalLength: invalidUrl.length,
      encodedLength: invalidUrl.length,
      compressionRatio: 0,
      characterAnalysis: {
        total: invalidUrl.length,
        spaces: 0,
        specialChars: 0,
        encodedSpaces: 0,
        encodedSpecialChars: 0
      }
    });

    render(<UrlEncoder />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: invalidUrl } });

    const processButtons = screen.getAllByText('Encode URL');
    const processButton = processButtons[1]; // Action button is the second one
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(screen.getAllByText('Invalid URL format')[0]).toBeInTheDocument();
    });
  });

  it('should swap between encode and decode modes', () => {
    render(<UrlEncoder />);

    const decodeButton = screen.getByText('Decode URL');
    fireEvent.click(decodeButton);

    expect(screen.getByText('Encoded URL to Decode')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter encoded URL to decode...')).toBeInTheDocument();
    expect(screen.getByText('Encode URL')).toBeInTheDocument();
  });

  it('should clear input and output when clear button is clicked', () => {
    render(<UrlEncoder />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: validUrl } });

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(textarea).toHaveValue('');
  });

  it('should show statistics when URL is processed', async () => {
    mockEncodeUrl.mockReturnValue({
      encoded: encodedUrl,
      decoded: validUrl,
      isValid: true,
      originalLength: validUrl.length,
      encodedLength: encodedUrl.length,
      compressionRatio: 20,
      characterAnalysis: {
        total: encodedUrl.length,
        spaces: 2,
        specialChars: 5,
        encodedSpaces: 2,
        encodedSpecialChars: 5
      }
    });

    render(<UrlEncoder />);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: validUrl } });

    const processButtons = screen.getAllByText('Encode URL');
    const processButton = processButtons[1]; // Action button is the second one
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(screen.getByText('Statistics')).toBeInTheDocument();
      expect(screen.getByText('Original Length:')).toBeInTheDocument();
      expect(screen.getByText('Encoded Length:')).toBeInTheDocument();
      expect(screen.getByText('Size Change:')).toBeInTheDocument();
    });
  });


  it('should handle custom character encoding', async () => {
    mockEncodeUrl.mockReturnValue({
      encoded: 'hello%20world',
      decoded: 'hello world',
      isValid: true,
      originalLength: 11,
      encodedLength: 13,
      compressionRatio: 18.2,
      characterAnalysis: {
        total: 13,
        spaces: 1,
        specialChars: 0,
        encodedSpaces: 1,
        encodedSpecialChars: 0
      }
    });

    render(<UrlEncoder />);

    // Select custom encoding
    const encodingTypeSelect = screen.getAllByRole('combobox')[0]; // First combobox is encoding type
    fireEvent.click(encodingTypeSelect);
    const customOption = screen.getByText('Custom Character Set');
    fireEvent.click(customOption);

    // Set custom characters
    const customCharsInput = screen.getByPlaceholderText("Enter characters to encode (e.g., ' &?=#/:;,')");
    fireEvent.change(customCharsInput, { target: { value: ' ' } });

    const textarea = screen.getByPlaceholderText('Enter URL to encode...');
    fireEvent.change(textarea, { target: { value: 'hello world' } });

    const processButtons = screen.getAllByText('Encode URL');
    const processButton = processButtons[1]; // Action button is the second one
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(mockEncodeUrl).toHaveBeenCalledWith('hello world', expect.objectContaining({
        encodingType: 'custom',
        customChars: ' '
      }));
    });
  });

  it('should handle decoding mode', async () => {
    mockDecodeUrl.mockReturnValue({
      encoded: encodedUrl,
      decoded: validUrl,
      isValid: true,
      originalLength: encodedUrl.length,
      encodedLength: encodedUrl.length,
      compressionRatio: -20,
      characterAnalysis: {
        total: validUrl.length,
        spaces: 2,
        specialChars: 5,
        encodedSpaces: 0,
        encodedSpecialChars: 0
      }
    });

    render(<UrlEncoder />);

    // Switch to decode mode
    const decodeButton = screen.getByText('Decode URL');
    fireEvent.click(decodeButton);

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: encodedUrl } });

    const processButtons = screen.getAllByText('Decode URL');
    const processButton = processButtons[1]; // Action button is the second one
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(mockDecodeUrl).toHaveBeenCalledWith(encodedUrl, expect.any(Object));
    });
  });

  it('should show processing state during encoding', async () => {
    // Mock encodeUrl to return a delayed promise
    let resolvePromise: (value: any) => void;
    const delayedPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockEncodeUrl.mockImplementation(() => {
      // Return the promise directly, not wrapped in then()
      return delayedPromise as any;
    });

    render(<UrlEncoder />);

    const textarea = screen.getByPlaceholderText('Enter URL to encode...');
    fireEvent.change(textarea, { target: { value: validUrl } });

    const processButtons = screen.getAllByText('Encode URL');
    const processButton = processButtons[1]; // Action button is the second one

    // Click the button to start processing
    fireEvent.click(processButton);

    // Check that processing state is shown
    expect(screen.getByText('Processing...')).toBeInTheDocument();

    // Resolve the promise to complete processing
    resolvePromise!({
      encoded: encodedUrl,
      decoded: validUrl,
      isValid: true,
      originalLength: validUrl.length,
      encodedLength: encodedUrl.length,
      compressionRatio: 20,
      characterAnalysis: {
        total: encodedUrl.length,
        spaces: 2,
        specialChars: 5,
        encodedSpaces: 2,
        encodedSpecialChars: 5
      }
    });

    // Wait for processing to complete
    await waitFor(() => {
      expect(screen.queryByText('Processing...')).not.toBeInTheDocument();
      expect(screen.getByText(encodedUrl)).toBeInTheDocument();
    });
  });

  it('should handle empty input gracefully', async () => {
    render(<UrlEncoder />);

    // Button should be disabled when there's no input
    const processButtons = screen.getAllByText('Encode URL');
    const processButton = processButtons[1]; // Action button is the second one
    expect(processButton).toBeDisabled();

    // Add input to enable button, then clear it to test empty input handling
    const textarea = screen.getByPlaceholderText('Enter URL to encode...');
    fireEvent.change(textarea, { target: { value: 'test' } });
    expect(processButton).not.toBeDisabled();

    // Clear input
    fireEvent.change(textarea, { target: { value: '' } });
    expect(processButton).toBeDisabled();

    // Force click the button to trigger the empty input validation
    fireEvent.click(processButton);

    // Since button is disabled, the error won't show through click
    // Instead, we can test that the button is properly disabled
    expect(processButton).toBeDisabled();
  });
});

