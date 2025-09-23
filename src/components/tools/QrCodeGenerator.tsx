'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  DEFAULT_QR_OPTIONS,
  QR_CODE_COLOR_PRESETS,
  QR_CODE_ERROR_CORRECTIONS,
  QR_CODE_EXAMPLES,
  QR_CODE_FORMATS,
  QR_CODE_SIZE_LIMITS,
  QR_CODE_TYPES
} from '@/config/qr-code-generator-config';
import {
  copyQrCodeToClipboard,
  downloadQrCode,
  generateQrCode,
  getQrCodeStats,
  type QrCodeInput,
  type QrCodeOptions,
  type QrCodeResult
} from '@/libs/qr-code-generator';
import { ArrowDownTrayIcon, ArrowPathIcon, ClipboardDocumentIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import { useEffect, useRef, useState } from 'react';

interface QrCodeGeneratorProps {
  className?: string;
}

export function QrCodeGenerator({ className }: QrCodeGeneratorProps) {
  const { toolState, updateToolState } = useToolState('qr-code-generator');

  // Initialize with persistent state or defaults
  const [options, setOptions] = useState<QrCodeOptions>(
    (toolState?.options as QrCodeOptions) || DEFAULT_QR_OPTIONS
  );
  const [input, setInput] = useState<QrCodeInput>(
    (toolState?.input as QrCodeInput) || { text: '' }
  );
  const [output, setOutput] = useState<string>(toolState?.output || '');
  const [qrCodeResult, setQrCodeResult] = useState<QrCodeResult | null>(
    (toolState?.qrCodeResult as QrCodeResult) || null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>(toolState?.error || '');
  const [stats, setStats] = useState<{
    type: string;
    size: number;
    errorCorrection: string;
    format: string;
    dataUrlLength: number;
    estimatedCapacity: number;
  } | null>(
    (toolState?.stats as {
      type: string;
      size: number;
      errorCorrection: string;
      format: string;
      dataUrlLength: number;
      estimatedCapacity: number;
    }) || null
  );
  const [copySuccess, setCopySuccess] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Use ref to get current options in callback
  const optionsRef = useRef(options);
  optionsRef.current = options;

  // Update persistent state whenever local state changes
  useEffect(() => {
    updateToolState({
      options,
      input,
      output,
      error,
      qrCodeResult: qrCodeResult || undefined,
      stats: stats || undefined
    });
  }, [options, input, output, error, qrCodeResult, stats]);

  // Reset state when tool is cleared
  useEffect(() => {
    if (!toolState || Object.keys(toolState).length === 0) {
      setOptions(DEFAULT_QR_OPTIONS);
      setInput({ text: '' });
      setOutput('');
      setQrCodeResult(null);
      setError('');
      setStats(null);
    }
  }, [toolState]);

  const handleGenerateQrCode = async () => {
    setIsGenerating(true);
    setError('');

    try {
      const result = await generateQrCode(input, optionsRef.current);
      setQrCodeResult(result);
      setOutput(result.dataUrl);

      const qrStats = getQrCodeStats(result);
      setStats(qrStats);
    } catch (err) {
      let errorMessage = 'Failed to generate QR code';

      if (err instanceof Error) {
        if (err.message.includes('Text is required')) {
          errorMessage = 'Please enter some text to generate a QR code';
        } else if (err.message.includes('URL is required')) {
          errorMessage = 'Please enter a URL to generate a QR code';
        } else if (err.message.includes('Contact name is required')) {
          errorMessage = 'Please enter a contact name';
        } else if (err.message.includes('WiFi SSID is required')) {
          errorMessage = 'Please enter a WiFi SSID';
        } else if (err.message.includes('Phone number is required')) {
          errorMessage = 'Please enter a phone number for SMS QR code';
        } else if (err.message.includes('Email address is required')) {
          errorMessage = 'Please enter an email address';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
      setOutput('');
      setQrCodeResult(null);
      setStats(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyOutput = async () => {
    if (!qrCodeResult) return;

    try {
      await copyQrCodeToClipboard(qrCodeResult);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownloadQrCode = () => {
    if (!qrCodeResult) return;

    try {
      downloadQrCode(qrCodeResult);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (err) {
      console.error('Failed to download:', err);
    }
  };

  const handleOptionChange = (key: keyof QrCodeOptions, value: any) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleInputChange = (key: keyof QrCodeInput, value: any) => {
    setInput(prev => ({ ...prev, [key]: value }));
  };

  const handleContactChange = (key: string, value: string) => {
    setInput(prev => ({
      ...prev,
      contact: {
        name: '', // Default required field
        ...(prev.contact || {}),
        [key]: value
      }
    }));
  };

  const handleWifiChange = (key: string, value: any) => {
    setInput(prev => ({
      ...prev,
      wifi: {
        ssid: '', // Default required field
        password: '', // Default required field
        security: 'WPA' as const, // Default required field
        ...(prev.wifi || {}),
        [key]: value
      }
    }));
  };

  const handleSmsChange = (key: string, value: string) => {
    setInput(prev => ({
      ...prev,
      sms: {
        phone: '', // Default required field
        message: '', // Default required field
        ...(prev.sms || {}),
        [key]: value
      }
    }));
  };

  const handleEmailChange = (key: string, value: string) => {
    setInput(prev => ({
      ...prev,
      email: {
        to: '', // Default required field
        ...(prev.email || {}),
        [key]: value
      }
    }));
  };

  const handleColorPreset = (preset: typeof QR_CODE_COLOR_PRESETS[0]) => {
    setOptions(prev => ({
      ...prev,
      color: {
        dark: preset.dark,
        light: preset.light
      }
    }));
  };

  const handleExample = (example: typeof QR_CODE_EXAMPLES[keyof typeof QR_CODE_EXAMPLES]) => {
    setInput(example.input);
    setOptions(example.options);
  };

  const renderInputFields = () => {
    switch (options.type) {
      case 'text':
        return (
          <div className="space-y-2">
            <Label htmlFor="text">Text Content</Label>
            <Textarea
              id="text"
              placeholder="Enter text content for QR code..."
              value={input.text || ''}
              onChange={(e) => handleInputChange('text', e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        );

      case 'url':
        return (
          <div className="space-y-2">
            <Label htmlFor="url">URL</Label>
            <Input
              id="url"
              type="url"
              placeholder="https://example.com"
              value={input.url || ''}
              onChange={(e) => handleInputChange('url', e.target.value)}
            />
          </div>
        );

      case 'contact':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-name">Name *</Label>
                <Input
                  id="contact-name"
                  placeholder="John Doe"
                  value={input.contact?.name || ''}
                  onChange={(e) => handleContactChange('name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Phone</Label>
                <Input
                  id="contact-phone"
                  placeholder="+1-555-123-4567"
                  value={input.contact?.phone || ''}
                  onChange={(e) => handleContactChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Email</Label>
                <Input
                  id="contact-email"
                  type="email"
                  placeholder="john@example.com"
                  value={input.contact?.email || ''}
                  onChange={(e) => handleContactChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-organization">Organization</Label>
                <Input
                  id="contact-organization"
                  placeholder="Company Name"
                  value={input.contact?.organization || ''}
                  onChange={(e) => handleContactChange('organization', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-title">Title</Label>
                <Input
                  id="contact-title"
                  placeholder="Software Developer"
                  value={input.contact?.title || ''}
                  onChange={(e) => handleContactChange('title', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-address">Address</Label>
                <Input
                  id="contact-address"
                  placeholder="123 Main St, City, State 12345"
                  value={input.contact?.address || ''}
                  onChange={(e) => handleContactChange('address', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 'wifi':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wifi-ssid">Network Name (SSID) *</Label>
                <Input
                  id="wifi-ssid"
                  placeholder="MyWiFiNetwork"
                  value={input.wifi?.ssid || ''}
                  onChange={(e) => handleWifiChange('ssid', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wifi-password">Password</Label>
                <Input
                  id="wifi-password"
                  type="password"
                  placeholder="password123"
                  value={input.wifi?.password || ''}
                  onChange={(e) => handleWifiChange('password', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wifi-security">Security Type</Label>
                <Select
                  value={input.wifi?.security || 'WPA'}
                  onValueChange={(value) => handleWifiChange('security', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nopass">No Password</SelectItem>
                    <SelectItem value="WEP">WEP</SelectItem>
                    <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="wifi-hidden"
                  checked={input.wifi?.hidden || false}
                  onCheckedChange={(checked) => handleWifiChange('hidden', checked)}
                />
                <Label htmlFor="wifi-hidden">Hidden Network</Label>
              </div>
            </div>
          </div>
        );

      case 'sms':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sms-phone">Phone Number *</Label>
                <Input
                  id="sms-phone"
                  placeholder="+1-555-123-4567"
                  value={input.sms?.phone || ''}
                  onChange={(e) => handleSmsChange('phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sms-message">Message *</Label>
                <Textarea
                  id="sms-message"
                  placeholder="Enter your message..."
                  value={input.sms?.message || ''}
                  onChange={(e) => handleSmsChange('message', e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>
        );

      case 'email':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email-to">Email Address *</Label>
                <Input
                  id="email-to"
                  type="email"
                  placeholder="recipient@example.com"
                  value={input.email?.to || ''}
                  onChange={(e) => handleEmailChange('to', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  placeholder="Email Subject"
                  value={input.email?.subject || ''}
                  onChange={(e) => handleEmailChange('subject', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="email-body">Message Body</Label>
                <Textarea
                  id="email-body"
                  placeholder="Enter your email message..."
                  value={input.email?.body || ''}
                  onChange={(e) => handleEmailChange('body', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCodeIcon className="h-6 w-6" />
            QR Code Generator
          </CardTitle>
          <CardDescription>
            Generate QR codes for text, URLs, contacts, WiFi, SMS, and email with customizable options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code Type Selection */}
          <div className="space-y-2">
            <Label>QR Code Type</Label>
            <Select
              value={options.type}
              onValueChange={(value) => handleOptionChange('type', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QR_CODE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.symbol}</span>
                      <span>{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Input Fields */}
          {renderInputFields()}

          <Separator />

          {/* Customization Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customization Options</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Size */}
              <div className="space-y-2">
                <Label htmlFor="size">Size (px)</Label>
                <Input
                  id="size"
                  type="number"
                  min={QR_CODE_SIZE_LIMITS.min}
                  max={QR_CODE_SIZE_LIMITS.max}
                  value={options.size}
                  onChange={(e) => handleOptionChange('size', parseInt(e.target.value) || 256)}
                />
              </div>

              {/* Error Correction */}
              <div className="space-y-2">
                <Label>Error Correction</Label>
                <Select
                  value={options.errorCorrection}
                  onValueChange={(value) => handleOptionChange('errorCorrection', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QR_CODE_ERROR_CORRECTIONS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          <span>{level.symbol}</span>
                          <span>{level.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Format */}
              <div className="space-y-2">
                <Label>Output Format</Label>
                <Select
                  value={options.format}
                  onValueChange={(value) => handleOptionChange('format', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QR_CODE_FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        <div className="flex items-center gap-2">
                          <span>{format.symbol}</span>
                          <span>{format.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Theme */}
              <div className="space-y-2">
                <Label>Color Theme</Label>
                <Select
                  value={QR_CODE_COLOR_PRESETS.find(preset =>
                    preset.dark === options.color.dark && preset.light === options.color.light
                  )?.name || 'Default'}
                  onValueChange={(value) => {
                    const preset = QR_CODE_COLOR_PRESETS.find(p => p.name === value);
                    if (preset) {
                      handleColorPreset(preset);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {QR_CODE_COLOR_PRESETS.map((preset) => (
                      <SelectItem key={preset.name} value={preset.name}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: preset.dark }}
                          />
                          <span>{preset.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

            </div>

          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={handleGenerateQrCode}
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                  Generating QR Code...
                </>
              ) : (
                <>
                  <QrCodeIcon className="h-4 w-4 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>
          </div>

          {/* Examples */}
          <div className="space-y-2">
            <Label>Quick Examples</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {Object.entries(QR_CODE_EXAMPLES).map(([key, example]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExample(example)}
                  className="justify-start"
                >
                  {example.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Output */}
      {qrCodeResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCodeIcon className="h-5 w-5" />
              Generated QR Code
            </CardTitle>
            <CardDescription>
              {stats && (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">Type: {stats.type}</Badge>
                  <Badge variant="outline">Size: {stats.size}px</Badge>
                  <Badge variant="outline">Error Correction: {stats.errorCorrection}</Badge>
                  <Badge variant="outline">Format: {stats.format.toUpperCase()}</Badge>
                </div>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Code Preview */}
            <div className="flex justify-center">
              <img
                src={qrCodeResult.dataUrl}
                alt="Generated QR Code"
                className="max-w-full h-auto border rounded-lg"
                style={{ maxHeight: '400px' }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleCopyOutput}
                variant="outline"
                disabled={copySuccess}
                className="flex-1"
              >
                {copySuccess ? (
                  <>
                    <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
              <Button
                onClick={handleDownloadQrCode}
                variant="outline"
                disabled={downloadSuccess}
                className="flex-1"
              >
                {downloadSuccess ? (
                  <>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Downloaded!
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Download {qrCodeResult.format.toUpperCase()}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
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
                onClick={handleGenerateQrCode}
                disabled={isGenerating}
                className="w-full sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <ArrowPathIcon className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <QrCodeIcon className="h-4 w-4 mr-2" />
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
