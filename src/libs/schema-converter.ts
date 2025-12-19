import type { SchemaConverterOptions, SchemaFormat } from '@/config/schema-converter-config';

export interface SchemaConversionResult {
  success: boolean;
  output: string;
  error?: string;
  format: SchemaFormat;
}

// Intermediate representation for schemas
interface SchemaField {
  name: string;
  type: string;
  nullable: boolean;
  required?: boolean;
  description?: string;
  defaultValue?: unknown;
  enum?: string[];
  items?: SchemaField;
  properties?: Record<string, SchemaField>;
}

interface IntermediateSchema {
  type: 'object' | 'array';
  fields: Record<string, SchemaField>;
  name?: string;
}

/**
 * Convert field name based on naming convention
 */
function convertFieldName(name: string, convention: SchemaConverterOptions['fieldNaming']): string {
  if (convention === 'preserve') return name;

  // Convert to camelCase
  if (convention === 'camelCase') {
    return name.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
      .replace(/^[A-Z]/, (letter) => letter.toLowerCase());
  }

  // Convert to snake_case
  if (convention === 'snake_case') {
    return name.replace(/([A-Z])/g, '_$1').toLowerCase()
      .replace(/^-/, '');
  }

  // Convert to PascalCase
  if (convention === 'PascalCase') {
    return name.replace(/(^|_)([a-z])/g, (_, __, letter) => letter.toUpperCase())
      .replace(/_/g, '');
  }

  // Convert to kebab-case
  if (convention === 'kebab-case') {
    return name.replace(/([A-Z])/g, '-$1').toLowerCase()
      .replace(/^-/, '');
  }

  return name;
}

/**
 * Convert JSON Schema to intermediate representation
 */
function jsonSchemaToIntermediate(schema: any): IntermediateSchema {
  if (schema.type === 'array') {
    return {
      type: 'array',
      fields: {},
      name: schema.title || 'Item'
    };
  }

  const fields: Record<string, SchemaField> = {};
  const required = schema.required || [];

  if (schema.properties) {
    for (const [key, value] of Object.entries(schema.properties as Record<string, any>)) {
      const field: SchemaField = {
        name: key,
        type: mapJsonSchemaType(value),
        nullable: !required.includes(key),
        required: required.includes(key),
        description: value.description,
        defaultValue: value.default
      };

      if (value.enum) {
        field.enum = value.enum;
      }

      if (value.type === 'array' && value.items) {
        field.items = {
          name: 'item',
          type: mapJsonSchemaType(value.items),
          nullable: true
        };
      }

      if (value.type === 'object' && value.properties) {
        field.properties = {};
        for (const [propKey, propValue] of Object.entries(value.properties as Record<string, any>)) {
          field.properties[propKey] = {
            name: propKey,
            type: mapJsonSchemaType(propValue),
            nullable: !(value.required || []).includes(propKey)
          };
        }
      }

      fields[key] = field;
    }
  }

  return {
    type: 'object',
    fields,
    name: schema.title || 'Root'
  };
}

/**
 * Map JSON Schema type to common type
 */
function mapJsonSchemaType(schema: any): string {
  if (schema.type === 'integer') return 'integer';
  if (schema.type === 'number') return 'number';
  if (schema.type === 'string') return 'string';
  if (schema.type === 'boolean') return 'boolean';
  if (schema.type === 'array') return 'array';
  if (schema.type === 'object') return 'object';
  if (schema.type === 'null') return 'null';
  return 'unknown';
}

/**
 * Convert intermediate schema to JSON Schema
 */
function intermediateToJsonSchema(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const fields = Object.values(intermediate.fields);
  const required: string[] = [];
  const properties: Record<string, any> = {};

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const jsonType = mapCommonTypeToJsonSchema(field.type);
    const fieldDef: any = {
      type: jsonType,
      description: field.description
    };

    if (field.defaultValue !== undefined) {
      fieldDef.default = field.defaultValue;
    }

    if (field.enum) {
      fieldDef.enum = field.enum;
    }

    if (field.type === 'array' && field.items) {
      fieldDef.type = 'array';
      fieldDef.items = {
        type: mapCommonTypeToJsonSchema(field.items.type)
      };
    }

    if (field.type === 'object' && field.properties) {
      fieldDef.type = 'object';
      fieldDef.properties = {};
      const nestedRequired: string[] = [];
      for (const [propKey, propValue] of Object.entries(field.properties)) {
        const propName = convertFieldName(propKey, options.fieldNaming);
        fieldDef.properties[propName] = {
          type: mapCommonTypeToJsonSchema(propValue.type)
        };
        if (!propValue.nullable) {
          nestedRequired.push(propName);
        }
      }
      if (nestedRequired.length > 0) {
        fieldDef.required = nestedRequired;
      }
    }

    properties[name] = fieldDef;
    if (field.required || !field.nullable) {
      required.push(name);
    }
  }

  const jsonSchema: any = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type: 'object',
    properties
  };

  if (required.length > 0) {
    jsonSchema.required = required;
  }

  if (intermediate.name && intermediate.name !== 'Root') {
    jsonSchema.title = intermediate.name;
  }

  return JSON.stringify(jsonSchema, null, 2);
}

/**
 * Map common type to JSON Schema type
 */
function mapCommonTypeToJsonSchema(type: string): string {
  if (type === 'integer') return 'integer';
  if (type === 'number') return 'number';
  if (type === 'string') return 'string';
  if (type === 'boolean') return 'boolean';
  if (type === 'array') return 'array';
  if (type === 'object') return 'object';
  if (type === 'null') return 'null';
  return 'string';
}

/**
 * Convert intermediate schema to TypeScript
 */
