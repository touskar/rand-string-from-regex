const randomStringFromRegex = require('./rand-string-from-regex');

// Copy the full test suite but using the improved version
function runTests() {
  console.log('🧪 REGEX GENERATOR TEST SUITE (IMPROVED VERSION)\n');
  console.log('='.repeat(70));

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function test(name, pattern, options = {}, validator = null) {
    totalTests++;
    console.log(`\n📋 Test: ${name}`);
    console.log(`   Pattern: ${pattern}`);
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
        console.log(`   ${i + 1}. "${r}" (length: ${r.length})`);
      });

      // Validate
      let valid = true;
      let errors = [];

      // Check if results match the pattern (skip if transform is used, rely on validator)
      if (!options.transform) {
        const regex = new RegExp(pattern);
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

      // Custom validator
      if (validator) {
        results.forEach((r, i) => {
          const validationResult = validator(r);
          if (!validationResult.valid) {
            valid = false;
            errors.push(`Result ${i + 1}: ${validationResult.error}`);
          }
        });
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
      console.log(`   ❌ ERROR: ${e.message}`);
      failedTests++;
    }
  }

  // ==================== BASIC TESTS ====================
  console.log('\n\n🔹 BASIC PATTERNS');
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

  // ==================== QUANTIFIER TESTS ====================
  console.log('\n\n🔹 QUANTIFIERS');
  console.log('-'.repeat(70));

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

  // ==================== ESCAPE SEQUENCES ====================
  console.log('\n\n🔹 ESCAPE SEQUENCES');
  console.log('-'.repeat(70));

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

  // ==================== GROUPS & ALTERNATION ====================
  console.log('\n\n🔹 GROUPS & ALTERNATION');
  console.log('-'.repeat(70));

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

  // ==================== REAL-WORLD PATTERNS ====================
  console.log('\n\n🔹 REAL-WORLD PATTERNS');
  console.log('-'.repeat(70));

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

  // ==================== LENGTH CONSTRAINT TESTS ====================
  console.log('\n\n🔹 LENGTH CONSTRAINTS');
  console.log('-'.repeat(70));

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

  // ==================== TRANSFORM TESTS ====================
  console.log('\n\n🔹 TRANSFORM FUNCTION');
  console.log('-'.repeat(70));

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

  // ==================== EDGE CASES ====================
  console.log('\n\n🔹 EDGE CASES');
  console.log('-'.repeat(70));

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
    console.log('\n⚠️  SOME TESTS FAILED\n');
  }
}

// Run the test suite
runTests();
