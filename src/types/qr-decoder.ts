// TypeScript interfaces for QR Code Decoder
// Defines the data structures and types used throughout the decoder

export interface QrDecoderResult {
  id: string;
  data: string;
  format: QrCodeFormat;
  position: QrCodePosition;
  confidence: number;
  timestamp: number;
}

export interface QrCodePosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type QrCodeFormat =
  | 'text'
  | 'url'
  | 'contact'
  | 'wifi'
  | 'sms'
  | 'email'
  | 'unknown';

export interface QrDecoderOptions {
  cameraEnabled: boolean;
  fileUploadEnabled: boolean;
  multipleDetection: boolean;
  formatDetection: boolean;
  showPosition: boolean;
}

export interface QrDecoderState {
  isScanning: boolean;
  hasCamera: boolean;
  cameraPermission: CameraPermissionState;
  results: QrDecoderResult[];
  error: string | null;
  lastScanTime: number | null;
}

export interface CameraConstraints {
  width: number;
  height: number;
  facingMode: 'user' | 'environment';
}

export interface QrScannerConfig {
  preferredCamera: 'environment' | 'user';
  maxScansPerSecond: number;
  highlightScanRegion: boolean;
  highlightCodeOutline: boolean;
  overlay: HTMLElement | null;
}

export interface ParsedQrData {
  type: QrCodeFormat;
  data: string;
  description?: string;
  structured?: {
    title?: string;
    description?: string;
    fields?: Record<string, string>;
  };
}