function intermediateToTypeScript(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const style = options.typescriptStyle;
  const className = intermediate.name || 'Root';
  const fields = Object.values(intermediate.fields);

  if (style === 'interface') {
    let output = `export interface ${className} {\n`;
    for (const field of fields) {
      const name = convertFieldName(field.name, options.fieldNaming);
      const type = mapTypeToTypeScript(field.type, field);
      const optional = field.nullable ? '?' : '';
      const comment = field.description ? ` // ${field.description}` : '';
      output += `  ${name}${optional}: ${type};${comment}\n`;
    }
    output += '}';
    return output;
  }

  if (style === 'type') {
    let output = `export type ${className} = {\n`;
    for (const field of fields) {
      const name = convertFieldName(field.name, options.fieldNaming);
      const type = mapTypeToTypeScript(field.type, field);
      const optional = field.nullable ? '?' : '';
      const comment = field.description ? ` // ${field.description}` : '';
      output += `  ${name}${optional}: ${type};${comment}\n`;
    }
    output += '};';
    return output;
  }

  // class style
  let output = `export class ${className} {\n`;
  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const type = mapTypeToTypeScript(field.type, field);
    const comment = field.description ? ` // ${field.description}` : '';
    output += `  ${name}${field.nullable ? '?' : ''}: ${type};${comment}\n`;
  }
  output += '}';
  return output;
}

/**
 * Map type to TypeScript type
 */
function mapTypeToTypeScript(type: string, field: SchemaField): string {
  if (type === 'integer' || type === 'number') return 'number';
  if (type === 'string') {
    if (field.enum) {
      return field.enum.map(v => `"${v}"`).join(' | ');
    }
    return 'string';
  }
  if (type === 'boolean') return 'boolean';
  if (type === 'array') {
    if (field.items) {
      return `${mapTypeToTypeScript(field.items.type, field.items)}[]`;
    }
    return 'unknown[]';
  }
  if (type === 'object') {
    if (field.properties) {
      const props = Object.values(field.properties)
        .map(f => `${convertFieldName(f.name, 'preserve')}: ${mapTypeToTypeScript(f.type, f)}`)
        .join('; ');
      return `{ ${props} }`;
    }
    return 'Record<string, unknown>';
  }
  return 'unknown';
}

/**
 * Convert intermediate schema to Python
 */
function intermediateToPython(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const style = options.pythonStyle;
  const className = intermediate.name || 'Root';
  const fields = Object.values(intermediate.fields);

  if (style === 'dataclass') {
    let output = 'from dataclasses import dataclass\n';
    const hasOptional = fields.some(f => f.nullable);
    const hasList = fields.some(f => f.type === 'array');
    const hasEnum = fields.some(f => f.enum && f.enum.length > 0);
    if (hasOptional || hasList || hasEnum) {
      output += 'from typing import';
      const imports: string[] = [];
      if (hasOptional) imports.push('Optional');
      if (hasList) imports.push('List');
      if (hasEnum) imports.push('Literal');
      output += ` ${imports.join(', ')}\n`;
    }
    output += '\n';
    output += `@dataclass\n`;
    output += `class ${className}:\n`;
    for (const field of fields) {
      const name = convertFieldName(field.name, options.fieldNaming);
      const type = mapTypeToPython(field.type, field);
      const pythonType = field.nullable ? `Optional[${type}]` : type;
      const defaultValue = field.defaultValue !== undefined
        ? ` = ${formatPythonValue(field.defaultValue)}`
        : field.nullable
          ? ' = None'
          : '';
      const comment = field.description ? `  # ${field.description}` : '';
      output += `    ${name}: ${pythonType}${defaultValue}${comment}\n`;
    }
    return output;
  }

  if (style === 'pydantic') {
    let output = 'from pydantic import BaseModel\n';
    const hasOptional = fields.some(f => f.nullable);
    const hasList = fields.some(f => f.type === 'array');
    const hasEnum = fields.some(f => f.enum && f.enum.length > 0);
    if (hasOptional || hasList || hasEnum) {
      output += 'from typing import';
      const imports: string[] = [];
      if (hasOptional) imports.push('Optional');
      if (hasList) imports.push('List');
      if (hasEnum) imports.push('Literal');
      output += ` ${imports.join(', ')}\n`;
    }
    output += '\n';
    output += `class ${className}(BaseModel):\n`;
    for (const field of fields) {
      const name = convertFieldName(field.name, options.fieldNaming);
      const type = mapTypeToPython(field.type, field);
      const pythonType = field.nullable ? `Optional[${type}]` : type;
      const defaultValue = field.defaultValue !== undefined
        ? ` = ${formatPythonValue(field.defaultValue)}`
        : field.nullable
          ? ' = None'
          : '';
      const comment = field.description ? `  # ${field.description}` : '';
      output += `    ${name}: ${pythonType}${defaultValue}${comment}\n`;
    }
    return output;
  }

  // Standard class
  let output = `class ${className}:\n`;
  output += `    def __init__(self):\n`;
  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const defaultValue = field.defaultValue !== undefined
      ? formatPythonValue(field.defaultValue)
      : field.nullable
        ? 'None'
        : 'None';
    output += `        self.${name} = ${defaultValue}\n`;
  }
  return output;
}

/**
 * Map type to Python type
 */
function mapTypeToPython(type: string, field: SchemaField): string {
  if (type === 'integer') return 'int';
  if (type === 'number') return 'float';
  if (type === 'string') {
    if (field.enum) {
      return `Literal[${field.enum.map(v => `"${v}"`).join(', ')}]`;
    }
    return 'str';
  }
  if (type === 'boolean') return 'bool';
  if (type === 'array') {
    if (field.items) {
      return `List[${mapTypeToPython(field.items.type, field.items)}]`;
    }
    return 'List[unknown]';
  }
  if (type === 'object') {
    return 'dict';
  }
  return 'unknown';
}

/**
 * Format Python value
 */
function formatPythonValue(value: unknown): string {
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? 'True' : 'False';
  if (value === null) return 'None';
  return String(value);
}

/**
 * Convert intermediate schema to SQL
 */
