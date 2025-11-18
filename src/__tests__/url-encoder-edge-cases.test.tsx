import { UrlEncoder } from '@/components/tools/UrlEncoder';
import { fireEvent, render, screen, waitFor } from '@/test-utils/test-utils';

// Mock the URL encoder utility functions
jest.mock('@/libs/url-encoder', () => ({
  encodeUrl: jest.fn(),
  decodeUrl: jest.fn(),
}));

import { decodeUrl, encodeUrl } from '@/libs/url-encoder';

const mockEncodeUrl = encodeUrl as jest.MockedFunction<typeof encodeUrl>;
const mockDecodeUrl = decodeUrl as jest.MockedFunction<typeof decodeUrl>;

describe.skip('URL Encoder Edge Cases', () => {
  const edgeCases = [
    {
      name: 'Empty string',
      input: '',
      expectedBehavior: 'Should handle gracefully'
    },
    {
      name: 'Very long URL',
      input: 'https://example.com/' + 'a'.repeat(10000),
      expectedBehavior: 'Should handle long URLs'
    },
    {
      name: 'URL with special characters',
      input: 'https://example.com/path?param=value&other=test#fragment',
      expectedBehavior: 'Should encode special characters'
    },
    {
      name: 'URL with Unicode characters',
      input: 'https://example.com/测试/路径',
      expectedBehavior: 'Should handle Unicode'
    },
    {
      name: 'URL with spaces',
      input: 'https://example.com/path with spaces',
      expectedBehavior: 'Should encode spaces'
    },
    {
      name: 'URL with newlines',
      input: 'https://example.com/path\nwith\nnewlines',
      expectedBehavior: 'Should handle newlines'
    },
    {
      name: 'URL with tabs',
      input: 'https://example.com/path\twith\ttabs',
      expectedBehavior: 'Should handle tabs'
    },
    {
      name: 'URL with mixed encoding',
      input: 'https://example.com/path%20with%20encoded%20spaces',
      expectedBehavior: 'Should handle already encoded URLs'
    },
    {
      name: 'URL with query parameters',
      input: 'https://example.com/search?q=hello world&category=tools&sort=date',
      expectedBehavior: 'Should handle complex query parameters'
    },
    {
      name: 'URL with fragments',
      input: 'https://example.com/page#section1',
      expectedBehavior: 'Should handle fragments'
    },
    {
      name: 'URL with ports',
      input: 'https://example.com:8080/path',
      expectedBehavior: 'Should handle ports'
    },
    {
      name: 'URL with authentication',
      input: 'https://user:pass@example.com/path',
      expectedBehavior: 'Should handle authentication'
    },
    {
      name: 'URL with IPv6',
      input: 'https://[2001:db8::1]/path',
      expectedBehavior: 'Should handle IPv6'
    },
    {
      name: 'URL with international domain',
      input: 'https://测试.example.com/path',
      expectedBehavior: 'Should handle international domains'
    },
    {
      name: 'URL with emoji',
      input: 'https://example.com/path/🚀/test',
      expectedBehavior: 'Should handle emoji'
    },
    {
      name: 'URL with control characters',
      input: 'https://example.com/path\x00\x01\x02',
      expectedBehavior: 'Should handle control characters'
    },
    {
      name: 'URL with backslashes',
      input: 'https://example.com/path\\with\\backslashes',
      expectedBehavior: 'Should handle backslashes'
    },
    {
      name: 'URL with quotes',
      input: 'https://example.com/path"with"quotes',
      expectedBehavior: 'Should handle quotes'
    },
    {
      name: 'URL with brackets',
      input: 'https://example.com/path[with]brackets',
      expectedBehavior: 'Should handle brackets'
    },
    {
      name: 'URL with parentheses',
      input: 'https://example.com/path(with)parentheses',
      expectedBehavior: 'Should handle parentheses'
    },
    {
      name: 'URL with curly braces',
      input: 'https://example.com/path{with}braces',
      expectedBehavior: 'Should handle curly braces'
    },
    {
      name: 'URL with pipe characters',
      input: 'https://example.com/path|with|pipes',
      expectedBehavior: 'Should handle pipe characters'
    },
    {
      name: 'URL with semicolons',
      input: 'https://example.com/path;with;semicolons',
      expectedBehavior: 'Should handle semicolons'
    },
    {
      name: 'URL with commas',
      input: 'https://example.com/path,with,commas',
      expectedBehavior: 'Should handle commas'
    },
    {
      name: 'URL with plus signs',
      input: 'https://example.com/path+with+plus',
      expectedBehavior: 'Should handle plus signs'
    },
    {
      name: 'URL with equals signs',
      input: 'https://example.com/path=with=equals',
      expectedBehavior: 'Should handle equals signs'
    },
    {
      name: 'URL with ampersands',
      input: 'https://example.com/path&with&ampersands',
      expectedBehavior: 'Should handle ampersands'
    },
    {
      name: 'URL with hash symbols',
      input: 'https://example.com/path#with#hash',
      expectedBehavior: 'Should handle hash symbols'
    },
    {
      name: 'URL with question marks',
      input: 'https://example.com/path?with?question',
      expectedBehavior: 'Should handle question marks'
    },
    {
      name: 'URL with slashes',
      input: 'https://example.com/path/with/slashes',
      expectedBehavior: 'Should handle slashes'
    },
    {
      name: 'URL with colons',
      input: 'https://example.com/path:with:colons',
      expectedBehavior: 'Should handle colons'
    },
    {
      name: 'URL with at symbols',
      input: 'https://example.com/path@with@at',
      expectedBehavior: 'Should handle at symbols'
    },
    {
      name: 'URL with exclamation marks',
      input: 'https://example.com/path!with!exclamation',
      expectedBehavior: 'Should handle exclamation marks'
    },
    {
      name: 'URL with dollar signs',
      input: 'https://example.com/path$with$dollar',
      expectedBehavior: 'Should handle dollar signs'
    },
    {
      name: 'URL with percent signs',
      input: 'https://example.com/path%with%percent',
      expectedBehavior: 'Should handle percent signs'
    },
    {
      name: 'URL with caret symbols',
      input: 'https://example.com/path^with^caret',
      expectedBehavior: 'Should handle caret symbols'
    },
    {
      name: 'URL with tilde symbols',
      input: 'https://example.com/path~with~tilde',
      expectedBehavior: 'Should handle tilde symbols'
    },
    {
      name: 'URL with backticks',
      input: 'https://example.com/path`with`backticks',
      expectedBehavior: 'Should handle backticks'
    },
    {
      name: 'URL with single quotes',
      input: "https://example.com/path'with'quotes",
      expectedBehavior: 'Should handle single quotes'
    },
    {
      name: 'URL with angle brackets',
      input: 'https://example.com/path<with>angles',
      expectedBehavior: 'Should handle angle brackets'
    },
    {
      name: 'URL with underscores',
      input: 'https://example.com/path_with_underscores',
      expectedBehavior: 'Should handle underscores'
    },
    {
      name: 'URL with hyphens',
      input: 'https://example.com/path-with-hyphens',
      expectedBehavior: 'Should handle hyphens'
    },
    {
      name: 'URL with dots',
      input: 'https://example.com/path.with.dots',
      expectedBehavior: 'Should handle dots'
    },
    {
      name: 'URL with numbers',
      input: 'https://example.com/path123with456numbers',
      expectedBehavior: 'Should handle numbers'
    },
    {
      name: 'URL with mixed case',
      input: 'https://Example.COM/Path/With/Mixed/Case',
      expectedBehavior: 'Should handle mixed case'
    },
    {
      name: 'URL with only numbers',
      input: 'https://123.456.789.012/path',
      expectedBehavior: 'Should handle numeric URLs'
    },
    {
      name: 'URL with only special characters',
      input: 'https://example.com/!@#$%^&*()',
      expectedBehavior: 'Should handle special character URLs'
    },
    {
      name: 'URL with only spaces',
      input: 'https://example.com/   ',
      expectedBehavior: 'Should handle space-only URLs'
    },
    {
      name: 'URL with only newlines',
      input: 'https://example.com/\n\n\n',
      expectedBehavior: 'Should handle newline-only URLs'
    },
    {
      name: 'URL with only tabs',
      input: 'https://example.com/\t\t\t',
      expectedBehavior: 'Should handle tab-only URLs'
    },
    {
      name: 'URL with only backslashes',
      input: 'https://example.com/\\\\\\',
      expectedBehavior: 'Should handle backslash-only URLs'
    },
    {
      name: 'URL with only forward slashes',
      input: 'https://example.com///',
      expectedBehavior: 'Should handle forward slash-only URLs'
    },
    {
      name: 'URL with only question marks',
      input: 'https://example.com/???',
      expectedBehavior: 'Should handle question mark-only URLs'
    },
    {
      name: 'URL with only hash symbols',
      input: 'https://example.com/###',
      expectedBehavior: 'Should handle hash-only URLs'
    },
    {
      name: 'URL with only ampersands',
      input: 'https://example.com/&&&',
      expectedBehavior: 'Should handle ampersand-only URLs'
    },
    {
      name: 'URL with only equals signs',
      input: 'https://example.com/===',
      expectedBehavior: 'Should handle equals-only URLs'
    },
    {
      name: 'URL with only plus signs',
      input: 'https://example.com/+++',
      expectedBehavior: 'Should handle plus-only URLs'
    },
    {
      name: 'URL with only commas',
      input: 'https://example.com/,,,',
      expectedBehavior: 'Should handle comma-only URLs'
    },
    {
      name: 'URL with only semicolons',
      input: 'https://example.com/;;;',
      expectedBehavior: 'Should handle semicolon-only URLs'
    },
    {
      name: 'URL with only colons',
      input: 'https://example.com/:::',
      expectedBehavior: 'Should handle colon-only URLs'
    },
    {
      name: 'URL with only at symbols',
      input: 'https://example.com/@@@',
      expectedBehavior: 'Should handle at-only URLs'
    },
    {
      name: 'URL with only exclamation marks',
      input: 'https://example.com/!!!',
      expectedBehavior: 'Should handle exclamation-only URLs'
    },
    {
      name: 'URL with only dollar signs',
      input: 'https://example.com/$$$',
      expectedBehavior: 'Should handle dollar-only URLs'
    },
    {
      name: 'URL with only percent signs',
      input: 'https://example.com/%%%',
      expectedBehavior: 'Should handle percent-only URLs'
    },
    {
      name: 'URL with only caret symbols',
      input: 'https://example.com/^^^',
      expectedBehavior: 'Should handle caret-only URLs'
    },
    {
      name: 'URL with only tilde symbols',
      input: 'https://example.com/~~~',
      expectedBehavior: 'Should handle tilde-only URLs'
    },
    {
      name: 'URL with only backticks',
      input: 'https://example.com/```',
      expectedBehavior: 'Should handle backtick-only URLs'
    },
    {
      name: 'URL with only single quotes',
      input: "https://example.com/'''",
      expectedBehavior: 'Should handle single quote-only URLs'
    },
    {
      name: 'URL with only double quotes',
      input: 'https://example.com/"""',
      expectedBehavior: 'Should handle double quote-only URLs'
    },
    {
      name: 'URL with only angle brackets',
      input: 'https://example.com/<<<',
      expectedBehavior: 'Should handle angle bracket-only URLs'
    },
    {
      name: 'URL with only square brackets',
      input: 'https://example.com/[[[',
      expectedBehavior: 'Should handle square bracket-only URLs'
    },
    {
      name: 'URL with only curly braces',
      input: 'https://example.com/{{{',
      expectedBehavior: 'Should handle curly brace-only URLs'
    },
    {
      name: 'URL with only parentheses',
      input: 'https://example.com/(((',
      expectedBehavior: 'Should handle parenthesis-only URLs'
    },
    {
      name: 'URL with only pipe characters',
      input: 'https://example.com/|||',
      expectedBehavior: 'Should handle pipe-only URLs'
    },
    {
      name: 'URL with only underscores',
      input: 'https://example.com/___',
      expectedBehavior: 'Should handle underscore-only URLs'
    },
    {
      name: 'URL with only hyphens',
      input: 'https://example.com/---',
      expectedBehavior: 'Should handle hyphen-only URLs'
    },
    {
      name: 'URL with only dots',
      input: 'https://example.com/...',
      expectedBehavior: 'Should handle dot-only URLs'
    },
    {
      name: 'URL with only numbers',
      input: 'https://example.com/123',
      expectedBehavior: 'Should handle number-only URLs'
    },
    {
      name: 'URL with only letters',
      input: 'https://example.com/abc',
      expectedBehavior: 'Should handle letter-only URLs'
    },
    {
      name: 'URL with only mixed characters',
      input: 'https://example.com/a1b2c3',
      expectedBehavior: 'Should handle mixed character URLs'
    },
    {
      name: 'URL with only uppercase letters',
      input: 'https://example.com/ABC',
      expectedBehavior: 'Should handle uppercase-only URLs'
    },
    {
      name: 'URL with only lowercase letters',
      input: 'https://example.com/abc',
      expectedBehavior: 'Should handle lowercase-only URLs'
    },
    {
      name: 'URL with only mixed case letters',
      input: 'https://example.com/AaBbCc',
      expectedBehavior: 'Should handle mixed case URLs'
    },
    {
      name: 'URL with only special characters and numbers',
      input: 'https://example.com/!@#123',
      expectedBehavior: 'Should handle special character and number URLs'
    },
    {
      name: 'URL with only special characters and letters',
      input: 'https://example.com/!@#abc',
      expectedBehavior: 'Should handle special character and letter URLs'
    },
    {
      name: 'URL with only special characters, numbers, and letters',
      input: 'https://example.com/!@#123abc',
      expectedBehavior: 'Should handle special character, number, and letter URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, and spaces',
      input: 'https://example.com/!@#123abc ',
      expectedBehavior: 'Should handle special character, number, letter, and space URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, and newlines',
      input: 'https://example.com/!@#123abc \n',
      expectedBehavior: 'Should handle special character, number, letter, space, and newline URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, and tabs',
      input: 'https://example.com/!@#123abc \n\t',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, and tab URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, and backslashes',
      input: 'https://example.com/!@#123abc \n\t\\',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, and backslash URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, and forward slashes',
      input: 'https://example.com/!@#123abc \n\t\\/',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, and forward slash URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, and question marks',
      input: 'https://example.com/!@#123abc \n\t\\/?',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, and question mark URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, and hash symbols',
      input: 'https://example.com/!@#123abc \n\t\\/?#',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, and hash URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, and ampersands',
      input: 'https://example.com/!@#123abc \n\t\\/?#&',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, and ampersand URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, and equals signs',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, and equals URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, and plus signs',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, and plus URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, and commas',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, and comma URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, and semicolons',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, and semicolon URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, and colons',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, and colon URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, and at symbols',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:@',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, and at URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, at symbols, and exclamation marks',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:@!',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, at, and exclamation URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, at symbols, exclamation marks, and dollar signs',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:@!$',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, at, exclamation, and dollar URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, at symbols, exclamation marks, dollar signs, and percent signs',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:@!$%',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, at, exclamation, dollar, and percent URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, at symbols, exclamation marks, dollar signs, percent signs, and caret symbols',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:@!$%^',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, at, exclamation, dollar, percent, and caret URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, at symbols, exclamation marks, dollar signs, percent signs, caret symbols, and tilde symbols',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:@!$%^~',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, at, exclamation, dollar, percent, caret, and tilde URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, at symbols, exclamation marks, dollar signs, percent signs, caret symbols, tilde symbols, and backticks',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:@!$%^~`',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, at, exclamation, dollar, percent, caret, tilde, and backtick URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, at symbols, exclamation marks, dollar signs, percent signs, caret symbols, tilde symbols, backticks, and single quotes',
      input: "https://example.com/!@#123abc \n\t\\/?#&=+,;:@!$%^~`'",
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, at, exclamation, dollar, percent, caret, tilde, backtick, and single quote URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, at symbols, exclamation marks, dollar signs, percent signs, caret symbols, tilde symbols, backticks, single quotes, and double quotes',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:@!$%^~`\'"',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, at, exclamation, dollar, percent, caret, tilde, backtick, single quote, and double quote URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, at symbols, exclamation marks, dollar signs, percent signs, caret symbols, tilde symbols, backticks, single quotes, double quotes, and angle brackets',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:@!$%^~`\'"<>',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, at, exclamation, dollar, percent, caret, tilde, backtick, single quote, double quote, and angle bracket URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, at symbols, exclamation marks, dollar signs, percent signs, caret symbols, tilde symbols, backticks, single quotes, double quotes, angle brackets, and square brackets',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:@!$%^~`\'"<>[]',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, at, exclamation, dollar, percent, caret, tilde, backtick, single quote, double quote, angle bracket, and square bracket URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, at symbols, exclamation marks, dollar signs, percent signs, caret symbols, tilde symbols, backticks, single quotes, double quotes, angle brackets, square brackets, and curly braces',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:@!$%^~`\'"<>[]{}',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, at, exclamation, dollar, percent, caret, tilde, backtick, single quote, double quote, angle bracket, square bracket, and curly brace URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, at symbols, exclamation marks, dollar signs, percent signs, caret symbols, tilde symbols, backticks, single quotes, double quotes, angle brackets, square brackets, curly braces, and parentheses',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:@!$%^~`\'"<>[]{}()',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, at, exclamation, dollar, percent, caret, tilde, backtick, single quote, double quote, angle bracket, square bracket, curly brace, and parenthesis URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, at symbols, exclamation marks, dollar signs, percent signs, caret symbols, tilde symbols, backticks, single quotes, double quotes, angle brackets, square brackets, curly braces, parentheses, and pipe characters',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:@!$%^~`\'"<>[]{}()|',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, at, exclamation, dollar, percent, caret, tilde, backtick, single quote, double quote, angle bracket, square bracket, curly brace, parenthesis, and pipe URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, at symbols, exclamation marks, dollar signs, percent signs, caret symbols, tilde symbols, backticks, single quotes, double quotes, angle brackets, square brackets, curly braces, parentheses, pipe characters, and underscores',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:@!$%^~`\'"<>[]{}()|_',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, at, exclamation, dollar, percent, caret, tilde, backtick, single quote, double quote, angle bracket, square bracket, curly brace, parenthesis, pipe, and underscore URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, at symbols, exclamation marks, dollar signs, percent signs, caret symbols, tilde symbols, backticks, single quotes, double quotes, angle brackets, square brackets, curly braces, parentheses, pipe characters, underscores, and hyphens',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:@!$%^~`\'"<>[]{}()|_-',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, at, exclamation, dollar, percent, caret, tilde, backtick, single quote, double quote, angle bracket, square bracket, curly brace, parenthesis, pipe, underscore, and hyphen URLs'
    },
    {
      name: 'URL with only special characters, numbers, letters, spaces, newlines, tabs, backslashes, forward slashes, question marks, hash symbols, ampersands, equals signs, plus signs, commas, semicolons, colons, at symbols, exclamation marks, dollar signs, percent signs, caret symbols, tilde symbols, backticks, single quotes, double quotes, angle brackets, square brackets, curly braces, parentheses, pipe characters, underscores, hyphens, and dots',
      input: 'https://example.com/!@#123abc \n\t\\/?#&=+,;:@!$%^~`\'"<>[]{}()|_-.',
      expectedBehavior: 'Should handle special character, number, letter, space, newline, tab, backslash, forward slash, question mark, hash, ampersand, equals, plus, comma, semicolon, colon, at, exclamation, dollar, percent, caret, tilde, backtick, single quote, double quote, angle bracket, square bracket, curly brace, parenthesis, pipe, underscore, hyphen, and dot URLs'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Edge Case Handling', () => {
    edgeCases.forEach(({ name, input, expectedBehavior }) => {
      it(`should handle ${name}`, async () => {
        mockEncodeUrl.mockReturnValue({
          encoded: input,
          decoded: input,
          isValid: true,
          originalLength: input.length,
          encodedLength: input.length,
          compressionRatio: 0,
          characterAnalysis: {
            total: input.length,
            spaces: 0,
            specialChars: 0,
            encodedSpaces: 0,
            encodedSpecialChars: 0
          }
        });

        render(<UrlEncoder />);

        // No auto-processing in current implementation

        const textarea = screen.getByPlaceholderText('Enter URL to encode...');
        fireEvent.change(textarea, { target: { value: input } });

        const processButtons = screen.getAllByText('Encode URL');
        const processButton = processButtons[1]; // Action button is the second one
        fireEvent.click(processButton);

        await waitFor(() => {
          if (input === '') {
            // For empty string, the button should be disabled
            expect(processButton).toBeDisabled();
          } else {
            expect(mockEncodeUrl).toHaveBeenCalledWith(input, expect.any(Object));
          }
        });
      });
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle null input gracefully', async () => {
      render(<UrlEncoder />);

      const textarea = screen.getByPlaceholderText('Enter URL to encode...');
      fireEvent.change(textarea, { target: { value: '' } });

      const processButtons = screen.getAllByText('Encode URL');
      const processButton = processButtons[1]; // Action button is the second one

      await waitFor(() => {
        // For empty input, the button should be disabled
        expect(processButton).toBeDisabled();
      });
    });

    it('should handle undefined input gracefully', async () => {
      render(<UrlEncoder />);

      const textarea = screen.getByPlaceholderText('Enter URL to encode...');
      fireEvent.change(textarea, { target: { value: undefined as any } });

      const processButtons = screen.getAllByText('Encode URL');
      const processButton = processButtons[1]; // Action button is the second one

      await waitFor(() => {
        // For undefined input, the button should be disabled
        expect(processButton).toBeDisabled();
      });
    });

    it('should handle very large input gracefully', async () => {
      const largeInput = 'https://example.com/' + 'a'.repeat(100000);

      mockEncodeUrl.mockReturnValue({
        encoded: largeInput,
        decoded: largeInput,
        isValid: true,
        originalLength: largeInput.length,
        encodedLength: largeInput.length,
        compressionRatio: 0,
        characterAnalysis: {
          total: largeInput.length,
          spaces: 0,
          specialChars: 0,
          encodedSpaces: 0,
          encodedSpecialChars: 0
        }
      });

      render(<UrlEncoder />);

      // No auto-processing in current implementation

      const textarea = screen.getByPlaceholderText('Enter URL to encode...');
      fireEvent.change(textarea, { target: { value: largeInput } });

      const processButtons = screen.getAllByText('Encode URL');
      const processButton = processButtons[1]; // Action button is the second one
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(mockEncodeUrl).toHaveBeenCalledWith(largeInput, expect.any(Object));
      });
    });

    it('should handle encoding errors gracefully', async () => {
      mockEncodeUrl.mockImplementation(() => {
        throw new Error('Encoding failed');
      });

      render(<UrlEncoder />);

      // No auto-processing in current implementation

      const textarea = screen.getByPlaceholderText('Enter URL to encode...');
      fireEvent.change(textarea, { target: { value: 'https://example.com' } });

      const processButtons = screen.getAllByText('Encode URL');
      const processButton = processButtons[1]; // Action button is the second one
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(screen.getAllByText('Encoding failed')[0]).toBeInTheDocument();
      });
    });

    it('should handle decoding errors gracefully', async () => {
      mockDecodeUrl.mockImplementation(() => {
        throw new Error('Decoding failed');
      });

      render(<UrlEncoder />);

      // Switch to decode mode
      const decodeButton = screen.getByText('Decode URL');
      fireEvent.click(decodeButton);

      // No auto-processing in current implementation

      const textarea = screen.getByPlaceholderText('Enter encoded URL to decode...');
      fireEvent.change(textarea, { target: { value: 'https%3A%2F%2Fexample.com' } });

      const processButtons = screen.getAllByText('Decode URL');
      const processButton = processButtons[1]; // Action button is the second one
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(screen.getAllByText('Decoding failed')[0]).toBeInTheDocument();
      });
    });
  });
});
