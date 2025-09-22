export interface IpInfo {
  ipv4: string | null;
  ipv6: string | null;
  country: string;
  region: string;
  city: string;
  isp: string;
  organization: string;
  timezone: string;
  latitude: number;
  longitude: number;
  query_time: string;
}

export interface IpCheckerOptions {
  showLocation: boolean;
  showISP: boolean;
  showTimezone: boolean;
  showIPv6: boolean;
  autoRefresh: boolean;
  refreshInterval: number; // seconds
}

export const DEFAULT_IP_OPTIONS: IpCheckerOptions = {
  showLocation: true,
  showISP: true,
  showTimezone: true,
  showIPv6: true,
  autoRefresh: false,
  refreshInterval: 30
};

/**
 * Check if an IP address is IPv4
 */
function isIPv4(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) return false;

  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
}

/**
 * Check if an IP address is IPv6
 */
function isIPv6(ip: string): boolean {
  // Full IPv6 format: 8 groups of 4 hex digits
  const ipv6FullRegex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  // Compressed IPv6 format with :: (simplified)
  const ipv6CompressedRegex = /^([0-9a-fA-F]{1,4}:)*::([0-9a-fA-F]{1,4}:)*[0-9a-fA-F]{1,4}$/;

  // IPv4-mapped IPv6
  const ipv6MappedRegex = /^::ffff:(\d{1,3}\.){3}\d{1,3}$/;

  // Simple check: contains colons and is not IPv4
  const hasColons = ip.includes(':');
  const isNotIPv4 = !isIPv4(ip);

  // If it has colons and is not IPv4, it's likely IPv6
  if (hasColons && isNotIPv4) {
    return true;
  }

  return ipv6FullRegex.test(ip) ||
         ipv6CompressedRegex.test(ip) ||
         ipv6MappedRegex.test(ip);
}

/**
 * Get public IP address and basic network information
 * Uses multiple services for reliability with fallbacks
 */
export async function getPublicIpInfo(): Promise<IpInfo> {
  const services = [
    'https://ipapi.co/json/',
    'https://api.ipify.org?format=json',
    'https://api64.ipify.org?format=json'
  ];

  let lastError: Error | null = null;
  let ipv4: string | null = null;
  let ipv6: string | null = null;
  let locationData: any = null;

  // Try to get both IPv4 and IPv6
  for (const service of services) {
    try {
      const response = await fetch(service, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const ip = data.ip || data.query;

      if (ip) {
        if (isIPv4(ip)) {
          ipv4 = ip;
        } else if (isIPv6(ip)) {
          ipv6 = ip;
        }

        // Store location data from the first successful response
        if (!locationData) {
          locationData = data;
        }
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      console.warn(`Service ${service} failed:`, lastError.message);
      continue;
    }
  }

  // If we have at least one IP, return the info
  if (ipv4 || ipv6) {
    return {
      ipv4,
      ipv6,
      country: locationData?.country_name || locationData?.country || 'Unknown',
      region: locationData?.region || locationData?.regionName || 'Unknown',
      city: locationData?.city || 'Unknown',
      isp: locationData?.org || locationData?.isp || 'Unknown',
      organization: locationData?.org || locationData?.organization || 'Unknown',
      timezone: locationData?.timezone || 'Unknown',
      latitude: locationData?.latitude || locationData?.lat || 0,
      longitude: locationData?.longitude || locationData?.lon || 0,
      query_time: new Date().toISOString()
    };
  }

  throw new Error(`All IP services failed. Last error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Format IP information for display
 * Enhanced to support both IPv4 and IPv6
 */
export function formatIpInfo(ipInfo: IpInfo, options: IpCheckerOptions): string {
  let output = `🕒 Checked at: ${new Date(ipInfo.query_time).toLocaleString()}\n\n`;

  // Display IP addresses
  output += `🌐 Public IP Addresses:\n`;

  if (ipInfo.ipv4) {
    output += `   IPv4: ${ipInfo.ipv4}\n`;
  }

  if (ipInfo.ipv6 && options.showIPv6) {
    output += `   IPv6: ${ipInfo.ipv6}\n`;
  }

  if (!ipInfo.ipv4 && !ipInfo.ipv6) {
    output += `   No IP addresses detected\n`;
  }

  output += `\n`;

  if (options.showLocation) {
    output += `📍 Location Information:\n`;
    output += `   Country: ${ipInfo.country}\n`;
    output += `   Region: ${ipInfo.region}\n`;
    output += `   City: ${ipInfo.city}\n`;
    if (ipInfo.latitude !== 0 && ipInfo.longitude !== 0) {
      output += `   Coordinates: ${ipInfo.latitude}, ${ipInfo.longitude}\n`;
    }
    output += `\n`;
  }

  if (options.showISP) {
    output += `🏢 Network Information:\n`;
    output += `   ISP: ${ipInfo.isp}\n`;
    output += `   Organization: ${ipInfo.organization}\n`;
    output += `\n`;
  }

  if (options.showTimezone) {
    output += `⏰ Timezone: ${ipInfo.timezone}\n`;
  }

  return output;
}