function intermediateToSQL(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const tableName = intermediate.name?.toLowerCase() || 'table_name';
  const fields = Object.values(intermediate.fields);
  const dialect = options.sqlDialect;

  let output = `CREATE TABLE ${tableName} (\n`;
  const sqlFields: string[] = [];

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const type = mapTypeToSQL(field.type, field, options);
    const nullable = field.nullable ? '' : ' NOT NULL';
    const defaultValue = field.defaultValue !== undefined
      ? ` DEFAULT ${formatSQLValue(field.defaultValue, dialect)}`
      : '';
    sqlFields.push(`    ${name} ${type}${nullable}${defaultValue}`);
  }

  // Add primary key if id field exists
  const idField = fields.find(f => f.name.toLowerCase() === 'id');
  if (idField) {
    sqlFields[0] = sqlFields[0].replace(' NOT NULL', ' PRIMARY KEY NOT NULL');
  }

  output += sqlFields.join(',\n');
  output += '\n);';
  return output;
}

/**
 * Map type to SQL type
 */
function mapTypeToSQL(type: string, field: SchemaField, options: SchemaConverterOptions): string {
  if (type === 'integer') {
    return options.numberType === 'bigint' ? 'BIGINT' : 'INTEGER';
  }
  if (type === 'number') {
    if (options.numberType === 'decimal') return 'DECIMAL(10, 2)';
    if (options.numberType === 'float') return 'FLOAT';
    if (options.numberType === 'double') return 'DOUBLE';
    return 'NUMERIC';
  }
  if (type === 'string') {
    if (options.stringType === 'varchar') return 'VARCHAR(255)';
    if (options.stringType === 'text') return 'TEXT';
    return 'VARCHAR(255)';
  }
  if (type === 'boolean') {
    if (options.sqlDialect === 'mysql') return 'TINYINT(1)';
    if (options.sqlDialect === 'mssql') return 'BIT';
    return options.booleanType === 'bit' ? 'BIT' : 'BOOLEAN';
  }
  if (type === 'array') {
    if (options.sqlDialect === 'postgresql') return 'JSONB';
    if (options.sqlDialect === 'mysql') return 'JSON';
    return 'TEXT';
  }
  if (type === 'object') {
    if (options.sqlDialect === 'postgresql') return 'JSONB';
    if (options.sqlDialect === 'mysql') return 'JSON';
    return 'TEXT';
  }
  return 'TEXT';
}

/**
 * Format SQL value
 */
function formatSQLValue(value: unknown, dialect: string): string {
  if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') {
    if (dialect === 'mysql') return value ? '1' : '0';
    return value ? 'TRUE' : 'FALSE';
  }
  return 'NULL';
}

/**
 * Convert intermediate schema to Spark Schema
 */
function intermediateToSpark(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const fields = Object.values(intermediate.fields);
  const sparkFields: any[] = [];

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const sparkField: any = {
      name,
      type: mapTypeToSpark(field.type, field),
      nullable: field.nullable,
      metadata: {}
    };

    if (field.type === 'array' && field.items) {
      sparkField.type = {
        type: 'array',
        elementType: mapTypeToSpark(field.items.type, field.items),
        containsNull: field.items.nullable !== false
      };
    }

    if (field.type === 'object' && field.properties) {
      const nestedFields: any[] = [];
      for (const [propKey, propValue] of Object.entries(field.properties)) {
        nestedFields.push({
          name: convertFieldName(propKey, options.fieldNaming),
          type: mapTypeToSpark(propValue.type, propValue),
          nullable: propValue.nullable,
          metadata: {}
        });
      }
      sparkField.type = {
        type: 'struct',
        fields: nestedFields
      };
    }

    sparkFields.push(sparkField);
  }

  const sparkSchema = {
    type: 'struct',
    fields: sparkFields
  };

  return JSON.stringify(sparkSchema, null, 2);
}

/**
 * Map type to Spark type
 */
function mapTypeToSpark(type: string, field: SchemaField): string {
  if (type === 'integer') return 'integer';
  if (type === 'number') return 'double';
  if (type === 'string') return 'string';
  if (type === 'boolean') return 'boolean';
  if (type === 'array') return 'array';
  if (type === 'object') return 'struct';
  return 'string';
}

/**
 * Parse JSON Schema
 */
