# rand-string-from-regex

Generate random strings that match a regular expression pattern. Works in both Node.js and browsers with zero dependencies.

[![npm version](https://img.shields.io/npm/v/rand-string-from-regex.svg)](https://www.npmjs.com/package/rand-string-from-regex)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🎯 **Accurate** - Generates strings that match your regex pattern
- 🚀 **Zero dependencies** - Pure JavaScript implementation
- 🌐 **Universal** - Works in Node.js and browsers
- 📏 **Length control** - Set min/max length constraints
- 🔧 **Full regex support** - Character classes, quantifiers, groups, alternation, escapes

## Installation

### Node.js

```bash
npm install rand-string-from-regex
```

### Browser

```html
<script src="rand-string-from-regex.js"></script>
```

Or use a CDN:

```html
<script src="https://unpkg.com/rand-string-from-regex"></script>
```

## Usage

### Node.js

```javascript
const randomStringFromRegex = require('rand-string-from-regex');

// Generate a random email
const email = randomStringFromRegex('[a-z]{5,10}@[a-z]{3,8}\\.(com|net|org)');
console.log(email); // => "johndoe@example.com"

// Generate a phone number
const phone = randomStringFromRegex('\\(\\d{3}\\)\\s\\d{3}-\\d{4}');
console.log(phone); // => "(555) 123-4567"

// Generate with length constraints
const serialNumber = randomStringFromRegex('^SN[0-9A-Za-z]*$', { min: 20, max: 30 });
console.log(serialNumber); // => "SN7aB3cD9eF1gH2iJ4kL5m"
```

### Browser

```html
<script src="rand-string-from-regex.js"></script>
<script>
  // Generate a random username
  const username = randomStringFromRegex('[a-zA-Z][a-zA-Z0-9_]{4,15}');
  console.log(username); // => "User_123"

  // Generate a hex color
  const color = randomStringFromRegex('#[0-9A-Fa-f]{6}');
  console.log(color); // => "#3a7f2c"
</script>
```

## API

### `randomStringFromRegex(pattern, options)`

Generates a random string matching the given regex pattern.

#### Parameters

- **`pattern`** (string | RegExp) - The regex pattern to match
- **`options`** (Object) - Optional configuration
  - **`min`** (number) - Minimum length of generated string
  - **`max`** (number) - Maximum length of generated string
  - **`maxRetries`** (number) - Maximum attempts to meet constraints (default: 100)
  - **`transform`** (Function) - Function to transform the result before returning (e.g., `str => str.toUpperCase()`)

#### Returns

- (string) - A random string matching the pattern

## Examples

### Basic Patterns

```javascript
// Literal string
randomStringFromRegex('hello'); // => "hello"

// Digits
randomStringFromRegex('\\d{5}'); // => "42397"

// Character class
randomStringFromRegex('[abc]{3}'); // => "bca"

// Range
randomStringFromRegex('[a-z]{5}'); // => "xqmtz"
```

### Quantifiers

```javascript
// Zero or more
randomStringFromRegex('a*'); // => "aaaa" or "" or "a"

// One or more
randomStringFromRegex('a+'); // => "aaa"

// Optional
randomStringFromRegex('a?b'); // => "ab" or "b"

// Exact count
randomStringFromRegex('\\d{3}'); // => "742"

// Range
randomStringFromRegex('[0-9]{3,5}'); // => "1234"

// Open-ended
randomStringFromRegex('\\w{5,}'); // => "aBc12_xyz"
```

### Escape Sequences

```javascript
// Word characters (\w)
randomStringFromRegex('\\w{10}'); // => "aB3_xYz9Qm"

// Digits (\d)
randomStringFromRegex('\\d{3}'); // => "847"

// Whitespace (\s)
randomStringFromRegex('a\\sb'); // => "a b"

// Non-digit (\D)
randomStringFromRegex('\\D{3}'); // => "xYz"
```

### Groups and Alternation

```javascript
// Simple group
randomStringFromRegex('(abc){2}'); // => "abcabc"

// Alternation in groups
randomStringFromRegex('(cat|dog)'); // => "cat" or "dog"

// Top-level alternation (OR operator)
randomStringFromRegex('cat|dog|bird'); // => "cat" or "dog" or "bird"

// Top-level alternation with different patterns
randomStringFromRegex('^EG[0-9A-Za-z]*$|[0-9]*');
// => Either "EG123abc" or "456789"

// Complex alternation
randomStringFromRegex('[a-z]{3}\\.(com|net|org)'); // => "xyz.com"

// Multiple patterns with anchors
randomStringFromRegex('^(hello|hi)$|^(bye|goodbye)$');
// => "hello", "hi", "bye", or "goodbye"
```

### Real-World Patterns

```javascript
// Email address
randomStringFromRegex('[a-z]{5,10}@[a-z]{3,8}\\.(com|net|org)');
// => "johnsmith@example.com"

// Phone number (Senegal format)
randomStringFromRegex('^((221)\\d{9})$');
// => "221771234567"

// US Phone number
randomStringFromRegex('\\(\\d{3}\\)\\s\\d{3}-\\d{4}');
// => "(555) 123-4567"

// Social Security Number
randomStringFromRegex('\\d{3}-\\d{2}-\\d{4}');
// => "123-45-6789"

// Hex color
randomStringFromRegex('#[0-9A-Fa-f]{6}');
// => "#3a7f2c"

// UUID (partial)
randomStringFromRegex('[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}');
// => "d37484a3-4797-c1ca"

// Username
randomStringFromRegex('[a-zA-Z][a-zA-Z0-9_]{4,15}');
// => "User_123abc"
```

### Length Constraints

```javascript
// Maximum length
randomStringFromRegex('^SN[0-9A-Za-z]*$', { max: 10 });
// => "SN7aB3c" (length ≤ 10)

// Minimum length
randomStringFromRegex('[a-z]+', { min: 15 });
// => "abcdefghijklmnop" (length ≥ 15)

// Exact length
randomStringFromRegex('^SN[0-9A-Za-z]*$', { min: 20, max: 20 });
// => "SN7aB3cD9eF1gH2iJ4k" (exactly 20 characters)

// Range
randomStringFromRegex('[a-z]+', { min: 10, max: 20 });
// => "xyzabcdefghij" (10 ≤ length ≤ 20)
```

### Transform Function

Apply custom transformations to the generated string:

```javascript
// Convert to uppercase
randomStringFromRegex('[a-z]{5}', { transform: (str) => str.toUpperCase() });
// => "ABCDE"

// Convert to lowercase
randomStringFromRegex('[A-Z]{5}', { transform: (str) => str.toLowerCase() });
// => "abcde"

// Add prefix
randomStringFromRegex('\\d{5}', { transform: (str) => 'ID-' + str });
// => "ID-12345"

// Add suffix
randomStringFromRegex('[A-Z]{3}', { transform: (str) => str + '-2024' });
// => "ABC-2024"

// Complex transformation
randomStringFromRegex('[a-z]{8}', {
  min: 8,
  max: 12,
  transform: (str) => str.charAt(0).toUpperCase() + str.slice(1)
});
// => "Abcdefgh"

// Reverse string
randomStringFromRegex('abc', { transform: (str) => str.split('').reverse().join('') });
// => "cba"

// Custom formatting
randomStringFromRegex('\\d{10}', {
  transform: (str) => `(${str.slice(0,3)}) ${str.slice(3,6)}-${str.slice(6)}`
});
// => "(123) 456-7890"
```

## Supported Regex Features

### Character Classes
- `[abc]` - Match any character in the set
- `[a-z]` - Match any character in the range
- `[^abc]` - Match any character NOT in the set
- `.` - Match any character

### Quantifiers
- `*` - Zero or more
- `+` - One or more
- `?` - Zero or one
- `{n}` - Exactly n times
- `{n,m}` - Between n and m times
- `{n,}` - n or more times

### Escape Sequences
- `\d` - Digit (0-9)
- `\w` - Word character (a-z, A-Z, 0-9, _)
- `\s` - Whitespace (space)
- `\D` - Non-digit
- `\W` - Non-word character
- `\S` - Non-whitespace
- `\t` - Tab
- `\n` - Newline
- `\r` - Carriage return

### Groups and Alternation
- `(abc)` - Capturing group
- `(?:abc)` - Non-capturing group
- `a|b` - Alternation (a or b)
- `(cat|dog)` - Group alternation
- `^pattern1$|^pattern2$` - Top-level alternation (matches entire pattern1 OR pattern2)

### Anchors
- `^` - Start of string (stripped during generation)
- `$` - End of string (stripped during generation)

## Testing

The library includes a comprehensive test suite with 41 tests covering:
- Basic patterns
- Quantifiers
- Escape sequences
- Groups and alternation
- Real-world patterns
- Length constraints
- Transform function
- Edge cases

Run tests:
```bash
node test.js
```

Expected output: **100% tests passing** ✅

## Browser Compatibility

Works in all modern browsers and IE11+. Uses only standard JavaScript features.

## Performance

The library uses a retry mechanism to meet length constraints. If constraints cannot be met after 100 attempts (configurable via `maxRetries`), it returns the best effort result.

## Limitations

- Does not support advanced regex features like:
  - Backreferences (`\1`, `\2`)
  - Lookaheads/lookbehinds (they are skipped)
  - Unicode property escapes (`\p{Letter}`)
  - Named capture groups
- Very complex patterns may require increasing `maxRetries`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT © [Your Name]

## Links

- [GitHub Repository](https://github.com/touskar/rand-string-from-regex)
- [npm Package](https://www.npmjs.com/package/rand-string-from-regex)
- [Issues](https://github.com/touskar/rand-string-from-regex/issues)

## Changelog

### v1.2.0 (2025-01-XX)
- **Fixed**: Top-level alternation support (`pattern1|pattern2`)
- Now correctly handles `^EG[0-9A-Za-z]*$|[0-9]*` and similar patterns
- Added 3 new tests for top-level alternation (41 tests total)

### v1.1.0 (2025-01-XX)
- Added `transform` option for custom string transformations
- Enhanced test suite (38 tests)
- Improved documentation with transform examples

### v1.0.0 (2025-01-XX)
- Initial release
- Support for all basic regex features
- Length constraints (min/max)
- Browser and Node.js compatibility
- 100% test coverage
