/**
 * JWT Encoder/Decoder Logic
 * Pure functions for JWT encoding, decoding, validation, and manipulation
 */

// Dynamic import for client-side only execution
let jose: any = null;

const getJose = async () => {
  if (typeof window === 'undefined') {
    throw new Error('JWT functions can only be used on the client side');
  }
  if (!jose) {
    jose = await import('jose');
  }
  return jose;
};

export type JwtAlgorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512';

export interface JwtEncoderOptions {
  algorithm: JwtAlgorithm;
  secret: string;
  expiresIn?: string;
  issuer?: string;
  audience?: string;
  subject?: string;
}

export interface JwtHeader {
  alg: JwtAlgorithm;
  typ: 'JWT';
  kid?: string;
  [key: string]: any;
}

export interface JwtPayload {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  [key: string]: any;
}

export interface JwtEncoderResult {
  token: string;
  header: JwtHeader;
  payload: JwtPayload;
  isValid: boolean;
  error?: string;
  signature?: string;
  expiresAt?: Date;
  issuedAt?: Date;
}

export interface JwtValidationResult {
  isValid: boolean;
  error?: string;
  header?: JwtHeader;
  payload?: JwtPayload;
  signature?: string;
  isExpired?: boolean;
  expiresAt?: Date;
  issuedAt?: Date;
}

/**
 * Validate JWT token format
 */
export function validateJwtFormat(token: string): { isValid: boolean; error?: string } {
  if (!token || token.trim().length === 0) {
    return {
      isValid: false,
      error: 'JWT token cannot be empty'
    };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return {
      isValid: false,
      error: 'Invalid JWT format. Expected 3 parts separated by dots'
    };
  }

  // Check if all parts are base64url encoded
  const base64UrlRegex = /^[A-Za-z0-9_-]+$/;
  for (const part of parts) {
    if (!base64UrlRegex.test(part)) {
      return {
        isValid: false,
        error: 'Invalid JWT format. Parts must be base64url encoded'
      };
    }
  }

  return { isValid: true };
}

/**
 * Parse JWT header without verification
 */
export function parseJwtHeader(token: string): { header: JwtHeader | null; error?: string } {
  try {
    const formatValidation = validateJwtFormat(token);
    if (!formatValidation.isValid) {
      return { header: null, error: formatValidation.error };
    }

    const parts = token.split('.');
    const headerBase64 = parts[0];
    const headerJson = atob(headerBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const header = JSON.parse(headerJson) as JwtHeader;

    return { header };
  } catch (error) {
    return {
      header: null,
      error: error instanceof Error ? error.message : 'Failed to parse JWT header'
    };
  }
}

/**
 * Parse JWT payload without verification
 */
export function parseJwtPayload(token: string): { payload: JwtPayload | null; error?: string } {
  try {
    const formatValidation = validateJwtFormat(token);
    if (!formatValidation.isValid) {
      return { payload: null, error: formatValidation.error };
    }

    const parts = token.split('.');
    const payloadBase64 = parts[1];
    const payloadJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadJson) as JwtPayload;

    return { payload };
  } catch (error) {
    return {
      payload: null,
      error: error instanceof Error ? error.message : 'Failed to parse JWT payload'
    };
  }
}

/**
 * Check if JWT is expired
 */