function parseJsonSchema(schemaString: string): any {
  try {
    return JSON.parse(schemaString);
  } catch (error) {
    throw new Error(`Invalid JSON Schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse Spark Schema
 */
function parseSparkSchema(schemaString: string): any {
  try {
    const schema = JSON.parse(schemaString);
    if (schema.type !== 'struct' || !schema.fields) {
      throw new Error('Invalid Spark Schema: must have type "struct" and "fields" array');
    }
    return schema;
  } catch (error) {
    throw new Error(`Invalid Spark Schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert Spark Schema to intermediate representation
 */
function sparkToIntermediate(schema: any): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};

  if (schema.fields && Array.isArray(schema.fields)) {
    for (const field of schema.fields) {
      const fieldType = typeof field.type === 'string' ? field.type : field.type.type;
      const schemaField: SchemaField = {
        name: field.name,
        type: mapSparkTypeToCommon(fieldType),
        nullable: field.nullable !== false
      };

      if (field.type && typeof field.type === 'object') {
        if (field.type.type === 'array' && field.type.elementType) {
          schemaField.items = {
            name: 'item',
            type: mapSparkTypeToCommon(field.type.elementType),
            nullable: field.type.containsNull !== false
          };
        }
        if (field.type.type === 'struct' && field.type.fields) {
          schemaField.properties = {};
          for (const nestedField of field.type.fields) {
            const nestedType = typeof nestedField.type === 'string' ? nestedField.type : nestedField.type.type;
            schemaField.properties[nestedField.name] = {
              name: nestedField.name,
              type: mapSparkTypeToCommon(nestedType),
              nullable: nestedField.nullable !== false
            };
          }
        }
      }

      fields[field.name] = schemaField;
    }
  }

  return {
    type: 'object',
    fields,
    name: 'Root'
  };
}

/**
 * Map Spark type to common type
 */
function mapSparkTypeToCommon(sparkType: string): string {
  if (sparkType === 'integer' || sparkType === 'int') return 'integer';
  if (sparkType === 'long') return 'integer';
  if (sparkType === 'double' || sparkType === 'float') return 'number';
  if (sparkType === 'string') return 'string';
  if (sparkType === 'boolean') return 'boolean';
  if (sparkType === 'array') return 'array';
  if (sparkType === 'struct') return 'object';
  return 'string';
}

/**
 * Parse MongoDB Schema
 */
function parseMongoSchema(schemaString: string): any {
  try {
    const schema = JSON.parse(schemaString);
    // MongoDB schema can be either a JSON Schema object or an array
    if (Array.isArray(schema)) {
      throw new Error('MongoDB schema should be a JSON Schema object, not an array');
    }
    if (schema.bsonType && schema.bsonType !== 'object') {
      throw new Error('MongoDB schema root must have bsonType "object"');
    }
    return schema;
  } catch (error) {
    throw new Error(`Invalid MongoDB Schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert MongoDB Schema to intermediate representation
 */
function mongoToIntermediate(schema: any): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};
  const required = schema.required || [];

  if (schema.properties) {
    for (const [key, value] of Object.entries(schema.properties as Record<string, any>)) {
      const bsonType = value.bsonType || value.type;
      const schemaField: SchemaField = {
        name: key,
        type: mapMongoTypeToCommon(bsonType),
        nullable: !required.includes(key),
        required: required.includes(key),
        description: value.description
      };

      if (value.enum) {
        schemaField.enum = value.enum;
      }

      if (bsonType === 'array' && value.items) {
        const itemBsonType = value.items.bsonType || value.items.type;
        schemaField.items = {
          name: 'item',
          type: mapMongoTypeToCommon(itemBsonType),
          nullable: true
        };
      }

      if (bsonType === 'object' && value.properties) {
        schemaField.properties = {};
        const nestedRequired = value.required || [];
        for (const [propKey, propValue] of Object.entries(value.properties as Record<string, any>)) {
          const propBsonType = propValue.bsonType || propValue.type;
          schemaField.properties[propKey] = {
            name: propKey,
            type: mapMongoTypeToCommon(propBsonType),
            nullable: !nestedRequired.includes(propKey)
          };
        }
      }

      fields[key] = schemaField;
    }
  }

  return {
    type: 'object',
    fields,
    name: 'Root'
  };
}

/**
 * Map MongoDB BSON type to common type
 */
function mapMongoTypeToCommon(bsonType: string | string[]): string {
  if (Array.isArray(bsonType)) {
    // Use the first non-null type
    const nonNullType = bsonType.find(t => t !== 'null');
    return mapMongoTypeToCommon(nonNullType || bsonType[0]);
  }
  if (bsonType === 'int' || bsonType === 'long') return 'integer';
  if (bsonType === 'double' || bsonType === 'decimal') return 'number';
  if (bsonType === 'string') return 'string';
  if (bsonType === 'bool') return 'boolean';
  if (bsonType === 'array') return 'array';
  if (bsonType === 'object') return 'object';
  if (bsonType === 'date') return 'string'; // Dates are typically strings in schemas
  if (bsonType === 'null') return 'null';
  return 'string';
}

/**
 * Parse BigQuery Schema
 */
function parseBigQuerySchema(schemaString: string): any {
  try {
    const schema = JSON.parse(schemaString);
    if (!Array.isArray(schema)) {
      throw new Error('BigQuery schema must be an array of field definitions');
    }
    return schema;
  } catch (error) {
    throw new Error(`Invalid BigQuery Schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert BigQuery Schema to intermediate representation
 */
function bigQueryToIntermediate(schema: any[]): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};

  for (const field of schema) {
    const schemaField: SchemaField = {
      name: field.name,
      type: mapBigQueryTypeToCommon(field.type),
      nullable: field.mode !== 'REQUIRED',
      required: field.mode === 'REQUIRED',
      description: field.description
    };

    // Handle REPEATED fields (arrays)
    if (field.mode === 'REPEATED') {
      schemaField.type = 'array';
      schemaField.items = {
        name: 'item',
        type: mapBigQueryTypeToCommon(field.type),
        nullable: true
      };
    }

    // Handle RECORD fields (nested objects)
    if (field.type === 'RECORD' && field.fields) {
      schemaField.type = 'object';
      schemaField.properties = {};
      for (const nestedField of field.fields) {
        schemaField.properties[nestedField.name] = {
          name: nestedField.name,
          type: mapBigQueryTypeToCommon(nestedField.type),
          nullable: nestedField.mode !== 'REQUIRED'
        };
        if (nestedField.mode === 'REPEATED') {
          schemaField.properties[nestedField.name].type = 'array';
        }
      }
    }

    fields[field.name] = schemaField;
  }

  return {
    type: 'object',
    fields,
    name: 'Root'
  };
}

/**
 * Map BigQuery type to common type
 */
function mapBigQueryTypeToCommon(bigQueryType: string): string {
  if (bigQueryType === 'INTEGER' || bigQueryType === 'INT64') return 'integer';
  if (bigQueryType === 'FLOAT' || bigQueryType === 'FLOAT64') return 'number';
  if (bigQueryType === 'STRING') return 'string';
  if (bigQueryType === 'BOOLEAN' || bigQueryType === 'BOOL') return 'boolean';
  if (bigQueryType === 'RECORD') return 'object';
  if (bigQueryType === 'DATE' || bigQueryType === 'DATETIME' || bigQueryType === 'TIMESTAMP') return 'string';
  if (bigQueryType === 'TIME') return 'string';
  return 'string';
}

/**
 * Convert intermediate schema to MongoDB Schema
 */
function intermediateToMongo(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const fields = Object.values(intermediate.fields);
  const required: string[] = [];
  const properties: Record<string, any> = {};

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const bsonType = mapCommonTypeToMongo(field.type, field);
    const fieldDef: any = {
      bsonType: bsonType,
      description: field.description
    };

    if (field.enum) {
      fieldDef.enum = field.enum;
    }

    if (field.type === 'array' && field.items) {
      fieldDef.bsonType = 'array';
      fieldDef.items = {
        bsonType: mapCommonTypeToMongo(field.items.type, field.items)
      };
    }

    if (field.type === 'object' && field.properties) {
      fieldDef.bsonType = 'object';
      fieldDef.properties = {};
      const nestedRequired: string[] = [];
      for (const [propKey, propValue] of Object.entries(field.properties)) {
        const propName = convertFieldName(propKey, options.fieldNaming);
        fieldDef.properties[propName] = {
          bsonType: mapCommonTypeToMongo(propValue.type, propValue)
        };
        if (!propValue.nullable) {
          nestedRequired.push(propName);
        }
      }
      if (nestedRequired.length > 0) {
        fieldDef.required = nestedRequired;
      }
    }

    properties[name] = fieldDef;
    if (field.required || !field.nullable) {
      required.push(name);
    }
  }

  const mongoSchema: any = {
    bsonType: 'object',
    properties
  };

  if (required.length > 0) {
    mongoSchema.required = required;
  }

  return JSON.stringify(mongoSchema, null, 2);
}

/**
 * Map common type to MongoDB BSON type
 */
function mapCommonTypeToMongo(type: string, field: SchemaField): string {
  if (type === 'integer') return 'int';
  if (type === 'number') return 'double';
  if (type === 'string') return 'string';
  if (type === 'boolean') return 'bool';
  if (type === 'array') return 'array';
  if (type === 'object') return 'object';
  return 'string';
}

/**
 * Convert intermediate schema to BigQuery Schema
 */
function intermediateToBigQuery(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const fields = Object.values(intermediate.fields);
  const bigQueryFields: any[] = [];

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const bigQueryType = mapCommonTypeToBigQuery(field.type, field);
    const fieldDef: any = {
      name,
      type: bigQueryType,
      mode: field.required || !field.nullable ? 'REQUIRED' : 'NULLABLE',
      description: field.description
    };

    // Handle arrays
    if (field.type === 'array') {
      fieldDef.mode = 'REPEATED';
      if (field.items) {
        fieldDef.type = mapCommonTypeToBigQuery(field.items.type, field.items);
      }
    }

    // Handle nested objects
    if (field.type === 'object' && field.properties) {
      fieldDef.type = 'RECORD';
      fieldDef.fields = [];
      for (const [propKey, propValue] of Object.entries(field.properties)) {
        const propName = convertFieldName(propKey, options.fieldNaming);
        let propType = mapCommonTypeToBigQuery(propValue.type, propValue);
        let propMode = propValue.nullable ? 'NULLABLE' : 'REQUIRED';

        // Handle arrays in nested objects
        if (propValue.type === 'array') {
          propMode = 'REPEATED';
          if (propValue.items) {
            propType = mapCommonTypeToBigQuery(propValue.items.type, propValue.items);
          }
        }

        const nestedField: any = {
          name: propName,
          type: propType,
          mode: propMode
        };

        // Handle nested RECORD fields
        if (propValue.type === 'object' && propValue.properties) {
          nestedField.type = 'RECORD';
          nestedField.fields = [];
          for (const [nestedPropKey, nestedPropValue] of Object.entries(propValue.properties)) {
            const nestedPropName = convertFieldName(nestedPropKey, options.fieldNaming);
            const nestedPropType = mapCommonTypeToBigQuery(nestedPropValue.type, nestedPropValue);
            nestedField.fields.push({
              name: nestedPropName,
              type: nestedPropType,
              mode: nestedPropValue.nullable ? 'NULLABLE' : 'REQUIRED'
            });
          }
        }

        fieldDef.fields.push(nestedField);
      }
    }

    bigQueryFields.push(fieldDef);
  }

  return JSON.stringify(bigQueryFields, null, 2);
}

