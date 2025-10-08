/**
 * JWT Encoder/Decoder Configuration
 * Options and settings for JWT encoding and decoding tool
 */

export const JWT_ALGORITHMS = [
  {
    value: 'HS256',
    label: 'HMAC SHA-256 (HS256)',
    symbol: '🔐',
    description: 'Symmetric algorithm using shared secret key'
  },
  {
    value: 'HS384',
    label: 'HMAC SHA-384 (HS384)',
    symbol: '🔒',
    description: 'Symmetric algorithm with stronger security'
  },
  {
    value: 'HS512',
    label: 'HMAC SHA-512 (HS512)',
    symbol: '🛡️',
    description: 'Symmetric algorithm with maximum security'
  },
  {
    value: 'RS256',
    label: 'RSA SHA-256 (RS256)',
    symbol: '🔑',
    description: 'Asymmetric algorithm using RSA key pair'
  },
  {
    value: 'RS384',
    label: 'RSA SHA-384 (RS384)',
    symbol: '🔐',
    description: 'Asymmetric algorithm with stronger RSA security'
  },
  {
    value: 'RS512',
    label: 'RSA SHA-512 (RS512)',
    symbol: '🔒',
    description: 'Asymmetric algorithm with maximum RSA security'
  }
] as const;

export const JWT_CLAIMS = {
  standard: [
    { key: 'iss', label: 'Issuer (iss)', description: 'Who issued the token' },
    { key: 'sub', label: 'Subject (sub)', description: 'Who the token is about' },
    { key: 'aud', label: 'Audience (aud)', description: 'Who the token is intended for' },
    { key: 'exp', label: 'Expiration (exp)', description: 'When the token expires' },
    { key: 'nbf', label: 'Not Before (nbf)', description: 'When the token becomes valid' },
    { key: 'iat', label: 'Issued At (iat)', description: 'When the token was issued' },
    { key: 'jti', label: 'JWT ID (jti)', description: 'Unique identifier for the token' }
  ],
  custom: [
    { key: 'userId', label: 'User ID', description: 'Custom user identifier' },
    { key: 'role', label: 'Role', description: 'User role or permission level' },
    { key: 'permissions', label: 'Permissions', description: 'Array of user permissions' },
    { key: 'sessionId', label: 'Session ID', description: 'Session identifier' },
    { key: 'deviceId', label: 'Device ID', description: 'Device identifier' }
  ]
} as const;

export const JWT_ENCODER_OPTIONS = {
  algorithms: JWT_ALGORITHMS,
  expirationTimes: [
    { value: '15m', label: '15 minutes' },
    { value: '1h', label: '1 hour' },
    { value: '24h', label: '24 hours' },
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '1y', label: '1 year' }
  ],
  commonSecrets: [
    { value: 'your-secret-key', label: 'Default Secret' },
    { value: 'super-secret-key-123', label: 'Strong Secret' },
    { value: 'jwt-secret-key-2024', label: 'Year-based Secret' },
    { value: 'my-app-secret-key', label: 'App Secret' }
  ]
} as const;

export const DEFAULT_JWT_OPTIONS = {
  algorithm: 'HS256' as const,
  secret: 'your-secret-key',
  expiresIn: '1h',
  issuer: 'devpockit.com',
  audience: 'devpockit-users'
};

export const JWT_EXAMPLES = {
  simple: {
    header: { alg: 'HS256', typ: 'JWT' },
    payload: { sub: '1234567890', name: 'John Doe', iat: 1516239022 }
  },
  withExpiration: {
    header: { alg: 'HS256', typ: 'JWT' },
    payload: {
      sub: 'user123',
      name: 'Jane Smith',
      role: 'admin',
      iat: 1516239022,
      exp: 1516242622
    }
  },
  fullClaims: {
    header: { alg: 'HS256', typ: 'JWT', kid: 'key-1' },
    payload: {
      iss: 'devpockit.com',
      sub: 'user123',
      aud: 'devpockit-users',
      exp: 1516242622,
      nbf: 1516239022,
      iat: 1516239022,
      jti: 'jwt-id-123',
      name: 'John Doe',
      role: 'developer',
      permissions: ['read', 'write']
    }
  },
  rsaExample: {
    header: { alg: 'RS256', typ: 'JWT' },
    payload: {
      sub: 'user456',
      name: 'Alice Johnson',
      role: 'admin',
      iat: 1516239022,
      exp: 1516242622
    }
  }
};

