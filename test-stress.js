/**
 * Stress Test Suite - Edge Cases & Extreme Scenarios
 * Tests boundary conditions, complex nesting, performance, and unusual patterns
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
    const iterations = options.iterations || 3;
    for (let i = 0; i < iterations; i++) {
      const result = randomStringFromRegex(pattern, options);
      results.push(result);
    }

    // Display results
    results.forEach((r, i) => {
      const display = r.replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t').replace(/\0/g, '\\0');
      const truncated = display.length > 60 ? display.substring(0, 60) + '...' : display;
      console.log(`   ${i + 1}. "${truncated}" (length: ${r.length})`);
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

console.log('🔥 STRESS TEST SUITE - EDGE CASES & EXTREME SCENARIOS\n');
console.log('='.repeat(70));

// ==================== EXTREME LENGTH CONSTRAINTS ====================
console.log('\n\n🔹 EXTREME LENGTH CONSTRAINTS');
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

test(
  'Short pattern with high min',
  'A',
  (r) => ({
    valid: r === 'A',
    error: 'Should be just "A" (pattern has no variable length)'
  }),
  { min: 50 }
);

test(
  'Zero length result',
  'a*',
  (r) => ({
    valid: /^a*$/.test(r),
    error: 'Should match a*'
  }),
  { max: 0 }
);

// ==================== DEEPLY NESTED STRUCTURES ====================
console.log('\n\n🔹 DEEPLY NESTED STRUCTURES');
console.log('-'.repeat(70));

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

// ==================== COMPLEX ALTERNATIONS ====================
console.log('\n\n🔹 COMPLEX ALTERNATIONS');
console.log('-'.repeat(70));

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

// ==================== UNICODE & SPECIAL CHARS ====================
console.log('\n\n🔹 UNICODE & SPECIAL CHARACTERS');
console.log('-'.repeat(70));

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

// ==================== LAZY VS GREEDY ====================
console.log('\n\n🔹 LAZY VS GREEDY QUANTIFIERS');
console.log('-'.repeat(70));

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

// ==================== BOUNDARY CONDITIONS ====================
console.log('\n\n🔹 BOUNDARY CONDITIONS');
console.log('-'.repeat(70));

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

// ==================== NEGATED CHARACTER CLASSES ====================
console.log('\n\n🔹 NEGATED CHARACTER CLASSES');
console.log('-'.repeat(70));

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

// ==================== REAL-WORLD COMPLEX PATTERNS ====================
console.log('\n\n🔹 REAL-WORLD COMPLEX PATTERNS');
console.log('-'.repeat(70));

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

// ==================== COMBINATION PATTERNS ====================
console.log('\n\n🔹 COMBINATION PATTERNS (Multiple Features)');
console.log('-'.repeat(70));

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

// ==================== EDGE CASES ====================
console.log('\n\n🔹 EDGE CASES & CORNER CASES');
console.log('-'.repeat(70));

test(
  'Only quantifiers',
  '*',
  (r) => ({ valid: r === '*', error: 'Literal * without char before' })
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

// ==================== SUMMARY ====================
console.log('\n\n' + '='.repeat(70));
console.log('📊 STRESS TEST SUMMARY');
console.log('='.repeat(70));
console.log(`Total Tests:  ${totalTests}`);
console.log(`✅ Passed:    ${passedTests}`);
console.log(`❌ Failed:    ${failedTests}`);
console.log(`Success Rate: ${((passedTests/totalTests)*100).toFixed(1)}%`);
console.log('='.repeat(70));

if (failedTests === 0) {
  console.log('\n🎉 ALL STRESS TESTS PASSED! 🎉\n');
} else {
  console.log(`\n⚠️  ${failedTests} TEST(S) FAILED\n`);
}

// Exit with appropriate code
process.exit(failedTests === 0 ? 0 : 1);