/**
 * Map common type to BigQuery type
 */
function mapCommonTypeToBigQuery(type: string, field: SchemaField): string {
  if (type === 'integer') return 'INTEGER';
  if (type === 'number') return 'FLOAT';
  if (type === 'string') return 'STRING';
  if (type === 'boolean') return 'BOOLEAN';
  if (type === 'object') return 'RECORD';
  return 'STRING';
}

/**
 * Parse TypeScript interface/type/class
 */
function parseTypeScript(input: string): any {
  // Remove comments
  const cleaned = input.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();

  // Extract interface/type/class name and body
  const interfaceMatch = cleaned.match(/(?:export\s+)?interface\s+(\w+)\s*\{([\s\S]*?)\}/);
  const typeMatch = cleaned.match(/(?:export\s+)?type\s+(\w+)\s*=\s*\{([\s\S]*?)\}/);
  const classMatch = cleaned.match(/(?:export\s+)?class\s+(\w+)[\s\S]*?\{([\s\S]*?)\}/);

  const match = interfaceMatch || typeMatch || classMatch;
  if (!match) {
    throw new Error('Could not parse TypeScript definition. Expected interface, type, or class.');
  }

  return {
    name: match[1],
    body: match[2],
    type: interfaceMatch ? 'interface' : typeMatch ? 'type' : 'class'
  };
}

/**
 * Convert TypeScript to intermediate representation
 */
