export interface JsonYamlOptions {
  input: string;
  inputFormat: 'auto' | 'json' | 'yaml';
  outputFormat: 'json' | 'yaml';
  indentSize: number;
  sortKeys: boolean;
}

export const DEFAULT_JSON_YAML_OPTIONS: JsonYamlOptions = {
  input: '',
  inputFormat: 'auto',
  outputFormat: 'yaml',
  indentSize: 2,
  sortKeys: false
};

export const JSON_YAML_EXAMPLES = [
  {
    name: 'Simple Object',
    json: `{
  "name": "John Doe",
  "age": 30,
  "email": "john@example.com"
}`,
    yaml: `name: John Doe
age: 30
email: john@example.com`,
    description: 'Basic object with string and number values',
    category: 'Basic'
  },
  {
    name: 'Nested Object',
    json: `{
  "user": {
    "id": 1,
    "profile": {
      "firstName": "John",
      "lastName": "Doe",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "zipCode": "10001"
      }
    }
  }
}`,
    yaml: `user:
  id: 1
  profile:
    firstName: John
    lastName: Doe
    address:
      street: 123 Main St
      city: New York
      zipCode: 10001`,
    description: 'Object with nested structures',
    category: 'Nested'
  },
  {
    name: 'Array of Objects',
    json: `[
  {
    "id": 1,
    "name": "Product A",
    "price": 29.99,
    "inStock": true
  },
  {
    "id": 2,
    "name": "Product B",
    "price": 39.99,
    "inStock": false
  }
]`,
    yaml: `- id: 1
  name: Product A
  price: 29.99
  inStock: true
- id: 2
  name: Product B
  price: 39.99
  inStock: false`,
    description: 'Array containing multiple objects',
    category: 'Arrays'
  },
  {
    name: 'Configuration File',
    json: `{
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "myapp",
    "credentials": {
      "username": "admin",
      "password": "secret"
    }
  },
  "server": {
    "port": 3000,
    "cors": {
      "enabled": true,
      "origins": ["http://localhost:3000", "https://myapp.com"]
    }
  }
}`,
    yaml: `database:
  host: localhost
  port: 5432
  name: myapp
  credentials:
    username: admin
    password: secret
server:
  port: 3000
  cors:
    enabled: true
    origins:
      - http://localhost:3000
      - https://myapp.com`,
    description: 'Application configuration structure',
    category: 'Configuration'
  },
  {
    name: 'API Response',
    json: `{
  "status": "success",
  "data": {
    "users": [
      {
        "id": 1,
        "name": "Alice",
        "role": "admin"
      },
      {
        "id": 2,
        "name": "Bob",
        "role": "user"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 2
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}`,
    yaml: `status: success
data:
  users:
    - id: 1
      name: Alice
      role: admin
    - id: 2
      name: Bob
      role: user
  pagination:
    page: 1
    limit: 10
    total: 2
timestamp: '2024-01-15T10:30:00Z'`,
    description: 'Typical API response structure',
    category: 'API'
  },
  {
    name: 'Package.json',
    json: `{
  "name": "my-project",
  "version": "0.1.0",
  "description": "A sample project",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "test": "jest",
    "build": "webpack"
  },
  "dependencies": {
    "express": "^4.18.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "webpack": "^5.0.0"
  }
}`,
    yaml: `name: my-project
version: 0.1.0
description: A sample project
main: index.js
scripts:
  start: node index.js
  test: jest
  build: webpack
dependencies:
  express: ^4.18.0
  lodash: ^4.17.21
devDependencies:
  jest: ^29.0.0
  webpack: ^5.0.0`,
    description: 'Node.js package.json structure',
    category: 'Node.js'
  }
];

export const JSON_YAML_CATEGORIES = [
  { name: 'Basic', description: 'Simple objects and values', icon: '📝' },
  { name: 'Nested', description: 'Complex nested structures', icon: '🏗️' },
  { name: 'Arrays', description: 'Array and list examples', icon: '📋' },
  { name: 'Configuration', description: 'Config file examples', icon: '⚙️' },
  { name: 'API', description: 'API response examples', icon: '🌐' },
  { name: 'Node.js', description: 'Node.js specific examples', icon: '🟢' }
];

export const JSON_YAML_FORMAT_OPTIONS = [
  { value: 'json', label: 'JSON', description: 'JavaScript Object Notation' },
  { value: 'yaml', label: 'YAML', description: 'YAML Ain\'t Markup Language' }
];

