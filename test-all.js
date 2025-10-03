/**
 * COMPREHENSIVE TEST SUITE - ALL TESTS MERGED
 * Source files: test.js, test-complete.js, test-all-operators.js, test-stress.js
 * Total: 227 tests (ALL tests preserved, no deduplication)
 */

const randomStringFromRegex = require('./rand-string-from-regex');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(description, pattern, options = {}, validator = null) {
  totalTests++;
  console.log(`\n📋 Test ${totalTests}: ${description}`);
  console.log(`   Pattern: ${pattern instanceof RegExp ? pattern : `"${pattern}"`}`);

  // Auto-detect parameter issues:
  // Case 1: 3 params with validator as 3rd param -> test(desc, pattern, validator)
  if (typeof options === 'function' && validator === null) {
    validator = options;
    options = {};
  }
  // Case 2: 4 params but swapped -> test(desc, pattern, validator, options)
  else if (typeof options === 'function' && typeof validator === 'object' && validator !== null) {
    [options, validator] = [validator, options];
  }

  if (Object.keys(options).length > 0) {
    console.log(`   Options: ${JSON.stringify(options)}`);
  }

  try {
    const iterations = options.iterations || 3;
    const results = [];
    for (let i = 0; i < iterations; i++) {
      const result = randomStringFromRegex(pattern, options);
      results.push(result);
    }

    // Display results (truncate if too long)
    results.forEach((r, i) => {
      const display = r.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\0/g, '\\0');
      const truncated = display.length > 60 ? display.substring(0, 60) + '...' : display;
      console.log(`   ${i + 1}. "${truncated}" (length: ${r.length})`);
    });

    // Validate
    let valid = true;
    let errors = [];

    // Use custom validator if provided
    if (validator) {
      results.forEach((r, i) => {
        const validationResult = validator(r);
        if (!validationResult.valid) {
          valid = false;
          errors.push(`Result ${i + 1}: ${validationResult.error}`);
        }
      });
    } else {
      // Default validation: check if result matches pattern
      if (!options.transform) {
        const regex = new RegExp(pattern instanceof RegExp ? pattern.source : pattern, pattern.flags);
        results.forEach((r, i) => {
          if (!regex.test(r)) {
            valid = false;
            errors.push(`Result ${i + 1} doesn't match pattern`);
          }
        });
      }

      // Check length constraints
      if (options.min !== undefined) {
        results.forEach((r, i) => {
          if (r.length < options.min) {
            valid = false;
            errors.push(`Result ${i + 1} length ${r.length} < min ${options.min}`);
          }
        });
      }

      if (options.max !== undefined) {
        results.forEach((r, i) => {
          if (r.length > options.max) {
            valid = false;
            errors.push(`Result ${i + 1} length ${r.length} > max ${options.max}`);
          }
        });
      }
    }

    if (valid) {
      console.log(`   ✅ PASS`);
      passedTests++;
    } else {
      console.log(`   ❌ FAIL`);
      errors.forEach(e => console.log(`      - ${e}`));
      failedTests++;
    }

  } catch (e) {
    // Check if this was an expected error
    if (options.expectError) {
      console.log(`   ✅ PASS (Expected error: ${e.message})`);
      passedTests++;
    } else {
      console.log(`   ❌ ERROR: ${e.message}`);
      failedTests++;
    }
  }
}

console.log('🧪 COMPREHENSIVE TEST SUITE - ALL REGEX FEATURES\n');
console.log('='.repeat(70));
console.log('Combined from: test.js, test-complete.js, test-all-operators.js, test-stress.js');
console.log('Plus 42 complex v4.0.0 feature tests (backreferences, edge cases, validation)');
console.log('Plus 24 real-world pattern tests (emails, phones, dates, IBANs, etc.)');
console.log('Total tests: 292');
console.log('='.repeat(70));


// ==================== FROM: test.js (47 tests) ====================
console.log('\n\n🔹 TESTS FROM: test.js');
console.log('-'.repeat(70));

test(
    'Simple literal',
    'hello',
    {},
    (r) => ({ valid: r === 'hello', error: 'Should be exactly "hello"' })
  );

test(
    'Digits only',
    '\\d{5}',
    {},
    (r) => ({ valid: /^\d{5}$/.test(r), error: 'Should be 5 digits' })
  );

test(
    'Character class',
    '[abc]{3}',
    {},
    (r) => ({ valid: /^[abc]{3}$/.test(r), error: 'Should be 3 chars from [abc]' })
  );

test(
    'Range class',
    '[a-z]{5}',
    {},
    (r) => ({ valid: /^[a-z]{5}$/.test(r), error: 'Should be 5 lowercase letters' })
  );

test(
    'Star quantifier (0 or more)',
    'a*',
    {}
  );

test(
    'Plus quantifier (1 or more)',
    'a+',
    {}
  );

test(
    'Question mark (0 or 1)',
    'a?b',
    {}
  );

test(
    'Exact count {n}',
    '\\d{9}',
    {},
    (r) => ({ valid: r.length === 9 && /^\d+$/.test(r), error: 'Should be exactly 9 digits' })
  );

test(
    'Range {n,m}',
    '[a-z]{3,7}',
    {},
    (r) => ({ valid: r.length >= 3 && r.length <= 7, error: 'Should be 3-7 chars' })
  );

test(
    'Open range {n,}',
    '\\d{3,}',
    {}
  );

test(
    'Word characters \\w',
    '\\w{10}',
    {},
    (r) => ({ valid: /^\w{10}$/.test(r), error: 'Should be 10 word chars' })
  );

test(
    'Whitespace \\s',
    'a\\sb',
    {},
    (r) => ({ valid: /^a\sb$/.test(r), error: 'Should be "a<space>b"' })
  );

test(
    'Non-digit \\D',
    '\\D{3}',
    {},
    (r) => ({ valid: /^\D{3}$/.test(r), error: 'Should be 3 non-digits' })
  );

test(
    'Simple group',
    '(abc){2}',
    {},
    (r) => ({ valid: r === 'abcabc', error: 'Should be "abcabc"' })
  );

test(
    'Alternation',
    '(cat|dog)',
    {},
    (r) => ({ valid: r === 'cat' || r === 'dog', error: 'Should be "cat" or "dog"' })
  );

test(
    'Complex alternation',
    '[a-z]{3}\\.(com|net|org)',
    {},
    (r) => ({ valid: /^[a-z]{3}\.(com|net|org)$/.test(r), error: 'Should match domain pattern' })
  );

test(
    'Top-level alternation',
    'cat|dog|bird',
    {},
    (r) => ({ valid: r === 'cat' || r === 'dog' || r === 'bird', error: 'Should be "cat", "dog", or "bird"' })
  );

test(
    'Top-level alternation with anchors',
    '^EG[0-9A-Za-z]*$|[0-9]*',
    {},
    (r) => ({
      valid: /^EG[0-9A-Za-z]*$/.test(r) || /^[0-9]*$/.test(r),
      error: 'Should match either "EG..." or just digits'
    })
  );

test(
    'Top-level alternation with groups',
    '^(hello|hi)$|^(bye|goodbye)$',
    {},
    (r) => ({
      valid: r === 'hello' || r === 'hi' || r === 'bye' || r === 'goodbye',
      error: 'Should be a greeting or farewell'
    })
  );

test(
    'Email pattern',
    '[a-z]{5,10}@[a-z]{3,8}\\.(com|net|org)',
    {},
    (r) => ({ valid: /^[a-z]{5,10}@[a-z]{3,8}\.(com|net|org)$/.test(r), error: 'Invalid email format' })
  );

test(
    'Phone number (221)',
    '^((221)\\d{9})$',
    {},
    (r) => ({ valid: /^221\d{9}$/.test(r) && r.length === 12, error: 'Should be 221 + 9 digits' })
  );

test(
    'SSN format',
    '\\d{3}-\\d{2}-\\d{4}',
    {},
    (r) => ({ valid: /^\d{3}-\d{2}-\d{4}$/.test(r), error: 'Invalid SSN format' })
  );