function typescriptToIntermediate(parsed: any): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};
  const body = parsed.body;

  // Parse field definitions: name?: type; or name: type;
  const fieldRegex = /(\w+)(\??)\s*:\s*([^;]+);/g;
  let match;

  while ((match = fieldRegex.exec(body)) !== null) {
    const name = match[1];
    const optional = match[2] === '?';
    const typeStr = match[3].trim();

    const field: SchemaField = {
      name,
      type: mapTypeScriptTypeToCommon(typeStr),
      nullable: optional
    };

    // Handle array types
    if (typeStr.endsWith('[]')) {
      field.type = 'array';
      const itemType = typeStr.slice(0, -2).trim();
      field.items = {
        name: 'item',
        type: mapTypeScriptTypeToCommon(itemType),
        nullable: true
      };
    }

    // Handle union types (enums)
    if (typeStr.includes('|') && typeStr.includes('"')) {
      const enumValues = typeStr.split('|').map(v => v.trim().replace(/"/g, ''));
      field.enum = enumValues;
      field.type = 'string';
    }

    // Handle object types
    if (typeStr.startsWith('{') && typeStr.endsWith('}')) {
      field.type = 'object';
      // Simple nested object parsing
      const nestedBody = typeStr.slice(1, -1);
      field.properties = {};
      const nestedMatch = nestedBody.match(/(\w+)\s*:\s*([^,}]+)/g);
      if (nestedMatch) {
        for (const nestedField of nestedMatch) {
          const nestedParts = nestedField.match(/(\w+)\s*:\s*(.+)/);
          if (nestedParts) {
            field.properties[nestedParts[1]] = {
              name: nestedParts[1],
              type: mapTypeScriptTypeToCommon(nestedParts[2].trim()),
              nullable: true
            };
          }
        }
      }
    }

    fields[name] = field;
  }

  return {
    type: 'object',
    fields,
    name: parsed.name || 'Root'
  };
}

/**
 * Map TypeScript type to common type
 */
function mapTypeScriptTypeToCommon(typeStr: string): string {
  const type = typeStr.trim();
  if (type === 'number' || type === 'Number') return 'number';
  if (type === 'string' || type === 'String') return 'string';
  if (type === 'boolean' || type === 'Boolean') return 'boolean';
  if (type === 'any' || type === 'unknown') return 'string';
  if (type.endsWith('[]')) return 'array';
  if (type.startsWith('{')) return 'object';
  if (type.startsWith('Record<')) return 'object';
  return 'string';
}

/**
 * Parse Python class/dataclass/pydantic
 */
function parsePython(input: string): any {
  // Remove comments
  const cleaned = input.replace(/#.*/g, '').trim();

  // Extract class name and body
  const classMatch = cleaned.match(/(?:@\w+\s+)?class\s+(\w+)[\s\S]*?:\s*([\s\S]*)/);
  if (!classMatch) {
    throw new Error('Could not parse Python class definition.');
  }

  const className = classMatch[1];
  const body = classMatch[2];

  // Determine if it's a dataclass, pydantic, or regular class
  const isDataclass = cleaned.includes('@dataclass') || cleaned.includes('from dataclasses');
  const isPydantic = cleaned.includes('BaseModel') || cleaned.includes('from pydantic');

  return {
    name: className,
    body,
    type: isDataclass ? 'dataclass' : isPydantic ? 'pydantic' : 'class'
  };
}

/**
 * Convert Python to intermediate representation
 */
function pythonToIntermediate(parsed: any): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};
  const body = parsed.body;

  // Parse field definitions: name: type = default or name: Optional[type] = None
  const fieldRegex = /(\w+)\s*:\s*([^=]+?)(?:\s*=\s*([^\n]+))?/g;
  let match;

  while ((match = fieldRegex.exec(body)) !== null) {
    const name = match[1];
    let typeStr = match[2].trim();
    const defaultValue = match[3]?.trim();

    const field: SchemaField = {
      name,
      type: mapPythonTypeToCommon(typeStr),
      nullable: typeStr.includes('Optional') || defaultValue === 'None'
    };

    // Handle Optional[Type]
    if (typeStr.includes('Optional[')) {
      typeStr = typeStr.replace(/Optional\[([^\]]+)\]/, '$1');
      field.type = mapPythonTypeToCommon(typeStr);
    }

    // Handle List[Type]
    if (typeStr.includes('List[')) {
      field.type = 'array';
      const itemType = typeStr.replace(/List\[([^\]]+)\]/, '$1');
      field.items = {
        name: 'item',
        type: mapPythonTypeToCommon(itemType),
        nullable: true
      };
    }

    // Handle Literal (enums)
    if (typeStr.includes('Literal[')) {
      const enumMatch = typeStr.match(/Literal\[([^\]]+)\]/);
      if (enumMatch) {
        field.enum = enumMatch[1].split(',').map(v => v.trim().replace(/"/g, '').replace(/'/g, ''));
        field.type = 'string';
      }
    }

    if (defaultValue && defaultValue !== 'None') {
      field.defaultValue = parsePythonValue(defaultValue);
    }

    fields[name] = field;
  }

  return {
    type: 'object',
    fields,
    name: parsed.name || 'Root'
  };
}

/**
 * Map Python type to common type
 */
function mapPythonTypeToCommon(typeStr: string): string {
  const type = typeStr.trim();
  if (type === 'int' || type === 'Int') return 'integer';
  if (type === 'float' || type === 'Float') return 'number';
  if (type === 'str' || type === 'String') return 'string';
  if (type === 'bool' || type === 'Boolean') return 'boolean';
  if (type.startsWith('List[')) return 'array';
  if (type === 'dict' || type === 'Dict') return 'object';
  return 'string';
}

/**
 * Parse Python value
 */
function parsePythonValue(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === 'True') return true;
  if (trimmed === 'False') return false;
  if (trimmed === 'None') return null;
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1);
  }
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }
  const num = Number(trimmed);
  if (!isNaN(num)) return num;
  return trimmed;
}