export const JSON_YAML_INPUT_FORMAT_OPTIONS = [
  { value: 'auto', label: 'Auto', description: 'Auto-detect input format' },
  { value: 'json', label: 'JSON', description: 'Input is JSON' },
  { value: 'yaml', label: 'YAML', description: 'Input is YAML' }
];

export const JSON_YAML_INDENT_OPTIONS = [
  { value: 2, label: '2 spaces', description: 'Standard indentation' },
  { value: 4, label: '4 spaces', description: 'Wide indentation' },
  { value: 1, label: '1 space', description: 'Compact indentation' }
];

export const JSON_YAML_VALIDATION_RULES = [
  {
    format: 'JSON',
    rules: [
      'Must be valid JavaScript object notation',
      'Strings must be in double quotes',
      'No trailing commas allowed',
      'Keys must be strings in double quotes'
    ],
    examples: [
      '{"key": "value"}',
      '{"numbers": [1, 2, 3]}',
      '{"nested": {"inner": "value"}}'
    ]
  },
  {
    format: 'YAML',
    rules: [
      'Indentation is significant',
      'Use colons to separate keys and values',
      'Use dashes for array items',
      'Strings don\'t need quotes unless they contain special characters'
    ],
    examples: [
      'key: value',
      'numbers: [1, 2, 3]',
      'nested:\n  inner: value'
    ]
  }
];

export const JSON_YAML_TOOL_DESCRIPTIONS = {
  title: 'JSON ↔ YAML Converter',
  description: 'Convert between JSON and YAML formats with validation and formatting.',
  features: [
    'Bidirectional conversion between JSON and YAML',
    'Auto-detect input format',
    'Format validation with error messages',
    'Pretty-printing with customizable indentation',
    'Real-time conversion statistics'
  ],
  useCases: [
    'Converting configuration files',
    'API response format conversion',
    'Data migration between systems',
    'Configuration management',
    'Documentation and examples'
  ]
};

export const JSON_YAML_EXAMPLE_SETS = {
  beginner: [
    { name: 'Simple Object', json: '{"name": "John", "age": 30}' },
    { name: 'Array', json: '[1, 2, 3, 4, 5]' },
    { name: 'String', json: '"Hello World"' }
  ],
  intermediate: [
    { name: 'Nested Object', json: '{"user": {"name": "John", "settings": {"theme": "dark"}}}' },
    { name: 'Array of Objects', json: '[{"id": 1, "name": "Item 1"}, {"id": 2, "name": "Item 2"}]' },
    { name: 'Mixed Types', json: '{"string": "value", "number": 42, "boolean": true, "null": null}' }
  ],
  advanced: [
    { name: 'Complex Nested', json: '{"config": {"database": {"host": "localhost", "port": 5432}, "cache": {"enabled": true, "ttl": 3600}}}' },
    { name: 'Large Array', json: '{"items": [{"id": 1, "data": {"value": "a"}}, {"id": 2, "data": {"value": "b"}}]}' },
    { name: 'Special Characters', json: '{"special": "value with spaces and symbols: @#$%", "unicode": "🚀 emoji"}' }
  ]
};

export const JSON_YAML_FORMAT_HELP = {
  json: {
    description: 'JavaScript Object Notation - a lightweight data interchange format',
    syntax: 'Uses curly braces for objects, square brackets for arrays, and double quotes for strings',
    example: '{"name": "John", "age": 30, "hobbies": ["reading", "coding"]}'
  },
  yaml: {
    description: 'YAML Ain\'t Markup Language - a human-readable data serialization format',
    syntax: 'Uses indentation for structure, colons for key-value pairs, and dashes for arrays',
    example: 'name: John\nage: 30\nhobbies:\n  - reading\n  - coding'
  }
};

export const JSON_YAML_CONVERSION_TIPS = [
  {
    tip: 'JSON to YAML',
    description: 'YAML is more human-readable and uses indentation instead of brackets',
    example: '{"key": "value"} → key: value'
  },
  {
    tip: 'YAML to JSON',
    description: 'JSON is more compact and widely supported in APIs',
    example: 'key: value → {"key": "value"}'
  },
  {
    tip: 'Array Handling',
    description: 'YAML uses dashes for arrays, JSON uses square brackets',
    example: 'items:\n  - item1\n  - item2 → {"items": ["item1", "item2"]}'
  },
  {
    tip: 'Nested Objects',
    description: 'Both formats support nested structures with different syntax',
    example: 'parent:\n  child: value → {"parent": {"child": "value"}}'
  }
];
