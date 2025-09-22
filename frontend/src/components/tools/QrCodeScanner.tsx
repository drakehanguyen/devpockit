'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
// Alert component not available, using div instead
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CameraManager
} from '@/lib/qr-code-decoder';
import {
  QrDecoderOptions,
  QrDecoderResult
} from '@/types/qr-decoder';
import {
  AlertCircle,
  Camera,
  CameraOff,
  CheckCircle,
  Copy,
  Download,
  Flashlight,
  FlashlightOff,
  Loader2,
  RotateCcw,
  Settings,
  Share,
  Trash2
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { QR_SCANNER_CONFIG } from '../../config/qr-code-scanner-config';

interface QrCodeScannerProps {
  onResult?: (result: QrDecoderResult) => void;
  onError?: (error: string) => void;
}

export function QrCodeScanner({ onResult, onError }: QrCodeScannerProps) {
  // State management
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [results, setResults] = useState<QrDecoderResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<string>('idle');
  const [options, setOptions] = useState<QrDecoderOptions>(QR_SCANNER_CONFIG.DEFAULT_OPTIONS);

  // Camera state
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [currentCamera, setCurrentCamera] = useState<string>('environment');
  const [isFlashOn, setIsFlashOn] = useState(false);
  const [cameraStatus, setCameraStatus] = useState<any>(null);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFormat, setFilterFormat] = useState<string>('all');
  const [showParsedData, setShowParsedData] = useState(true);
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const cameraManagerRef = useRef<CameraManager | null>(null);
  const prevStateRef = useRef<any>(null);

  // Tool state management
  const { toolState, updateToolState, clearToolState } = useToolState('qr-code-scanner');

  // Initialize camera manager
  useEffect(() => {
    if (!cameraManagerRef.current) {
      cameraManagerRef.current = new CameraManager();
    }
    return () => {
      if (cameraManagerRef.current) {
        cameraManagerRef.current.cleanup();
      }
    };
  }, []);

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
      setOptions(QR_SCANNER_CONFIG.DEFAULT_OPTIONS);
      setResults([]);
      setError(null);
      setState('idle');
      setIsScanning(false);
      setIsCameraActive(false);
      setSearchQuery('');
      setFilterFormat('all');
      setSelectedResults(new Set());
      if (cameraManagerRef.current) {
        cameraManagerRef.current.cleanup();
      }
      prevStateRef.current = null;
    }
  }, [toolState, clearToolState]);

  // Initialize camera
  const initializeCamera = useCallback(async () => {
    if (!videoRef.current) {
      setError('Video element not available');
      return;
    }

    setState('camera initializing');
    setError(null);

    try {
      const cameraManager = cameraManagerRef.current!;
      const result = await cameraManager.initializeCamera(videoRef.current, {
        video: {
          facingMode: currentCamera,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (result.success) {
        setIsCameraActive(true);
        setState('idle');

        // Get camera info
        const cameras = await cameraManager.getAvailableCameras();
        setAvailableCameras(cameras.cameras);

        const flashStatus = await cameraManager.getFlashStatus();
        setIsFlashOn(flashStatus.isOn || false);

        const status = await cameraManager.getCameraStatus();
        setCameraStatus(status);
      } else {
        setError(result.error || 'Failed to initialize camera');
        setState('error');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Camera initialization failed');
      setState('error');
    }
  }, [currentCamera]);

  // Start scanning
  const startScanning = useCallback(async () => {
    if (!cameraManagerRef.current || !isCameraActive) {
      setError('Camera not initialized');
      return;
    }

    setState('scanning');
    setError(null);

    try {
      const cameraManager = cameraManagerRef.current;
      await cameraManager.startScanning(
        (result: QrDecoderResult) => {
          // Replace previous result with new one (only keep 1 result)
          setResults([result]);
          setState('qr detected');
          onResult?.(result);

          // Auto-stop scanning after detection
          setIsScanning(false);
          if (cameraManagerRef.current) {
            cameraManagerRef.current.stopScanning();
          }
        },
        (error: string) => {
          setError(error);
          setState('error');
          onError?.(error);
        },
        {
          scanIntervalMs: 100,
          maxResults: 1, // Only detect one QR code
          qualityThreshold: 0.5,
          enableMultipleDetection: false
        }
      );

      setIsScanning(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start scanning');
      setState('error');
    }
  }, [isCameraActive, onResult, onError]);

  // Stop scanning only (keep camera active)
  const stopScanningOnly = useCallback(async () => {
    if (cameraManagerRef.current) {
      await cameraManagerRef.current.stopScanning();
    }
    setIsScanning(false);
    setState('camera ready');
  }, []);

  // Stop camera completely
  const stopCamera = useCallback(async () => {
    if (cameraManagerRef.current) {
      await cameraManagerRef.current.stopScanning();
      await cameraManagerRef.current.cleanup();
    }
    setIsScanning(false);
    setIsCameraActive(false);
    setState('idle');
  }, []);

  // Switch camera
  const switchCamera = useCallback(async () => {
    if (!cameraManagerRef.current || !isCameraActive) return;

    try {
      // Stop current scanning and stream
      await cameraManagerRef.current.stopScanning();
      await cameraManagerRef.current.cleanup();

      // Determine new facing mode
      const newFacingMode = currentCamera === 'environment' ? 'user' : 'environment';
      setCurrentCamera(newFacingMode);

      // Reinitialize with new camera
      const result = await cameraManagerRef.current.initializeCamera(videoRef.current!, {
        video: {
          facingMode: newFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });

      if (result.success) {
        // Update camera status
        const status = await cameraManagerRef.current.getCameraStatus();
        setCameraStatus(status);

        // Restart scanning if it was active
        if (isScanning) {
          await cameraManagerRef.current.startScanning(
            (result) => {
              setResults([result]);
              setIsScanning(false);
              setState('qr detected');
            },
            (error) => {
              setError(error);
              setState('error');
            },
            {
              scanIntervalMs: 100,
              maxResults: 1,
              qualityThreshold: 0.5,
              enableMultipleDetection: false
            }
          );
          setIsScanning(true);
          setState('scanning');
        }
      } else {
        setError(result.error || 'Failed to switch camera');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to switch camera');
    }
  }, [currentCamera, isCameraActive, isScanning]);

  // Toggle flash
  const toggleFlash = useCallback(async () => {
    if (!cameraManagerRef.current) return;

    try {
      const result = await cameraManagerRef.current.toggleFlash();
      setIsFlashOn(result.isFlashOn || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle flash');
    }
  }, []);

  // Focus camera
  const focusCamera = useCallback(async () => {
    if (!cameraManagerRef.current) return;

    try {
      await cameraManagerRef.current.focusCamera();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to focus camera');
    }
  }, []);

  // Filter results
  const filteredResults = useCallback(() => {
    return results.filter(result => {
        const matchesSearch = !searchQuery ||
          result.data.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.format.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesFilter = filterFormat === 'all' || result.format === filterFormat;

      return matchesSearch && matchesFilter;
    });
  }, [results, searchQuery, filterFormat]);

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
    const data = selectedResults.size > 0
      ? results.filter(r => selectedResults.has(r.id))
      : filteredResults();

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
  }, [results, selectedResults, filteredResults]);

  // Select all results
  const selectAllResults = useCallback(() => {
    const filtered = filteredResults();
    if (selectedResults.size === filtered.length) {
      setSelectedResults(new Set());
    } else {
      setSelectedResults(new Set(filtered.map(r => r.id)));
    }
  }, [filteredResults, selectedResults]);

  // Clear results
  const clearResults = useCallback(() => {
    setResults([]);
    setSelectedResults(new Set());
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">QR Code Scanner</h2>
        <p className="text-muted-foreground">
          Scan QR codes using your device camera
        </p>
      </div>

      {/* Camera Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Camera Scanner
          </CardTitle>
          <CardDescription>
            Use your device camera to scan QR codes in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Camera Status */}
          {state === 'camera initializing' && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                <div className="ml-3">
                  <p className="text-sm text-blue-800">Initializing camera...</p>
                </div>
              </div>
            </div>
          )}

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

          {/* Camera Video */}
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              className={`w-full h-auto max-h-96 min-h-48 sm:max-h-80 md:max-h-96 lg:max-h-[32rem] object-contain ${!isCameraActive ? 'hidden' : ''}`}
              playsInline
              muted
              style={{ aspectRatio: '16/9' }}
            />
            {!isCameraActive && (
              <div className="absolute inset-0 flex items-center justify-center bg-black rounded-lg" style={{ aspectRatio: '16/9' }}>
                <div className="text-center space-y-2">
                  <Camera className="h-12 w-12 mx-auto text-white" />
                  <p className="text-white">Camera not active</p>
                </div>
              </div>
            )}

            {/* Scanning Overlay */}
            {isScanning && (
              <div className="absolute inset-0 border-4 border-green-500 rounded-lg animate-pulse">
                <div className="absolute top-4 left-4 right-4 bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                  Scanning for QR codes...
                </div>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="flex flex-wrap gap-2">
            {!isCameraActive ? (
              <>
                <Button onClick={initializeCamera} className="flex-1">
                  <Camera className="h-4 w-4 mr-2" />
                  Initialize Camera
                </Button>
              </>
            ) : (
              <>
                {!isScanning ? (
                  <Button onClick={startScanning} className="flex-1">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Scanning
                  </Button>
                ) : (
                  <Button onClick={stopScanningOnly} variant="destructive" className="flex-1">
                    <CameraOff className="h-4 w-4 mr-2" />
                    Stop Scanning
                  </Button>
                )}

                <Button onClick={switchCamera} variant="outline">
                  <RotateCcw className="h-4 w-4" />
                </Button>

                <Button onClick={toggleFlash} variant="outline">
                  {isFlashOn ? <FlashlightOff className="h-4 w-4" /> : <Flashlight className="h-4 w-4" />}
                </Button>

                <Button onClick={() => setShowSettings(!showSettings)} variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Stop Camera Button - Always visible when camera is active */}
            {isCameraActive && (
              <Button onClick={stopCamera} variant="outline" className="text-red-600 hover:text-red-700">
                <CameraOff className="h-4 w-4 mr-2" />
                Stop Camera
              </Button>
            )}
          </div>

          {/* Camera Settings Panel */}
          {showSettings && isCameraActive && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">Camera Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Camera Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Camera</label>
                    <select
                      value={currentCamera}
                      onChange={async (e) => {
                        const newFacingMode = e.target.value;
                        setCurrentCamera(newFacingMode);

                        if (cameraManagerRef.current && isCameraActive) {
                          try {
                            // Stop current scanning and stream
                            await cameraManagerRef.current.stopScanning();
                            await cameraManagerRef.current.cleanup();

                            // Reinitialize with new camera
                            const result = await cameraManagerRef.current.initializeCamera(videoRef.current!, {
                              video: {
                                facingMode: newFacingMode,
                                width: { ideal: 1280 },
                                height: { ideal: 720 }
                              }
                            });

                            if (result.success) {
                              // Update camera status
                              const status = await cameraManagerRef.current.getCameraStatus();
                              setCameraStatus(status);

                              // Restart scanning if it was active
                              if (isScanning) {
                                await cameraManagerRef.current.startScanning(
                                  (result) => {
                                    setResults([result]);
                                    setIsScanning(false);
                                    setState('qr detected');
                                  },
                                  (error) => {
                                    setError(error);
                                    setState('error');
                                  },
                                  {
                                    scanIntervalMs: 100,
                                    maxResults: 1,
                                    qualityThreshold: 0.5,
                                    enableMultipleDetection: false
                                  }
                                );
                                setIsScanning(true);
                                setState('scanning');
                              }
                            } else {
                              setError(result.error || 'Failed to switch camera');
                            }
                          } catch (err) {
                            setError(err instanceof Error ? err.message : 'Failed to switch camera');
                          }
                        }
                      }}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="environment">Back Camera</option>
                      <option value="user">Front Camera</option>
                    </select>
                  </div>

                  {/* Flash Control */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Flash</label>
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={toggleFlash}
                        variant={isFlashOn ? "default" : "outline"}
                        size="sm"
                      >
                        {isFlashOn ? <FlashlightOff className="h-4 w-4 mr-2" /> : <Flashlight className="h-4 w-4 mr-2" />}
                        {isFlashOn ? 'Turn Off' : 'Turn On'}
                      </Button>
                    </div>
                  </div>

                  {/* Focus Control */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Focus</label>
                    <Button
                      onClick={focusCamera}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Auto Focus
                    </Button>
                  </div>

                  {/* Camera Status */}
                  {cameraStatus && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span>Resolution:</span>
                          <span>{cameraStatus.resolution || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>FPS:</span>
                          <span>{cameraStatus.fps || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Flash:</span>
                          <span>{cameraStatus.flash ? 'Available' : 'Not Available'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Camera Info */}
          {cameraStatus && (
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Camera: {cameraStatus.facingMode || 'Unknown'}</p>
              <p>Resolution: {cameraStatus.width}x{cameraStatus.height}</p>
              <p>Flash: {cameraStatus.flashSupported ? 'Supported' : 'Not supported'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Scan Result
              </CardTitle>
              <div className="flex gap-2">
                <Button onClick={clearResults} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                  Clear Result
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Result Display */}
            <div className="space-y-3">
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
