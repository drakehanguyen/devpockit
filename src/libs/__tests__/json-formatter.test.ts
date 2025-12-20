import { formatJson, getJsonStats, validateJson } from '../json-formatter'

describe('JSON Formatter', () => {
  const validJson = '{"name":"John","age":30,"city":"New York"}'
  const invalidJson = '{"name":"John","age":30,"city":"New York"' // Missing closing brace
  const formattedJson = `{
  "name": "John",
  "age": 30,
  "city": "New York"
}`

  describe('formatJson', () => {
    it('should format valid JSON with default indent', () => {
      const result = formatJson(validJson, { format: 'beautify', indentSize: 2, sortKeys: 'none' })
      expect(result.formatted).toBe(formattedJson)
    })

    it('should format JSON with custom indent', () => {
      const result = formatJson(validJson, { format: 'beautify', indentSize: 4, sortKeys: 'none' })
      expect(result.formatted).toContain('    "name"') // 4 spaces
    })

    it('should handle already formatted JSON', () => {
      const result = formatJson(formattedJson, { format: 'beautify', indentSize: 2, sortKeys: 'none' })
      expect(result.formatted).toBe(formattedJson)
    })

    it('should return error for invalid JSON', () => {
      const result = formatJson(invalidJson, { format: 'beautify', indentSize: 2, sortKeys: 'none' })
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('minifyJson', () => {
    it('should minify valid JSON', () => {
      const result = formatJson(formattedJson, { format: 'minify', indentSize: 2, sortKeys: 'none' })
      expect(result.formatted).toBe(validJson)
    })

    it('should handle already minified JSON', () => {
      const result = formatJson(validJson, { format: 'minify', indentSize: 2, sortKeys: 'none' })
      expect(result.formatted).toBe(validJson)
    })

    it('should return error for invalid JSON', () => {
      const result = formatJson(invalidJson, { format: 'minify', indentSize: 2, sortKeys: 'none' })
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('validateJson', () => {
    it('should validate correct JSON', () => {
      const result = validateJson(validJson)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should detect invalid JSON', () => {
      const result = validateJson(invalidJson)
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle empty string', () => {
      const result = validateJson('')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('should handle non-JSON string', () => {
      const result = validateJson('Hello World')
      expect(result.isValid).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('getJsonStats', () => {
    it('should calculate correct statistics for valid JSON', () => {
      const result = getJsonStats(validJson)

      expect(result.size).toBe(validJson.length)
      expect(result.lines).toBe(1)
      expect(result.depth).toBe(1)
      expect(result.keys).toBe(3)
    })

    it('should calculate statistics for formatted JSON', () => {
      const result = getJsonStats(formattedJson)

      expect(result.size).toBe(formattedJson.length)
      expect(result.lines).toBeGreaterThan(1)
      expect(result.depth).toBe(1)
      expect(result.keys).toBe(3)
    })

    it('should handle nested objects', () => {
      const nestedJson = '{"user":{"name":"John","details":{"age":30}}}'
      const result = getJsonStats(nestedJson)

      expect(result.depth).toBe(3)
      expect(result.keys).toBe(4) // user, name, details, age
    })

    it('should handle arrays', () => {
      const arrayJson = '[{"name":"John"},{"name":"Jane"}]'
      const result = getJsonStats(arrayJson)

      expect(result.keys).toBe(2) // Two objects in array
    })

    it('should return zero statistics for invalid JSON', () => {
      const result = getJsonStats(invalidJson)

      expect(result.size).toBe(invalidJson.length)
      expect(result.lines).toBe(1)
      expect(result.depth).toBe(0)
      expect(result.keys).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty object', () => {
      const emptyJson = '{}'
      const result = formatJson(emptyJson, { format: 'beautify', indentSize: 2, sortKeys: 'none' })
      expect(result.formatted).toBe('{}')
    })

    it('should handle empty array', () => {
      const emptyArray = '[]'
      const result = formatJson(emptyArray, { format: 'beautify', indentSize: 2, sortKeys: 'none' })
      expect(result.formatted).toBe('[]')
    })

    it('should handle null values', () => {
      const nullJson = '{"value":null}'
      const result = formatJson(nullJson, { format: 'beautify', indentSize: 2, sortKeys: 'none' })
      expect(result.formatted).toContain('null')
    })

    it('should handle boolean values', () => {
      const boolJson = '{"active":true,"inactive":false}'
      const result = formatJson(boolJson, { format: 'beautify', indentSize: 2, sortKeys: 'none' })
      expect(result.formatted).toContain('true')
      expect(result.formatted).toContain('false')
    })

    it('should handle number values', () => {
      const numberJson = '{"count":42,"price":19.99}'
      const result = formatJson(numberJson, { format: 'beautify', indentSize: 2, sortKeys: 'none' })
      expect(result.formatted).toContain('42')
      expect(result.formatted).toContain('19.99')
    })
  })
})