export const JWT_ENCODED_EXAMPLES = {
  simple: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
  withExpiration: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkphbmUgU21pdGgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjI0MjYyMn0.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
  fullClaims: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleS0xIn0.eyJpc3MiOiJkZXZwb2NraXQuY29tIiwic3ViIjoidXNlcjEyMyIsImF1ZCI6ImRldnBvY2tpdC11c2VycyIsImV4cCI6MTUxNjI0MjYyMiwibmJmIjoxNTE2MjM5MDIyLCJpYXQiOjE1MTYyMzkwMjIsImp0aSI6Imp3dC1pZC0xMjMiLCJuYW1lIjoiSm9obiBEb2UiLCJyb2xlIjoiZGV2ZWxvcGVyIiwicGVybWlzc2lvbnMiOlsicmVhZCIsIndyaXRlIl19.xyz789abc123def456ghi789jkl012mno345pqr678stu901vwx234yz'
};

export const JWT_EXAMPLE_SETS = {
  simple: [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkphbmUgU21pdGgiLCJpYXQiOjE1MTYyMzkwMjJ9.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyNDU2IiwibmFtZSI6IkFsaWNlIEpvaG5zb24iLCJpYXQiOjE1MTYyMzkwMjJ9.def456ghi789jkl012mno345pqr678stu901vwx234yzabc123'
  ],
  withExpiration: [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkphbmUgU21pdGgiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MTUxNjI0MjYyMn0.abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyNDU2IiwibmFtZSI6IkFsaWNlIEpvaG5zb24iLCJyb2xlIjoiZGV2ZWxvcGVyIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDI2MjJ9.ghi789jkl012mno345pqr678stu901vwx234yzabc123def456',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyNzg5IiwibmFtZSI6IkJvYiBXaWxzb24iLCJyb2xlIjoidXNlciIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNTE2MjQyNjIyfQ.jkl012mno345pqr678stu901vwx234yzabc123def456ghi789'
  ],
  fullClaims: [
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleS0xIn0.eyJpc3MiOiJkZXZwb2NraXQuY29tIiwic3ViIjoidXNlcjEyMyIsImF1ZCI6ImRldnBvY2tpdC11c2VycyIsImV4cCI6MTUxNjI0MjYyMiwibmJmIjoxNTE2MjM5MDIyLCJpYXQiOjE1MTYyMzkwMjIsImp0aSI6Imp3dC1pZC0xMjMiLCJuYW1lIjoiSm9obiBEb2UiLCJyb2xlIjoiZGV2ZWxvcGVyIiwicGVybWlzc2lvbnMiOlsicmVhZCIsIndyaXRlIl19.xyz789abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleS0yIn0.eyJpc3MiOiJhcGkuZXhhbXBsZS5jb20iLCJzdWIiOiJ1c2VyNDU2IiwiYXVkIjoiYXBpLXVzZXJzIiwiZXhwIjoxNTE2MjQyNjIyLCJuYmYiOjE1MTYyMzkwMjIsImlhdCI6MTUxNjIzOTAyMiwianRpIjoianNvbi10b2tlbi0xMjMiLCJuYW1lIjoiQWxpY2UgSm9obnNvbiIsInJvbGUiOiJhZG1pbiIsInBlcm1pc3Npb25zIjpbInJlYWQiLCJ3cml0ZSIsImFkbWluIl19.mno345pqr678stu901vwx234yzabc123def456ghi789jkl012',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImtleS0zIn0.eyJpc3MiOiJhdXRoLmV4YW1wbGUuY29tIiwic3ViIjoidXNlcjc4OSIsImF1ZCI6WyJhcGktdXNlcnMiLCJ3ZWIiLCJtb2JpbGUiXSwiZXhwIjoxNTE2MjQyNjIyLCJuYmYiOjE1MTYyMzkwMjIsImlhdCI6MTUxNjIzOTAyMiwianRpIjoiYXV0aC10b2tlbi0xMjMiLCJuYW1lIjoiQm9iIFdpbHNvbiIsInJvbGUiOiJ1c2VyIiwicGVybWlzc2lvbnMiOlsicmVhZCJdfQ.pqr678stu901vwx234yzabc123def456ghi789jkl012mno345'
  ]
};

export const JWT_VALIDATION_RULES = {
  HS256: {
    description: 'HMAC SHA-256 - Symmetric algorithm using shared secret',
    security: 'High security with shared secret key',
    useCase: 'Internal APIs, microservices, single-tenant applications'
  },
  HS384: {
    description: 'HMAC SHA-384 - Symmetric algorithm with stronger security',
    security: 'Higher security than HS256',
    useCase: 'High-security applications, government systems'
  },
  HS512: {
    description: 'HMAC SHA-512 - Symmetric algorithm with maximum security',
    security: 'Maximum security for symmetric algorithms',
    useCase: 'Banking, healthcare, critical infrastructure'
  },
  RS256: {
    description: 'RSA SHA-256 - Asymmetric algorithm using RSA key pair',
    security: 'High security with public/private key pair',
    useCase: 'Multi-tenant applications, public APIs, OAuth'
  },
  RS384: {
    description: 'RSA SHA-384 - Asymmetric algorithm with stronger RSA security',
    security: 'Higher security than RS256',
    useCase: 'Enterprise applications, high-security systems'
  },
  RS512: {
    description: 'RSA SHA-512 - Asymmetric algorithm with maximum RSA security',
    security: 'Maximum security for asymmetric algorithms',
    useCase: 'Financial systems, critical infrastructure, government'
  }
};

