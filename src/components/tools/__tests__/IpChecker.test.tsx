import { ToolStateProvider } from '@/components/providers/ToolStateProvider';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { IpChecker } from '../IpChecker';

// Mock the IP checker utility
jest.mock('@/libs/ip-checker', () => ({
  getPublicIpInfo: jest.fn(),
  formatIpInfo: jest.fn(),
  DEFAULT_IP_OPTIONS: {
    showLocation: true,
    showISP: true,
    showTimezone: true,
    showIPv6: true,
    autoRefresh: false,
    refreshInterval: 30
  }
}));

const mockGetPublicIpInfo = require('@/libs/ip-checker').getPublicIpInfo;
const mockFormatIpInfo = require('@/libs/ip-checker').formatIpInfo;

describe('IpChecker Component', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <ToolStateProvider>
        {component}
      </ToolStateProvider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockFormatIpInfo.mockReturnValue('Formatted IP info');
  });

  it('renders IP checker interface', () => {
    renderWithProvider(<IpChecker />);

    expect(screen.getByText('IP Address Lookup')).toBeInTheDocument();
    expect(screen.getByText('Look up information about your current public IP address and network details')).toBeInTheDocument();
    expect(screen.getByText('Check My IP')).toBeInTheDocument();
  });

  it('handles IP check successfully', async () => {
    const mockIpInfo = {
      ipv4: '192.168.1.1',
      ipv6: '2001:db8::1',
      country: 'United States',
      city: 'New York',
      isp: 'Test ISP',
      organization: 'Test Org',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
      query_time: '2024-01-01T00:00:00.000Z'
    };

    mockGetPublicIpInfo.mockResolvedValue(mockIpInfo);
    mockFormatIpInfo.mockReturnValue('Formatted IP info');

    renderWithProvider(<IpChecker />);

    const checkButton = screen.getByText('Check My IP');
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(mockGetPublicIpInfo).toHaveBeenCalled();
      expect(mockFormatIpInfo).toHaveBeenCalledWith(mockIpInfo, expect.any(Object));
    });

    // Check that the output is displayed (the exact text might be different)
    await waitFor(() => {
      expect(screen.getByText(/IP Information/)).toBeInTheDocument();
    });
  });

  it('handles IP check errors', async () => {
    mockGetPublicIpInfo.mockRejectedValue(new Error('Network error'));

    renderWithProvider(<IpChecker />);

    const checkButton = screen.getByText('Check My IP');
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('toggles display options', () => {
    renderWithProvider(<IpChecker />);

    const locationSwitch = screen.getByLabelText('Show Location');
    fireEvent.click(locationSwitch);

    expect(locationSwitch).not.toBeChecked();
  });

  it('toggles IPv6 display option', () => {
    renderWithProvider(<IpChecker />);

    const ipv6Switch = screen.getByLabelText('Show IPv6');
    fireEvent.click(ipv6Switch);

    expect(ipv6Switch).not.toBeChecked();
  });

  it('handles auto-refresh toggle', () => {
    renderWithProvider(<IpChecker />);

    const autoRefreshSwitch = screen.getByLabelText('Auto Refresh');
    fireEvent.click(autoRefreshSwitch);

    expect(autoRefreshSwitch).toBeChecked();
  });

  it('shows refresh interval input when auto-refresh is enabled', () => {
    renderWithProvider(<IpChecker />);

    const autoRefreshSwitch = screen.getByLabelText('Auto Refresh');
    fireEvent.click(autoRefreshSwitch);

    expect(screen.getByLabelText('Refresh Interval (seconds)')).toBeInTheDocument();
  });

  it('handles copy functionality', async () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined)
      }
    });

    const mockIpInfo = {
      ipv4: '192.168.1.1',
      ipv6: '2001:db8::1',
      country: 'United States',
      city: 'New York',
      isp: 'Test ISP',
      organization: 'Test Org',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
      query_time: '2024-01-01T00:00:00.000Z'
    };

    mockGetPublicIpInfo.mockResolvedValue(mockIpInfo);
    mockFormatIpInfo.mockReturnValue('Formatted IP info');

    renderWithProvider(<IpChecker />);

    const checkButton = screen.getByText('Check My IP');
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText('Copy')).toBeInTheDocument(); // Only from OutputDisplay now
    });

    // Click the copy button (from OutputDisplay)
    const copyButton = screen.getByText('Copy');
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Formatted IP info');
  });

  it('shows loading state during IP check', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise(resolve => {
      resolvePromise = resolve;
    });

    mockGetPublicIpInfo.mockReturnValue(promise);
    mockFormatIpInfo.mockReturnValue('Formatted IP info');

    renderWithProvider(<IpChecker />);

    const checkButton = screen.getByText('Check My IP');
    fireEvent.click(checkButton);

    expect(screen.getByText('Checking IP...')).toBeInTheDocument();
    expect(screen.queryByText('Check My IP')).not.toBeInTheDocument();

    // Resolve the promise
    resolvePromise!({
      ip: '192.168.1.1',
      country: 'United States',
      city: 'New York',
      isp: 'Test ISP',
      organization: 'Test Org',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
      query_time: '2024-01-01T00:00:00.000Z'
    });

    await waitFor(() => {
      expect(screen.getByText('Check My IP')).toBeInTheDocument();
    });
  });

  it('displays status badges when IP is checked', async () => {
    const mockIpInfo = {
      ipv4: '192.168.1.1',
      ipv6: '2001:db8::1',
      country: 'United States',
      city: 'New York',
      isp: 'Test ISP',
      organization: 'Test Org',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
      query_time: '2024-01-01T00:00:00.000Z'
    };

    mockGetPublicIpInfo.mockResolvedValue(mockIpInfo);
    mockFormatIpInfo.mockReturnValue('Formatted IP info');

    renderWithProvider(<IpChecker />);

    const checkButton = screen.getByText('Check My IP');
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/Last checked:/)).toBeInTheDocument();
    });
  });

  it('shows auto-refresh badge when enabled', async () => {
    const mockIpInfo = {
      ipv4: '192.168.1.1',
      ipv6: '2001:db8::1',
      country: 'United States',
      city: 'New York',
      isp: 'Test ISP',
      organization: 'Test Org',
      timezone: 'America/New_York',
      latitude: 40.7128,
      longitude: -74.0060,
      query_time: '2024-01-01T00:00:00.000Z'
    };

    mockGetPublicIpInfo.mockResolvedValue(mockIpInfo);
    mockFormatIpInfo.mockReturnValue('Formatted IP info');

    renderWithProvider(<IpChecker />);

    const autoRefreshSwitch = screen.getByLabelText('Auto Refresh');
    fireEvent.click(autoRefreshSwitch);

    // Need to trigger an IP check first to show the badge
    const checkButton = screen.getByText('Check My IP');
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/Auto-refresh: 30s/)).toBeInTheDocument();
    });
  });
});
