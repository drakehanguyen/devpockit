'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CodeEditor } from '@/components/ui/CodeEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DEFAULT_URL_OPTIONS,
  URL_ENCODED_EXAMPLES,
  URL_ENCODING_TYPES,
  URL_EXAMPLES,
  URL_HELP_TEXT
} from '@/config/url-encoder-config';
import {
  decodeUrl,
  encodeUrl,
  type UrlEncoderOptions,
  type UrlEncoderResult
} from '@/libs/url-encoder';
import { cn } from '@/libs/utils';
import { ArrowPathIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';

interface UrlEncoderProps {
  className?: string;
}

export function UrlEncoder({ className }: UrlEncoderProps) {
  const { toolState, updateToolState } = useToolState('url-encoder');

  // Initialize with persistent state or defaults
  const [options, setOptions] = useState<UrlEncoderOptions>(
    (toolState?.options as UrlEncoderOptions) || DEFAULT_URL_OPTIONS
  );
  const [input, setInput] = useState<string>(toolState?.input || '');
  const [output, setOutput] = useState<string>(toolState?.output || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>(toolState?.error || '');
  const [stats, setStats] = useState<{
    originalLength: number;
    encodedLength: number;
    compressionRatio: number;
    characterAnalysis: {
      total: number;
      spaces: number;
      specialChars: number;
      encodedSpaces: number;
      encodedSpecialChars: number;
    };
  } | null>(
    (toolState?.stats as {
      originalLength: number;
      encodedLength: number;
      compressionRatio: number;
      characterAnalysis: {
        total: number;
        spaces: number;
        specialChars: number;
        encodedSpaces: number;
        encodedSpecialChars: number;
      };
    }) || null
  );
  const [copySuccess, setCopySuccess] = useState(false);
  const [isEncoding, setIsEncoding] = useState(true); // true for encode, false for decode

  // Update persistent state only when processing completes
  const updatePersistentState = useCallback(() => {
    updateToolState({
      options,
      input,
      output,
      error,
      stats: stats || undefined
    });
  }, [options, input, output, error, stats, updateToolState]);

  // Process URL encoding/decoding
  const processUrl = useCallback(async () => {
    if (!input.trim()) {
      setError('Please enter a URL to encode or decode');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      let result: UrlEncoderResult;

      if (isEncoding) {
        result = await encodeUrl(input, options);
      } else {
        result = await decodeUrl(input, options);
      }

      if (result.isValid) {
        setOutput(isEncoding ? result.encoded : result.decoded);
        setStats({
          originalLength: result.originalLength,
          encodedLength: result.encodedLength,
          compressionRatio: result.compressionRatio,
          characterAnalysis: result.characterAnalysis
        });
      } else {
        setError(result.error || 'Processing failed');
        setOutput('');
        setStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setOutput('');
      setStats(null);
    } finally {
      setIsProcessing(false);
      // Update persistent state after processing completes
      updatePersistentState();
    }
  }, [input, options, isEncoding, updatePersistentState]);


  // Reset local state when tool state is cleared
  useEffect(() => {
    if (!toolState || Object.keys(toolState).length === 0) {
      setOptions(DEFAULT_URL_OPTIONS);
      setInput('');
      setOutput('');
      setError('');
      setStats(null);
      setIsEncoding(true);
    }
  }, [toolState]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  }, []);

  // Handle mode change
  const handleModeChange = useCallback((mode: boolean) => {
    setIsEncoding(mode);
    // Clear input and output when switching modes
    setInput('');
    setOutput('');
    setError('');
  }, []);

  // Load example
  const loadExample = useCallback((example: string) => {
    setInput(example);
    setError('');
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🔗</span>
            URL Encoder/Decoder
          </CardTitle>
          <CardDescription>
            Encode and decode URLs with multiple encoding types including URL, URI, and custom character sets.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Mode Switch */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button
              variant={isEncoding ? 'default' : 'outline'}
              onClick={() => handleModeChange(true)}
              className="flex-1"
            >
              Encode URL
            </Button>
            <Button
              variant={isEncoding ? 'outline' : 'default'}
              onClick={() => handleModeChange(false)}
              className="flex-1"
            >
              Decode URL
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Encoding Type */}
          <div className="space-y-2">
            <Label htmlFor="encoding-type">Encoding Type</Label>
            <Select
              value={options.encodingType}
              onValueChange={(value: 'url' | 'uri' | 'custom') =>
                setOptions(prev => ({ ...prev, encodingType: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select encoding type" />
              </SelectTrigger>
              <SelectContent>
                {URL_ENCODING_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <span>{type.symbol}</span>
                      <span className="font-medium">{type.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom Characters (only show for custom encoding) */}
          {options.encodingType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-chars">Custom Characters to Encode</Label>
              <Input
                id="custom-chars"
                value={options.customChars}
                onChange={(e) => setOptions(prev => ({ ...prev, customChars: e.target.value }))}
                placeholder="Enter characters to encode (e.g., ' &?=#/:;,')"
              />
              <p className="text-sm text-muted-foreground">
                {URL_HELP_TEXT.custom}
              </p>
            </div>
          )}

          {/* Preserve Spaces */}
          <div className="space-y-2">
            <Label htmlFor="preserve-spaces">Space Handling</Label>
            <Select
              value={options.preserveSpaces ? 'preserve' : 'encode'}
              onValueChange={(value) =>
                setOptions(prev => ({ ...prev, preserveSpaces: value === 'preserve' }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="encode">Encode spaces as %20</SelectItem>
                <SelectItem value="preserve">Preserve spaces (not recommended)</SelectItem>
              </SelectContent>
            </Select>
          </div>

        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={processUrl}
              disabled={isProcessing || !input.trim()}
              className="flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowPathIcon className="h-4 w-4" />
                  {isEncoding ? 'Encode URL' : 'Decode URL'}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setInput('');
                setOutput('');
                setError('');
                setStats(null);
              }}
            >
              Clear
            </Button>
          </div>

          {/* Examples */}
          <div className="space-y-2">
            <Label>Examples</Label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(isEncoding ? URL_EXAMPLES : URL_ENCODED_EXAMPLES).map(([key, example]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  onClick={() => loadExample(example)}
                  className="text-xs"
                >
                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Code Editor with Input and Output */}
      <CodeEditor
        mode="both"
        inputValue={input}
        outputValue={output}
        onInputChange={(value) => setInput(value)}
        language="plaintext"
        inputTitle={isEncoding ? 'URL to Encode' : 'Encoded URL to Decode'}
        outputTitle={isEncoding ? 'Encoded URL' : 'Decoded URL'}
        placeholder={isEncoding ? 'Enter URL to encode...' : 'Enter encoded URL to decode...'}
        error={error}
        isLoading={isProcessing}
        showStats={true}
        height="300px"
      />

      {/* Statistics */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Original Length:</span> {stats.originalLength} characters
              </div>
              <div>
                <span className="font-medium">Encoded Length:</span> {stats.encodedLength} characters
              </div>
              <div>
                <span className="font-medium">Size Change:</span> {stats.compressionRatio > 0 ? '+' : ''}{stats.compressionRatio.toFixed(1)}%
              </div>
              <div>
                <span className="font-medium">Total Characters:</span> {stats.characterAnalysis.total}
              </div>
              <div>
                <span className="font-medium">Spaces:</span> {stats.characterAnalysis.spaces}
              </div>
              <div>
                <span className="font-medium">Special Characters:</span> {stats.characterAnalysis.specialChars}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