export function isJwtExpired(payload: JwtPayload): boolean {
  if (!payload || !payload.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now;
}

/**
 * Get JWT expiration date
 */
export function getJwtExpirationDate(payload: JwtPayload): Date | undefined {
  if (!payload || !payload.exp) return undefined;
  return new Date(payload.exp * 1000);
}

/**
 * Get JWT issued date
 */
export function getJwtIssuedDate(payload: JwtPayload): Date | undefined {
  if (!payload || !payload.iat) return undefined;
  return new Date(payload.iat * 1000);
}

/**
 * Create JWT token
 */
export async function encodeJwt(
  payload: JwtPayload,
  options: JwtEncoderOptions
): Promise<JwtEncoderResult> {
  try {
    const joseLib = await getJose();
    const { SignJWT } = joseLib;

    const secret = new TextEncoder().encode(options.secret);

    let jwt = new SignJWT(payload)
      .setProtectedHeader({ alg: options.algorithm });

    // Set optional claims
    if (options.issuer) jwt = jwt.setIssuer(options.issuer);
    if (options.audience) jwt = jwt.setAudience(options.audience);
    if (options.subject) jwt = jwt.setSubject(options.subject);
    if (options.expiresIn) jwt = jwt.setExpirationTime(options.expiresIn);
    else jwt = jwt.setIssuedAt();

    const token = await jwt.sign(secret);

    // Calculate expiration and issued dates from the payload
    const expiresAt = getJwtExpirationDate(payload);
    const issuedAt = getJwtIssuedDate(payload);

    return {
      token,
      header: { alg: options.algorithm, typ: 'JWT' },
      payload: payload,
      isValid: true,
      expiresAt: expiresAt || undefined,
      issuedAt: issuedAt || undefined
    };
  } catch (error) {
    return {
      token: '',
      header: { alg: options.algorithm, typ: 'JWT' },
      payload: payload,
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to create JWT'
    };
  }
}

/**
 * Decode JWT token without verification
 */
export function decodeJwt(token: string): JwtValidationResult {
  try {
    const formatValidation = validateJwtFormat(token);
    if (!formatValidation.isValid) {
      return {
        isValid: false,
        error: formatValidation.error
      };
    }

    const { header } = parseJwtHeader(token);
    const { payload } = parseJwtPayload(token);

    if (!header || !payload) {
      return {
        isValid: false,
        error: 'Failed to parse JWT header or payload'
      };
    }

    const isExpired = isJwtExpired(payload);
    const expiresAt = getJwtExpirationDate(payload);
    const issuedAt = getJwtIssuedDate(payload);

    return {
      isValid: true,
      header,
      payload,
      isExpired,
      expiresAt: expiresAt || undefined,
      issuedAt: issuedAt || undefined
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to decode JWT'
    };
  }
}

/**
 * Verify JWT token with signature validation
 */
export async function verifyJwt(
  token: string,
  secret: string
): Promise<JwtValidationResult> {
  try {
    const joseLib = await getJose();
    const { jwtVerify } = joseLib;

    const formatValidation = validateJwtFormat(token);
    if (!formatValidation.isValid) {
      return {
        isValid: false,
        error: formatValidation.error
      };
    }

    const secretKey = new TextEncoder().encode(secret);
    const { payload, protectedHeader } = await jwtVerify(token, secretKey);

    const isExpired = isJwtExpired(payload);
    const expiresAt = getJwtExpirationDate(payload);
    const issuedAt = getJwtIssuedDate(payload);

    return {
      isValid: true,
      header: protectedHeader as JwtHeader,
      payload: payload as JwtPayload,
      isExpired,
      expiresAt: expiresAt || undefined,
      issuedAt: issuedAt || undefined
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'JWT verification failed'
    };
  }
}

/**
 * Get JWT statistics
 */
export function getJwtStats(token: string): {
  length: number;
  headerSize: number;
  payloadSize: number;
  signatureSize: number;
  hasExpiration: boolean;
  hasIssuer: boolean;
  hasAudience: boolean;
  algorithm?: string;
} {
  try {
    const parts = token.split('.');
    const headerSize = parts[0]?.length || 0;
    const payloadSize = parts[1]?.length || 0;
    const signatureSize = parts[2]?.length || 0;

    const { header } = parseJwtHeader(token);
    const { payload } = parseJwtPayload(token);

    return {
      length: token.length,
      headerSize,
      payloadSize,
      signatureSize,
      hasExpiration: !!payload?.exp,
      hasIssuer: !!payload?.iss,
      hasAudience: !!payload?.aud,
      algorithm: header?.alg
    };
  } catch {
    return {
      length: token.length,
      headerSize: 0,
      payloadSize: 0,
      signatureSize: 0,
      hasExpiration: false,
      hasIssuer: false,
      hasAudience: false
    };
  }
}

/**
 * Format JWT for display
 */
export function formatJwtForDisplay(token: string): {
  header: string;
  payload: string;
  signature: string;
} {
  try {
    const parts = token.split('.');
    return {
      header: parts[0] || '',
      payload: parts[1] || '',
      signature: parts[2] || ''
    };
  } catch {
    return {
      header: '',
      payload: '',
      signature: ''
    };
  }
}

/**
 * Validate JWT payload structure
 */
export function validateJwtPayload(payload: JwtPayload): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check for required numeric timestamps
  if (payload.exp && typeof payload.exp !== 'number') {
    errors.push('exp (expiration time) must be a number');
  }
  if (payload.iat && typeof payload.iat !== 'number') {
    errors.push('iat (issued at) must be a number');
  }
  if (payload.nbf && typeof payload.nbf !== 'number') {
    errors.push('nbf (not before) must be a number');
  }

  // Check for valid string claims
  if (payload.iss && typeof payload.iss !== 'string') {
    errors.push('iss (issuer) must be a string');
  }
  if (payload.sub && typeof payload.sub !== 'string') {
    errors.push('sub (subject) must be a string');
  }
  if (payload.jti && typeof payload.jti !== 'string') {
    errors.push('jti (JWT ID) must be a string');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate JWT header structure
 */
export function validateJwtHeader(header: JwtHeader): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!header.alg) {
    errors.push('alg (algorithm) is required');
  } else if (!['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512'].includes(header.alg)) {
    errors.push('alg (algorithm) must be a supported algorithm');
  }

  if (header.typ && header.typ !== 'JWT') {
    errors.push('typ (type) must be "JWT" if specified');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
