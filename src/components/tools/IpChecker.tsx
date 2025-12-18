'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { CodeOutputPanel } from '@/components/ui/CodeOutputPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useCodeEditorTheme } from '@/hooks/useCodeEditorTheme';
import { DEFAULT_IP_OPTIONS, IpCheckerOptions, IpInfo, formatIpInfo, getPublicIpInfo } from '@/libs/ip-checker';
import { cn } from '@/libs/utils';
import { ArrowPathIcon, BuildingOfficeIcon, ClockIcon, GlobeAltIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useRef, useState } from 'react';

interface IpCheckerProps {
  className?: string;
}

export function IpChecker({ className }: IpCheckerProps) {
  const { toolState, updateToolState } = useToolState('ip-checker');

  // Initialize with defaults to avoid hydration mismatch
  const [options, setOptions] = useState<IpCheckerOptions>(DEFAULT_IP_OPTIONS);
  const [output, setOutput] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);
  const [lastChecked, setLastChecked] = useState<string>('');
  const [isHydrated, setIsHydrated] = useState(false);

  // Editor settings
  const [theme] = useCodeEditorTheme('basicDark');
  const [wrapText, setWrapText] = useState(true);

  // Use ref to get current options in callback
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Hydrate state from toolState after mount (client-side only)
  useEffect(() => {
    setIsHydrated(true);
    if (toolState) {
      if (toolState.options) setOptions(toolState.options as IpCheckerOptions);
      if (toolState.output) setOutput(toolState.output as string);
      if (toolState.error) setError(toolState.error as string);
      if (toolState.ipInfo) setIpInfo(toolState.ipInfo as IpInfo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update persistent state
  useEffect(() => {
    if (isHydrated) {
      updateToolState({
        options,
        output,
        error,
        ipInfo: ipInfo || undefined
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, output, error, ipInfo, isHydrated]);

  // Auto-refresh functionality
  useEffect(() => {
    if (options.autoRefresh && options.refreshInterval > 0) {
      const interval = setInterval(() => {
        handleCheckIp();
      }, options.refreshInterval * 1000);

      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval]);

  // Reset state when tool is cleared
  useEffect(() => {
    if (isHydrated && (!toolState || Object.keys(toolState).length === 0)) {
      setOptions(DEFAULT_IP_OPTIONS);
      setOutput('');
      setError('');
      setIpInfo(null);
      setLastChecked('');
    }
  }, [toolState, isHydrated]);

  const handleCheckIp = useCallback(async () => {
    setIsLoading(true);
    setError('');

    try {
      const info = await getPublicIpInfo();
      setIpInfo(info);

      const formatted = formatIpInfo(info, optionsRef.current);
      setOutput(formatted);
      setLastChecked(new Date().toLocaleString());
    } catch (err) {
      let errorMessage = 'Failed to get IP information';

      if (err instanceof Error) {
        if (err.message.includes('All IP services failed')) {
          errorMessage = 'Unable to connect to IP services. Please check your internet connection and try again.';
        } else if (err.message.includes('timeout')) {
          errorMessage = 'Request timed out. Please try again.';
        } else if (err.message.includes('HTTP error')) {
          errorMessage = 'Service temporarily unavailable. Please try again later.';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setOutput('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleOptionChange = (key: keyof IpCheckerOptions, value: unknown) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const getLineCount = (text: string): number => {
    if (!text) return 0;
    return text.split('\n').length;
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header Section */}
      <div className="bg-background px-[28px] pt-[36px] pb-[20px]">
        <h1 className="text-[32px] font-normal leading-6 tracking-normal text-neutral-900 dark:text-neutral-100 mb-3">
          IP Address Lookup
        </h1>
        <p className="text-sm leading-5 tracking-normal text-neutral-900 dark:text-neutral-100">
          Look up information about your current public IP address and network details
        </p>
      </div>

      {/* Body Section */}
      <div className="flex-1 bg-background px-[24px] pt-6 pb-10">
        <div className="flex flex-col gap-4">
          {/* Controls */}
          <div className="flex flex-col gap-4">
            {/* Main Controls Row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Show Location */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={options.showLocation}
                  onCheckedChange={(checked) => handleOptionChange('showLocation', checked)}
                  size="sm"
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                  <MapPinIcon className="h-4 w-4" />
                  Location
                </span>
              </div>

              {/* Show ISP */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={options.showISP}
                  onCheckedChange={(checked) => handleOptionChange('showISP', checked)}
                  size="sm"
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                  <BuildingOfficeIcon className="h-4 w-4" />
                  ISP
                </span>
              </div>

              {/* Show Timezone */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={options.showTimezone}
                  onCheckedChange={(checked) => handleOptionChange('showTimezone', checked)}
                  size="sm"
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  Timezone
                </span>
              </div>

              {/* Show IPv6 */}
              <div className="flex items-center gap-2">
                <Switch
                  checked={options.showIPv6}
                  onCheckedChange={(checked) => handleOptionChange('showIPv6', checked)}
                  size="sm"
                />
                <span className="text-sm text-neutral-600 dark:text-neutral-400 flex items-center gap-1">
                  <GlobeAltIcon className="h-4 w-4" />
                  IPv6
                </span>
              </div>
            </div>

            {/* Second Controls Row */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Auto Refresh */}
              <Select
                value={options.autoRefresh ? options.refreshInterval.toString() : 'off'}
                onValueChange={(value) => {
                  if (value === 'off') {
                    handleOptionChange('autoRefresh', false);
                  } else {
                    handleOptionChange('autoRefresh', true);
                    handleOptionChange('refreshInterval', parseInt(value));
                  }
                }}
              >
                <SelectTrigger label="Auto Refresh:">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="off">Off</SelectItem>
                  <SelectItem value="30">30 seconds</SelectItem>
                  <SelectItem value="60">1 minute</SelectItem>
                  <SelectItem value="300">5 minutes</SelectItem>
                </SelectContent>
              </Select>

              {/* Check IP Button */}
              <Button
                onClick={handleCheckIp}
                disabled={isLoading}
                variant="default"
                size="default"
              >
                {isLoading ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 animate-spin mr-2" />
                    Checking...
                  </>
                ) : (
                  'Check My IP'
                )}
              </Button>
            </div>
          </div>

          {/* Output Panel */}
          <CodeOutputPanel
            title="IP Information"
            value={output}
            language="json"
            height="500px"
            theme={theme}
            wrapText={wrapText}
            onWrapTextChange={setWrapText}
            footerLeftContent={
              output && (
                <>
                  <span>{getLineCount(output)} lines</span>
                  {lastChecked && <span>Last checked: {lastChecked}</span>}
                </>
              )
            }
          />

          {/* Error Display */}
          {error && (
            <div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