/**
 * Parse SQL CREATE TABLE statement
 */
function parseSQL(input: string): any {
  // Remove comments
  const cleaned = input.replace(/--.*/g, '').replace(/\/\*[\s\S]*?\*\//g, '').trim();

  // Extract table name and columns
  const tableMatch = cleaned.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([\s\S]*?)\)/i);
  if (!tableMatch) {
    throw new Error('Could not parse SQL CREATE TABLE statement.');
  }

  const tableName = tableMatch[1];
  const columnsBody = tableMatch[2];

  return {
    name: tableName,
    columns: columnsBody
  };
}

/**
 * Convert SQL to intermediate representation
 */
function sqlToIntermediate(parsed: any): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};
  const columns = parsed.columns;

  // Parse column definitions: name TYPE constraints
  const columnRegex = /(\w+)\s+(\w+(?:\([^)]+\))?)\s*([^,]*)/g;
  let match;

  while ((match = columnRegex.exec(columns)) !== null) {
    const name = match[1];
    const sqlType = match[2].toUpperCase();
    const constraints = match[3].trim();

    const field: SchemaField = {
      name,
      type: mapSQLTypeToCommon(sqlType),
      nullable: !constraints.includes('NOT NULL'),
      required: constraints.includes('NOT NULL') || constraints.includes('PRIMARY KEY')
    };

    // Extract DEFAULT value
    const defaultMatch = constraints.match(/DEFAULT\s+([^\s,]+)/i);
    if (defaultMatch) {
      field.defaultValue = parseSQLValue(defaultMatch[1]);
    }

    fields[name] = field;
  }

  return {
    type: 'object',
    fields,
    name: parsed.name || 'Root'
  };
}

/**
 * Map SQL type to common type
 */
function mapSQLTypeToCommon(sqlType: string): string {
  const type = sqlType.toUpperCase();
  if (type.includes('INT')) return 'integer';
  if (type.includes('DECIMAL') || type.includes('NUMERIC') || type.includes('FLOAT') || type.includes('DOUBLE')) return 'number';
  if (type.includes('VARCHAR') || type.includes('CHAR') || type.includes('TEXT') || type.includes('STRING')) return 'string';
  if (type.includes('BOOL') || type.includes('BOOLEAN') || type.includes('BIT')) return 'boolean';
  if (type.includes('JSON')) return 'object';
  return 'string';
}

/**
 * Parse SQL value
 */
function parseSQLValue(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed === 'TRUE' || trimmed === '1') return true;
  if (trimmed === 'FALSE' || trimmed === '0') return false;
  if (trimmed === 'NULL') return null;
  if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
    return trimmed.slice(1, -1);
  }
  const num = Number(trimmed);
  if (!isNaN(num)) return num;
  return trimmed;
}

/**
 * Parse Pandas Schema
 * Format: {"column1": "int64", "column2": "object"} or [{"name": "column1", "type": "int64"}, ...]
 */
