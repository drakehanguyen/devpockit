/**
 * Component tests for IpCidrConverter
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { ToolStateProvider } from '../../providers/ToolStateProvider';
import { IpCidrConverter } from '../IpCidrConverter';

// Mock the utility functions
jest.mock('../../../lib/ip-cidr', () => ({
  validateIpAddress: jest.fn(),
  validateCidr: jest.fn(),
  parseCidr: jest.fn(),
  analyzeNetwork: jest.fn(),
  ipToCidr: jest.fn(),
  cidrToRange: jest.fn(),
  generateIpRange: jest.fn(),
  getCidrSuggestions: jest.fn(),
  calculateSubnets: jest.fn(),
  getNetworkStats: jest.fn(),
  isIpInCidr: jest.fn(),
  cidrRangesOverlap: jest.fn(),
  getNextIpInRange: jest.fn()
}));

// Mock the config
jest.mock('../../../config/ip-cidr-config', () => ({
  DEFAULT_OPTIONS: {
    showNetworkInfo: true,
    showSubnetInfo: false,
    showStatistics: false,
    maxSubnets: 8
  }
}));

// Import the mocked functions
import * as ipCidrUtils from '../../../libs/ip-cidr';

const mockIpCidrUtils = ipCidrUtils as jest.Mocked<typeof ipCidrUtils>;

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ToolStateProvider>
    {children}
  </ToolStateProvider>
);

describe('IpCidrConverter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render the component with default state', () => {
      render(
        <TestWrapper>
          <IpCidrConverter />
        </TestWrapper>
      );

      expect(screen.getByText('IP Address CIDR Converter')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('192.168.1.0/24')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /analyze network/i })).toBeInTheDocument();
    });

    it('should render all input fields', () => {
      render(
        <TestWrapper>
          <IpCidrConverter />
        </TestWrapper>
      );

      expect(screen.getByPlaceholderText('192.168.1.0/24')).toBeInTheDocument();
    });

    it('should render options panel', () => {
      render(
        <TestWrapper>
          <IpCidrConverter />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Show Network Analysis')).toBeInTheDocument();
      expect(screen.getByLabelText('Show Subnet Information')).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle IP address input', async () => {
      const user = userEvent.setup();

      mockIpCidrUtils.validateIpAddress.mockReturnValue({
        isValid: true,
        version: 'ipv4'
      });

      render(
        <TestWrapper>
          <IpCidrConverter />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('192.168.1.0/24');
      await user.type(input, '192.168.1.1');

      expect(input).toHaveValue('192.168.1.1');
    });

    it('should handle CIDR notation input', async () => {
      const user = userEvent.setup();

      mockIpCidrUtils.validateCidr.mockReturnValue({
        isValid: true,
        ip: '192.168.1.0',
        prefixLength: 24,
        version: 'ipv4'
      });

      render(
        <TestWrapper>
          <IpCidrConverter />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('192.168.1.0/24');
      await user.type(input, '192.168.1.0/24');

      expect(input).toHaveValue('192.168.1.0/24');
    });

    it('should handle convert button click', async () => {
      const user = userEvent.setup();

      mockIpCidrUtils.validateCidr.mockReturnValue({
        isValid: true,
        ip: '192.168.1.0',
        prefixLength: 24,
        version: 'ipv4'
      });

      mockIpCidrUtils.parseCidr.mockReturnValue({
        isValid: true,
        networkAddress: '192.168.1.0',
        broadcastAddress: '192.168.1.255',
        subnetMask: '255.255.255.0',
        totalHosts: 256,
        usableHosts: 254,
        firstUsable: '192.168.1.1',
        lastUsable: '192.168.1.254'
      });

      mockIpCidrUtils.analyzeNetwork.mockReturnValue({
        isValid: true,
        cidr: '192.168.1.0/24',
        version: 'ipv4',
        networkAddress: '192.168.1.0',
        broadcastAddress: '192.168.1.255',
        subnetMask: '255.255.255.0',
        wildcardMask: '0.0.0.255',
        prefixLength: 24,
        totalHosts: 256,
        usableHosts: 254,
        firstUsable: '192.168.1.1',
        lastUsable: '192.168.1.254',
        networkClass: 'C',
        isPrivate: true,
        isLoopback: false,
        hostBits: 8,
        networkBits: 24
      });

      render(
        <TestWrapper>
          <IpCidrConverter />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('192.168.1.0/24');
      await user.type(input, '192.168.1.0/24');

      const convertButton = screen.getByRole('button', { name: /analyze network/i });
      await user.click(convertButton);

      expect(mockIpCidrUtils.validateCidr).toHaveBeenCalledWith('192.168.1.0/24');
    });

    it('should handle clear button click', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <IpCidrConverter />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('192.168.1.0/24');
      await user.type(input, '192.168.1.1');

      const clearButton = screen.getByRole('button', { name: /clear/i });
      await user.click(clearButton);

      expect(input).toHaveValue('');
    });
  });

  describe('Options Panel', () => {
    it('should toggle network information option', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <IpCidrConverter />
        </TestWrapper>
      );

      const checkbox = screen.getByLabelText('Show Network Analysis');
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it('should toggle subnet calculation option', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <IpCidrConverter />
        </TestWrapper>
      );

      const checkbox = screen.getByLabelText('Show Subnet Information');
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();
    });
  });

  describe('Analysis Results', () => {
    it('should display network analysis results', async () => {
      const user = userEvent.setup();

      mockIpCidrUtils.validateCidr.mockReturnValue({
        isValid: true,
        ip: '192.168.1.0',
        prefixLength: 24,
        version: 'ipv4'
      });

      mockIpCidrUtils.parseCidr.mockReturnValue({
        isValid: true,
        networkAddress: '192.168.1.0',
        broadcastAddress: '192.168.1.255',
        subnetMask: '255.255.255.0',
        totalHosts: 256,
        usableHosts: 254,
        firstUsable: '192.168.1.1',
        lastUsable: '192.168.1.254'
      });

      mockIpCidrUtils.analyzeNetwork.mockReturnValue({
        isValid: true,
        cidr: '192.168.1.0/24',
        version: 'ipv4',
        networkAddress: '192.168.1.0',
        broadcastAddress: '192.168.1.255',
        subnetMask: '255.255.255.0',
        wildcardMask: '0.0.0.255',
        prefixLength: 24,
        totalHosts: 256,
        usableHosts: 254,
        firstUsable: '192.168.1.1',
        lastUsable: '192.168.1.254',
        networkClass: 'C',
        isPrivate: true,
        isLoopback: false,
        hostBits: 8,
        networkBits: 24
      });

      render(
        <TestWrapper>
          <IpCidrConverter />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('192.168.1.0/24');
      await user.type(input, '192.168.1.0/24');

      const convertButton = screen.getByRole('button', { name: /analyze network/i });
      await user.click(convertButton);

      await waitFor(() => {
        expect(screen.getAllByText('192.168.1.0/24')).toHaveLength(2);
      });
    });

    it('should display error message for invalid input', async () => {
      const user = userEvent.setup();

      mockIpCidrUtils.validateCidr.mockReturnValue({
        isValid: false,
        ip: '',
        prefixLength: 0,
        version: null,
        error: 'Invalid CIDR notation'
      });

      render(
        <TestWrapper>
          <IpCidrConverter />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('192.168.1.0/24');
      await user.type(input, 'invalid-cidr');

      const convertButton = screen.getByRole('button', { name: /analyze network/i });
      await user.click(convertButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid CIDR notation')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle network analysis errors', async () => {
      const user = userEvent.setup();

      mockIpCidrUtils.validateCidr.mockReturnValue({
        isValid: true,
        ip: '192.168.1.0',
        prefixLength: 24,
        version: 'ipv4'
      });

      mockIpCidrUtils.parseCidr.mockReturnValue({
        isValid: false,
        error: 'Failed to parse CIDR'
      });

      render(
        <TestWrapper>
          <IpCidrConverter />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('192.168.1.0/24');
      await user.type(input, '192.168.1.0/24');

      const convertButton = screen.getByRole('button', { name: /analyze network/i });
      await user.click(convertButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to parse CIDR')).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should handle conversion process', async () => {
      const user = userEvent.setup();

      mockIpCidrUtils.validateCidr.mockReturnValue({
        isValid: true,
        ip: '192.168.1.0',
        prefixLength: 24,
        version: 'ipv4'
      });

      mockIpCidrUtils.parseCidr.mockReturnValue({
        isValid: true,
        networkAddress: '192.168.1.0',
        broadcastAddress: '192.168.1.255',
        subnetMask: '255.255.255.0',
        totalHosts: 256,
        usableHosts: 254,
        firstUsable: '192.168.1.1',
        lastUsable: '192.168.1.254'
      });

      mockIpCidrUtils.analyzeNetwork.mockReturnValue({
        isValid: true,
        cidr: '192.168.1.0/24',
        version: 'ipv4',
        networkAddress: '192.168.1.0',
        broadcastAddress: '192.168.1.255',
        subnetMask: '255.255.255.0',
        wildcardMask: '0.0.0.255',
        prefixLength: 24,
        totalHosts: 256,
        usableHosts: 254,
        firstUsable: '192.168.1.1',
        lastUsable: '192.168.1.254',
        networkClass: 'C',
        isPrivate: true,
        isLoopback: false,
        hostBits: 8,
        networkBits: 24
      });

      render(
        <TestWrapper>
          <IpCidrConverter />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('192.168.1.0/24');
      await user.type(input, '192.168.1.0/24');

      const convertButton = screen.getByRole('button', { name: /analyze network/i });
      await user.click(convertButton);

      // Check that the conversion process completes without errors
      await waitFor(() => {
        expect(mockIpCidrUtils.validateCidr).toHaveBeenCalledWith('192.168.1.0/24');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <TestWrapper>
          <IpCidrConverter />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Show Network Analysis')).toBeInTheDocument();
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <IpCidrConverter />
        </TestWrapper>
      );

      const input = screen.getByPlaceholderText('192.168.1.0/24');
      await user.type(input, '192.168.1.1');

      const convertButton = screen.getByRole('button', { name: /analyze network/i });
      await user.tab();
      expect(convertButton).toHaveFocus();
    });
  });
});
