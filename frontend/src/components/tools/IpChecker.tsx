import { useToolState } from '@/components/providers/ToolStateProvider';
import { OutputDisplay } from '@/components/ui/OutputDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_IP_OPTIONS, IpCheckerOptions, IpInfo, formatIpInfo, getPublicIpInfo } from '@/lib/ip-checker';
import { Building, Clock, Globe, Loader2, MapPin, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface IpCheckerProps {
  className?: string;
}

export function IpChecker({ className }: IpCheckerProps) {
  const { toolState, updateToolState } = useToolState('ip-checker');

  const [options, setOptions] = useState<IpCheckerOptions>(
    (toolState?.options as IpCheckerOptions) || DEFAULT_IP_OPTIONS
  );
  const [output, setOutput] = useState<string>(toolState?.output || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>(toolState?.error || '');
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(toolState?.ipInfo || null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('');

  // Use ref to get current options in callback
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Update persistent state
  useEffect(() => {
    updateToolState({
      options,
      output,
      error,
      ipInfo: ipInfo || undefined
    });
  }, [options, output, error, ipInfo]);

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
    if (!toolState || Object.keys(toolState).length === 0) {
      setOptions(DEFAULT_IP_OPTIONS);
      setOutput('');
      setError('');
      setIpInfo(null);
      setLastChecked('');
    }
  }, [toolState]);

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

  const handleCopyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleOptionChange = (key: keyof IpCheckerOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6" />
            IP Address Lookup
          </CardTitle>
          <CardDescription>
            Look up information about your current public IP address and network details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Display Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="showLocation"
                checked={options.showLocation}
                onCheckedChange={(checked) => handleOptionChange('showLocation', checked)}
              />
              <Label htmlFor="showLocation" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Show Location
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showISP"
                checked={options.showISP}
                onCheckedChange={(checked) => handleOptionChange('showISP', checked)}
              />
              <Label htmlFor="showISP" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Show ISP Info
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showTimezone"
                checked={options.showTimezone}
                onCheckedChange={(checked) => handleOptionChange('showTimezone', checked)}
              />
              <Label htmlFor="showTimezone" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Show Timezone
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="showIPv6"
                checked={options.showIPv6}
                onCheckedChange={(checked) => handleOptionChange('showIPv6', checked)}
              />
              <Label htmlFor="showIPv6" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Show IPv6
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="autoRefresh"
                checked={options.autoRefresh}
                onCheckedChange={(checked) => handleOptionChange('autoRefresh', checked)}
              />
              <Label htmlFor="autoRefresh">Auto Refresh</Label>
            </div>
          </div>

          {/* Auto Refresh Settings */}
          {options.autoRefresh && (
            <div className="space-y-2">
              <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
              <Input
                id="refreshInterval"
                type="number"
                min="10"
                max="300"
                value={options.refreshInterval}
                onChange={(e) => handleOptionChange('refreshInterval', parseInt(e.target.value) || 30)}
                className="w-32"
              />
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleCheckIp}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking IP...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Check My IP
                </>
              )}
            </Button>
          </div>

          {/* Status */}
          {lastChecked && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="outline">
                Last checked: {lastChecked}
              </Badge>
              {options.autoRefresh && (
                <Badge variant="secondary">
                  Auto-refresh: {options.refreshInterval}s
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Output */}
      {output && (
        <OutputDisplay
          content={output}
          title="IP Information"
        />
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="text-destructive text-sm">
                <strong>Error:</strong> {error}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCheckIp}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