function parsePandasSchema(schemaString: string): any {
  try {
    const schema = JSON.parse(schemaString);

    // Handle dictionary format: {"column1": "int64", "column2": "object"}
    if (!Array.isArray(schema) && typeof schema === 'object') {
      return Object.entries(schema).map(([name, dtype]) => ({
        name,
        type: dtype as string
      }));
    }

    // Handle array format: [{"name": "column1", "type": "int64"}, ...]
    if (Array.isArray(schema)) {
      return schema.map(field => ({
        name: field.name || field.column,
        type: field.type || field.dtype
      }));
    }

    throw new Error('Invalid Pandas schema format');
  } catch (error) {
    throw new Error(`Invalid Pandas Schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert Pandas Schema to intermediate representation
 */
function pandasToIntermediate(schema: any[]): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};

  for (const field of schema) {
    const schemaField: SchemaField = {
      name: field.name,
      type: mapPandasTypeToCommon(field.type),
      nullable: true // Pandas allows NaN/null by default
    };

    fields[field.name] = schemaField;
  }

  return {
    type: 'object',
    fields,
    name: 'Root'
  };
}

/**
 * Map Pandas dtype to common type
 */
function mapPandasTypeToCommon(dtype: string): string {
  const type = dtype.toLowerCase();
  if (type.includes('int')) return 'integer';
  if (type.includes('float')) return 'number';
  if (type === 'object' || type === 'string' || type.includes('str')) return 'string';
  if (type === 'bool' || type === 'boolean') return 'boolean';
  if (type.includes('datetime')) return 'string';
  if (type.includes('category')) return 'string';
  return 'string';
}

/**
 * Convert intermediate schema to Pandas Schema
 */
function intermediateToPandas(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const fields = Object.values(intermediate.fields);
  const pandasSchema: Record<string, string> = {};

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const pandasType = mapCommonTypeToPandas(field.type);
    pandasSchema[name] = pandasType;
  }

  return JSON.stringify(pandasSchema, null, 2);
}

/**
 * Map common type to Pandas dtype
 */
function mapCommonTypeToPandas(type: string): string {
  if (type === 'integer') return 'int64';
  if (type === 'number') return 'float64';
  if (type === 'string') return 'object';
  if (type === 'boolean') return 'bool';
  if (type === 'array') return 'object';
  if (type === 'object') return 'object';
  return 'object';
}

/**
 * Parse Polars Schema
 * Format: {"column1": "Int64", "column2": "Utf8"} or [{"name": "column1", "type": "Int64"}, ...]
 */
function parsePolarsSchema(schemaString: string): any {
  try {
    const schema = JSON.parse(schemaString);

    // Handle dictionary format: {"column1": "Int64", "column2": "Utf8"}
    if (!Array.isArray(schema) && typeof schema === 'object') {
      return Object.entries(schema).map(([name, type]) => ({
        name,
        type: type as string
      }));
    }

    // Handle array format: [{"name": "column1", "type": "Int64"}, ...]
    if (Array.isArray(schema)) {
      return schema.map(field => ({
        name: field.name || field.column,
        type: field.type || field.dtype
      }));
    }

    throw new Error('Invalid Polars schema format');
  } catch (error) {
    throw new Error(`Invalid Polars Schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert Polars Schema to intermediate representation
 */
function polarsToIntermediate(schema: any[]): IntermediateSchema {
  const fields: Record<string, SchemaField> = {};

  for (const field of schema) {
    const schemaField: SchemaField = {
      name: field.name,
      type: mapPolarsTypeToCommon(field.type),
      nullable: true // Polars allows null by default unless specified
    };

    fields[field.name] = schemaField;
  }

  return {
    type: 'object',
    fields,
    name: 'Root'
  };
}

/**
 * Map Polars type to common type
 */
function mapPolarsTypeToCommon(polarsType: string): string {
  const type = polarsType.toLowerCase();
  if (type.includes('int')) return 'integer';
  if (type.includes('float')) return 'number';
  if (type === 'utf8' || type === 'str' || type === 'string') return 'string';
  if (type === 'bool' || type === 'boolean') return 'boolean';
  if (type.includes('date') || type.includes('datetime')) return 'string';
  if (type.includes('list') || type.includes('array')) return 'array';
  if (type.includes('struct')) return 'object';
  return 'string';
}

/**
 * Convert intermediate schema to Polars Schema
 */
function intermediateToPolars(
  intermediate: IntermediateSchema,
  options: SchemaConverterOptions
): string {
  const fields = Object.values(intermediate.fields);
  const polarsSchema: Record<string, string> = {};

  for (const field of fields) {
    const name = convertFieldName(field.name, options.fieldNaming);
    const polarsType = mapCommonTypeToPolars(field.type);
    polarsSchema[name] = polarsType;
  }

  return JSON.stringify(polarsSchema, null, 2);
}

/**
 * Map common type to Polars type
 */
function mapCommonTypeToPolars(type: string): string {
  if (type === 'integer') return 'Int64';
  if (type === 'number') return 'Float64';
  if (type === 'string') return 'Utf8';
  if (type === 'boolean') return 'Bool';
  if (type === 'array') return 'List';
  if (type === 'object') return 'Struct';
  return 'Utf8';
}

/**
 * Main conversion function
 * Simplified: All formats convert to JSON Schema first, then JSON Schema converts to target format
 */
export function convertSchema(
  input: string,
  options: SchemaConverterOptions
): SchemaConversionResult {
  try {
    let intermediate: IntermediateSchema;
    let jsonSchemaIntermediate: IntermediateSchema;

    // Step 1: Convert source format to JSON Schema intermediate representation
    // All formats convert to JSON Schema first (simplified architecture)
    if (options.sourceFormat === 'json-schema') {
      // Already JSON Schema, just parse it
      const schema = parseJsonSchema(input);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(schema);
    } else if (options.sourceFormat === 'spark') {
      // Convert Spark → Intermediate → JSON Schema → Intermediate
      const schema = parseSparkSchema(input);
      intermediate = sparkToIntermediate(schema);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'mongo') {
      // Convert MongoDB → Intermediate → JSON Schema → Intermediate
      const schema = parseMongoSchema(input);
      intermediate = mongoToIntermediate(schema);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'bigquery') {
      // Convert BigQuery → Intermediate → JSON Schema → Intermediate
      const schema = parseBigQuerySchema(input);
      intermediate = bigQueryToIntermediate(schema);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'typescript') {
      // Convert TypeScript → Intermediate → JSON Schema → Intermediate
      const parsed = parseTypeScript(input);
      intermediate = typescriptToIntermediate(parsed);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'python') {
      // Convert Python → Intermediate → JSON Schema → Intermediate
      const parsed = parsePython(input);
      intermediate = pythonToIntermediate(parsed);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'sql') {
      // Convert SQL → Intermediate → JSON Schema → Intermediate
      const parsed = parseSQL(input);
      intermediate = sqlToIntermediate(parsed);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'pandas') {
      // Convert Pandas → Intermediate → JSON Schema → Intermediate
      const schema = parsePandasSchema(input);
      intermediate = pandasToIntermediate(schema);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else if (options.sourceFormat === 'polars') {
      // Convert Polars → Intermediate → JSON Schema → Intermediate
      const schema = parsePolarsSchema(input);
      intermediate = polarsToIntermediate(schema);
      const jsonSchemaString = intermediateToJsonSchema(intermediate, options);
      const jsonSchema = parseJsonSchema(jsonSchemaString);
      jsonSchemaIntermediate = jsonSchemaToIntermediate(jsonSchema);
    } else {
      return {
        success: false,
        output: '',
        error: `Source format "${options.sourceFormat}" is not yet supported`,
        format: options.targetFormat
      };
    }

    // Step 2: Convert JSON Schema intermediate to target format
    let output: string;
    if (options.targetFormat === 'json-schema') {
      output = intermediateToJsonSchema(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'typescript') {
      output = intermediateToTypeScript(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'python') {
      output = intermediateToPython(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'sql') {
      output = intermediateToSQL(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'spark') {
      output = intermediateToSpark(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'mongo') {
      output = intermediateToMongo(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'bigquery') {
      output = intermediateToBigQuery(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'pandas') {
      output = intermediateToPandas(jsonSchemaIntermediate, options);
    } else if (options.targetFormat === 'polars') {
      output = intermediateToPolars(jsonSchemaIntermediate, options);
    } else {
      return {
        success: false,
        output: '',
        error: `Target format "${options.targetFormat}" is not yet supported`,
        format: options.targetFormat
      };
    }

    return {
      success: true,
      output,
      format: options.targetFormat
    };
  } catch (error) {
    return {
      success: false,
      output: '',
      error: error instanceof Error ? error.message : 'Conversion failed',
      format: options.targetFormat
    };
  }
}

