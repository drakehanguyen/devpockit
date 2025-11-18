'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CodeEditor } from '@/components/ui/CodeEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    analyzeNetwork,
    calculateSubnets,
    getCidrSuggestions,
    getNetworkStats,
    ipToCidrAuto,
    parseCidr,
    validateCidr,
    validateIpAddress
} from '@/libs/ip-cidr';
import { ExclamationTriangleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';

interface IpCidrConverterProps {
  onResult?: (result: string) => void;
  onError?: (error: string) => void;
}

export function IpCidrConverter({ onResult, onError }: IpCidrConverterProps) {
  // State management
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'ip' | 'cidr'>('cidr');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedExample, setSelectedExample] = useState('');
  const [showNetworkInfo, setShowNetworkInfo] = useState(true);
  const [showSubnetInfo, setShowSubnetInfo] = useState(false);
  const [showStatistics, setShowStatistics] = useState(false);
  const [maxSubnets, setMaxSubnets] = useState(8);

  // Tool state persistence
  const { toolState, updateToolState, clearToolState } = useToolState('ip-cidr-converter');

  // Initialize state from tool state
  useEffect(() => {
    if (toolState && Object.keys(toolState).length > 0) {
      setInput(toolState.input || '');
      setInputType(toolState.inputType || 'cidr');
      setOutput(toolState.output || '');
      setError(toolState.error || '');
      setShowNetworkInfo(toolState.options?.showNetworkInfo ?? true);
      setShowSubnetInfo(toolState.options?.showSubnetInfo ?? false);
      setShowStatistics(toolState.options?.showStatistics ?? false);
      setMaxSubnets(toolState.options?.maxSubnets ?? 8);
    }
  }, [toolState]);

  // Reset state when tool is cleared
  useEffect(() => {
    if (!toolState || Object.keys(toolState).length === 0) {
      setInput('');
      setInputType('cidr');
      setOutput('');
      setError('');
      setShowNetworkInfo(true);
      setShowSubnetInfo(false);
      setShowStatistics(false);
      setMaxSubnets(8);
      setSelectedExample('');
    }
  }, [toolState]);

  // Update tool state
  const updateState = useCallback((updates: any) => {
    updateToolState({
      input,
      inputType,
      output,
      error,
      options: {
        showNetworkInfo,
        showSubnetInfo,
        showStatistics,
        maxSubnets
      },
      ...updates
    });
  }, [input, inputType, output, error, showNetworkInfo, showSubnetInfo, showStatistics, maxSubnets, updateToolState]);

  // Handle input change
  const handleInputChange = (value: string) => {
    setInput(value);
    setError('');
    updateState({ input: value, error: '' });
  };

  // Handle input type change
  const handleInputTypeChange = (type: 'ip' | 'cidr') => {
    setInputType(type);
    setError('');
    updateState({ inputType: type, error: '' });
  };

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // Handle example selection
  const handleLoadExample = (example: string) => {
    setInput(example);
    setError('');
    setSelectedExample(example);
    updateState({ input: example, error: '', selectedExample: example });
  };

  // Main conversion function
  const handleConvert = async () => {
    if (!input.trim()) {
      setError('Please enter an IP address or CIDR notation');
      onError?.('Please enter an IP address or CIDR notation');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result = '';
      let analysisResult = null;
      let subnetResult = null;
      let statsResult = null;

      if (inputType === 'ip') {
        // IP to CIDR conversion
        const ipValidation = validateIpAddress(input);
        if (!ipValidation.isValid) {
          throw new Error(ipValidation.error || 'Invalid IP address');
        }

        const autoResult = ipToCidrAuto(input);
        if (!autoResult.isValid) {
          throw new Error(autoResult.error || 'Failed to convert IP to CIDR');
        }

        result = `IP: ${input}\nSuggested CIDR: ${autoResult.cidr}\nNetwork: ${autoResult.networkAddress}\nSubnet Mask: ${autoResult.subnetMask}`;

        // Get suggestions
        const suggestions = getCidrSuggestions(input);
        if (suggestions.length > 0) {
          result += `\n\nOther CIDR Options:\n${suggestions.map(s => `  ${s}`).join('\n')}`;
        }

        // Analyze the suggested CIDR
        analysisResult = analyzeNetwork(autoResult.cidr);
      } else {
        // CIDR analysis
        const cidrValidation = validateCidr(input);
        if (!cidrValidation.isValid) {
          throw new Error(cidrValidation.error || 'Invalid CIDR notation');
        }

        const parseResult = parseCidr(input);
        if (!parseResult.isValid) {
          throw new Error(parseResult.error || 'Failed to parse CIDR');
        }

        result = `CIDR: ${input}\nNetwork: ${parseResult.networkAddress}\nBroadcast: ${parseResult.broadcastAddress}\nSubnet Mask: ${parseResult.subnetMask}\nTotal Hosts: ${parseResult.totalHosts}\nUsable Hosts: ${parseResult.usableHosts}`;

        if (parseResult.firstUsable && parseResult.lastUsable) {
          result += `\nFirst Usable: ${parseResult.firstUsable}\nLast Usable: ${parseResult.lastUsable}`;
        }

        // Get comprehensive analysis
        analysisResult = analyzeNetwork(input);
      }

      // Add network analysis if enabled
      if (showNetworkInfo && analysisResult?.isValid) {
        result += `\n\n=== Network Analysis ===\n`;
        result += `Network Class: ${analysisResult.networkClass}\n`;
        result += `Wildcard Mask: ${analysisResult.wildcardMask}\n`;
        result += `Host Bits: ${analysisResult.hostBits}\n`;
        result += `Network Bits: ${analysisResult.networkBits}\n`;
        result += `Is Private: ${analysisResult.isPrivate ? 'Yes' : 'No'}\n`;
        result += `Is Loopback: ${analysisResult.isLoopback ? 'Yes' : 'No'}\n`;
        if (analysisResult.isMulticast) {
          result += `Is Multicast: Yes\n`;
        }
        if (analysisResult.isLinkLocal) {
          result += `Is Link Local: Yes\n`;
        }
      }

      // Add subnet information if enabled
      if (showSubnetInfo && analysisResult?.isValid && analysisResult.totalHosts > 2) {
        const subnetCount = Math.min(maxSubnets, Math.floor(Math.log2(analysisResult.totalHosts)));
        if (subnetCount > 1) {
          subnetResult = calculateSubnets(input, subnetCount);
          if (subnetResult.isValid) {
            result += `\n\n=== Subnet Information ===\n`;
            result += `Total Subnets: ${subnetResult.totalSubnets}\n`;
            result += `Hosts per Subnet: ${subnetResult.hostsPerSubnet}\n\n`;
            result += `Subnets:\n`;
            subnetResult.subnets.forEach((subnet, index) => {
              result += `  Subnet ${index + 1}: ${subnet.network} - ${subnet.broadcast}\n`;
              if (subnet.firstUsable && subnet.lastUsable) {
                result += `    Usable: ${subnet.firstUsable} - ${subnet.lastUsable}\n`;
              }
            });
          }
        }
      }

      // Add statistics if enabled
      if (showStatistics && analysisResult?.isValid) {
        statsResult = getNetworkStats(input);
        if (statsResult.isValid) {
          result += `\n\n=== Network Statistics ===\n`;
          result += `Network Size: ${statsResult.networkSize}\n`;
          result += `Host Density: ${statsResult.hostDensity}\n`;
          result += `Common Uses: ${statsResult.commonUses.join(', ')}\n`;
          if (statsResult.subnetRecommendations.length > 0) {
            result += `\nSubnet Recommendations:\n`;
            statsResult.subnetRecommendations.forEach(rec => {
              result += `  ${rec}\n`;
            });
          }
        }
      }

      setOutput(result);
      setError('');
      updateState({ output: result, error: '' });
      onResult?.(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during conversion';
      setError(errorMessage);
      setOutput('');
      updateState({ error: errorMessage, output: '' });
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle clear
  const handleClear = () => {
    setInput('');
    setOutput('');
    setError('');
    setSelectedExample('');
    updateState({ input: '', output: '', error: '', selectedExample: '' });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 'Enter':
            event.preventDefault();
            handleConvert();
            break;
          case 'k':
            event.preventDefault();
            handleClear();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [input, inputType, showNetworkInfo, showSubnetInfo, showStatistics, maxSubnets]);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InformationCircleIcon className="h-5 w-5" />
            IP Address CIDR Converter
          </CardTitle>
          <CardDescription>
            Convert between IP addresses and CIDR notation, analyze network properties, and calculate subnet information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Type Selection */}
          <div className="flex gap-2">
            <Button
              variant={inputType === 'cidr' ? 'default' : 'outline'}
              onClick={() => handleInputTypeChange('cidr')}
              className="flex-1"
            >
              CIDR Analysis
            </Button>
            <Button
              variant={inputType === 'ip' ? 'default' : 'outline'}
              onClick={() => handleInputTypeChange('ip')}
              className="flex-1"
            >
              IP to CIDR
            </Button>
          </div>

          {/* Input Field */}
          <div className="space-y-2">
            <Label htmlFor="input">
              {inputType === 'cidr' ? 'CIDR Notation' : 'IP Address'}
            </Label>
            <Input
              id="input"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder={inputType === 'cidr' ? '192.168.1.0/24' : '192.168.1.1'}
              className="font-mono"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleConvert} disabled={loading || !input.trim()}>
              {loading ? 'Analyzing...' : inputType === 'cidr' ? 'Analyze Network' : 'Convert to CIDR'}
            </Button>
            <Button variant="outline" onClick={handleClear}>
              Clear
            </Button>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showNetworkInfo"
                checked={showNetworkInfo}
                onChange={(e) => {
                  setShowNetworkInfo(e.target.checked);
                  updateState({ options: { ...toolState?.options, showNetworkInfo: e.target.checked } });
                }}
                className="rounded"
              />
              <Label htmlFor="showNetworkInfo">Show Network Analysis</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showSubnetInfo"
                checked={showSubnetInfo}
                onChange={(e) => {
                  setShowSubnetInfo(e.target.checked);
                  updateState({ options: { ...toolState?.options, showSubnetInfo: e.target.checked } });
                }}
                className="rounded"
              />
              <Label htmlFor="showSubnetInfo">Show Subnet Information</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showStatistics"
                checked={showStatistics}
                onChange={(e) => {
                  setShowStatistics(e.target.checked);
                  updateState({ options: { ...toolState?.options, showStatistics: e.target.checked } });
                }}
                className="rounded"
              />
              <Label htmlFor="showStatistics">Show Network Statistics</Label>
            </div>
            {showSubnetInfo && (
              <div className="space-y-2">
                <Label htmlFor="maxSubnets">Maximum Subnets</Label>
                <Select
                  value={maxSubnets.toString()}
                  onValueChange={(value) => {
                    setMaxSubnets(parseInt(value));
                    updateState({ options: { ...toolState?.options, maxSubnets: parseInt(value) } });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="4">4</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="16">16</SelectItem>
                    <SelectItem value="32">32</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 mt-2">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Output Section */}
      {output && (
        <CodeEditor
          mode="output"
          outputValue={output}
          language="plaintext"
          title="Result"
          showStats={true}
          height="300px"
        />
      )}

      {/* Network Information Display */}
      {output && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <InformationCircleIcon className="h-5 w-5" />
              Network Information
            </CardTitle>
            <CardDescription>
              Detailed network analysis and properties
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Network Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Network Address</Label>
                <div className="p-3 bg-gray-50 rounded-md font-mono text-sm">
                  {(() => {
                    try {
                      if (inputType === 'ip') {
                        const autoResult = ipToCidrAuto(input);
                        return autoResult.isValid ? autoResult.networkAddress : 'N/A';
                      } else {
                        const parseResult = parseCidr(input);
                        return parseResult.isValid ? parseResult.networkAddress : 'N/A';
                      }
                    } catch {
                      return 'N/A';
                    }
                  })()}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Broadcast Address</Label>
                <div className="p-3 bg-gray-50 rounded-md font-mono text-sm">
                  {(() => {
                    try {
                      if (inputType === 'cidr') {
                        const parseResult = parseCidr(input);
                        return parseResult.isValid ? parseResult.broadcastAddress : 'N/A';
                      }
                      return 'N/A';
                    } catch {
                      return 'N/A';
                    }
                  })()}
                </div>
              </div>
            </div>

            {/* Subnet Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Subnet Mask</Label>
                <div className="p-3 bg-gray-50 rounded-md font-mono text-sm">
                  {(() => {
                    try {
                      if (inputType === 'ip') {
                        const autoResult = ipToCidrAuto(input);
                        return autoResult.isValid ? autoResult.subnetMask : 'N/A';
                      } else {
                        const parseResult = parseCidr(input);
                        return parseResult.isValid ? parseResult.subnetMask : 'N/A';
                      }
                    } catch {
                      return 'N/A';
                    }
                  })()}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Wildcard Mask</Label>
                <div className="p-3 bg-gray-50 rounded-md font-mono text-sm">
                  {(() => {
                    try {
                      const analysis = analyzeNetwork(inputType === 'ip' ? ipToCidrAuto(input).cidr : input);
                      return analysis.isValid ? analysis.wildcardMask : 'N/A';
                    } catch {
                      return 'N/A';
                    }
                  })()}
                </div>
              </div>
            </div>

            {/* Host Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Total Hosts</Label>
                <div className="p-3 bg-blue-50 rounded-md">
                  <div className="text-2xl font-bold text-blue-600">
                    {(() => {
                      try {
                        if (inputType === 'ip') {
                          const autoResult = ipToCidrAuto(input);
                          const analysis = analyzeNetwork(autoResult.cidr);
                          return analysis.isValid ? analysis.totalHosts.toLocaleString() : 'N/A';
                        } else {
                          const parseResult = parseCidr(input);
                          return parseResult.isValid ? parseResult.totalHosts.toLocaleString() : 'N/A';
                        }
                      } catch {
                        return 'N/A';
                      }
                    })()}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Usable Hosts</Label>
                <div className="p-3 bg-green-50 rounded-md">
                  <div className="text-2xl font-bold text-green-600">
                    {(() => {
                      try {
                        if (inputType === 'ip') {
                          const autoResult = ipToCidrAuto(input);
                          const analysis = analyzeNetwork(autoResult.cidr);
                          return analysis.isValid ? analysis.usableHosts.toLocaleString() : 'N/A';
                        } else {
                          const parseResult = parseCidr(input);
                          return parseResult.isValid ? parseResult.usableHosts.toLocaleString() : 'N/A';
                        }
                      } catch {
                        return 'N/A';
                      }
                    })()}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Network Class</Label>
                <div className="p-3 bg-purple-50 rounded-md">
                  <div className="text-lg font-semibold text-purple-600">
                    {(() => {
                      try {
                        const analysis = analyzeNetwork(inputType === 'ip' ? ipToCidrAuto(input).cidr : input);
                        return analysis.isValid ? analysis.networkClass : 'N/A';
                      } catch {
                        return 'N/A';
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Network Properties */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Network Properties</Label>
              <div className="flex flex-wrap gap-2">
                {(() => {
                  try {
                    const analysis = analyzeNetwork(inputType === 'ip' ? ipToCidrAuto(input).cidr : input);
                    if (!analysis.isValid) return null;

                    const badges = [];
                    if (analysis.isPrivate) badges.push(<Badge key="private" variant="secondary">Private</Badge>);
                    if (analysis.isLoopback) badges.push(<Badge key="loopback" variant="secondary">Loopback</Badge>);
                    if (analysis.isMulticast) badges.push(<Badge key="multicast" variant="secondary">Multicast</Badge>);
                    if (analysis.isLinkLocal) badges.push(<Badge key="linklocal" variant="secondary">Link Local</Badge>);
                    if (!analysis.isPrivate && !analysis.isLoopback && !analysis.isMulticast && !analysis.isLinkLocal) {
                      badges.push(<Badge key="public" variant="default">Public</Badge>);
                    }
                    return badges;
                  } catch {
                    return null;
                  }
                })()}
              </div>
            </div>

            {/* Bit Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Network Bits</Label>
                <div className="p-3 bg-gray-50 rounded-md text-center">
                  <div className="text-xl font-bold">
                    {(() => {
                      try {
                        const analysis = analyzeNetwork(inputType === 'ip' ? ipToCidrAuto(input).cidr : input);
                        return analysis.isValid ? analysis.networkBits : 'N/A';
                      } catch {
                        return 'N/A';
                      }
                    })()}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-600">Host Bits</Label>
                <div className="p-3 bg-gray-50 rounded-md text-center">
                  <div className="text-xl font-bold">
                    {(() => {
                      try {
                        const analysis = analyzeNetwork(inputType === 'ip' ? ipToCidrAuto(input).cidr : input);
                        return analysis.isValid ? analysis.hostBits : 'N/A';
                      } catch {
                        return 'N/A';
                      }
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Usable Range */}
            {(() => {
              try {
                if (inputType === 'cidr') {
                  const parseResult = parseCidr(input);
                  if (parseResult.isValid && parseResult.firstUsable && parseResult.lastUsable) {
                    return (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-600">Usable IP Range</Label>
                        <div className="p-3 bg-green-50 rounded-md">
                          <div className="font-mono text-sm">
                            <div className="text-green-700">
                              <strong>First Usable:</strong> {parseResult.firstUsable}
                            </div>
                            <div className="text-green-700">
                              <strong>Last Usable:</strong> {parseResult.lastUsable}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                }
                return null;
              } catch {
                return null;
              }
            })()}
          </CardContent>
        </Card>
      )}

      {/* Examples Section */}
      <Card>
        <CardHeader>
          <CardTitle>Examples & Common Networks</CardTitle>
          <CardDescription>Click on an example to load it into the input field</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Quick Reference */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-blue-800">📚 Quick Reference</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="space-y-1">
                  <div className="font-mono text-blue-700">/24 = 254 hosts</div>
                  <div className="font-mono text-blue-700">/25 = 126 hosts</div>
                  <div className="font-mono text-blue-700">/26 = 62 hosts</div>
                  <div className="font-mono text-blue-700">/27 = 30 hosts</div>
                </div>
                <div className="space-y-1">
                  <div className="font-mono text-blue-700">/28 = 14 hosts</div>
                  <div className="font-mono text-blue-700">/29 = 6 hosts</div>
                  <div className="font-mono text-blue-700">/30 = 2 hosts</div>
                  <div className="font-mono text-blue-700">/32 = 1 host</div>
                </div>
              </div>
            </div>

            {/* Common Networks */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <span>🏠</span>
                Common Private Networks
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Button
                    variant={selectedExample === '192.168.1.0/24' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLoadExample('192.168.1.0/24')}
                    className="w-full justify-start text-left"
                  >
                    <div>
                      <div className="font-mono text-xs">192.168.1.0/24</div>
                      <div className="text-xs text-gray-500">Home Network (254 hosts)</div>
                    </div>
                  </Button>
                  <Button
                    variant={selectedExample === '10.0.0.0/8' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLoadExample('10.0.0.0/8')}
                    className="w-full justify-start text-left"
                  >
                    <div>
                      <div className="font-mono text-xs">10.0.0.0/8</div>
                      <div className="text-xs text-gray-500">Class A Private (16M hosts)</div>
                    </div>
                  </Button>
                </div>
                <div className="space-y-2">
                  <Button
                    variant={selectedExample === '172.16.0.0/12' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLoadExample('172.16.0.0/12')}
                    className="w-full justify-start text-left"
                  >
                    <div>
                      <div className="font-mono text-xs">172.16.0.0/12</div>
                      <div className="text-xs text-gray-500">Class B Private (1M hosts)</div>
                    </div>
                  </Button>
                  <Button
                    variant={selectedExample === '192.168.0.0/16' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLoadExample('192.168.0.0/16')}
                    className="w-full justify-start text-left"
                  >
                    <div>
                      <div className="font-mono text-xs">192.168.0.0/16</div>
                      <div className="text-xs text-gray-500">Class C Private (65K hosts)</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Subnet Sizes */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <span>📏</span>
                Common Subnet Sizes
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { cidr: '192.168.1.0/24', hosts: '254', desc: 'Standard /24' },
                  { cidr: '192.168.1.0/25', hosts: '126', desc: 'Half /24' },
                  { cidr: '192.168.1.0/26', hosts: '62', desc: 'Quarter /24' },
                  { cidr: '192.168.1.0/27', hosts: '30', desc: 'Eighth /24' },
                  { cidr: '192.168.1.0/28', hosts: '14', desc: 'Sixteenth /24' },
                  { cidr: '192.168.1.0/29', hosts: '6', desc: 'Small subnet' },
                  { cidr: '192.168.1.0/30', hosts: '2', desc: 'Point-to-point' },
                  { cidr: '192.168.1.1/32', hosts: '1', desc: 'Single host' }
                ].map(({ cidr, hosts, desc }) => (
                  <Button
                    key={cidr}
                    variant={selectedExample === cidr ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLoadExample(cidr)}
                    className="flex flex-col h-auto py-2"
                  >
                    <div className="font-mono text-xs">{cidr}</div>
                    <div className="text-xs text-gray-500">{hosts} hosts</div>
                    <div className="text-xs text-gray-400">{desc}</div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Special Purpose Networks */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <span>⚙️</span>
                Special Purpose Networks
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Button
                    variant={selectedExample === '127.0.0.1/32' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLoadExample('127.0.0.1/32')}
                    className="w-full justify-start text-left"
                  >
                    <div>
                      <div className="font-mono text-xs">127.0.0.1/32</div>
                      <div className="text-xs text-gray-500">Loopback Address</div>
                    </div>
                  </Button>
                  <Button
                    variant={selectedExample === '169.254.0.0/16' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLoadExample('169.254.0.0/16')}
                    className="w-full justify-start text-left"
                  >
                    <div>
                      <div className="font-mono text-xs">169.254.0.0/16</div>
                      <div className="text-xs text-gray-500">Link Local (APIPA)</div>
                    </div>
                  </Button>
                </div>
                <div className="space-y-2">
                  <Button
                    variant={selectedExample === '224.0.0.0/4' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLoadExample('224.0.0.0/4')}
                    className="w-full justify-start text-left"
                  >
                    <div>
                      <div className="font-mono text-xs">224.0.0.0/4</div>
                      <div className="text-xs text-gray-500">Multicast Range</div>
                    </div>
                  </Button>
                  <Button
                    variant={selectedExample === '203.0.113.0/24' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLoadExample('203.0.113.0/24')}
                    className="w-full justify-start text-left"
                  >
                    <div>
                      <div className="font-mono text-xs">203.0.113.0/24</div>
                      <div className="text-xs text-gray-500">Documentation (RFC 5737)</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* IPv6 Examples */}
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <span>🔢</span>
                IPv6 Networks
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Button
                    variant={selectedExample === '2001:db8::/32' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLoadExample('2001:db8::/32')}
                    className="w-full justify-start text-left"
                  >
                    <div>
                      <div className="font-mono text-xs">2001:db8::/32</div>
                      <div className="text-xs text-gray-500">Documentation (RFC 3849)</div>
                    </div>
                  </Button>
                  <Button
                    variant={selectedExample === 'fe80::/64' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLoadExample('fe80::/64')}
                    className="w-full justify-start text-left"
                  >
                    <div>
                      <div className="font-mono text-xs">fe80::/64</div>
                      <div className="text-xs text-gray-500">Link Local</div>
                    </div>
                  </Button>
                </div>
                <div className="space-y-2">
                  <Button
                    variant={selectedExample === 'fd00::/8' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLoadExample('fd00::/8')}
                    className="w-full justify-start text-left"
                  >
                    <div>
                      <div className="font-mono text-xs">fd00::/8</div>
                      <div className="text-xs text-gray-500">Unique Local</div>
                    </div>
                  </Button>
                  <Button
                    variant={selectedExample === 'ff00::/8' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLoadExample('ff00::/8')}
                    className="w-full justify-start text-left"
                  >
                    <div>
                      <div className="font-mono text-xs">ff00::/8</div>
                      <div className="text-xs text-gray-500">Multicast</div>
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            {/* Network Classes Reference */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3 text-gray-800">📋 Network Classes Reference</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="font-semibold text-gray-700">Class A</div>
                  <div className="text-gray-600">1.0.0.0 - 126.255.255.255</div>
                  <div className="text-gray-500">/8 (16M hosts)</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Class B</div>
                  <div className="text-gray-600">128.0.0.0 - 191.255.255.255</div>
                  <div className="text-gray-500">/16 (65K hosts)</div>
                </div>
                <div>
                  <div className="font-semibold text-gray-700">Class C</div>
                  <div className="text-gray-600">192.0.0.0 - 223.255.255.255</div>
                  <div className="text-gray-500">/24 (254 hosts)</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-2">💡 Tips:</p>
            <ul className="space-y-1 text-sm">
              <li>• Use <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Ctrl+Enter</kbd> to convert</li>
              <li>• Use <kbd className="px-1 py-0.5 bg-blue-100 rounded text-xs">Ctrl+K</kbd> to clear</li>
              <li>• Click examples to load them into the input field</li>
              <li>• Enable options to see detailed network analysis</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
