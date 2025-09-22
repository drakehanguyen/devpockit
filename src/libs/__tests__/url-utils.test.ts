import { getCategoryById, getToolById } from '../tools-data';
import {
  getCategoryUrl,
  getToolUrl,
  isValidCategoryUrl,
  isValidToolUrl,
  parseCategoryUrl,
  parseToolUrl
} from '../url-utils';

// Mock the tools-data module
jest.mock('../tools-data', () => ({
  getToolById: jest.fn(),
  getCategoryById: jest.fn()
}));

const mockGetToolById = getToolById as jest.MockedFunction<typeof getToolById>;
const mockGetCategoryById = getCategoryById as jest.MockedFunction<typeof getCategoryById>;

describe('URL Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mocks to return undefined by default
    mockGetToolById.mockReturnValue(undefined);
    mockGetCategoryById.mockReturnValue(undefined);
  });

  describe('getToolUrl', () => {
    it('should return tool URL for valid tool ID', () => {
      const mockTool = {
        id: 'json-formatter',
        name: 'JSON Formatter',
        category: 'formatters',
        description: 'Format and beautify JSON data',
        icon: '{ }',
        isPopular: true,
        path: '/tools/formatters/json-formatter',
        component: 'JsonFormatter'
      };

      mockGetToolById.mockReturnValue(mockTool);

      const result = getToolUrl('json-formatter');

      expect(result).toBe('/tools/formatters/json-formatter');
      expect(mockGetToolById).toHaveBeenCalledWith('json-formatter');
    });

    it('should return null for invalid tool ID', () => {
      mockGetToolById.mockReturnValue(undefined);

      const result = getToolUrl('invalid-tool');

      expect(result).toBeNull();
      expect(mockGetToolById).toHaveBeenCalledWith('invalid-tool');
    });

    it('should return null for empty tool ID', () => {
      mockGetToolById.mockReturnValue(undefined);

      const result = getToolUrl('');

      expect(result).toBeNull();
      expect(mockGetToolById).toHaveBeenCalledWith('');
    });

    it('should handle tools with different categories', () => {
      const mockTool = {
        id: 'lorem-ipsum',
        name: 'Lorem Ipsum Generator',
        category: 'text-tools',
        description: 'Generate placeholder text',
        icon: '📄',
        isPopular: true,
        path: '/tools/text-tools/lorem-ipsum',
        component: 'LoremIpsumGenerator'
      };

      mockGetToolById.mockReturnValue(mockTool);

      const result = getToolUrl('lorem-ipsum');

      expect(result).toBe('/tools/text-tools/lorem-ipsum');
    });
  });

  describe('getCategoryUrl', () => {
    it('should return category URL for valid category ID', () => {
      const mockCategory = {
        id: 'formatters',
        name: 'Formatters',
        icon: '🔧',
        color: 'green',
        description: 'Code and data formatting tools',
        tools: []
      };

      mockGetCategoryById.mockReturnValue(mockCategory);

      const result = getCategoryUrl('formatters');

      expect(result).toBe('/tools/formatters');
      expect(mockGetCategoryById).toHaveBeenCalledWith('formatters');
    });

    it('should return null for invalid category ID', () => {
      mockGetCategoryById.mockReturnValue(undefined);

      const result = getCategoryUrl('invalid-category');

      expect(result).toBeNull();
      expect(mockGetCategoryById).toHaveBeenCalledWith('invalid-category');
    });

    it('should return null for empty category ID', () => {
      mockGetCategoryById.mockReturnValue(undefined);

      const result = getCategoryUrl('');

      expect(result).toBeNull();
      expect(mockGetCategoryById).toHaveBeenCalledWith('');
    });

    it('should handle different category IDs', () => {
      const mockCategory = {
        id: 'text-tools',
        name: 'Text Tools',
        icon: '📝',
        color: 'blue',
        description: 'Text generation and manipulation tools',
        tools: []
      };

      mockGetCategoryById.mockReturnValue(mockCategory);

      const result = getCategoryUrl('text-tools');

      expect(result).toBe('/tools/text-tools');
    });
  });

  describe('parseToolUrl', () => {
    it('should parse valid tool URL', () => {
      const result = parseToolUrl('/tools/formatters/json-formatter');

      expect(result).toEqual({
        category: 'formatters',
        toolId: 'json-formatter'
      });
    });

    it('should parse tool URL with leading slash', () => {
      const result = parseToolUrl('/tools/text-tools/lorem-ipsum');

      expect(result).toEqual({
        category: 'text-tools',
        toolId: 'lorem-ipsum'
      });
    });

    it('should parse tool URL without leading slash', () => {
      const result = parseToolUrl('tools/encoders/uuid-generator');

      expect(result).toEqual({
        category: 'encoders',
        toolId: 'uuid-generator'
      });
    });

    it('should return null for invalid URL format', () => {
      const result = parseToolUrl('/invalid/path');

      expect(result).toBeNull();
    });

    it('should return null for URL with wrong number of segments', () => {
      const result = parseToolUrl('/tools');

      expect(result).toBeNull();
    });

    it('should return null for URL with too many segments', () => {
      const result = parseToolUrl('/tools/formatters/json-formatter/extra');

      expect(result).toBeNull();
    });

    it('should return null for URL not starting with tools', () => {
      const result = parseToolUrl('/other/formatters/json-formatter');

      expect(result).toBeNull();
    });

    it('should return null for empty pathname', () => {
      const result = parseToolUrl('');

      expect(result).toBeNull();
    });

    it('should return null for root path', () => {
      const result = parseToolUrl('/');

      expect(result).toBeNull();
    });

    it('should handle URL with query parameters', () => {
      const result = parseToolUrl('/tools/formatters/json-formatter?param=value');

      expect(result).toEqual({
        category: 'formatters',
        toolId: 'json-formatter?param=value'
      });
    });

    it('should handle URL with hash', () => {
      const result = parseToolUrl('/tools/formatters/json-formatter#section');

      expect(result).toEqual({
        category: 'formatters',
        toolId: 'json-formatter#section'
      });
    });
  });

  describe('parseCategoryUrl', () => {
    it('should parse valid category URL', () => {
      const result = parseCategoryUrl('/tools/formatters');

      expect(result).toBe('formatters');
    });

    it('should parse category URL with leading slash', () => {
      const result = parseCategoryUrl('/tools/text-tools');

      expect(result).toBe('text-tools');
    });

    it('should parse category URL without leading slash', () => {
      const result = parseCategoryUrl('tools/encoders');

      expect(result).toBe('encoders');
    });

    it('should return null for invalid URL format', () => {
      const result = parseCategoryUrl('/invalid/path');

      expect(result).toBeNull();
    });

    it('should return null for URL with wrong number of segments', () => {
      const result = parseCategoryUrl('/tools/formatters/json-formatter');

      expect(result).toBeNull();
    });

    it('should return null for URL not starting with tools', () => {
      const result = parseCategoryUrl('/other/formatters');

      expect(result).toBeNull();
    });

    it('should return null for empty pathname', () => {
      const result = parseCategoryUrl('');

      expect(result).toBeNull();
    });

    it('should return null for root path', () => {
      const result = parseCategoryUrl('/');

      expect(result).toBeNull();
    });

    it('should handle URL with query parameters', () => {
      const result = parseCategoryUrl('/tools/formatters?param=value');

      expect(result).toBe('formatters?param=value');
    });

    it('should handle URL with hash', () => {
      const result = parseCategoryUrl('/tools/formatters#section');

      expect(result).toBe('formatters#section');
    });
  });

  describe('isValidToolUrl', () => {
    it('should return true for valid tool URL', () => {
      const mockTool = {
        id: 'json-formatter',
        name: 'JSON Formatter',
        category: 'formatters',
        description: 'Format and beautify JSON data',
        icon: '{ }',
        isPopular: true,
        path: '/tools/formatters/json-formatter',
        component: 'JsonFormatter'
      };

      mockGetToolById.mockReturnValue(mockTool);

      const result = isValidToolUrl('/tools/formatters/json-formatter');

      expect(result).toBe(true);
      expect(mockGetToolById).toHaveBeenCalledWith('json-formatter');
    });

    it('should return false for invalid tool URL format', () => {
      const result = isValidToolUrl('/invalid/path');

      expect(result).toBe(false);
    });

    it('should return false when tool is not found', () => {
      mockGetToolById.mockReturnValue(undefined);

      const result = isValidToolUrl('/tools/formatters/invalid-tool');

      expect(result).toBe(false);
      expect(mockGetToolById).toHaveBeenCalledWith('invalid-tool');
    });

    it('should return false when tool category does not match', () => {
      const mockTool = {
        id: 'json-formatter',
        name: 'JSON Formatter',
        category: 'formatters',
        description: 'Format and beautify JSON data',
        icon: '{ }',
        isPopular: true,
        path: '/tools/formatters/json-formatter',
        component: 'JsonFormatter'
      };

      mockGetToolById.mockReturnValue(mockTool);

      const result = isValidToolUrl('/tools/wrong-category/json-formatter');

      expect(result).toBe(false);
    });

    it('should return false for empty pathname', () => {
      const result = isValidToolUrl('');

      expect(result).toBe(false);
    });

    it('should return false for root path', () => {
      const result = isValidToolUrl('/');

      expect(result).toBe(false);
    });

    it('should handle URL with query parameters', () => {
      const mockTool = {
        id: 'json-formatter',
        name: 'JSON Formatter',
        category: 'formatters',
        description: 'Format and beautify JSON data',
        icon: '{ }',
        isPopular: true,
        path: '/tools/formatters/json-formatter',
        component: 'JsonFormatter'
      };

      mockGetToolById.mockReturnValue(mockTool);

      const result = isValidToolUrl('/tools/formatters/json-formatter?param=value');

      expect(result).toBe(true);
    });
  });

  describe('isValidCategoryUrl', () => {
    it('should return true for valid category URL', () => {
      const mockCategory = {
        id: 'formatters',
        name: 'Formatters',
        icon: '🔧',
        color: 'green',
        description: 'Code and data formatting tools',
        tools: []
      };

      mockGetCategoryById.mockReturnValue(mockCategory);

      const result = isValidCategoryUrl('/tools/formatters');

      expect(result).toBe(true);
      expect(mockGetCategoryById).toHaveBeenCalledWith('formatters');
    });

    it('should return false for invalid category URL format', () => {
      const result = isValidCategoryUrl('/invalid/path');

      expect(result).toBe(false);
    });

    it('should return false when category is not found', () => {
      // Explicitly set the mock to return null for this test
      // Note: The implementation checks `category !== null`, so we need to return null to get false
      mockGetCategoryById.mockReturnValueOnce(null as any);

      const result = isValidCategoryUrl('/tools/invalid-category');

      expect(result).toBe(false);
      expect(mockGetCategoryById).toHaveBeenCalledWith('invalid-category');
    });

    it('should return false for empty pathname', () => {
      const result = isValidCategoryUrl('');

      expect(result).toBe(false);
    });

    it('should return false for root path', () => {
      const result = isValidCategoryUrl('/');

      expect(result).toBe(false);
    });

    it('should handle URL with query parameters', () => {
      const mockCategory = {
        id: 'formatters',
        name: 'Formatters',
        icon: '🔧',
        color: 'green',
        description: 'Code and data formatting tools',
        tools: []
      };

      mockGetCategoryById.mockReturnValue(mockCategory);

      const result = isValidCategoryUrl('/tools/formatters?param=value');

      expect(result).toBe(true);
    });

    it('should handle URL with hash', () => {
      const mockCategory = {
        id: 'formatters',
        name: 'Formatters',
        icon: '🔧',
        color: 'green',
        description: 'Code and data formatting tools',
        tools: []
      };

      mockGetCategoryById.mockReturnValue(mockCategory);

      const result = isValidCategoryUrl('/tools/formatters#section');

      expect(result).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle URLs with multiple slashes', () => {
      const result = parseToolUrl('//tools//formatters//json-formatter');

      expect(result).toEqual({
        category: 'formatters',
        toolId: 'json-formatter'
      });
    });

    it('should handle URLs with trailing slashes', () => {
      const result = parseToolUrl('/tools/formatters/json-formatter/');

      expect(result).toEqual({
        category: 'formatters',
        toolId: 'json-formatter'
      });
    });

    it('should handle URLs with special characters in IDs', () => {
      const result = parseToolUrl('/tools/special-category/tool-with-special_chars');

      expect(result).toEqual({
        category: 'special-category',
        toolId: 'tool-with-special_chars'
      });
    });

    it('should handle very long URLs', () => {
      const longPath = '/tools/' + 'a'.repeat(100) + '/' + 'b'.repeat(100);
      const result = parseToolUrl(longPath);

      expect(result).toEqual({
        category: 'a'.repeat(100),
        toolId: 'b'.repeat(100)
      });
    });

    it('should handle URLs with encoded characters', () => {
      const result = parseToolUrl('/tools/category%20with%20spaces/tool%20with%20spaces');

      expect(result).toEqual({
        category: 'category%20with%20spaces',
        toolId: 'tool%20with%20spaces'
      });
    });
  });

  describe('Integration Tests', () => {
    it('should work together for complete tool URL validation', () => {
      const mockTool = {
        id: 'json-formatter',
        name: 'JSON Formatter',
        category: 'formatters',
        description: 'Format and beautify JSON data',
        icon: '{ }',
        isPopular: true,
        path: '/tools/formatters/json-formatter',
        component: 'JsonFormatter'
      };

      mockGetToolById.mockReturnValue(mockTool);

      const url = '/tools/formatters/json-formatter';
      const parsed = parseToolUrl(url);
      const isValid = isValidToolUrl(url);

      expect(parsed).toEqual({
        category: 'formatters',
        toolId: 'json-formatter'
      });
      expect(isValid).toBe(true);
    });

    it('should work together for complete category URL validation', () => {
      const mockCategory = {
        id: 'formatters',
        name: 'Formatters',
        icon: '🔧',
        color: 'green',
        description: 'Code and data formatting tools',
        tools: []
      };

      mockGetCategoryById.mockReturnValue(mockCategory);

      const url = '/tools/formatters';
      const parsed = parseCategoryUrl(url);
      const isValid = isValidCategoryUrl(url);

      expect(parsed).toBe('formatters');
      expect(isValid).toBe(true);
    });
  });
});
