// Dynamic component loader for static export compatibility
export const getToolComponent = async (componentName: string) => {
  const componentMap: Record<string, () => Promise<any>> = {
    'LoremIpsumGenerator': () => import('@/components/tools/LoremIpsumGenerator').then(m => m.LoremIpsumGenerator),
    'JsonFormatter': () => import('@/components/tools/JsonFormatter').then(m => m.JsonFormatter),
    'XmlFormatter': () => import('@/components/tools/XmlFormatter').then(m => m.XmlFormatter),
    'UuidGenerator': () => import('@/components/tools/UuidGenerator').then(m => m.UuidGenerator),
    'QrCodeGenerator': () => import('@/components/tools/QrCodeGenerator').then(m => m.QrCodeGenerator),
    'QrCodeDecoder': () => import('@/components/tools/QrCodeDecoder').then(m => m.QrCodeDecoder),
    'QrCodeScanner': () => import('@/components/tools/QrCodeScanner').then(m => m.QrCodeScanner),
    'UrlEncoderTool': () => import('@/components/tools/UrlEncoderTool').then(m => m.UrlEncoderTool),
    'UrlDecoderTool': () => import('@/components/tools/UrlDecoderTool').then(m => m.UrlDecoderTool),
    'CronParser': () => import('@/components/tools/CronParser').then(m => m.CronParser),
    'JsonYamlConverter': () => import('@/components/tools/JsonYamlConverter').then(m => m.JsonYamlConverter),
    'CidrAnalyzer': () => import('@/components/tools/CidrAnalyzer').then(m => m.CidrAnalyzer),
    'IpToCidrConverter': () => import('@/components/tools/IpToCidrConverter').then(m => m.IpToCidrConverter),
    'IpChecker': () => import('@/components/tools/IpChecker').then(m => m.IpChecker),
    'DiffChecker': () => import('@/components/tools/DiffChecker').then(m => m.DiffChecker),
    'TimestampConverter': () => import('@/components/tools/TimestampConverter').then(m => m.TimestampConverter),
    'ListComparison': () => import('@/components/tools/ListComparison').then(m => m.ListComparison),
  };

  const loader = componentMap[componentName];
  if (!loader) {
    throw new Error(`Component ${componentName} not found`);
  }

  return await loader();
};
