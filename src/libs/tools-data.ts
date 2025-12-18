import { ToolCategory } from '@/types/tools';
import {
  FileText,
  Braces,
  Code,
  Hash,
  QrCode,
  ScanSearch,
  ScanLine,
  Link,
  Clock,
  ArrowLeftRight,
  Network,
  MapPin,
  Wrench,
  type LucideIcon
} from 'lucide-react';

import { Unlock } from 'lucide-react';

// Icon mapping for tools
export const toolIcons: Record<string, LucideIcon> = {
  'lorem-ipsum': FileText,
  'json-formatter': Braces,
  'xml-formatter': Code,
  'uuid-generator': Hash,
  'qr-code-generator': QrCode,
  'qr-code-decoder': ScanSearch,
  'qr-code-scanner': ScanLine,
  'url-encoder': Link,
  'url-decoder': Unlock,
  'cron-parser': Clock,
  'json-yaml-converter': ArrowLeftRight,
  'cidr-analyzer': Network,
  'ip-to-cidr-converter': Network,
  'ip-checker': MapPin,
  'placeholder-tool': Wrench,
};

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
        path: '/tools/text-tools/lorem-ipsum',
        component: 'LoremIpsumGenerator',
        supportsDesktop: true,
        supportsMobile: true,
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
            path: '/tools/formatters/json-formatter',
            component: 'JsonFormatter',
            supportsDesktop: true,
            supportsMobile: true,
          },
      {
        id: 'xml-formatter',
        name: 'XML Formatter',
        description: 'Format and beautify XML data',
        category: 'formatters',
        icon: '< >',
        isPopular: false,
        path: '/tools/formatters/xml-formatter',
        component: 'XmlFormatter',
        supportsDesktop: true,
        supportsMobile: true,
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
        path: '/tools/cryptography/uuid-generator',
        component: 'UuidGenerator',
        supportsDesktop: true,
        supportsMobile: true,
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
        path: '/tools/encoders/qr-code-generator',
        component: 'QrCodeGenerator',
        supportsDesktop: true,
        supportsMobile: true,
      },
      {
        id: 'qr-code-decoder',
        name: 'QR Code Decoder',
        description: 'Decode QR codes from uploaded images with support for multiple formats and structured data parsing',
        category: 'encoders',
        icon: '🔍',
        isPopular: true,
        path: '/tools/encoders/qr-code-decoder',
        component: 'QrCodeDecoder',
        supportsDesktop: true,
        supportsMobile: true,
      },
      {
        id: 'qr-code-scanner',
        name: 'QR Code Scanner',
        description: 'Scan QR codes using your device camera with real-time detection and instant results',
        category: 'encoders',
        icon: '📷',
        isPopular: true,
        path: '/tools/encoders/qr-code-scanner',
        component: 'QrCodeScanner',
        supportsDesktop: true,
        supportsMobile: true,
      },
      {
        id: 'url-encoder',
        name: 'URL Encoder',
        description: 'Encode URLs and text with multiple encoding types including URL, URI, and custom character sets',
        category: 'encoders',
        icon: '🔗',
        isPopular: true,
        path: '/tools/encoders/url-encoder',
        component: 'UrlEncoderTool',
        supportsDesktop: true,
        supportsMobile: true,
      },
      {
        id: 'url-decoder',
        name: 'URL Decoder',
        description: 'Decode URL-encoded text back to its original form with support for multiple encoding types',
        category: 'encoders',
        icon: '🔓',
        isPopular: true,
        path: '/tools/encoders/url-decoder',
        component: 'UrlDecoderTool',
        supportsDesktop: true,
        supportsMobile: true,
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
        path: '/tools/converters/cron-parser',
        component: 'CronParser',
        supportsDesktop: true,
        supportsMobile: true,
      },
      {
        id: 'json-yaml-converter',
        name: 'JSON ↔ YAML Converter',
        description: 'Convert between JSON and YAML formats with validation and formatting',
        category: 'converters',
        icon: '⚡',
        isPopular: true,
        path: '/tools/converters/json-yaml-converter',
        component: 'JsonYamlConverter',
        supportsDesktop: true,
        supportsMobile: true,
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
        id: 'cidr-analyzer',
        name: 'CIDR Analyzer',
        description: 'Analyze CIDR notation and get detailed network information including subnets and statistics',
        category: 'network',
        icon: '🔍',
        isPopular: true,
        path: '/tools/network/cidr-analyzer',
        component: 'CidrAnalyzer',
        supportsDesktop: true,
        supportsMobile: true,
      },
      {
        id: 'ip-to-cidr-converter',
        name: 'IP to CIDR Converter',
        description: 'Convert an IP address to CIDR notation with network suggestions',
        category: 'network',
        icon: '🔗',
        isPopular: true,
        path: '/tools/network/ip-to-cidr-converter',
        component: 'IpToCidrConverter',
        supportsDesktop: true,
        supportsMobile: true,
      },
      {
        id: 'ip-checker',
        name: 'IP Address Lookup',
        description: 'Look up information about your current public IP address including location and network details',
        category: 'network',
        icon: '📡',
        isPopular: true,
        path: '/tools/network/ip-checker',
        component: 'IpChecker',
        supportsDesktop: true,
        supportsMobile: true,
      },
    ],
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: '🛠️',
    color: 'purple',
    description: 'General utility tools and helpers',
    tools: [
      {
        id: 'placeholder-tool',
        name: 'Placeholder Tool',
        description: 'A placeholder tool for testing and development',
        category: 'utilities',
        icon: '🔧',
        isPopular: false,
        path: '/tools/utilities/placeholder-tool',
        component: 'PlaceholderTool',
        supportsDesktop: true,
        supportsMobile: true,
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

export const getCategories = () => {
  return toolCategories;
};

export const getTools = () => {
  return getAllTools();
};

export const searchTools = (query: string) => {
  const lowercaseQuery = query.toLowerCase();
  return getAllTools().filter(
    tool =>
      tool.name.toLowerCase().includes(lowercaseQuery) ||
      tool.description.toLowerCase().includes(lowercaseQuery)
  );
};



