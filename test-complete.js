/**
 * COMPLETE TEST SUITE - Combined All Tests
 * Merges test.js + test-all-operators.js into one comprehensive suite
 */

const randomStringFromRegex = require('./rand-string-from-regex');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, pattern, validator, options = {}) {
  totalTests++;
  console.log(`\n📋 Test ${totalTests}: ${name}`);
  console.log(`   Pattern: ${pattern instanceof RegExp ? pattern : `"${pattern}"`}`);
  if (Object.keys(options).length > 0) {
    console.log(`   Options: ${JSON.stringify(options)}`);
  }

  try {
    const results = [];
    for (let i = 0; i < 5; i++) {
      const result = randomStringFromRegex(pattern, options);
      results.push(result);
    }

    // Display results
    results.forEach((r, i) => {
      const display = r.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\0/g, '\\0');
      console.log(`   ${i + 1}. "${display}" (length: ${r.length})`);
    });

    // Validate
    let valid = true;
    let errors = [];

    results.forEach((r, i) => {
      const validationResult = validator(r);
      if (!validationResult.valid) {
        valid = false;
        errors.push(`Result ${i + 1}: ${validationResult.error}`);
      }
    });

    if (valid) {
      console.log(`   ✅ PASS`);
      passedTests++;
    } else {
      console.log(`   ❌ FAIL`);
      errors.forEach(e => console.log(`      - ${e}`));
      failedTests++;
    }

  } catch (e) {
    console.log(`   ❌ ERROR: ${e.message}`);
    failedTests++;
  }
}

console.log('🧪 COMPLETE TEST SUITE - ALL OPERATORS & FEATURES\n');
console.log('='.repeat(70));

// ==================== CHARACTER CLASSES ====================
console.log('\n\n🔹 CHARACTER CLASSES');
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

// ==================== ANCHORS ====================
console.log('\n\n🔹 ANCHORS');
console.log('-'.repeat(70));

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

// ==================== QUANTIFIERS ====================
console.log('\n\n🔹 QUANTIFIERS');
console.log('-'.repeat(70));

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

// ==================== LAZY QUANTIFIERS ====================
console.log('\n\n🔹 LAZY QUANTIFIERS');
console.log('-'.repeat(70));

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

// ==================== GROUPING & ALTERNATION ====================
console.log('\n\n🔹 GROUPING & ALTERNATION');
console.log('-'.repeat(70));

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

// ==================== SPECIAL CHARACTERS ====================
console.log('\n\n🔹 SPECIAL CHARACTERS');
console.log('-'.repeat(70));

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

// ==================== REGEX FLAGS ====================
console.log('\n\n🔹 REGEX FLAGS');
console.log('-'.repeat(70));

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

// ==================== COMPLEX REAL-WORLD PATTERNS ====================
console.log('\n\n🔹 COMPLEX REAL-WORLD PATTERNS');
console.log('-'.repeat(70));

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

// ==================== LENGTH CONSTRAINTS ====================
console.log('\n\n🔹 LENGTH CONSTRAINTS');
console.log('-'.repeat(70));

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

// ==================== TRANSFORM FUNCTION ====================
console.log('\n\n🔹 TRANSFORM FUNCTION');
console.log('-'.repeat(70));

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

// ==================== EDGE CASES ====================
console.log('\n\n🔹 EDGE CASES');
console.log('-'.repeat(70));

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

// Exit with appropriate code
process.exit(failedTests === 0 ? 0 : 1);