export const JWT_TOOL_DESCRIPTIONS = {
  HS256: 'HMAC SHA-256 is the most common JWT algorithm. It uses a shared secret key for both signing and verification, making it simple to implement and use.',
  HS384: 'HMAC SHA-384 provides stronger security than HS256 with a longer hash output, suitable for high-security applications.',
  HS512: 'HMAC SHA-512 offers maximum security for symmetric algorithms with the longest hash output, ideal for critical systems.',
  RS256: 'RSA SHA-256 uses public/private key pairs for signing and verification, perfect for multi-tenant applications and public APIs.',
  RS384: 'RSA SHA-384 provides stronger RSA security than RS256, suitable for enterprise applications requiring high security.',
  RS512: 'RSA SHA-512 offers maximum security for asymmetric algorithms, ideal for financial and government systems.'
};

export const JWT_USE_CASES = {
  HS256: [
    'Internal API authentication',
    'Microservices communication',
    'Single-tenant applications',
    'Development and testing'
  ],
  HS384: [
    'High-security applications',
    'Government systems',
    'Healthcare applications',
    'Financial services'
  ],
  HS512: [
    'Banking systems',
    'Critical infrastructure',
    'Military applications',
    'Maximum security requirements'
  ],
  RS256: [
    'Multi-tenant applications',
    'Public API authentication',
    'OAuth 2.0 implementations',
    'Third-party integrations'
  ],
  RS384: [
    'Enterprise applications',
    'High-security systems',
    'Compliance requirements',
    'Advanced authentication'
  ],
  RS512: [
    'Financial systems',
    'Government applications',
    'Critical infrastructure',
    'Maximum security requirements'
  ]
};

export const JWT_STATISTICS_LABELS = {
  tokenLength: 'Token Length',
  headerSize: 'Header Size',
  payloadSize: 'Payload Size',
  signatureSize: 'Signature Size',
  hasExpiration: 'Has Expiration',
  hasIssuer: 'Has Issuer',
  hasAudience: 'Has Audience',
  algorithm: 'Algorithm'
};

export const JWT_HELP_TEXT = {
  HS256: 'Use HS256 for most applications. It provides good security with a shared secret key.',
  HS384: 'Use HS384 for applications requiring higher security than HS256.',
  HS512: 'Use HS512 for maximum security in symmetric algorithms.',
  RS256: 'Use RS256 for multi-tenant applications and public APIs with public/private key pairs.',
  RS384: 'Use RS384 for enterprise applications requiring higher RSA security.',
  RS512: 'Use RS512 for financial and government systems requiring maximum security.',
  examples: 'Try the examples below to see how different JWT structures work.',
  validation: 'Invalid JWTs will show error messages. Make sure your token is properly formatted.',
  security: 'Never share your secret keys. Use strong, random secrets for production.'
};

export const JWT_ERROR_MESSAGES = {
  invalidToken: 'Invalid JWT format. Please check your token.',
  invalidHeader: 'Invalid JWT header. Please check the header format.',
  invalidPayload: 'Invalid JWT payload. Please check the payload format.',
  invalidSignature: 'Invalid JWT signature. The token may be tampered with.',
  expiredToken: 'JWT token has expired.',
  invalidSecret: 'Invalid secret key. Please check your secret.',
  algorithmMismatch: 'Algorithm mismatch. The token uses a different algorithm.',
  verificationFailed: 'JWT verification failed. Please check your secret key.',
  emptyInput: 'Please enter a JWT token to decode or verify.',
  networkError: 'Network error. Please check your connection.'
};

export const JWT_SECURITY_TIPS = [
  'Use strong, random secret keys (at least 32 characters)',
  'Never share your secret keys in client-side code',
  'Set appropriate expiration times for your tokens',
  'Use HTTPS in production to protect tokens in transit',
  'Validate all JWT claims on the server side',
  'Use different secrets for different environments',
  'Rotate your secret keys regularly',
  'Consider using asymmetric algorithms (RS256) for public APIs',
  'Implement proper token storage and transmission',
  'Monitor and log JWT usage for security auditing'
];

export const JWT_CLAIM_DESCRIPTIONS = {
  iss: 'Issuer - Identifies who issued the JWT',
  sub: 'Subject - Identifies the subject of the JWT',
  aud: 'Audience - Identifies the recipients that the JWT is intended for',
  exp: 'Expiration Time - Identifies the expiration time on or after which the JWT must not be accepted',
  nbf: 'Not Before - Identifies the time before which the JWT must not be accepted',
  iat: 'Issued At - Identifies the time at which the JWT was issued',
  jti: 'JWT ID - Provides a unique identifier for the JWT'
};
