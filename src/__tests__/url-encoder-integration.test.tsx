import { UrlEncoder } from '@/components/tools/UrlEncoder';
import { fireEvent, render, screen, waitFor } from '@/test-utils/test-utils';

// Mock the URL encoder utility functions
jest.mock('@/libs/url-encoder', () => ({
  encodeUrl: jest.fn(),
  decodeUrl: jest.fn(),
}));

import { decodeUrl, encodeUrl } from '@/libs/url-encoder';

const mockEncodeUrl = encodeUrl as jest.MockedFunction<typeof encodeUrl>;
const mockDecodeUrl = decodeUrl as jest.MockedFunction<typeof decodeUrl>;

describe.skip('URL Encoder Integration Tests', () => {
  const testCases = [
    {
      name: 'Simple URL',
      input: 'https://example.com',
      expectedEncoded: 'https%3A%2F%2Fexample.com',
      expectedStats: {
        originalLength: 19,
        encodedLength: 25,
        compressionRatio: 31.6
      }
    },
    {
      name: 'URL with Query Parameters',
      input: 'https://example.com/search?q=hello world&category=tools',
      expectedEncoded: 'https%3A%2F%2Fexample.com%2Fsearch%3Fq%3Dhello%20world%26category%3Dtools',
      expectedStats: {
        originalLength: 55,
        encodedLength: 75,
        compressionRatio: 36.4
      }
    },
    {
      name: 'URL with Special Characters',
      input: 'https://example.com/path with spaces/file.txt',
      expectedEncoded: 'https%3A%2F%2Fexample.com%2Fpath%20with%20spaces%2Ffile.txt',
      expectedStats: {
        originalLength: 44,
        encodedLength: 58,
        compressionRatio: 31.8
      }
    },
    {
      name: 'Unicode URL',
      input: 'https://example.com/测试/路径',
      expectedEncoded: 'https%3A%2F%2Fexample.com%2F%E6%B5%8B%E8%AF%95%2F%E8%B7%AF%E5%BE%84',
      expectedStats: {
        originalLength: 30,
        encodedLength: 58,
        compressionRatio: 93.3
      }
    },
    {
      name: 'Complex URL with All Components',
      input: 'ftp://user:pass@host:port/path/to/file.txt?query=string#fragment',
      expectedEncoded: 'ftp%3A%2F%2Fuser%3Apass%40host%3Aport%2Fpath%2Fto%2Ffile.txt%3Fquery%3Dstring%23fragment',
      expectedStats: {
        originalLength: 60,
        encodedLength: 88,
        compressionRatio: 46.7
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Complete Encoding Workflow', () => {
    testCases.forEach(({ name, input, expectedEncoded, expectedStats }) => {
      it(`should complete encoding workflow for ${name}`, async () => {
        mockEncodeUrl.mockReturnValue({
          encoded: expectedEncoded,
          decoded: input,
          isValid: true,
          originalLength: expectedStats.originalLength,
          encodedLength: expectedStats.encodedLength,
          compressionRatio: expectedStats.compressionRatio,
          characterAnalysis: {
            total: expectedStats.encodedLength,
            spaces: 0,
            specialChars: 0,
            encodedSpaces: 0,
            encodedSpecialChars: 0
          }
        });

        render(<UrlEncoder />);

        // Step 1: Enter URL
        const textarea = screen.getByPlaceholderText('Enter URL to encode...');
        fireEvent.change(textarea, { target: { value: input } });

        // Step 2: Click process button
        const processButtons = screen.getAllByText('Encode URL');
        const processButton = processButtons[1]; // Action button is the second one
        fireEvent.click(processButton);

        await waitFor(() => {
          expect(mockEncodeUrl).toHaveBeenCalledWith(input, expect.any(Object));
        });

        // Step 3: Verify output
        await waitFor(() => {
          expect(screen.getByText('Statistics')).toBeInTheDocument();
        });
      });
    });
  });

  describe('Complete Decoding Workflow', () => {
    testCases.forEach(({ name, input, expectedEncoded }) => {
      it(`should complete decoding workflow for ${name}`, async () => {
        mockDecodeUrl.mockReturnValue({
          encoded: expectedEncoded,
          decoded: input,
          isValid: true,
          originalLength: expectedEncoded.length,
          encodedLength: expectedEncoded.length,
          compressionRatio: -31.6,
          characterAnalysis: {
            total: input.length,
            spaces: 0,
            specialChars: 0,
            encodedSpaces: 0,
            encodedSpecialChars: 0
          }
        });

        render(<UrlEncoder />);

        // Step 1: Switch to decode mode
        const decodeButton = screen.getByText('Decode URL');
        fireEvent.click(decodeButton);

        // Step 2: Enter encoded URL
        const textarea = screen.getByPlaceholderText('Enter encoded URL to decode...');
        fireEvent.change(textarea, { target: { value: expectedEncoded } });

        // Step 3: Click process button
        const processButtons = screen.getAllByText('Decode URL');
        const processButton = processButtons[1]; // Action button is the second one
        fireEvent.click(processButton);

        await waitFor(() => {
          expect(mockDecodeUrl).toHaveBeenCalledWith(expectedEncoded, expect.any(Object));
        });

        // Step 4: Verify output
        await waitFor(() => {
          expect(screen.getByText('Statistics')).toBeInTheDocument();
        });
      });
    });
  });

  describe('Encoding Type Workflows', () => {
    it('should complete URL encoding workflow', async () => {
      const input = 'https://example.com/path?param=value with spaces';
      const expectedEncoded = 'https%3A%2F%2Fexample.com%2Fpath%3Fparam%3Dvalue%20with%20spaces';

      mockEncodeUrl.mockReturnValue({
        encoded: expectedEncoded,
        decoded: input,
        isValid: true,
        originalLength: input.length,
        encodedLength: expectedEncoded.length,
        compressionRatio: 20,
        characterAnalysis: {
          total: expectedEncoded.length,
          spaces: 2,
          specialChars: 5,
          encodedSpaces: 2,
          encodedSpecialChars: 5
        }
      });

      render(<UrlEncoder />);

      // Ensure URL encoding is selected (default)
      expect(screen.getByText('URL Encoding (encodeURIComponent)')).toBeInTheDocument();

      const textarea = screen.getByPlaceholderText('Enter URL to encode...');
      fireEvent.change(textarea, { target: { value: input } });

      const processButtons = screen.getAllByText('Encode URL');
      const processButton = processButtons[1]; // Action button is the second one
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(mockEncodeUrl).toHaveBeenCalledWith(input, expect.objectContaining({
          encodingType: 'url'
        }));
      });
    });

    it('should complete URI encoding workflow', async () => {
      const input = 'https://example.com/path?param=value with spaces';
      const expectedEncoded = 'https://example.com/path?param=value%20with%20spaces';

      mockEncodeUrl.mockReturnValue({
        encoded: expectedEncoded,
        decoded: input,
        isValid: true,
        originalLength: input.length,
        encodedLength: expectedEncoded.length,
        compressionRatio: 5,
        characterAnalysis: {
          total: expectedEncoded.length,
          spaces: 2,
          specialChars: 0,
          encodedSpaces: 2,
          encodedSpecialChars: 0
        }
      });

      render(<UrlEncoder />);

      // Switch to URI encoding
      const encodingTypeSelect = screen.getAllByRole('combobox')[0];
      fireEvent.click(encodingTypeSelect);
      const uriOption = screen.getByText('URI Encoding (encodeURI)');
      fireEvent.click(uriOption);

      await waitFor(() => {
        expect(screen.getByText('URI Encoding (encodeURI)')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('Enter URL to encode...');
      fireEvent.change(textarea, { target: { value: input } });

      const processButtons = screen.getAllByText('Encode URL');
      const processButton = processButtons[1]; // Action button is the second one
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(mockEncodeUrl).toHaveBeenCalledWith(input, expect.objectContaining({
          encodingType: 'uri'
        }));
      });
    });

    it('should complete custom encoding workflow', async () => {
      const input = 'hello world test';
      const customChars = ' ';
      const expectedEncoded = 'hello%20world%20test';

      mockEncodeUrl.mockReturnValue({
        encoded: expectedEncoded,
        decoded: input,
        isValid: true,
        originalLength: input.length,
        encodedLength: expectedEncoded.length,
        compressionRatio: 20,
        characterAnalysis: {
          total: expectedEncoded.length,
          spaces: 2,
          specialChars: 0,
          encodedSpaces: 2,
          encodedSpecialChars: 0
        }
      });

      render(<UrlEncoder />);

      // Switch to custom encoding
      const encodingTypeSelect = screen.getAllByRole('combobox')[0];
      fireEvent.click(encodingTypeSelect);
      const customOption = screen.getByText('Custom Character Set');
      fireEvent.click(customOption);

      await waitFor(() => {
        expect(screen.getByText('Custom Character Set')).toBeInTheDocument();
        expect(screen.getByText('Custom Characters to Encode')).toBeInTheDocument();
      });

      // Set custom characters
      const customCharsInput = screen.getByPlaceholderText("Enter characters to encode (e.g., ' &?=#/:;,')");
      fireEvent.change(customCharsInput, { target: { value: customChars } });

      const textarea = screen.getByPlaceholderText('Enter URL to encode...');
      fireEvent.change(textarea, { target: { value: input } });

      const processButtons = screen.getAllByText('Encode URL');
      const processButton = processButtons[1]; // Action button is the second one
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(mockEncodeUrl).toHaveBeenCalledWith(input, expect.objectContaining({
          encodingType: 'custom',
          customChars: customChars
        }));
      });
    });
  });

  describe('Error Handling Workflows', () => {
    it('should handle invalid URL gracefully', async () => {
      const invalidInput = 'not-a-valid-url';

      mockEncodeUrl.mockReturnValue({
        encoded: invalidInput,
        decoded: invalidInput,
        isValid: false,
        error: 'Invalid URL format',
        originalLength: invalidInput.length,
        encodedLength: invalidInput.length,
        compressionRatio: 0,
        characterAnalysis: {
          total: invalidInput.length,
          spaces: 0,
          specialChars: 0,
          encodedSpaces: 0,
          encodedSpecialChars: 0
        }
      });

      render(<UrlEncoder />);

      const textarea = screen.getByPlaceholderText('Enter URL to encode...');
      fireEvent.change(textarea, { target: { value: invalidInput } });

      const processButtons = screen.getAllByText('Encode URL');
      const processButton = processButtons[1]; // Action button is the second one
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(screen.getAllByText('Invalid URL format')[0]).toBeInTheDocument();
      });
    });

    it('should handle encoding errors gracefully', async () => {
      const input = 'https://example.com';

      mockEncodeUrl.mockImplementation(() => {
        throw new Error('Encoding failed');
      });

        render(<UrlEncoder />);

        const textarea = screen.getByPlaceholderText('Enter URL to encode...');
        fireEvent.change(textarea, { target: { value: input } });

      const processButtons = screen.getAllByText('Encode URL');
      const processButton = processButtons[1]; // Action button is the second one
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(screen.getAllByText('Encoding failed')[0]).toBeInTheDocument();
      });
    });
  });

  describe('User Interaction Workflows', () => {
    it('should complete example loading workflow', async () => {
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

      // Load simple example
      const simpleExampleButton = screen.getByText('simple');
      fireEvent.click(simpleExampleButton);

      const textarea = screen.getByPlaceholderText('Enter URL to encode...');
      expect(textarea).toHaveValue('https://example.com');

      const processButtons = screen.getAllByText('Encode URL');
      const processButton = processButtons[1]; // Action button is the second one
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(mockEncodeUrl).toHaveBeenCalledWith('https://example.com', expect.any(Object));
      });
    });

    it('should complete clear workflow', async () => {
      render(<UrlEncoder />);

      const textarea = screen.getByPlaceholderText('Enter URL to encode...');
      fireEvent.change(textarea, { target: { value: 'https://example.com' } });

      const clearButton = screen.getByText('Clear');
      fireEvent.click(clearButton);

      expect(textarea).toHaveValue('');
    });

    it('should complete mode switching workflow', async () => {
      const input = 'https://example.com';
      const encodedInput = 'https%3A%2F%2Fexample.com';

      mockEncodeUrl.mockReturnValue({
        encoded: encodedInput,
        decoded: input,
        isValid: true,
        originalLength: input.length,
        encodedLength: encodedInput.length,
        compressionRatio: 31.6,
        characterAnalysis: {
          total: encodedInput.length,
          spaces: 0,
          specialChars: 0,
          encodedSpaces: 0,
          encodedSpecialChars: 0
        }
      });

      mockDecodeUrl.mockReturnValue({
        encoded: encodedInput,
        decoded: input,
        isValid: true,
        originalLength: encodedInput.length,
        encodedLength: encodedInput.length,
        compressionRatio: -31.6,
        characterAnalysis: {
          total: input.length,
          spaces: 0,
          specialChars: 0,
          encodedSpaces: 0,
          encodedSpecialChars: 0
        }
      });

      render(<UrlEncoder />);

      // Start in encode mode
      const textarea = screen.getByPlaceholderText('Enter URL to encode...');
      fireEvent.change(textarea, { target: { value: input } });

      const encodeButtons = screen.getAllByText('Encode URL');
      const encodeButton = encodeButtons[1]; // Action button is the second one
      fireEvent.click(encodeButton);

      await waitFor(() => {
        expect(mockEncodeUrl).toHaveBeenCalled();
      });

      // Switch to decode mode
      const decodeButton = screen.getByText('Decode URL');
      fireEvent.click(decodeButton);

      expect(screen.getByText('Encoded URL to Decode')).toBeInTheDocument();
      expect(screen.getByText('Encode URL')).toBeInTheDocument();

      // Enter encoded URL
      fireEvent.change(textarea, { target: { value: encodedInput } });

      const decodeProcessButtons = screen.getAllByText('Decode URL');
      const decodeProcessButton = decodeProcessButtons[1]; // Action button is the second one
      fireEvent.click(decodeProcessButton);

      await waitFor(() => {
        expect(mockDecodeUrl).toHaveBeenCalled();
      });
    });
  });

});
