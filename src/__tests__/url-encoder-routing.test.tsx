import { getToolComponent } from '@/libs/tool-components';
import { getCategoryById, getToolById } from '@/libs/tools-data';
import { render, screen } from '@/test-utils/test-utils';

describe('URL Encoder Routing Integration', () => {
  it('should have URL encoder in tools data', () => {
    const urlEncoderTool = getToolById('url-encoder');

    expect(urlEncoderTool).toBeDefined();
    expect(urlEncoderTool?.id).toBe('url-encoder');
    expect(urlEncoderTool?.name).toBe('URL Encoder/Decoder');
    expect(urlEncoderTool?.category).toBe('encoders');
    expect(urlEncoderTool?.path).toBe('/tools/encoders/url-encoder');
    expect(urlEncoderTool?.component).toBe('UrlEncoder');
    expect(urlEncoderTool?.isPopular).toBe(true);
  });

  it('should be in encoders category', () => {
    const encodersCategory = getCategoryById('encoders');

    expect(encodersCategory).toBeDefined();
    expect(encodersCategory?.id).toBe('encoders');
    expect(encodersCategory?.name).toBe('Encoders & Decoders');

    const urlEncoderTool = encodersCategory?.tools.find(tool => tool.id === 'url-encoder');
    expect(urlEncoderTool).toBeDefined();
    expect(urlEncoderTool?.name).toBe('URL Encoder/Decoder');
  });

  it('should be able to load UrlEncoder component', async () => {
    const UrlEncoderComponent = await getToolComponent('UrlEncoder');

    expect(UrlEncoderComponent).toBeDefined();
    expect(typeof UrlEncoderComponent).toBe('function');
  });

  it('should render UrlEncoder component without errors', async () => {
    const UrlEncoderComponent = await getToolComponent('UrlEncoder');

    render(<UrlEncoderComponent />);

    expect(screen.getByText('URL Encoder/Decoder')).toBeInTheDocument();
    expect(screen.getByText('Encode and decode URLs with multiple encoding types including URL, URI, and custom character sets.')).toBeInTheDocument();
  });

  it('should have correct routing path', () => {
    const urlEncoderTool = getToolById('url-encoder');

    expect(urlEncoderTool?.path).toBe('/tools/encoders/url-encoder');
  });

  it('should be included in popular tools', () => {
    const urlEncoderTool = getToolById('url-encoder');

    expect(urlEncoderTool?.isPopular).toBe(true);
  });

  it('should have proper icon and description', () => {
    const urlEncoderTool = getToolById('url-encoder');

    expect(urlEncoderTool?.icon).toBe('🔗');
    expect(urlEncoderTool?.description).toBe('Encode and decode URLs with multiple encoding types including URL, URI, and custom character sets');
  });

  it('should be searchable by name and description', () => {
    const { searchTools } = require('@/libs/tools-data');

    // Search by name
    const nameResults = searchTools('URL Encoder');
    expect(nameResults).toHaveLength(1);
    expect(nameResults[0].id).toBe('url-encoder');

    // Search by description keyword
    const descResults = searchTools('encoding');
    expect(descResults.some((tool: any) => tool.id === 'url-encoder')).toBe(true);

    // Search by category keyword
    const categoryResults = searchTools('decode');
    expect(categoryResults.some((tool: any) => tool.id === 'url-encoder')).toBe(true);
  });

  it('should be accessible through category navigation', () => {
    const encodersCategory = getCategoryById('encoders');

    expect(encodersCategory?.tools).toContainEqual(
      expect.objectContaining({
        id: 'url-encoder',
        name: 'URL Encoder/Decoder',
        category: 'encoders'
      })
    );
  });

  it('should have consistent component mapping', async () => {
    const urlEncoderTool = getToolById('url-encoder');
    const componentName = urlEncoderTool?.component;

    expect(componentName).toBe('UrlEncoder');

    // Verify component can be loaded
    const component = await getToolComponent(componentName!);
    expect(component).toBeDefined();
  });
});