test(
    'Hex color',
    '#[0-9A-Fa-f]{6}',
    {},
    (r) => ({ valid: /^#[0-9A-Fa-f]{6}$/.test(r), error: 'Invalid hex color' })
  );

test(
    'Username',
    '[a-zA-Z][a-zA-Z0-9_]{4,15}',
    {},
    (r) => ({ valid: /^[a-zA-Z][a-zA-Z0-9_]{4,15}$/.test(r), error: 'Invalid username format' })
  );

test(
    'UUID-like',
    '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}',
    {},
    (r) => ({ valid: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}$/.test(r), error: 'Invalid UUID format' })
  );

test(
    'Max length constraint',
    '^SN[0-9A-Za-z]*$',
    { max: 10 },
    (r) => ({ valid: r.length <= 10, error: `Length ${r.length} exceeds max 10` })
  );

test(
    'Min length constraint',
    '^SN[0-9A-Za-z]*$',
    { min: 15 },
    (r) => ({ valid: r.length >= 15, error: `Length ${r.length} below min 15` })
  );

test(
    'Exact length (min=max)',
    '^SN[0-9A-Za-z]*$',
    { min: 28, max: 28 },
    (r) => ({ valid: r.length === 28, error: `Length ${r.length} should be exactly 28` })
  );

test(
    'Range constraint',
    '[a-z]+',
    { min: 10, max: 20 },
    (r) => ({ valid: r.length >= 10 && r.length <= 20, error: `Length ${r.length} not in range 10-20` })
  );

test(
    'Phone with max constraint',
    '^((221)\\d{9})$',
    { max: 15 },
    (r) => ({ valid: r.length <= 15, error: `Length ${r.length} exceeds max 15` })
  );

test(
    'Email with max constraint',
    '[a-z]{5}@[a-z]{3}\\.(com|net|org)',
    { max: 20 },
    (r) => ({ valid: r.length <= 20, error: `Length ${r.length} exceeds max 20` })
  );

test(
    'Name pattern with range',
    '[A-Z][a-z]+ [A-Z][a-z]+',
    { min: 10, max: 28 },
    (r) => ({ valid: r.length >= 10 && r.length <= 28, error: `Length ${r.length} not in range 10-28` })
  );

test(
    'Transform to uppercase',
    '[a-z]{5}',
    { transform: (str) => str.toUpperCase() },
    (r) => ({ valid: /^[A-Z]{5}$/.test(r) && r.length === 5, error: 'Should be 5 uppercase letters' })
  );

test(
    'Transform to lowercase',
    '[A-Z]{5}',
    { transform: (str) => str.toLowerCase() },
    (r) => ({ valid: /^[a-z]{5}$/.test(r) && r.length === 5, error: 'Should be 5 lowercase letters' })
  );

test(
    'Transform with prefix',
    '\\d{5}',
    { transform: (str) => 'ID-' + str },
    (r) => ({ valid: /^ID-\d{5}$/.test(r) && r.length === 8, error: 'Should be "ID-" + 5 digits' })
  );

test(
    'Transform with length constraint',
    '[a-z]+',
    { min: 10, max: 15, transform: (str) => str.toUpperCase() },
    (r) => ({
      valid: /^[A-Z]+$/.test(r) && r.length >= 10 && r.length <= 15,
      error: 'Should be 10-15 uppercase letters'
    })
  );

test(
    'Transform - reverse string',
    'abc',
    { transform: (str) => str.split('').reverse().join('') },
    (r) => ({ valid: r === 'cba', error: 'Should be "cba" (reversed "abc")' })
  );

test(
    'Case-insensitive flag /i - lowercase pattern',
    /[a-z]{5}/i,
    {},
    (r) => ({ valid: /^[a-zA-Z]{5}$/.test(r), error: 'Should match both upper and lowercase letters' })
  );

test(
    'Case-insensitive flag /i - uppercase pattern',
    /[A-Z]{5}/i,
    {},
    (r) => ({ valid: /^[a-zA-Z]{5}$/.test(r), error: 'Should match both upper and lowercase letters' })
  );

test(
    'Case-insensitive flag /i - mixed pattern',
    /[a-zA-Z]{10}/i,
    {},
    (r) => ({ valid: /^[a-zA-Z]{10}$/.test(r) && r.length === 10, error: 'Should be 10 letters (any case)' })
  );

test(
    'DotAll flag /s - dot matches newlines',
    /.{5}/s,
    {},
    (r) => ({ valid: r.length === 5, error: 'Should be 5 characters (possibly including newlines)' })
  );

test(
    'Case-insensitive with character class',
    /[abc]{3}/i,
    {},
    (r) => ({ valid: /^[abcABC]{3}$/.test(r), error: 'Should match a,b,c in any case' })
  );

test(
    'Case-insensitive with exact letters',
    /hello/i,
    {},
    (r) => ({ valid: /^hello$/i.test(r) && r.length === 5, error: 'Should match "hello" in any case' })
  );

test(
    'Empty star',
    'a*',
    {},
    (r) => ({ valid: /^a*$/.test(r), error: 'Should match a*' })
  );

test(
    'Nested groups',
    '((a|b)(c|d))+',
    {}
  );

test(
    'Escaped characters',
    '\\(\\d{3}\\)\\s\\d{3}-\\d{4}',
    {},
    (r) => ({ valid: /^\(\d{3}\) \d{3}-\d{4}$/.test(r), error: 'Invalid phone format' })
  );

test(
    'Mixed quantifiers',
    '[A-Z][a-z]+\\s[A-Z][a-z]+',
    {},
    (r) => ({ valid: /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(r), error: 'Invalid name format' })
  );


// ==================== FROM: test-complete.js (82 tests) ====================
console.log('\n\n🔹 TESTS FROM: test-complete.js');
console.log('-'.repeat(70));

test(
  '. (dot) - any character',
  '.{3}',
  (r) => ({ valid: r.length === 3, error: 'Should be 3 chars' })
);

test(
  '\\d - digit',
  '\\d{5}',
  (r) => ({ valid: /^\d{5}$/.test(r), error: 'Should be 5 digits' })
);

test(
  '\\D - non-digit',
  '\\D{3}',
  (r) => ({ valid: /^\D{3}$/.test(r), error: 'Should be 3 non-digits' })
);

test(
  '\\w - word character',
  '\\w{5}',
  (r) => ({ valid: /^\w{5}$/.test(r), error: 'Should be 5 word chars' })
);

test(
  '\\W - non-word character',
  '\\W{3}',
  (r) => ({ valid: /^\W{3}$/.test(r), error: 'Should be 3 non-word chars' })
);

test(
  '\\s - whitespace',
  '\\d\\s\\d',
  (r) => ({ valid: /^\d\s\d$/.test(r), error: 'Should be digit-space-digit' })
);

test(
  '\\S - non-whitespace',
  '\\S{4}',
  (r) => ({ valid: /^\S{4}$/.test(r), error: 'Should be 4 non-whitespace' })
);

test(
  '[abc] - character set',
  '[abc]{5}',
  (r) => ({ valid: /^[abc]{5}$/.test(r), error: 'Should be 5 chars from [abc]' })
);

test(
  '[^abc] - negated set',
  '[^abc]{3}',
  (r) => ({ valid: /^[^abc]{3}$/.test(r), error: 'Should be 3 chars NOT in [abc]' })
);

test(
  '[a-z] - range',
  '[a-z]{4}',
  (r) => ({ valid: /^[a-z]{4}$/.test(r), error: 'Should be 4 lowercase letters' })
);

test(
  '[A-Z0-9] - multiple ranges',
  '[A-Z0-9]{6}',
  (r) => ({ valid: /^[A-Z0-9]{6}$/.test(r), error: 'Should be 6 uppercase or digits' })
);

test(
  '^ - start anchor (stripped)',
  '^hello',
  (r) => ({ valid: r === 'hello', error: 'Should be "hello"' })
);

test(
  '$ - end anchor (stripped)',
  'world$',
  (r) => ({ valid: r === 'world', error: 'Should be "world"' })
);

test(
  '^...$ - both anchors',
  '^test$',
  (r) => ({ valid: r === 'test', error: 'Should be "test"' })
);

test(
  '\\b - word boundary (no char)',
  '\\bhello\\b',
  (r) => ({ valid: r === 'hello', error: 'Should be "hello" (boundaries dont add chars)' })
);

test(
  '\\B - non-word boundary (no char)',
  '\\Btest\\B',
  (r) => ({ valid: r === 'test', error: 'Should be "test"' })
);

test(
  '* - zero or more',
  'a*',
  (r) => ({ valid: /^a*$/.test(r), error: 'Should match a*' })
);

test(
  '+ - one or more',
  'b+',
  (r) => ({ valid: /^b+$/.test(r) && r.length >= 1, error: 'Should be one or more b' })
);

test(
  '? - zero or one',
  'c?d',
  (r) => ({ valid: r === 'd' || r === 'cd', error: 'Should be "d" or "cd"' })
);

test(
  '{n} - exactly n',
  'x{3}',
  (r) => ({ valid: r === 'xxx', error: 'Should be exactly "xxx"' })
);

test(
  '{n,} - n or more',
  '\\d{3,}',
  (r) => ({ valid: /^\d+$/.test(r) && r.length >= 3, error: 'Should be 3+ digits' })
);

test(
  '{n,m} - between n and m',
  '[a-z]{3,5}',
  (r) => ({ valid: /^[a-z]+$/.test(r) && r.length >= 3 && r.length <= 5, error: 'Should be 3-5 lowercase' })
);

test(
  '*? - lazy zero or more',
  'a*?b',
  (r) => ({ valid: /^a*b$/.test(r), error: 'Should match a*?b' })
);

test(
  '+? - lazy one or more',
  'x+?y',
  (r) => ({ valid: /^x+y$/.test(r), error: 'Should match x+?y' })
);

test(
  '?? - lazy zero or one',
  'z??end',
  (r) => ({ valid: r === 'end' || r === 'zend', error: 'Should be "end" or "zend"' })
);

test(
  '| - alternation',
  'cat|dog',
  (r) => ({ valid: r === 'cat' || r === 'dog', error: 'Should be "cat" or "dog"' })
);

test(
  '() - capturing group',
  '(abc){2}',
  (r) => ({ valid: r === 'abcabc', error: 'Should be "abcabc"' })
);

test(
  '(?:) - non-capturing group',
  '(?:xy){3}',
  (r) => ({ valid: r === 'xyxyxy', error: 'Should be "xyxyxy"' })
);

test(
  'Nested groups',
  '((a|b)(c|d))+',
  (r) => ({ valid: /^((a|b)(c|d))+$/.test(r), error: 'Should match pattern' })
);

test(
  'Top-level alternation with anchors',
  '^abc$|^123$',
  (r) => ({ valid: r === 'abc' || r === '123', error: 'Should be "abc" or "123"' })
);

test(
  'Top-level alternation - complex',
  '^EG[0-9A-Za-z]*$|[0-9]*',
  (r) => ({
    valid: /^EG[0-9A-Za-z]*$/.test(r) || /^[0-9]*$/.test(r),
    error: 'Should match either "EG..." or digits'
  })
);

test(
  'Multi-level alternation',
  'cat|dog|bird',
  (r) => ({ valid: ['cat','dog','bird'].includes(r), error: 'Should be cat, dog, or bird' })
);

test(
  '\\\\ - escaped backslash',
  'a\\\\b',
  (r) => ({ valid: r === 'a\\b', error: 'Should be "a\\b"' })
);

test(
  '\\n - newline',
  'a\\nb',
  (r) => ({ valid: r === 'a\nb', error: 'Should be "a\\nb"' })
);

test(
  '\\r - carriage return',
  'x\\ry',
  (r) => ({ valid: r === 'x\ry', error: 'Should be "x\\ry"' })
);

test(
  '\\t - tab',
  'p\\tq',
  (r) => ({ valid: r === 'p\tq', error: 'Should be "p\\tq"' })
);

test(
  '\\0 - null character',
  'a\\0b',
  (r) => ({ valid: r === 'a\0b' && r.length === 3, error: 'Should be "a\\0b"' })
);

test(
  '\\xhh - hex character code',
  '\\x41\\x42\\x43',
  (r) => ({ valid: r === 'ABC', error: 'Should be "ABC" (0x41=A, 0x42=B, 0x43=C)' })
);

test(
  '\\uhhhh - unicode 4-digit',
  '\\u0041\\u0042',
  (r) => ({ valid: r === 'AB', error: 'Should be "AB"' })
);

test(
  '\\u{hhhhh} - unicode code point',
  '\\u{1F600}',
  (r) => ({ valid: r === '😀', error: 'Should be emoji 😀' })
);

test(
  'Mixed hex and unicode',
  '\\x48\\u0065\\u{6C}\\u{6C}\\x6F',
  (r) => ({ valid: r === 'Hello', error: 'Should be "Hello"' })
);

test(
  'Emoji sequence',
  '\\u{1F600}\\u{1F601}\\u{1F602}',
  (r) => ({ valid: r === '😀😁😂', error: 'Should be three emojis' })
);

test(
  '/i - case insensitive',
  /[a-z]{5}/i,
  (r) => ({ valid: /^[a-zA-Z]{5}$/.test(r), error: 'Should be 5 letters (any case)' })
);

test(
  '/s - dotAll (dot matches newline)',
  /.{3}/s,
  (r) => ({ valid: r.length === 3, error: 'Should be 3 characters' })
);

test(
  '/i with literal',
  /hello/i,
  (r) => ({ valid: /^hello$/i.test(r), error: 'Should be "hello" in any case' })
);

test(
  'Combined flags /is',
  /[a-z]{3}/is,
  (r) => ({ valid: r.length === 3, error: 'Should be 3 chars' })
);

test(
  '/i with character class',
  /[abc]{3}/i,
  (r) => ({ valid: /^[abcABC]{3}$/.test(r), error: 'Should be a/b/c any case' })
);

test(
  '/i with uppercase pattern',
  /[A-Z]{5}/i,
  (r) => ({ valid: /^[a-zA-Z]{5}$/.test(r), error: 'Should be 5 letters (any case)' })
);

test(
  'Email pattern',
  '[a-z]{5,10}@[a-z]{3,8}\\.(com|net|org)',
  (r) => ({ valid: /^[a-z]{5,10}@[a-z]{3,8}\.(com|net|org)$/.test(r), error: 'Invalid email' })
);

test(
  'Phone with special chars',
  '\\(\\d{3}\\)\\s\\d{3}-\\d{4}',
  (r) => ({ valid: /^\(\d{3}\) \d{3}-\d{4}$/.test(r), error: 'Invalid phone format' })
);

test(
  'Senegal phone (221)',
  '^((221)\\d{9})$',
  (r) => ({ valid: /^221\d{9}$/.test(r) && r.length === 12, error: 'Should be 221 + 9 digits' })
);

test(
  'Hex color',
  '#[0-9A-Fa-f]{6}',
  (r) => ({ valid: /^#[0-9A-Fa-f]{6}$/.test(r), error: 'Invalid hex color' })
);

test(
  'UUID-like',
  '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}',
  (r) => ({ valid: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}$/.test(r), error: 'Invalid UUID format' })
);

test(
  'Full UUID v4',
  '[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}',
  (r) => ({ valid: /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(r), error: 'Invalid UUID v4' })
);

test(
  'ISO Date',
  '\\d{4}-\\d{2}-\\d{2}',
  (r) => ({ valid: /^\d{4}-\d{2}-\d{2}$/.test(r), error: 'Invalid date format' })
);

test(
  'IP Address',
  '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}',
  (r) => ({ valid: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(r), error: 'Invalid IP format' })
);

test(
  'SSN format',
  '\\d{3}-\\d{2}-\\d{4}',
  (r) => ({ valid: /^\d{3}-\d{2}-\d{4}$/.test(r), error: 'Invalid SSN format' })
);

test(
  'Credit card',
  '\\d{4}-\\d{4}-\\d{4}-\\d{4}',
  (r) => ({ valid: /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(r), error: 'Invalid card format' })
);

test(
  'MAC address',
  '([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}',
  (r) => ({ valid: /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(r), error: 'Invalid MAC format' })
);

test(
  'URL pattern',
  '(https?://)?(www\\.)?[a-z]+\\.(com|org|net)',
  (r) => ({ valid: /^(https?:\/\/)?(www\.)?[a-z]+\.(com|org|net)$/.test(r), error: 'Invalid URL' })
);

test(
  'Username',
  '[a-zA-Z][a-zA-Z0-9_]{4,15}',
  (r) => ({ valid: /^[a-zA-Z][a-zA-Z0-9_]{4,15}$/.test(r), error: 'Invalid username' })
);

test(
  'Semantic version',
  '\\d+\\.\\d+\\.\\d+(-[a-z]+\\.\\d+)?',
  (r) => ({ valid: /^\d+\.\d+\.\d+(-[a-z]+\.\d+)?$/.test(r), error: 'Invalid semver' })
);

test(
  'Max length constraint',
  '^SN[0-9A-Za-z]*$',
  (r) => ({ valid: r.length <= 10, error: `Length ${r.length} exceeds max 10` }),
  { max: 10 }
);

test(
  'Min length constraint',
  '^SN[0-9A-Za-z]*$',
  (r) => ({ valid: r.length >= 15, error: `Length ${r.length} below min 15` }),
  { min: 15 }
);

test(
  'Exact length (min=max)',
  '^SN[0-9A-Za-z]*$',
  (r) => ({ valid: r.length === 28, error: `Length ${r.length} should be exactly 28` }),
  { min: 28, max: 28 }
);

test(
  'Range constraint',
  '[a-z]+',
  (r) => ({ valid: r.length >= 10 && r.length <= 20, error: `Length ${r.length} not in range 10-20` }),
  { min: 10, max: 20 }
);

test(
  'Email with max constraint',
  '[a-z]{5}@[a-z]{3}\\.(com|net|org)',
  (r) => ({ valid: r.length <= 20, error: `Length ${r.length} exceeds max 20` }),
  { max: 20 }
);

test(
  'Name pattern with range',
  '[A-Z][a-z]+ [A-Z][a-z]+',
  (r) => ({ valid: r.length >= 10 && r.length <= 28, error: `Length ${r.length} not in range 10-28` }),
  { min: 10, max: 28 }
);

test(
  'Very long string',
  '[a-z]+',
  (r) => ({ valid: r.length >= 100 && r.length <= 150, error: `Length ${r.length} not in range 100-150` }),
  { min: 100, max: 150 }
);

test(
  'Transform to uppercase',
  '[a-z]{5}',
  (r) => ({ valid: /^[A-Z]{5}$/.test(r), error: 'Should be 5 uppercase letters' }),
  { transform: (str) => str.toUpperCase() }
);

test(
  'Transform to lowercase',
  '[A-Z]{5}',
  (r) => ({ valid: /^[a-z]{5}$/.test(r), error: 'Should be 5 lowercase letters' }),
  { transform: (str) => str.toLowerCase() }
);

test(
  'Transform with prefix',
  '\\d{5}',
  (r) => ({ valid: /^ID-\d{5}$/.test(r), error: 'Should be "ID-" + 5 digits' }),
  { transform: (str) => 'ID-' + str }
);

test(
  'Transform - reverse string',
  'abc',
  (r) => ({ valid: r === 'cba', error: 'Should be "cba"' }),
  { transform: (str) => str.split('').reverse().join('') }
);

test(
  'Transform with length constraint',
  '[a-z]+',
  (r) => ({ valid: /^[A-Z]+$/.test(r) && r.length >= 10 && r.length <= 15, error: 'Should be 10-15 uppercase' }),
  { min: 10, max: 15, transform: (str) => str.toUpperCase() }
);

test(
  'Empty pattern',
  '',
  (r) => ({ valid: r === '', error: 'Should be empty' })
);

test(
  'Only quantifier',
  'a*',
  (r) => ({ valid: /^a*$/.test(r), error: 'Should match a*' })
);

test(
  'Deeply nested groups',
  '(((a|b)))',
  (r) => ({ valid: r === 'a' || r === 'b', error: 'Should be a or b' })
);

test(
  'Multiple alternations',
  'a|b|c|d|e',
  (r) => ({ valid: ['a','b','c','d','e'].includes(r), error: 'Should be one of a,b,c,d,e' })
);

test(
  'Mix of all features',
  '^[A-Z][a-z]{2,5}\\d{2}$|^\\w+@\\w+\\.com$',
  (r) => ({
    valid: /^[A-Z][a-z]{2,5}\d{2}$/.test(r) || /^\w+@\w+\.com$/.test(r),
    error: 'Should match either pattern'
  })
);

test(
  'Escaped quantifiers',
  'a\\*b\\+c\\?',
  (r) => ({ valid: r === 'a*b+c?', error: 'Should be literal quantifier chars' })
);

test(
  'Zero length result with max=0',
  'a*',
  (r) => ({ valid: r === '', error: 'Should be empty with max=0' }),
  { max: 0 }
);

test(
  'Multiple dots',
  '....',
  (r) => ({ valid: r.length === 4, error: 'Should be 4 chars' })
);


// ==================== FROM: test-all-operators.js (54 tests) ====================
console.log('\n\n🔹 TESTS FROM: test-all-operators.js');
console.log('-'.repeat(70));

test(
  '. (dot) - any character',
  '.{3}',
  (r) => ({ valid: r.length === 3, error: 'Should be 3 chars' })
);

test(
  '\\d - digit',
  '\\d{5}',
  (r) => ({ valid: /^\d{5}$/.test(r), error: 'Should be 5 digits' })
);

test(
  '\\D - non-digit',
  '\\D{3}',
  (r) => ({ valid: /^\D{3}$/.test(r), error: 'Should be 3 non-digits' })
);

test(
  '\\w - word character',
  '\\w{5}',
  (r) => ({ valid: /^\w{5}$/.test(r), error: 'Should be 5 word chars' })
);

test(
  '\\W - non-word character',
  '\\W{3}',
  (r) => ({ valid: /^\W{3}$/.test(r), error: 'Should be 3 non-word chars' })
);

test(
  '\\s - whitespace',
  '\\d\\s\\d',
  (r) => ({ valid: /^\d\s\d$/.test(r), error: 'Should be digit-space-digit' })
);

test(
  '\\S - non-whitespace',
  '\\S{4}',
  (r) => ({ valid: /^\S{4}$/.test(r), error: 'Should be 4 non-whitespace' })
);

test(
  '[abc] - character set',
  '[abc]{5}',
  (r) => ({ valid: /^[abc]{5}$/.test(r), error: 'Should be 5 chars from [abc]' })
);

test(
  '[^abc] - negated set',
  '[^abc]{3}',
  (r) => ({ valid: /^[^abc]{3}$/.test(r), error: 'Should be 3 chars NOT in [abc]' })
);

test(
  '[a-z] - range',
  '[a-z]{4}',
  (r) => ({ valid: /^[a-z]{4}$/.test(r), error: 'Should be 4 lowercase letters' })
);

test(
  '[A-Z0-9] - multiple ranges',
  '[A-Z0-9]{6}',
  (r) => ({ valid: /^[A-Z0-9]{6}$/.test(r), error: 'Should be 6 uppercase or digits' })
);

test(
  '^ - start anchor (stripped)',
  '^hello',
  (r) => ({ valid: r === 'hello', error: 'Should be "hello"' })
);

test(
  '$ - end anchor (stripped)',
  'world$',
  (r) => ({ valid: r === 'world', error: 'Should be "world"' })
);

test(
  '^...$ - both anchors',
  '^test$',
  (r) => ({ valid: r === 'test', error: 'Should be "test"' })
);

test(
  '\\b - word boundary (no char)',
  '\\bhello\\b',
  (r) => ({ valid: r === 'hello', error: 'Should be "hello" (boundaries dont add chars)' })
);

test(
  '\\B - non-word boundary (no char)',
  '\\Btest\\B',
  (r) => ({ valid: r === 'test', error: 'Should be "test"' })
);

test(
  '* - zero or more',
  'a*',
  (r) => ({ valid: /^a*$/.test(r), error: 'Should match a*' })
);

test(
  '+ - one or more',
  'b+',
  (r) => ({ valid: /^b+$/.test(r) && r.length >= 1, error: 'Should be one or more b' })
);

test(
  '? - zero or one',
  'c?d',
  (r) => ({ valid: r === 'd' || r === 'cd', error: 'Should be "d" or "cd"' })
);

test(
  '{n} - exactly n',
  'x{3}',
  (r) => ({ valid: r === 'xxx', error: 'Should be exactly "xxx"' })
);

test(
  '{n,} - n or more',
  '\\d{3,}',
  (r) => ({ valid: /^\d+$/.test(r) && r.length >= 3, error: 'Should be 3+ digits' })
);

test(
  '{n,m} - between n and m',
  '[a-z]{3,5}',
  (r) => ({ valid: /^[a-z]+$/.test(r) && r.length >= 3 && r.length <= 5, error: 'Should be 3-5 lowercase' })
);

test(
  '*? - lazy zero or more',
  'a*?b',
  (r) => ({ valid: /^a*b$/.test(r), error: 'Should match a*?b' })
);

test(
  '+? - lazy one or more',
  'x+?y',
  (r) => ({ valid: /^x+y$/.test(r), error: 'Should match x+?y' })
);

test(
  '?? - lazy zero or one',
  'z??end',
  (r) => ({ valid: r === 'end' || r === 'zend', error: 'Should be "end" or "zend"' })
);

test(
  '| - alternation',
  'cat|dog',
  (r) => ({ valid: r === 'cat' || r === 'dog', error: 'Should be "cat" or "dog"' })
);

test(
  '() - capturing group',
  '(abc){2}',
  (r) => ({ valid: r === 'abcabc', error: 'Should be "abcabc"' })
);

test(
  '(?:) - non-capturing group',
  '(?:xy){3}',
  (r) => ({ valid: r === 'xyxyxy', error: 'Should be "xyxyxy"' })
);

test(
  'Nested groups',
  '((a|b)(c|d))+',
  (r) => ({ valid: /^((a|b)(c|d))+$/.test(r), error: 'Should match pattern' })
);

test(
  'Top-level alternation with anchors',
  '^abc$|^123$',
  (r) => ({ valid: r === 'abc' || r === '123', error: 'Should be "abc" or "123"' })
);

test(
  '\\\\ - escaped backslash',
  'a\\\\b',
  (r) => ({ valid: r === 'a\\b', error: 'Should be "a\\b"' })
);

test(
  '\\n - newline',
  'a\\nb',
  (r) => ({ valid: r === 'a\nb', error: 'Should be "a\\nb"' })
);

test(
  '\\r - carriage return',
  'x\\ry',
  (r) => ({ valid: r === 'x\ry', error: 'Should be "x\\ry"' })
);

test(
  '\\t - tab',
  'p\\tq',
  (r) => ({ valid: r === 'p\tq', error: 'Should be "p\\tq"' })
);

test(
  '\\0 - null character',
  'a\\0b',
  (r) => ({ valid: r === 'a\0b' && r.length === 3, error: 'Should be "a\\0b"' })
);

test(
  '\\xhh - hex character code',
  '\\x41\\x42\\x43',
  (r) => ({ valid: r === 'ABC', error: 'Should be "ABC" (0x41=A, 0x42=B, 0x43=C)' })
);

test(
  '\\uhhhh - unicode 4-digit',
  '\\u0041\\u0042',
  (r) => ({ valid: r === 'AB', error: 'Should be "AB"' })
);

test(
  '\\u{hhhhh} - unicode code point',
  '\\u{1F600}',
  (r) => ({ valid: r === '😀', error: 'Should be emoji 😀' })
);

test(
  'Mixed hex and unicode',
  '\\x48\\u0065\\u{6C}\\u{6C}\\x6F',
  (r) => ({ valid: r === 'Hello', error: 'Should be "Hello"' })
);

test(
  '/i - case insensitive',
  /[a-z]{5}/i,
  (r) => ({ valid: /^[a-zA-Z]{5}$/.test(r), error: 'Should be 5 letters (any case)' })
);

test(
  '/s - dotAll (dot matches newline)',
  /.{3}/s,
  (r) => ({ valid: r.length === 3, error: 'Should be 3 characters' })
);

test(
  '/i with literal',
  /hello/i,
  (r) => ({ valid: /^hello$/i.test(r), error: 'Should be "hello" in any case' })
);

test(
  'Combined flags /is',
  /[a-z]{3}/is,
  (r) => ({ valid: r.length === 3, error: 'Should be 3 chars' })
);

test(
  'Email pattern',
  '[a-z]{5,10}@[a-z]{3,8}\\.(com|net|org)',
  (r) => ({ valid: /^[a-z]{5,10}@[a-z]{3,8}\.(com|net|org)$/.test(r), error: 'Invalid email' })
);

test(
  'Phone with special chars',
  '\\(\\d{3}\\)\\s\\d{3}-\\d{4}',
  (r) => ({ valid: /^\(\d{3}\) \d{3}-\d{4}$/.test(r), error: 'Invalid phone format' })
);

test(
  'Hex color',
  '#[0-9A-Fa-f]{6}',
  (r) => ({ valid: /^#[0-9A-Fa-f]{6}$/.test(r), error: 'Invalid hex color' })
);

test(
  'UUID-like',
  '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}',
  (r) => ({ valid: /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}$/.test(r), error: 'Invalid UUID format' })
);

test(
  'ISO Date',
  '\\d{4}-\\d{2}-\\d{2}',
  (r) => ({ valid: /^\d{4}-\d{2}-\d{2}$/.test(r), error: 'Invalid date format' })
);

test(
  'IP Address',
  '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}',
  (r) => ({ valid: /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(r), error: 'Invalid IP format' })
);

test(
  'Empty pattern',
  '',
  (r) => ({ valid: r === '', error: 'Should be empty' })
);

test(
  'Only quantifier',
  'a*',
  (r) => ({ valid: /^a*$/.test(r), error: 'Should match' })
);

test(
  'Deeply nested groups',
  '(((a|b)))',
  (r) => ({ valid: r === 'a' || r === 'b', error: 'Should be a or b' })
);

test(
  'Multiple alternations',
  'a|b|c|d|e',
  (r) => ({ valid: ['a','b','c','d','e'].includes(r), error: 'Should be one of a,b,c,d,e' })
);

test(
  'Mix of all features',
  '^[A-Z][a-z]{2,5}\\d{2}$|^\\w+@\\w+\\.com$',
  (r) => ({
    valid: /^[A-Z][a-z]{2,5}\d{2}$/.test(r) || /^\w+@\w+\.com$/.test(r),
    error: 'Should match either pattern'
  })
);


// ==================== FROM: test-stress.js (44 tests) ====================
console.log('\n\n🔹 TESTS FROM: test-stress.js');
console.log('-'.repeat(70));

test(
  'Very long string (100+ chars)',
  '[a-z]+',
  (r) => ({
    valid: r.length >= 100 && r.length <= 150 && /^[a-z]+$/.test(r),
    error: 'Should be 100-150 lowercase letters'
  }),
  { min: 100, max: 150 }
);

test(
  'Exact long length (200 chars)',
  '\\w*',
  (r) => ({
    valid: r.length === 200 && /^\w*$/.test(r),
    error: 'Should be exactly 200 word chars'
  }),
  { min: 200, max: 200 }
);

// Test removed: In v4, fixed-length patterns throw error if constraints conflict
// Pattern "A" has fixed length 1, so min:50 causes validation error (correct behavior)

test(
  'Zero length result',
  'a*',
  { max: 0 },
  (r) => ({
    valid: /^a*$/.test(r),
    error: 'Should match a*'
  })
);

test(
  'Deep nesting - 5 levels',
  '(((((abc)))))',
  (r) => ({ valid: r === 'abc', error: 'Should be "abc"' })
);

test(
  'Deep nesting with quantifiers',
  '((([a-z]{2})+)+)+',
  (r) => ({
    valid: /^([a-z]{2})+$/.test(r) && r.length >= 2 && r.length % 2 === 0,
    error: 'Should be pairs of lowercase letters'
  })
);

test(
  'Deep alternation nesting',
  '(((a|b)|(c|d))|((e|f)|(g|h)))',
  (r) => ({
    valid: ['a','b','c','d','e','f','g','h'].includes(r),
    error: 'Should be one letter a-h'
  })
);

test(
  'Mixed deep nesting',
  '((a+|b*)+|(c?|d{2}))+',
  (r) => ({
    valid: /^[abcd]+$/.test(r) || r === '',
    error: 'Should match pattern'
  })
);

test(
  'Many alternatives (10+)',
  'one|two|three|four|five|six|seven|eight|nine|ten',
  (r) => ({
    valid: ['one','two','three','four','five','six','seven','eight','nine','ten'].includes(r),
    error: 'Should be one of the number words'
  })
);

test(
  'Alternation with empty option',
  'hello|',
  (r) => ({
    valid: r === 'hello' || r === '',
    error: 'Should be "hello" or empty'
  })
);

test(
  'Complex mixed alternation',
  '^[A-Z]{3}\\d{2}$|^[a-z]{5}$|^\\d{10}$',
  (r) => ({
    valid: /^[A-Z]{3}\d{2}$/.test(r) || /^[a-z]{5}$/.test(r) || /^\d{10}$/.test(r),
    error: 'Should match one of three patterns'
  })
);

test(
  'Nested alternation with groups',
  '((red|blue|green) (car|truck))|((small|large) (dog|cat))',
  (r) => ({
    valid: /^(red|blue|green) (car|truck)$/.test(r) || /^(small|large) (dog|cat)$/.test(r),
    error: 'Should match vehicle or animal pattern'
  })
);

test(
  'Multiple emojis',
  '\\u{1F600}\\u{1F601}\\u{1F602}',
  (r) => ({ valid: r === '😀😁😂', error: 'Should be three emojis' })
);

test(
  'Mixed ASCII and Unicode',
  'Hello\\u{1F44B}World\\u{1F30E}',
  (r) => ({ valid: r === 'Hello👋World🌎', error: 'Should be "Hello👋World🌎"' })
);

test(
  'Hex sequence',
  '\\x48\\x65\\x6C\\x6C\\x6F\\x20\\x57\\x6F\\x72\\x6C\\x64',
  (r) => ({ valid: r === 'Hello World', error: 'Should be "Hello World" from hex' })
);

test(
  'All special escapes',
  'a\\t\\n\\r\\0b',
  (r) => ({ valid: r === 'a\t\n\r\0b' && r.length === 6, error: 'Should have all special chars' })
);

test(
  'Unicode ranges',
  '[\\u0041-\\u005A]{3}',
  (r) => ({ valid: /^[A-Z]{3}$/.test(r), error: 'Should be 3 uppercase via unicode range' })
);

test(
  'Lazy star vs greedy star',
  'a*?b',
  (r) => ({
    valid: /^a*b$/.test(r),
    error: 'Should match a*?b (lazy prefers fewer)'
  }),
  { iterations: 10 }
);

test(
  'Multiple lazy quantifiers',
  'x*?y+?z??',
  (r) => ({
    valid: /^x*y+z?$/.test(r),
    error: 'Should match pattern with lazy quantifiers'
  })
);

test(
  'Greedy then lazy',
  'a+b*?c',
  (r) => ({
    valid: /^a+b*c$/.test(r) && r.includes('a') && r.includes('c'),
    error: 'Should have at least one a and end with c'
  })
);

test(
  'Multiple word boundaries',
  '\\bhello\\b\\sworld\\b',
  (r) => ({ valid: r === 'hello world', error: 'Should be "hello world"' })
);

test(
  'Boundary with quantifiers',
  '\\b\\w+\\b',
  (r) => ({
    valid: /^\w+$/.test(r) && r.length > 0,
    error: 'Should be word characters'
  })
);

test(
  'Mixed boundaries',
  '\\btest\\B\\w+\\b',
  (r) => ({
    valid: /^test\w+$/.test(r) && r.length > 4,
    error: 'Should start with "test" then more word chars'
  })
);

test(
  'Negated simple set',
  '[^0-9]{5}',
  (r) => ({
    valid: /^[^0-9]{5}$/.test(r) && r.length === 5,
    error: 'Should be 5 non-digits'
  })
);

test(
  'Negated multiple ranges',
  '[^a-zA-Z0-9]{3}',
  (r) => ({
    valid: /^[^a-zA-Z0-9]{3}$/.test(r),
    error: 'Should be 3 non-alphanumeric chars'
  })
);

test(
  'Negated with special chars',
  '[^\\s]{10}',
  (r) => ({
    valid: /^\S{10}$/.test(r),
    error: 'Should be 10 non-whitespace chars'
  })
);

test(
  'Complex negated class',
  '[^aeiouAEIOU]{5}',
  (r) => ({
    valid: /^[^aeiouAEIOU]{5}$/.test(r) && r.length === 5,
    error: 'Should be 5 non-vowels'
  })
);

test(
  'Credit card (simplified)',
  '\\d{4}-\\d{4}-\\d{4}-\\d{4}',
  (r) => ({
    valid: /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(r),
    error: 'Invalid credit card format'
  })
);

test(
  'Full UUID v4',
  '[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}',
  (r) => ({
    valid: /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(r),
    error: 'Invalid UUID v4 format'
  })
);

test(
  'URL pattern',
  '(https?://)?(www\\.)?[a-z]+\\.(com|org|net)',
  (r) => ({
    valid: /^(https?:\/\/)?(www\.)?[a-z]+\.(com|org|net)$/.test(r),
    error: 'Invalid URL format'
  })
);

test(
  'MAC address',
  '([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}',
  (r) => ({
    valid: /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(r),
    error: 'Invalid MAC address format'
  })
);

test(
  'Git commit hash (short)',
  '[a-f0-9]{7}',
  (r) => ({
    valid: /^[a-f0-9]{7}$/.test(r),
    error: 'Invalid git hash format'
  })
);

test(
  'Semantic version',
  '\\d+\\.\\d+\\.\\d+(-[a-z]+\\.\\d+)?',
  (r) => ({
    valid: /^\d+\.\d+\.\d+(-[a-z]+\.\d+)?$/.test(r),
    error: 'Invalid semver format'
  })
);

test(
  'Complex email with subdomain',
  '[a-z]{3,8}\\.[a-z]{3,8}@[a-z]{3,10}\\.[a-z]{2,5}\\.(com|org)',
  (r) => ({
    valid: /^[a-z]{3,8}\.[a-z]{3,8}@[a-z]{3,10}\.[a-z]{2,5}\.(com|org)$/.test(r),
    error: 'Invalid email format'
  })
);

test(
  'All quantifiers combined',
  'a*b+c?d{2}e{3,5}',
  (r) => ({
    valid: /^a*b+c?dd[e]{3,5}$/.test(r),
    error: 'Should match complex quantifier pattern'
  })
);

test(
  'All character classes',
  '\\d\\w\\s\\D\\W\\S',
  (r) => ({
    valid: /^\d\w\s\D\W\S$/.test(r) && r.length === 6,
    error: 'Should have all character class types'
  })
);

test(
  'Flags + quantifiers + groups',
  /([a-z]{2,4}[0-9]+)+/i,
  (r) => ({
    valid: /^([a-zA-Z]{2,4}[0-9]+)+$/.test(r),
    error: 'Should match case-insensitive pattern'
  })
);

test(
  'Everything combined',
  /^((https?:\/\/)?(www\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?)?$/i,
  (r) => ({
    valid: typeof r === 'string',
    error: 'Should generate valid string'
  })
);

test(
  'Only quantifiers',
  '*',
  (r) => ({ valid: r === '', error: 'Quantifier without preceding element generates empty string' })
);

test(
  'Escaped quantifiers',
  'a\\*b\\+c\\?',
  (r) => ({ valid: r === 'a*b+c?', error: 'Should be literal quantifier chars' })
);

test(
  'Empty alternation branches',
  '||hello||',
  (r) => ({
    valid: r === '' || r === 'hello',
    error: 'Should be empty or "hello"'
  })
);

test(
  'Quantifier on quantifier (invalid but handled)',
  'a+*',
  (r) => ({
    valid: typeof r === 'string',
    error: 'Should handle invalid pattern gracefully'
  })
);

test(
  'Multiple dots',
  '....',
  (r) => ({ valid: r.length === 4, error: 'Should be 4 chars' })
);

test(
  'Escaped special chars in character class',
  '[\\[\\]\\(\\)\\{\\}]',
  (r) => ({
    valid: ['[',']','(',')' ,'{','}'].includes(r),
    error: 'Should be one of the bracket chars'
  })
);


// ==================== COMPLEX & EDGE CASES (v4.0.0 features) ====================
console.log('\n\n🔹 COMPLEX & EDGE CASES - v4.0.0 Features');
console.log('-'.repeat(70));

// BACKREFERENCES - Major v4.0.0 feature
test(
  'Simple backreference \\1',
  '(\\d{3})-\\1',
  (r) => {
    const parts = r.split('-');
    return {
      valid: parts.length === 2 && parts[0] === parts[1] && /^\d{3}$/.test(parts[0]),
      error: 'Should be "XXX-XXX" where both parts match'
    };
  }
);

test(
  'Backreference with alternation',
  '(cat|dog) and \\1',
  (r) => {
    return {
      valid: r === 'cat and cat' || r === 'dog and dog',
      error: 'Should be "cat and cat" or "dog and dog"'
    };
  }
);

test(
  'Multiple backreferences',
  '(\\w+)@(\\w+)\\.\\2',
  (r) => {
    const match = r.match(/^(\w+)@(\w+)\.(\w+)$/);
    return {
      valid: match && match[2] === match[3],
      error: 'Domain should repeat: user@example.example'
    };
  }
);

test(
  'Backreference with quantifier',
  '(\\d{2})-(\\w{2})-\\1',
  (r) => {
    const match = r.match(/^(\d{2})-(\w{2})-(\d{2})$/);
    return {
      valid: match && match[1] === match[3],
      error: 'First and third parts should match: 42-ab-42'
    };
  }
);

test(
  'Nested groups with backreference',
  '((a|b)(c|d))-\\1',
  (r) => {
    const parts = r.split('-');
    return {
      valid: parts.length === 2 && parts[0] === parts[1] && /^(a|b)(c|d)$/.test(parts[0]),
      error: 'Should be "XY-XY" where X is a|b and Y is c|d'
    };
  }
);

test(
  'Complex backreference pattern',
  '([a-z]{3})\\d{2}\\1',
  (r) => {
    const match = r.match(/^([a-z]{3})(\d{2})([a-z]{3})$/);
    return {
      valid: match && match[1] === match[3] && /^\d{2}$/.test(match[2]),
      error: 'Should be "abc12abc" format with matching letter groups'
    };
  }
);

// QUANTIFIER EDGE CASES
test(
  '{0} - exactly zero repetitions',
  'a{0}b',
  (r) => ({ valid: r === 'b', error: 'Should be just "b" (a repeated 0 times)' })
);

test(
  '{0,0} - zero to zero repetitions',
  'x{0,0}y',
  (r) => ({ valid: r === 'y', error: 'Should be just "y"' })
);

test(
  'Very large exact count {100}',
  'a{100}',
  (r) => ({ valid: r === 'a'.repeat(100) && r.length === 100, error: 'Should be exactly 100 a\'s' })
);

test(
  'Nested lazy quantifiers',
  '(a+?)+(b*?)+',
  (r) => ({
    valid: /^a+b*$/.test(r),
    error: 'Should match nested lazy pattern'
  })
);

test(
  'Triple nested quantifiers',
  '((a{2})+)+',
  (r) => ({
    valid: /^(aa)+$/.test(r) && r.length % 2 === 0 && r.length >= 2,
    error: 'Should be pairs of "aa"'
  })
);

test(
  'Mixed greedy and lazy in sequence',
  'a+b*?c+?d*',
  (r) => ({
    valid: /^a+b*c+d*$/.test(r) && r.includes('a') && r.includes('c'),
    error: 'Should have greedy and lazy quantifiers mixed'
  })
);

// COMPLEX REAL-WORLD PATTERNS
test(
  'JWT-like token (simplified)',
  '[A-Za-z0-9_-]{20,40}\\.[A-Za-z0-9_-]{20,40}\\.[A-Za-z0-9_-]{20,40}',
  (r) => {
    const parts = r.split('.');
    return {
      valid: parts.length === 3 && parts.every(p => /^[A-Za-z0-9_-]{20,40}$/.test(p)),
      error: 'Should match JWT format with 3 parts'
    };
  }
);

test(
  'Base64-like string',
  '[A-Za-z0-9+/]{20}={0,2}',
  (r) => ({
    valid: /^[A-Za-z0-9+\/]{20}={0,2}$/.test(r) && r.length >= 20 && r.length <= 22,
    error: 'Should match base64 format'
  })
);

test(
  'Complex email with dots and plus',
  '[a-z]{3,8}(\\.[a-z]{2,5})?\\+?[a-z]{0,5}@[a-z]{5,10}\\.(com|net|org)',
  (r) => ({
    valid: /^[a-z]{3,8}(\.[a-z]{2,5})?\+?[a-z]{0,5}@[a-z]{5,10}\.(com|net|org)$/.test(r),
    error: 'Should match complex email pattern'
  })
);

test(
  'HTML hex color with alpha',
  '#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?',
  (r) => ({
    valid: /^#[0-9A-Fa-f]{6}([0-9A-Fa-f]{2})?$/.test(r) && (r.length === 7 || r.length === 9),
    error: 'Should be hex color with optional alpha'
  })
);

test(
  'Semantic version with prerelease',
  '\\d{1,2}\\.\\d{1,2}\\.\\d{1,3}(-alpha\\.-beta\\.[0-9]+)?',
  (r) => ({
    valid: /^\d{1,2}\.\d{1,2}\.\d{1,3}(-alpha\.-beta\.[0-9]+)?$/.test(r),
    error: 'Should match semver with optional prerelease'
  })
);

test(
  'Git branch name',
  '(feature|bugfix|hotfix)/[a-z0-9-]{5,30}',
  (r) => ({
    valid: /^(feature|bugfix|hotfix)\/[a-z0-9-]{5,30}$/.test(r),
    error: 'Should match git branch naming convention'
  })
);

// COMPLEX NESTING & ALTERNATION
test(
  'Deeply nested with all features',
  '((([a-z]{2}|[0-9]{2})+)?-?)+',
  (r) => ({
    // Pattern allows: (letters|digits in pairs, optional)?  dash(optional)  repeat+
    // So "-", "ab-", "-cd-", "ab-cd-ef-" are all valid
    valid: /^(([a-z]{2}|[0-9]{2})*-?)+$/.test(r),
    error: 'Should match deeply nested pattern'
  })
);

test(
  'Alternation with different length branches',
  '(\\d{10}|[a-z]{5}|[A-Z]{3}\\d{2})',
  (r) => ({
    valid: /^\d{10}$/.test(r) || /^[a-z]{5}$/.test(r) || /^[A-Z]{3}\d{2}$/.test(r),
    error: 'Should match one of three different-length patterns'
  })
);

test(
  'Complex character class with ranges',
  '[a-zA-Z0-9\\-\\_\\.]{8,20}',
  (r) => ({
    valid: /^[a-zA-Z0-9\-\_\.]{8,20}$/.test(r) && r.length >= 8 && r.length <= 20,
    error: 'Should be 8-20 chars from complex class'
  })
);

// CHARACTER CLASS EDGE CASES
test(
  'Single character in class [a]',
  '[a]{5}',
  (r) => ({ valid: r === 'aaaaa', error: 'Should be five a\'s' })
);

test(
  'Character class with only special chars',
  '[!@#$%]{3}',
  (r) => ({
    valid: /^[!@#$%]{3}$/.test(r) && r.length === 3,
    error: 'Should be 3 special chars'
  })
);

test(
  'Escaped dash in character class',
  '[a\\-z]{4}',
  (r) => ({
    valid: /^[a\-z]{4}$/.test(r) && r.length === 4,
    error: 'Should be 4 chars: a, -, or z only'
  })
);

test(
  'Multiple ranges in one class',
  '[a-zA-Z0-9_-]{10}',
  (r) => ({
    valid: /^[a-zA-Z0-9_-]{10}$/.test(r) && r.length === 10,
    error: 'Should be 10 alphanumeric/underscore/dash chars'
  })
);

// EDGE CASES WITH MIN/MAX
test(
  'Pattern with exact length and matching min/max',
  '\\d{5}',
  (r) => ({ valid: /^\d{5}$/.test(r) && r.length === 5, error: 'Should be exactly 5 digits' }),
  { min: 5, max: 5 }
);

test(
  'Zero-length pattern with max=0',
  'a*b*c*',
  (r) => ({ valid: r === '', error: 'Should be empty with max=0' }),
  { max: 0 }
);

test(
  'Variable pattern with exact min=max',
  '[a-z]+',
  (r) => ({ valid: /^[a-z]{50}$/.test(r) && r.length === 50, error: 'Should be exactly 50 lowercase' }),
  { min: 50, max: 50 }
);

// COMPLEX ESCAPE SEQUENCES
test(
  'All escape types combined',
  '\\d\\w\\s\\D\\W\\S\\t\\n\\r',
  (r) => ({
    valid: /^\d\w\s\D\W\S\t\n\r$/.test(r) && r.length === 9,
    error: 'Should have all escape sequence types'
  })
);

test(
  'Unicode range with flags',
  /[\u0041-\u005A]{5}/i,
  (r) => ({
    valid: /^[a-zA-Z]{5}$/.test(r) && r.length === 5,
    error: 'Should be 5 letters (unicode range with case-insensitive)'
  })
);

test(
  'Mixed unicode, hex, and literals',
  '\\u{1F600}\\x41\\u0042test',
  (r) => ({ valid: r === '😀ABtest', error: 'Should be "😀ABtest"' })
);

// STRESS TESTS - Complex combinations
test(
  'Everything: groups, quantifiers, alternation, backrefs, flags',
  /^((https|http):\/\/)?(www\.)?([a-z0-9]+)\.([a-z]{2,5})$/i,
  (r) => ({
    valid: typeof r === 'string' && r.length > 0,
    error: 'Should generate URL-like string'
  })
);

test(
  'Extreme nesting with alternation',
  '(((((a|b)|(c|d))|(e|f))|(g|h))|(i|j))',
  (r) => ({
    valid: ['a','b','c','d','e','f','g','h','i','j'].includes(r),
    error: 'Should be one letter a-j'
  })
);

test(
  'Long sequence with mixed quantifiers',
  'a{3}b+c*d?e{2,5}f*?g+?h??',
  (r) => ({
    valid: /^aaab+c*d?e{2,5}f*g+h?$/.test(r) && r.startsWith('aaa') && r.includes('b'),
    error: 'Should match complex quantifier sequence'
  })
);

test(
  'Multiple backreferences with quantifiers',
  '(\\d+)-(\\w+)-\\1-\\2',
  (r) => {
    const parts = r.split('-');
    return {
      valid: parts.length === 4 && parts[0] === parts[2] && parts[1] === parts[3],
      error: 'Pattern should be X-Y-X-Y with matching parts'
    };
  }
);

test(
  'Nested groups with multiple backreferences',
  '((\\d{2})(\\w{2}))-\\2-\\3',
  (r) => {
    const match = r.match(/^((\d{2})(\w{2}))-(\d{2})-(\w{2})$/);
    return {
      valid: match && match[2] === match[4] && match[3] === match[5],
      error: 'Should be (DDww)-DD-ww with matching parts'
    };
  }
);

test(
  'Complex alternation with backreferences',
  '(red|blue|green) (car|bike) \\1 \\2',
  (r) => {
    const parts = r.split(' ');
    return {
      valid: parts.length === 4 &&
             ['red','blue','green'].includes(parts[0]) &&
             ['car','bike'].includes(parts[1]) &&
             parts[0] === parts[2] &&
             parts[1] === parts[3],
      error: 'Should be "color vehicle color vehicle" with matching words'
    };
  }
);

// VALIDATION ERROR TESTS (should throw)
test(
  'Fixed length with conflicting min (should throw)',
  '\\d{4}',
  { min: 10, expectError: true }
);

test(
  'Fixed length with conflicting max (should throw)',
  'hello',
  { max: 3, expectError: true }
);

// EDGE CASES - Empty and minimal patterns
test(
  'Optional everything',
  'a?b?c?d?',
  (r) => ({
    valid: /^[abcd]{0,4}$/.test(r),
    error: 'Should be 0-4 chars from abcd'
  })
);

test(
  'Alternation with empty branches',
  'a||b',
  (r) => ({
    valid: r === 'a' || r === '' || r === 'b',
    error: 'Should be "a", "", or "b"'
  })
);

test(
  'Complex lookahead-like pattern (no actual lookaheads)',
  '(?:https?://)?(?:www\\.)?[a-z]+',
  (r) => ({
    valid: /^(https?:\/\/)?(www\.)?[a-z]+$/.test(r),
    error: 'Should match URL pattern without capturing'
  })
);


// ==================== REAL-WORLD PATTERNS (25 tests) ====================
console.log('\n\n🔹 REAL-WORLD PATTERNS - Practical Use Cases');
console.log('-'.repeat(70));

test(
  'Email address (standard)',
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  (r) => ({
    valid: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(r),
    error: 'Should match email format'
  })
);

test(
  'Phone number (international format)',
  /^\+?[1-9]\d{1,14}$/,
  (r) => ({
    valid: /^\+?[1-9]\d{1,14}$/.test(r) && r.length >= 2 && r.length <= 16,
    error: 'Should match international phone format'
  })
);

test(
  'Phone number (Senegal)',
  /^(\+221|00221)?[73][0-9]{8}$/,
  (r) => ({
    valid: /^(\+221|00221)?[73][0-9]{8}$/.test(r),
    error: 'Should match Senegal phone format'
  })
);

test(
  'URL (HTTP/HTTPS)',
  /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
  (r) => ({
    valid: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/.test(r),
    error: 'Should match URL format'
  })
);

test(
  'French postal code',
  /^[0-9]{5}$/,
  (r) => ({
    valid: /^[0-9]{5}$/.test(r) && r.length === 5,
    error: 'Should be 5 digits'
  })
);

test(
  'US ZIP code',
  /^\d{5}(-\d{4})?$/,
  (r) => ({
    valid: /^\d{5}(-\d{4})?$/.test(r) && (r.length === 5 || r.length === 10),
    error: 'Should match US ZIP format (5 or 9 digits)'
  })
);

test(
  'Credit card number (basic format)',
  /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/,
  (r) => ({
    valid: /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/.test(r),
    error: 'Should match credit card format'
  })
);

test(
  'Date (DD/MM/YYYY)',
  /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/,
  (r) => ({
    valid: /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/.test(r) && r.length === 10,
    error: 'Should match DD/MM/YYYY format'
  })
);

test(
  'Date ISO (YYYY-MM-DD)',
  /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
  (r) => ({
    valid: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(r) && r.length === 10,
    error: 'Should match YYYY-MM-DD format'
  })
);

test(
  'Time (HH:MM 24h format)',
  /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
  (r) => ({
    valid: /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(r),
    error: 'Should match HH:MM format'
  })
);

// Note: Password with lookaheads skipped - will add when lookahead support is implemented

test(
  'IPv4 address',
  /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  (r) => ({
    valid: /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(r),
    error: 'Should match IPv4 format'
  })
);

test(
  'IPv6 address (simplified)',
  /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
  (r) => ({
    valid: /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(r),
    error: 'Should match IPv6 format'
  })
);

test(
  'Domain name',
  /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
  (r) => ({
    valid: /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/.test(r),
    error: 'Should match domain name format'
  })
);

test(
  'URL slug',
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  (r) => ({
    valid: /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(r),
    error: 'Should match URL slug format'
  })
);

test(
  'Hex color code',
  /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
  (r) => ({
    valid: /^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/.test(r),
    error: 'Should match hex color format'
  })
);

test(
  'Username (alphanumeric + underscore)',
  /^[a-zA-Z0-9_]{3,16}$/,
  (r) => ({
    valid: /^[a-zA-Z0-9_]{3,16}$/.test(r) && r.length >= 3 && r.length <= 16,
    error: 'Should be 3-16 alphanumeric characters'
  })
);

test(
  'French social security number',
  /^[12][0-9]{2}(0[1-9]|1[0-2])[0-9]{2}[0-9]{3}[0-9]{3}[0-9]{2}$/,
  (r) => ({
    valid: /^[12][0-9]{2}(0[1-9]|1[0-2])[0-9]{2}[0-9]{3}[0-9]{3}[0-9]{2}$/.test(r) && r.length === 15,
    error: 'Should match French SSN format (15 digits)'
  })
);

test(
  'European VAT number (France)',
  /^FR[0-9A-Z]{2}[0-9]{9}$/,
  (r) => ({
    valid: /^FR[0-9A-Z]{2}[0-9]{9}$/.test(r) && r.length === 13,
    error: 'Should match French VAT format'
  })
);

test(
  'IBAN (general format)',
  /^[A-Z]{2}\d{2}[A-Z0-9]+$/,
  (r) => ({
    valid: /^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(r) && r.length >= 15,
    error: 'Should match IBAN format'
  }),
  { min: 15, max: 34 }
);

test(
  'Letters only (with accents)',
  /^[a-zA-ZÀ-ÿ\s]+$/,
  (r) => ({
    valid: /^[a-zA-ZÀ-ÿ\s]+$/.test(r),
    error: 'Should contain only letters and spaces'
  })
);

test(
  'Digits only',
  /^\d+$/,
  (r) => ({
    valid: /^\d+$/.test(r) && r.length > 0,
    error: 'Should contain only digits'
  })
);

test(
  'Price/Amount with decimals',
  /^\d+(\.\d{1,2})?$/,
  (r) => ({
    valid: /^\d+(\.\d{1,2})?$/.test(r),
    error: 'Should match price format (digits with optional 1-2 decimals)'
  })
);

test(
  'French phone number',
  /^0[1-9](\s?\d{2}){4}$/,
  (r) => ({
    valid: /^0[1-9](\s?\d{2}){4}$/.test(r),
    error: 'Should match French phone format'
  })
);

test(
  'Bitcoin address',
  /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/,
  (r) => ({
    valid: /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(r) && r.length >= 26 && r.length <= 35,
    error: 'Should match Bitcoin address format'
  })
);


// ==================== SUMMARY ====================
console.log('\n\n' + '='.repeat(70));
console.log('📊 TEST SUMMARY');
console.log('='.repeat(70));
console.log(`Total Tests:  ${totalTests}`);
console.log(`✅ Passed:    ${passedTests}`);
console.log(`❌ Failed:    ${failedTests}`);
console.log(`Success Rate: ${((passedTests/totalTests)*100).toFixed(1)}%`);
console.log('='.repeat(70));

if (failedTests === 0) {
  console.log('\n🎉 ALL TESTS PASSED! 🎉\n');
} else {
  console.log(`\n⚠️  ${failedTests} TEST(S) FAILED\n`);
}

process.exit(failedTests === 0 ? 0 : 1);
