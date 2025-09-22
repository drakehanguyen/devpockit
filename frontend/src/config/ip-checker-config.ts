import { IpCheckerOptions } from '@/libs/ip-checker';

export const DEFAULT_IP_OPTIONS: IpCheckerOptions = {
  showLocation: true,
  showISP: true,
  showTimezone: true,
  showIPv6: true,
  autoRefresh: false,
  refreshInterval: 30
};

export const IP_CHECKER_EXAMPLES = [
  {
    name: 'Basic IP Check',
    description: 'Get your public IP address',
    options: { ...DEFAULT_IP_OPTIONS, showLocation: false, showISP: false, showTimezone: false, showIPv6: false }
  },
  {
    name: 'Full Network Info',
    description: 'Get IP with location and ISP details',
    options: DEFAULT_IP_OPTIONS
  },
  {
    name: 'IPv4 Only',
    description: 'Get IPv4 address only',
    options: { ...DEFAULT_IP_OPTIONS, showIPv6: false }
  },
  {
    name: 'IPv6 Only',
    description: 'Get IPv6 address only',
    options: { ...DEFAULT_IP_OPTIONS, showLocation: false, showISP: false, showTimezone: false }
  }
];

export const IP_CHECKER_HELP = {
  title: 'IP Address Lookup',
  description: 'Look up information about your current public IP address and network details',
  features: [
    'Get your public IP address (IPv4 and IPv6)',
    'View location information (country, region, city)',
    'Check ISP and organization details',
    'See timezone information',
    'Toggle IPv6 display on/off',
    'Auto-refresh capability',
    'Multiple service fallbacks for reliability'
  ],
  tips: [
    'This tool shows your public IP address as seen by external services',
    'Location information is approximate and based on IP geolocation',
    'Use auto-refresh to monitor IP changes',
    'Information is retrieved from multiple reliable sources'
  ]
};
