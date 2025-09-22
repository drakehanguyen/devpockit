import { CronParser } from '@/components/tools/CronParser';
import { IpChecker } from '@/components/tools/IpChecker';
import { IpCidrConverter } from '@/components/tools/IpCidrConverter';
import { JsonFormatter } from '@/components/tools/JsonFormatter';
import { JsonYamlConverter } from '@/components/tools/JsonYamlConverter';
import { LoremIpsumGenerator } from '@/components/tools/LoremIpsumGenerator';
import { QrCodeDecoder } from '@/components/tools/QrCodeDecoder';
import { QrCodeGenerator } from '@/components/tools/QrCodeGenerator';
import { QrCodeScanner } from '@/components/tools/QrCodeScanner';
import { UuidGenerator } from '@/components/tools/UuidGenerator';
import { XmlFormatter } from '@/components/tools/XmlFormatter';
import { ToolCategory } from '@/types/tools';

export const toolCategories: ToolCategory[] = [
  {
    id: 'text-tools',
    name: 'Text Tools',
    icon: '📝',
    color: 'blue',
    description: 'Text generation and manipulation tools',
    tools: [
      {
        id: 'lorem-ipsum',
        name: 'Lorem Ipsum Generator',
        description: 'Generate placeholder text in Latin or Bacon Ipsum',
        category: 'text-tools',
        icon: '📄',
        isPopular: true,
        path: '/tools/lorem-ipsum',
        component: LoremIpsumGenerator,
      },
    ],
  },
  {
    id: 'formatters',
    name: 'Formatters',
    icon: '🔧',
    color: 'green',
    description: 'Code and data formatting tools',
    tools: [
          {
            id: 'json-formatter',
            name: 'JSON Formatter',
            description: 'Format and beautify JSON data',
            category: 'formatters',
            icon: '{ }',
            isPopular: true,
            path: '/tools/json-formatter',
            component: JsonFormatter,
          },
      {
        id: 'xml-formatter',
        name: 'XML Formatter',
        description: 'Format and beautify XML data',
        category: 'formatters',
        icon: '< >',
        isPopular: false,
        path: '/tools/xml-formatter',
        component: XmlFormatter,
      },
    ],
  },
  {
    id: 'cryptography',
    name: 'Cryptography & Security',
    icon: '🔐',
    color: 'red',
    description: 'Security and cryptographic tools',
    tools: [
      {
        id: 'uuid-generator',
        name: 'UUID Generator',
        description: 'Generate unique identifiers in v1, v4, and v5 formats',
        category: 'cryptography',
        icon: '🆔',
        isPopular: true,
        path: '/tools/uuid-generator',
        component: UuidGenerator,
      },
    ],
  },
  {
    id: 'encoders',
    name: 'Encoders & Decoders',
    icon: '🔄',
    color: 'orange',
    description: 'Text encoding and decoding utilities',
    tools: [
      {
        id: 'qr-code-generator',
        name: 'QR Code Generator',
        description: 'Generate QR codes for text, URLs, contacts, WiFi, SMS, and email with customizable options',
        category: 'encoders',
        icon: '📱',
        isPopular: true,
        path: '/tools/qr-code-generator',
        component: QrCodeGenerator,
      },
      {
        id: 'qr-code-decoder',
        name: 'QR Code Decoder',
        description: 'Decode QR codes from uploaded images with support for multiple formats and structured data parsing',
        category: 'encoders',
        icon: '🔍',
        isPopular: true,
        path: '/tools/qr-code-decoder',
        component: QrCodeDecoder,
      },
      {
        id: 'qr-code-scanner',
        name: 'QR Code Scanner',
        description: 'Scan QR codes using your device camera with real-time detection and instant results',
        category: 'encoders',
        icon: '📷',
        isPopular: true,
        path: '/tools/qr-code-scanner',
        component: QrCodeScanner,
      },
    ],
  },
  {
    id: 'converters',
    name: 'Converters',
    icon: '🔀',
    color: 'teal',
    description: 'Data format conversion tools',
    tools: [
      {
        id: 'cron-parser',
        name: 'Cron Expression Parser',
        description: 'Parse and validate cron expressions with human-readable descriptions',
        category: 'converters',
        icon: '⏰',
        isPopular: true,
        path: '/tools/cron-parser',
        component: CronParser,
      },
      {
        id: 'json-yaml-converter',
        name: 'JSON ↔ YAML Converter',
        description: 'Convert between JSON and YAML formats with validation and formatting',
        category: 'converters',
        icon: '⚡',
        isPopular: true,
        path: '/tools/json-yaml-converter',
        component: JsonYamlConverter,
      },
    ],
  },
  {
    id: 'network',
    name: 'Network Tools',
    icon: '🌐',
    color: 'indigo',
    description: 'Network utilities and tools',
    tools: [
      {
        id: 'ip-cidr-converter',
        name: 'IP Address CIDR Converter',
        description: 'Convert between IP addresses and CIDR notation, analyze network properties, and calculate subnet information',
        category: 'network',
        icon: '🔗',
        isPopular: true,
        path: '/tools/ip-cidr-converter',
        component: IpCidrConverter,
      },
      {
        id: 'ip-checker',
        name: 'IP Address Lookup',
        description: 'Look up information about your current public IP address including location and network details',
        category: 'network',
        icon: '📡',
        isPopular: true,
        path: '/tools/ip-checker',
        component: IpChecker,
      },
    ],
  },
];

export const getPopularTools = () => {
  return toolCategories
    .flatMap(category => category.tools)
    .filter(tool => tool.isPopular);
};

export const getAllTools = () => {
  return toolCategories.flatMap(category => category.tools);
};

export const getToolById = (id: string) => {
  return getAllTools().find(tool => tool.id === id);
};

export const getCategoryById = (id: string) => {
  return toolCategories.find(category => category.id === id);
};

export const searchTools = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return getAllTools().filter(
    tool =>
      tool.name.toLowerCase().includes(lowercaseQuery) ||
      tool.description.toLowerCase().includes(lowercaseQuery)
  );
};


