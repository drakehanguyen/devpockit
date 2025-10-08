'use client';

import { useToolState } from '@/components/providers/ToolStateProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OutputDisplay } from '@/components/ui/OutputDisplay';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  DEFAULT_JWT_OPTIONS,
  JWT_ALGORITHMS,
  JWT_EXAMPLE_SETS
} from '@/config/jwt-encoder-config';
import {
  decodeJwt,
  encodeJwt,
  verifyJwt,
  type JwtEncoderOptions
} from '@/libs/jwt-encoder';
import { cn } from '@/libs/utils';
import { ArrowPathIcon, CheckCircleIcon, ExclamationTriangleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useCallback, useEffect, useState } from 'react';

interface JwtEncoderDecoderProps {
  className?: string;
}

type JwtMode = 'encode' | 'decode' | 'verify';

export function JwtEncoderDecoder({ className }: JwtEncoderDecoderProps) {
  const { toolState, updateToolState } = useToolState('jwt-encoder');

  // Initialize with persistent state or defaults
  const [mode, setMode] = useState<JwtMode>((toolState?.mode as JwtMode) || 'encode');
  const [options, setOptions] = useState<JwtEncoderOptions>(
    (toolState?.options as JwtEncoderOptions) || DEFAULT_JWT_OPTIONS
  );
  const [header, setHeader] = useState<string>(
    (toolState?.header as string) || JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2)
  );
  const [payload, setPayload] = useState<string>(
    (toolState?.payload as string) || JSON.stringify({ sub: 'user123', name: 'John Doe', iat: Math.floor(Date.now() / 1000) }, null, 2)
  );
  const [input, setInput] = useState<string>(toolState?.input || '');
  const [output, setOutput] = useState<string>(toolState?.output || '');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>(toolState?.error || '');
  const [jwtInfo, setJwtInfo] = useState<{
    tokenLength: number;
    algorithm: string;
    expiresAt?: Date;
    issuedAt?: Date;
    isValid: boolean;
    isExpired?: boolean;
    claims: string[];
    verificationStatus?: 'verified' | 'invalid' | 'expired' | 'not-verified';
    signatureValid?: boolean;
    claimsValid?: boolean;
  } | null>(
    (toolState?.jwtInfo as {
      tokenLength: number;
      algorithm: string;
      expiresAt?: Date;
      issuedAt?: Date;
      isValid: boolean;
      isExpired?: boolean;
      claims: string[];
    }) || null
  );
  const [copySuccess, setCopySuccess] = useState(false);
  const [headerError, setHeaderError] = useState<string>('');
  const [payloadError, setPayloadError] = useState<string>('');

  // Update persistent state only when processing completes
  const updatePersistentState = useCallback(() => {
    updateToolState({
      mode,
      options,
      header,
      payload,
      input,
      output,
      error,
      jwtInfo: jwtInfo || undefined
    });
  }, [mode, options, header, payload, input, output, error, jwtInfo, updateToolState]);

  // Enhanced JSON validation with detailed error information
  const validateJson = useCallback((jsonString: string, type: 'header' | 'payload' = 'payload'): { isValid: boolean; error?: string; warnings?: string[] } => {
    if (!jsonString.trim()) {
      return { isValid: false, error: 'JSON cannot be empty' };
    }

    try {
      const parsed = JSON.parse(jsonString);
      const warnings: string[] = [];

      // Header-specific validation
      if (type === 'header') {
        if (!parsed.alg) {
          warnings.push('Missing "alg" (algorithm) field');
        }
        if (!parsed.typ) {
          warnings.push('Missing "typ" (type) field');
        }
        if (parsed.typ && parsed.typ !== 'JWT') {
          warnings.push('Type should be "JWT"');
        }
        if (parsed.alg && !['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'].includes(parsed.alg)) {
          warnings.push('Unsupported algorithm');
        }
      }

      // Payload-specific validation
      if (type === 'payload') {
        if (parsed.exp && typeof parsed.exp !== 'number') {
          warnings.push('exp (expiration) should be a number');
        }
        if (parsed.iat && typeof parsed.iat !== 'number') {
          warnings.push('iat (issued at) should be a number');
        }
        if (parsed.nbf && typeof parsed.nbf !== 'number') {
          warnings.push('nbf (not before) should be a number');
        }
        if (parsed.exp && parsed.exp < Math.floor(Date.now() / 1000)) {
          warnings.push('Token has already expired');
        }
      }

      return { isValid: true, warnings: warnings.length > 0 ? warnings : undefined };
    } catch (err) {
      let errorMessage = 'Invalid JSON format';
      if (err instanceof Error) {
        if (err.message.includes('Unexpected token')) {
          errorMessage = 'Invalid JSON syntax';
        } else if (err.message.includes('Unexpected end')) {
          errorMessage = 'Incomplete JSON - missing closing bracket or quote';
        } else {
          errorMessage = err.message;
        }
      }
      return { isValid: false, error: errorMessage };
    }
  }, []);

  // Validate header JSON
  const validateHeader = useCallback(() => {
    const validation = validateJson(header, 'header');
    setHeaderError(validation.error || '');
    return validation.isValid;
  }, [header, validateJson]);

  // Validate payload JSON
  const validatePayload = useCallback(() => {
    const validation = validateJson(payload, 'payload');
    setPayloadError(validation.error || '');
    return validation.isValid;
  }, [payload, validateJson]);

  // Process JWT operations
  const processJwt = useCallback(async () => {
    if (mode === 'encode') {
      if (!validateHeader() || !validatePayload()) {
        setError('Please fix JSON errors in header and payload');
        return;
      }

      setIsProcessing(true);
      setError('');

      try {
        const headerObj = JSON.parse(header);
        const payloadObj = JSON.parse(payload);

        const result = await encodeJwt(payloadObj, options);

        if (result.isValid) {
          setOutput(result.token);
          setJwtInfo({
            tokenLength: result.token.length,
            algorithm: result.header.alg,
            expiresAt: result.expiresAt || undefined,
            issuedAt: result.issuedAt || undefined,
            isValid: true,
            isExpired: false,
            claims: Object.keys(result.payload)
          });
        } else {
          setError(result.error || 'Failed to create JWT');
          setOutput('');
          setJwtInfo(null);
        }
      } catch (err) {
        let errorMessage = 'An unexpected error occurred';
        if (err instanceof Error) {
          if (err.message.includes('Failed to decode JWT payload')) {
            errorMessage = 'Failed to create JWT - invalid payload structure';
          } else if (err.message.includes('exp')) {
            errorMessage = 'JWT creation failed - check your payload structure';
          } else {
            errorMessage = err.message;
          }
        }
        setError(errorMessage);
        setOutput('');
        setJwtInfo(null);
      } finally {
        setIsProcessing(false);
        updatePersistentState();
      }
    } else if (mode === 'decode') {
      if (!input.trim()) {
        setError('Please enter a JWT token to decode');
        return;
      }

      setIsProcessing(true);
      setError('');

      try {
        const result = decodeJwt(input);

        if (result.isValid) {
          setOutput(JSON.stringify({
            header: result.header,
            payload: result.payload
          }, null, 2));
          setJwtInfo({
            tokenLength: input.length,
            algorithm: result.header?.alg || 'Unknown',
            expiresAt: result.expiresAt,
            issuedAt: result.issuedAt,
            isValid: true,
            isExpired: result.isExpired,
            claims: result.payload ? Object.keys(result.payload) : []
          });
        } else {
          setError(result.error || 'Failed to decode JWT');
          setOutput('');
          setJwtInfo(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        setOutput('');
        setJwtInfo(null);
      } finally {
        setIsProcessing(false);
        updatePersistentState();
      }
    } else if (mode === 'verify') {
      if (!input.trim()) {
        setError('Please enter a JWT token to verify');
        return;
      }

      if (!options.secret.trim()) {
        setError('Please enter a secret key for verification');
        return;
      }

      setIsProcessing(true);
      setError('');

      try {
        // First decode to get header information
        const decodeResult = decodeJwt(input);
        if (!decodeResult.isValid) {
          setError(`Invalid JWT format: ${decodeResult.error}`);
          setOutput('');
          setJwtInfo(null);
          setIsProcessing(false);
          return;
        }

        // Check algorithm compatibility
        const tokenAlgorithm = decodeResult.header?.alg;
        if (tokenAlgorithm && tokenAlgorithm !== options.algorithm) {
          setError(`Algorithm mismatch: Token uses ${tokenAlgorithm} but verification is set to ${options.algorithm}`);
          setOutput('');
          setJwtInfo(null);
          setIsProcessing(false);
          return;
        }

        // Verify the JWT
        const result = await verifyJwt(input, options.secret);

        if (result.isValid) {
          const verificationDetails = {
            header: result.header,
            payload: result.payload,
            verification: {
              verified: true,
              algorithm: result.header?.alg,
              signatureValid: true,
              claimsValid: !result.isExpired,
              timestamp: new Date().toISOString()
            }
          };

          setOutput(JSON.stringify(verificationDetails, null, 2));
          setJwtInfo({
            tokenLength: input.length,
            algorithm: result.header?.alg || 'Unknown',
            expiresAt: result.expiresAt,
            issuedAt: result.issuedAt,
            isValid: true,
            isExpired: result.isExpired,
            claims: result.payload ? Object.keys(result.payload) : [],
            verificationStatus: result.isExpired ? 'expired' : 'verified',
            signatureValid: true,
            claimsValid: !result.isExpired
          });
        } else {
          // Enhanced error handling for verification failures
          let errorMessage = 'JWT verification failed';
          if (result.error) {
            if (result.error.includes('signature')) {
              errorMessage = 'Invalid signature - token may be tampered with or secret is incorrect';
            } else if (result.error.includes('expired')) {
              errorMessage = 'Token has expired';
            } else if (result.error.includes('algorithm')) {
              errorMessage = 'Unsupported algorithm or algorithm mismatch';
            } else {
              errorMessage = result.error;
            }
          }
          setError(errorMessage);
          setOutput('');
          setJwtInfo(null);
        }
      } catch (err) {
        let errorMessage = 'An unexpected error occurred';
        if (err instanceof Error) {
          if (err.message.includes('secret')) {
            errorMessage = 'Invalid secret key format';
          } else if (err.message.includes('algorithm')) {
            errorMessage = 'Unsupported algorithm';
          } else {
            errorMessage = err.message;
          }
        }
        setError(errorMessage);
        setOutput('');
        setJwtInfo(null);
      } finally {
        setIsProcessing(false);
        updatePersistentState();
      }
    }
  }, [mode, header, payload, input, options, validateHeader, validatePayload, updatePersistentState]);

  // Reset local state when tool state is cleared
  useEffect(() => {
    if (!toolState || Object.keys(toolState).length === 0) {
      setMode('encode');
      setOptions(DEFAULT_JWT_OPTIONS);
      setHeader(JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2));
      setPayload(JSON.stringify({ sub: 'user123', name: 'John Doe', iat: Math.floor(Date.now() / 1000) }, null, 2));
      setInput('');
      setOutput('');
      setError('');
      setJwtInfo(null);
      setHeaderError('');
      setPayloadError('');
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
  const handleModeChange = useCallback((newMode: JwtMode) => {
    setMode(newMode);
    setInput('');
    setOutput('');
    setError('');
    setJwtInfo(null);
  }, []);

  // Load example
  const loadExample = useCallback((example: string) => {
    if (mode === 'encode') {
      setInput(example);
    } else {
      setInput(example);
    }
    setError('');
  }, [mode]);

  // Reset to default
  const resetToDefault = useCallback((type: 'header' | 'payload') => {
    if (type === 'header') {
      setHeader(JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2));
      setHeaderError('');
    } else {
      setPayload(JSON.stringify({ sub: 'user123', name: 'John Doe', iat: Math.floor(Date.now() / 1000) }, null, 2));
      setPayloadError('');
    }
  }, []);

  // Add standard claims
  const addStandardClaims = useCallback(() => {
    try {
      const currentPayload = JSON.parse(payload);
      const now = Math.floor(Date.now() / 1000);
      const standardClaims = {
        iss: options.issuer || 'devpockit.com',
        sub: options.subject || 'user123',
        aud: options.audience || 'devpockit-users',
        exp: now + 3600, // 1 hour from now
        nbf: now,
        iat: now,
        jti: `jwt-${Date.now()}`
      };

      const updatedPayload = { ...currentPayload, ...standardClaims };
      setPayload(JSON.stringify(updatedPayload, null, 2));
      setPayloadError('');
    } catch (err) {
      setPayloadError('Invalid JSON in payload');
    }
  }, [payload, options]);

  // Format JSON
  const formatJson = useCallback((jsonString: string, type: 'header' | 'payload') => {
    try {
      const parsed = JSON.parse(jsonString);
      const formatted = JSON.stringify(parsed, null, 2);
      if (type === 'header') {
        setHeader(formatted);
        setHeaderError('');
      } else {
        setPayload(formatted);
        setPayloadError('');
      }
    } catch (err) {
      if (type === 'header') {
        setHeaderError('Invalid JSON - cannot format');
      } else {
        setPayloadError('Invalid JSON - cannot format');
      }
    }
  }, []);

  // Add custom claim
  const addCustomClaim = useCallback((key: string, value: any) => {
    try {
      const currentPayload = JSON.parse(payload);
      currentPayload[key] = value;
      setPayload(JSON.stringify(currentPayload, null, 2));
      setPayloadError('');
    } catch (err) {
      setPayloadError('Invalid JSON in payload');
    }
  }, [payload]);

  // Validate secret key strength
  const validateSecretStrength = useCallback((secret: string): { strength: 'weak' | 'medium' | 'strong'; message: string } => {
    if (!secret) {
      return { strength: 'weak', message: 'Secret key is required' };
    }

    if (secret.length < 8) {
      return { strength: 'weak', message: 'Secret should be at least 8 characters' };
    }

    if (secret.length < 16) {
      return { strength: 'medium', message: 'Consider using a longer secret (16+ characters)' };
    }

    // Check for complexity
    const hasUpperCase = /[A-Z]/.test(secret);
    const hasLowerCase = /[a-z]/.test(secret);
    const hasNumbers = /\d/.test(secret);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(secret);

    const complexityScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecial].filter(Boolean).length;

    if (complexityScore >= 3 && secret.length >= 16) {
      return { strength: 'strong', message: 'Strong secret key' };
    } else if (complexityScore >= 2 && secret.length >= 12) {
      return { strength: 'medium', message: 'Good secret key' };
    } else {
      return { strength: 'weak', message: 'Consider using a more complex secret' };
    }
  }, []);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-2xl">🔐</span>
            JWT Encoder/Decoder
          </CardTitle>
          <CardDescription>
            Create, decode, and verify JSON Web Tokens with support for multiple algorithms and comprehensive validation.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Mode Selection */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-2">
            <Button
              variant={mode === 'encode' ? 'default' : 'outline'}
              onClick={() => handleModeChange('encode')}
              className="flex-1"
            >
              🔧 Encode JWT
            </Button>
            <Button
              variant={mode === 'decode' ? 'default' : 'outline'}
              onClick={() => handleModeChange('decode')}
              className="flex-1"
            >
              📖 Decode JWT
            </Button>
            <Button
              variant={mode === 'verify' ? 'default' : 'outline'}
              onClick={() => handleModeChange('verify')}
              className="flex-1"
            >
              ✅ Verify JWT
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Algorithm */}
            <div className="space-y-2">
              <Label htmlFor="algorithm">Algorithm</Label>
              <Select
                value={options.algorithm}
                onValueChange={(value: any) =>
                  setOptions(prev => ({ ...prev, algorithm: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select algorithm" />
                </SelectTrigger>
                <SelectContent>
                  {JWT_ALGORITHMS.map((algo) => (
                    <SelectItem key={algo.value} value={algo.value}>
                      <div className="flex items-center gap-2">
                        <span>{algo.symbol}</span>
                        <span className="font-medium">{algo.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Secret */}
            <div className="space-y-2">
              <Label htmlFor="secret">Secret Key</Label>
              <Input
                id="secret"
                value={options.secret}
                onChange={(e) => setOptions(prev => ({ ...prev, secret: e.target.value }))}
                placeholder="Enter secret key"
                type="password"
              />
              {options.secret && (
                <div className="text-sm">
                  {(() => {
                    const strength = validateSecretStrength(options.secret);
                    const colorClass = strength.strength === 'strong' ? 'text-green-600' :
                                      strength.strength === 'medium' ? 'text-yellow-600' : 'text-red-600';
                    return (
                      <div className={`flex items-center gap-1 ${colorClass}`}>
                        <div className={`w-2 h-2 rounded-full ${
                          strength.strength === 'strong' ? 'bg-green-600' :
                          strength.strength === 'medium' ? 'bg-yellow-600' : 'bg-red-600'
                        }`} />
                        <span>{strength.message}</span>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Expiration */}
            <div className="space-y-2">
              <Label htmlFor="expires">Expires In</Label>
              <Select
                value={options.expiresIn}
                onValueChange={(value) =>
                  setOptions(prev => ({ ...prev, expiresIn: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15m">15 minutes</SelectItem>
                  <SelectItem value="1h">1 hour</SelectItem>
                  <SelectItem value="24h">24 hours</SelectItem>
                  <SelectItem value="7d">7 days</SelectItem>
                  <SelectItem value="30d">30 days</SelectItem>
                  <SelectItem value="1y">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Issuer */}
            <div className="space-y-2">
              <Label htmlFor="issuer">Issuer</Label>
              <Input
                id="issuer"
                value={options.issuer || ''}
                onChange={(e) => setOptions(prev => ({ ...prev, issuer: e.target.value }))}
                placeholder="Enter issuer"
              />
            </div>

            {/* Audience */}
            <div className="space-y-2">
              <Label htmlFor="audience">Audience</Label>
              <Input
                id="audience"
                value={options.audience || ''}
                onChange={(e) => setOptions(prev => ({ ...prev, audience: e.target.value }))}
                placeholder="Enter audience"
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={options.subject || ''}
                onChange={(e) => setOptions(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Enter subject"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Header Editor (only for encode mode) */}
      {mode === 'encode' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Header</CardTitle>
            <CardDescription>
              JWT header containing algorithm and token type information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={header}
                onChange={(e) => {
                  setHeader(e.target.value);
                  // Real-time validation
                  const validation = validateJson(e.target.value, 'header');
                  setHeaderError(validation.error || '');
                }}
                placeholder="Enter JWT header JSON..."
                className="min-h-[120px] font-mono"
              />
              {headerError && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <XCircleIcon className="h-4 w-4" />
                  <span>{headerError}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => resetToDefault('header')}
                size="sm"
              >
                Reset to Default
              </Button>
              <Button
                variant="outline"
                onClick={() => formatJson(header, 'header')}
                size="sm"
                disabled={!!headerError}
              >
                Format JSON
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payload Editor (only for encode mode) */}
      {mode === 'encode' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payload</CardTitle>
            <CardDescription>
              JWT payload containing claims and user data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Textarea
                value={payload}
                onChange={(e) => {
                  setPayload(e.target.value);
                  // Real-time validation
                  const validation = validateJson(e.target.value, 'payload');
                  setPayloadError(validation.error || '');
                }}
                placeholder="Enter JWT payload JSON..."
                className="min-h-[200px] font-mono"
              />
              {payloadError && (
                <div className="flex items-center gap-2 text-destructive text-sm">
                  <XCircleIcon className="h-4 w-4" />
                  <span>{payloadError}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                variant="outline"
                onClick={() => resetToDefault('payload')}
                size="sm"
              >
                Reset to Default
              </Button>
              <Button
                variant="outline"
                onClick={() => formatJson(payload, 'payload')}
                size="sm"
                disabled={!!payloadError}
              >
                Format JSON
              </Button>
              <Button
                variant="outline"
                onClick={addStandardClaims}
                size="sm"
              >
                Add Standard Claims
              </Button>
              <Button
                variant="outline"
                onClick={() => addCustomClaim('name', 'John Doe')}
                size="sm"
              >
                Add Name
              </Button>
              <Button
                variant="outline"
                onClick={() => addCustomClaim('role', 'developer')}
                size="sm"
              >
                Add Role
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input Area (for decode and verify modes) */}
      {(mode === 'decode' || mode === 'verify') && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="jwt-input">
                {mode === 'decode' ? 'JWT Token to Decode' : 'JWT Token to Verify'}
              </Label>
              <Textarea
                id="jwt-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'decode' ? 'Enter JWT token to decode...' : 'Enter JWT token to verify...'}
                className="min-h-[120px] font-mono"
              />
            </div>

            {/* Examples */}
            <div className="space-y-2">
              <Label>Examples</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(JWT_EXAMPLE_SETS.simple).map(([key, example]) => (
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
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={processJwt}
              disabled={isProcessing || (mode === 'encode' && (!header.trim() || !payload.trim())) || (mode !== 'encode' && !input.trim())}
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
                  {mode === 'encode' ? 'Generate JWT' : mode === 'decode' ? 'Decode JWT' : 'Verify JWT'}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setInput('');
                setOutput('');
                setError('');
                setJwtInfo(null);
              }}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Output Area */}
      <OutputDisplay
        title={mode === 'encode' ? 'Generated JWT Token' : mode === 'decode' ? 'Decoded JWT' : 'Verified JWT'}
        content={output}
        error={error}
        onCopy={() => copyToClipboard(output)}
        className="font-mono"
      />

      {/* JWT Information */}
      {jwtInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">JWT Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Token Length:</span> {jwtInfo.tokenLength} characters
              </div>
              <div>
                <span className="font-medium">Algorithm:</span> {jwtInfo.algorithm}
              </div>
              {jwtInfo.expiresAt && (
                <div>
                  <span className="font-medium">Expires:</span> {jwtInfo.expiresAt.toLocaleString()}
                </div>
              )}
              {jwtInfo.issuedAt && (
                <div>
                  <span className="font-medium">Issued:</span> {jwtInfo.issuedAt.toLocaleString()}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="font-medium">Status:</span>
                {jwtInfo.isValid ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircleIcon className="h-4 w-4" />
                    <span>Valid</span>
                    {jwtInfo.isExpired && <span className="text-yellow-600">(Expired)</span>}
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircleIcon className="h-4 w-4" />
                    <span>Invalid</span>
                  </div>
                )}
              </div>
              {jwtInfo.verificationStatus && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Verification:</span>
                  {jwtInfo.verificationStatus === 'verified' && (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Verified</span>
                    </div>
                  )}
                  {jwtInfo.verificationStatus === 'expired' && (
                    <div className="flex items-center gap-1 text-yellow-600">
                      <XCircleIcon className="h-4 w-4" />
                      <span>Expired</span>
                    </div>
                  )}
                  {jwtInfo.verificationStatus === 'invalid' && (
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircleIcon className="h-4 w-4" />
                      <span>Invalid</span>
                    </div>
                  )}
                  {jwtInfo.verificationStatus === 'not-verified' && (
                    <div className="flex items-center gap-1 text-gray-600">
                      <span>Not Verified</span>
                    </div>
                  )}
                </div>
              )}
              {jwtInfo.signatureValid !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Signature:</span>
                  {jwtInfo.signatureValid ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Valid</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircleIcon className="h-4 w-4" />
                      <span>Invalid</span>
                    </div>
                  )}
                </div>
              )}
              <div className="col-span-2">
                <span className="font-medium">Claims:</span> {jwtInfo.claims.join(', ')}
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
