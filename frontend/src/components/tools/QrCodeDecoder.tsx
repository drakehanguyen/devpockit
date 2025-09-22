'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
// Alert component not available, using div instead
import { useToolState } from '@/components/providers/ToolStateProvider';
import { DEFAULT_QR_DECODER_OPTIONS } from '@/config/qr-code-decoder-config';
import {
  decodeQrFromImage,
  getErrorMessage,
  validateImageFile
} from '@/libs/qr-code-decoder';
import {
  QrDecoderOptions,
  QrDecoderResult
} from '@/types/qr-decoder';
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileImage,
  Loader2,
  Share,
  Trash2,
  Upload,
  XCircle
} from 'lucide-react';

interface QrCodeDecoderProps {
  onResult?: (result: QrDecoderResult) => void;
  onError?: (error: string) => void;
}

export function QrCodeDecoder({ onResult, onError }: QrCodeDecoderProps) {
  // State management
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<QrDecoderResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<string>('idle');
  const [options, setOptions] = useState<QrDecoderOptions>(DEFAULT_QR_DECODER_OPTIONS);

  // UI state
  const [showParsedData, setShowParsedData] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [displayedImage, setDisplayedImage] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const prevStateRef = useRef<any>(null);
  const displayedImageRef = useRef<string | null>(null);
  const filesRef = useRef<File[]>([]);
  const onResultRef = useRef<((result: QrDecoderResult) => void) | undefined>(undefined);
  const onErrorRef = useRef<((error: string) => void) | undefined>(undefined);

  // Tool state management
  const { toolState, updateToolState, clearToolState } = useToolState('qr-code-decoder');

  // Update refs when props change
  useEffect(() => {
    onResultRef.current = onResult;
    onErrorRef.current = onError;
  }, [onResult, onError]);

  // Force UI update when results change
  useLayoutEffect(() => {
    if (results.length > 0) {
      setForceUpdate(prev => prev + 1);
    }
  }, [results]);

  // Force UI update when displayed image changes
  useLayoutEffect(() => {
    if (displayedImage) {
      setForceUpdate(prev => prev + 1);
    }
  }, [displayedImage]);


  // Handle tool state updates
  useEffect(() => {
    if (toolState && Object.keys(toolState).length > 0) {
      const { options: savedOptions, results: savedResults, state: savedState } = toolState;
      if (savedOptions) setOptions(savedOptions as QrDecoderOptions);
      if (savedResults) setResults(savedResults as QrDecoderResult[]);
      if (savedState) setState(savedState as string);
    }
  }, [toolState]);

  // Update tool state when state changes
  useEffect(() => {
    const currentState = { options, results, error: error || undefined, state };
    const prevState = prevStateRef.current;

    if (!prevState || JSON.stringify(currentState) !== JSON.stringify(prevState)) {
      updateToolState(currentState);
      prevStateRef.current = currentState;
    }
  }, [options, results, error, state, updateToolState]);

  // Clear tool state when switching tools
  useEffect(() => {
    if (!toolState || Object.keys(toolState).length === 0) {
      // Clear displayed image from memory
      if (displayedImageRef.current) {
        URL.revokeObjectURL(displayedImageRef.current);
        displayedImageRef.current = null;
        setDisplayedImage(null);
      }
      setOptions(DEFAULT_QR_DECODER_OPTIONS);
      setResults([]);
      setError(null);
      setState('idle');
      filesRef.current = [];
      setFiles([]);
      prevStateRef.current = null;
    }
  }, [toolState, clearToolState]);

  // Cleanup displayed image on unmount
  useEffect(() => {
    return () => {
      if (displayedImageRef.current) {
        URL.revokeObjectURL(displayedImageRef.current);
      }
    };
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    // Only take the first file
    const file = selectedFiles[0];
    const validation = validateImageFile(file);

    if (validation.isValid) {
      filesRef.current = [file]; // Update ref immediately
      setFiles([file]); // Replace any existing files
      setError(null);
    } else {
      setError(`${file.name}: ${validation.error}`);
    }
  }, []);

  // Process files - completely stable function
  const processFiles = useCallback(async () => {
    if (filesRef.current.length === 0) {
      setError('No file selected');
      return;
    }

    setIsProcessing(true);
    setState('file processing');
    setError(null);

    try {
      const file = filesRef.current[0]; // Only process the first (and only) file

      // Create image URL for display
      const imageUrl = URL.createObjectURL(file);

      // Clear previous image from memory
      if (displayedImageRef.current) {
        URL.revokeObjectURL(displayedImageRef.current);
      }

      // Set new image for display
      displayedImageRef.current = imageUrl;
      setDisplayedImage(imageUrl);

      // Force immediate re-render by updating forceUpdate directly
      setForceUpdate(prev => prev + 1);

      const results = await decodeQrFromImage(file);

      if (results && results.length > 0) {
        // Replace previous results with new ones (only keep latest)
        setResults(results);
        setState('qr detected');

        // Force immediate re-render by updating forceUpdate directly
        setForceUpdate(prev => prev + 1);

        results.forEach(result => onResultRef.current?.(result));
      } else {
        setError('No QR codes found in the uploaded image');
        setState('error');
      }
    } catch (err) {
      setError(getErrorMessage(err as Error));
      setState('error');
      onErrorRef.current?.(getErrorMessage(err as Error));
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Remove file
  const removeFile = useCallback((index: number) => {
    const newFiles = filesRef.current.filter((_, i) => i !== index);
    filesRef.current = newFiles;
    setFiles(newFiles);
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    // Clear displayed image from memory
    if (displayedImageRef.current) {
      URL.revokeObjectURL(displayedImageRef.current);
      displayedImageRef.current = null;
      setDisplayedImage(null);
    }
    filesRef.current = [];
    setFiles([]);
    setResults([]);
  }, []);


  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      setError('Failed to copy to clipboard');
    }
  }, []);

  // Share results
  const shareResults = useCallback(async (result: QrDecoderResult) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'QR Code Result',
          text: result.data,
          url: result.format === 'url' ? result.data : undefined
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await copyToClipboard(result.data);
    }
  }, [copyToClipboard]);

  // Export results
  const exportResults = useCallback((format: 'json' | 'csv' | 'txt') => {
    const data = results;

    let content = '';
    let filename = '';

    switch (format) {
      case 'json':
        content = JSON.stringify(data, null, 2);
        filename = 'qr-results.json';
        break;
      case 'csv':
        const headers = ['ID', 'Format', 'Data', 'Timestamp'];
        const rows = data.map(r => [r.id, r.format, r.data, new Date(r.timestamp).toISOString()]);
        content = [headers, ...rows].map(row => row.join(',')).join('\n');
        filename = 'qr-results.csv';
        break;
      case 'txt':
        content = data.map(r => `${r.format}: ${r.data}`).join('\n');
        filename = 'qr-results.txt';
        break;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [results]);


  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">QR Code Decoder</h2>
        <p className="text-muted-foreground">
          Upload an image containing a QR code to decode it
        </p>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Image
          </CardTitle>
          <CardDescription>
            Select or drag and drop an image file containing a QR code
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDrop={handleDrop}
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
          >
            <FileImage className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Drop an image here or click to select</p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports JPG, PNG, GIF, WebP (max 10MB)
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4 mr-2" />
              Select File
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
            />
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Selected File</h4>
                <div className="flex gap-2">
                  <Button onClick={processFiles} disabled={isProcessing}>
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    {isProcessing ? 'Processing...' : 'Process Files'}
                  </Button>
                  <Button onClick={clearFiles} variant="outline">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <FileImage className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      <Badge variant="outline">
                        {(file.size / 1024 / 1024).toFixed(1)} MB
                      </Badge>
                    </div>
                    <Button
                      onClick={() => removeFile(index)}
                      variant="ghost"
                      size="sm"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card key={forceUpdate}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Decoded Result
              </CardTitle>
              <div className="flex gap-2">
                <Button onClick={() => setShowParsedData(!showParsedData)} variant="outline" size="sm">
                  {showParsedData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {showParsedData ? 'Hide' : 'Show'} Details
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Displayed Image */}
            {displayedImage && (
                        <div key={`image-${forceUpdate}`} className="space-y-2">
                <h4 className="font-medium text-sm">Uploaded Image:</h4>
                <div className="relative">
                  <img
                    src={displayedImage}
                    alt="Uploaded QR code"
                    className="max-w-full h-auto max-h-64 object-contain border rounded-lg"
                  />
                </div>
              </div>
            )}

            {/* Result Display */}
            <div key={`results-${forceUpdate}`} className="space-y-3">
              {results.map((result) => (
                <Card key={result.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{result.format}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {new Date(result.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="font-mono text-sm bg-muted p-2 rounded break-all">
                      {result.data}
                    </div>

                    {showParsedData && (
                      <div className="space-y-1">
                        <h4 className="font-medium text-sm">Additional Info:</h4>
                        <div className="text-sm space-y-1">
                          <div className="flex">
                            <span className="font-medium w-20">Confidence:</span>
                            <span className="ml-2">{(result.confidence * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex">
                            <span className="font-medium w-20">Position:</span>
                            <span className="ml-2">{result.position.x}, {result.position.y}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action buttons - now on their own row */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        onClick={() => copyToClipboard(result.data)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      <Button
                        onClick={() => shareResults(result)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Export Options */}
            {results.length > 0 && (
              <div className="flex gap-2 pt-4 border-t">
                <Button onClick={() => exportResults('json')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
                <Button onClick={() => exportResults('csv')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export CSV
                </Button>
                <Button onClick={() => exportResults('txt')} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export TXT
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
