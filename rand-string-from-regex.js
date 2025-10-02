/**
 * Generate a random string matching a regex pattern
 * Pure browser JavaScript - no dependencies
 * Supports: character classes, quantifiers, groups, alternation, escapes
 *
 * @param {string|RegExp} pattern - The regex pattern
 * @param {Object} options - Generation options
 * @param {number} options.min - Minimum length for quantifiers (default: varies by quantifier)
 * @param {number} options.max - Maximum length for quantifiers (default: varies by quantifier)
 * @param {number} options.maxRetries - Max attempts to meet length constraints (default: 100)
 * @param {Function} options.transform - Function to transform the result before returning (e.g., str => str.toUpperCase())
 * @returns {string} A random string matching the pattern
 */
function randomStringFromRegex(pattern, options = {}) {
  const opts = {
    min: options.min !== undefined ? options.min : null,
    max: options.max !== undefined ? options.max : null,
    maxRetries: options.maxRetries || 100,
    transform: options.transform || null
  };

  // Convert RegExp to string
  let patternStr = (typeof pattern === 'string' ? pattern : pattern.source);

  // Handle top-level alternation before removing anchors
  if (patternStr.includes('|')) {
    const options = splitTopLevelAlternation(patternStr);
    const chosen = options[Math.floor(Math.random() * options.length)];
    patternStr = chosen;
  }

  // Now remove anchors from the chosen alternative
  patternStr = patternStr.replace(/^\^/, '').replace(/\$$/, '');

  // Try to generate a string within the length constraints
  let attempts = 0;
  let bestResult = '';

  while (attempts < opts.maxRetries) {
    // Calculate target length for this attempt
    let targetLength = null;
    if (opts.min !== null && opts.max !== null && opts.min === opts.max) {
      targetLength = opts.min;
    } else if (opts.min !== null && opts.max !== null) {
      targetLength = opts.min + Math.floor(Math.random() * (opts.max - opts.min + 1));
    } else if (opts.min !== null) {
      // For min only, aim for min + some buffer
      targetLength = opts.min + Math.floor(Math.random() * 10);
    } else if (opts.max !== null) {
      // For max only, aim for something under max
      targetLength = Math.max(1, Math.floor(Math.random() * (opts.max + 1)));
    }

    const result = generate(patternStr, targetLength);

    // Check length constraints
    const meetsMin = opts.min === null || result.length >= opts.min;
    const meetsMax = opts.max === null || result.length <= opts.max;

    if (meetsMin && meetsMax) {
      return opts.transform ? opts.transform(result) : result;
    }

    // Track best result in case we can't meet constraints
    if (bestResult === '' ||
        Math.abs((opts.min || 0) - result.length) < Math.abs((opts.min || 0) - bestResult.length)) {
      bestResult = result;
    }

    attempts++;
  }

  // If we couldn't meet constraints, return best effort
  if (opts.max !== null && bestResult.length > opts.max) {
    bestResult = bestResult.substring(0, opts.max);
  }
  return opts.transform ? opts.transform(bestResult) : bestResult;

  function generate(str, targetLen = null, index = 0) {
    let result = '';
    let i = index;

    while (i < str.length) {
      const char = str[i];

      // Handle escaped characters \d, \w, \s, etc.
      if (char === '\\' && i + 1 < str.length) {
        i++;
        const escaped = str[i];
        const escapeResult = handleEscape(escaped);

        i++;
        const quantResult = handleQuantifier(str, i, () => escapeResult, targetLen, result.length);
        if (quantResult) {
          result += quantResult.value;
          i = quantResult.nextIndex;
        } else {
          result += escapeResult;
        }
        continue;
      }

      // Handle groups (...)
      if (char === '(') {
        const groupEnd = findMatchingParen(str, i);
        const groupContent = str.substring(i + 1, groupEnd);

        // Skip non-capturing groups and lookaheads/lookbehinds
        if (groupContent.startsWith('?:')) {
          const innerContent = groupContent.substring(2);
          const remainingLen = targetLen !== null ? Math.max(0, targetLen - result.length) : null;
          const groupResult = handleAlternation(innerContent, remainingLen);
          i = groupEnd + 1;

          const quantResult = handleQuantifier(str, i, () => groupResult, targetLen, result.length);
          if (quantResult) {
            result += quantResult.value;
            i = quantResult.nextIndex;
          } else {
            result += groupResult;
          }
        } else if (groupContent.startsWith('?=') || groupContent.startsWith('?!') ||
                   groupContent.startsWith('?<=') || groupContent.startsWith('?<!')) {
          // Skip lookahead/lookbehind assertions (don't consume input)
          i = groupEnd + 1;
        } else {
          // Regular capturing group or alternation
          const remainingLen = targetLen !== null ? Math.max(0, targetLen - result.length) : null;
          const groupResult = handleAlternation(groupContent, remainingLen);
          i = groupEnd + 1;

          const quantResult = handleQuantifier(str, i, () => groupResult, targetLen, result.length);
          if (quantResult) {
            result += quantResult.value;
            i = quantResult.nextIndex;
          } else {
            result += groupResult;
          }
        }
        continue;
      }

      // Handle character classes [...]
      if (char === '[') {
        const closeIndex = str.indexOf(']', i);
        const classContent = str.substring(i + 1, closeIndex);

        i = closeIndex + 1;
        const quantResult = handleQuantifier(str, i, () => generateFromClass(classContent), targetLen, result.length);
        if (quantResult) {
          result += quantResult.value;
          i = quantResult.nextIndex;
        } else {
          result += generateFromClass(classContent);
        }
        continue;
      }

      // Handle dot (any character)
      if (char === '.') {
        i++;
        const quantResult = handleQuantifier(str, i, () => randomChar(), targetLen, result.length);
        if (quantResult) {
          result += quantResult.value;
          i = quantResult.nextIndex;
        } else {
          result += randomChar();
        }
        continue;
      }

      // Check for quantifiers after regular character
      const quantResult = handleQuantifier(str, i + 1, () => char, targetLen, result.length);
      if (quantResult) {
        result += quantResult.value;
        i = quantResult.nextIndex;
        continue;
      }

      // Regular character
      result += char;
      i++;
    }

    return result;
  }

  function handleAlternation(content, targetLen = null) {
    if (content.includes('|')) {
      const options = splitAlternation(content);
      const chosen = options[Math.floor(Math.random() * options.length)];
      return generate(chosen, targetLen);
    }
    return generate(content, targetLen);
  }

  function splitTopLevelAlternation(str) {
    const options = [];
    let current = '';
    let depth = 0;
    let inCharClass = false;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      if (char === '\\' && i + 1 < str.length) {
        current += char + str[i + 1];
        i++;
      } else if (char === '[' && !inCharClass) {
        inCharClass = true;
        current += char;
      } else if (char === ']' && inCharClass) {
        inCharClass = false;
        current += char;
      } else if (char === '(' && !inCharClass) {
        depth++;
        current += char;
      } else if (char === ')' && !inCharClass) {
        depth--;
        current += char;
      } else if (char === '|' && depth === 0 && !inCharClass) {
        options.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    if (current) options.push(current);
    return options;
  }

  function splitAlternation(str) {
    const options = [];
    let current = '';
    let depth = 0;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];

      if (char === '\\' && i + 1 < str.length) {
        current += char + str[i + 1];
        i++;
      } else if (char === '(') {
        depth++;
        current += char;
      } else if (char === ')') {
        depth--;
        current += char;
      } else if (char === '|' && depth === 0) {
        options.push(current);
        current = '';
      } else {
        current += char;
      }
    }

    if (current) options.push(current);
    return options;
  }

  function handleQuantifier(str, startIndex, generator, targetLen = null, currentLen = 0) {
    if (startIndex >= str.length) return null;

    const char = str[startIndex];

    // Calculate how many chars we should generate based on target
    const remainingLen = targetLen !== null ? Math.max(0, targetLen - currentLen) : null;

    // Handle {n}, {n,m}, {n,}
    if (char === '{') {
      const closeIndex = str.indexOf('}', startIndex);
      if (closeIndex === -1) return null;

      const quantifier = str.substring(startIndex + 1, closeIndex);
      const parts = quantifier.split(',').map(s => s.trim());

      let count;
      if (parts.length === 1) {
        count = parseInt(parts[0]);
      } else if (parts[1] === '') {
        const min = parseInt(parts[0]);
        // If we have a target length, try to fill it
        if (remainingLen !== null && remainingLen > min) {
          count = Math.min(remainingLen, min + Math.floor(Math.random() * 5));
        } else {
          count = min + Math.floor(Math.random() * 5);
        }
      } else {
        const min = parseInt(parts[0]);
        const max = parseInt(parts[1]);
        count = min + Math.floor(Math.random() * (max - min + 1));
      }

      if (isNaN(count)) return null;

      let value = '';
      for (let k = 0; k < count; k++) {
        value += generator();
      }

      return { value, nextIndex: closeIndex + 1 };
    }

    // Handle * (0 or more)
    if (char === '*') {
      const isLazy = startIndex + 1 < str.length && str[startIndex + 1] === '?';
      let count;

      // If we have a target length, try to fill it
      if (remainingLen !== null && remainingLen > 0) {
        // Use all remaining length if available
        count = isLazy ? Math.min(2, remainingLen) : remainingLen;
      } else if (opts.min !== null && currentLen < opts.min) {
        // If we have a min constraint and haven't met it, be more generous
        const needed = opts.min - currentLen;
        count = isLazy ? Math.min(2, needed) : Math.max(5, needed);
      } else {
        count = isLazy ? Math.floor(Math.random() * 2) : Math.floor(Math.random() * 5);
      }

      let value = '';
      for (let k = 0; k < count; k++) {
        value += generator();
      }
      return { value, nextIndex: startIndex + (isLazy ? 2 : 1) };
    }

    // Handle + (1 or more)
    if (char === '+') {
      const isLazy = startIndex + 1 < str.length && str[startIndex + 1] === '?';
      let count;

      // If we have a target length, try to fill it
      if (remainingLen !== null && remainingLen >= 1) {
        // Use all remaining length if available
        count = isLazy ? Math.min(2, Math.max(1, remainingLen)) : Math.max(1, remainingLen);
      } else if (opts.min !== null && currentLen < opts.min) {
        // If we have a min constraint and haven't met it, be more generous
        const needed = Math.max(1, opts.min - currentLen);
        count = isLazy ? Math.min(2, needed) : Math.max(5, needed);
      } else {
        count = isLazy ? (1 + Math.floor(Math.random() * 1)) : (1 + Math.floor(Math.random() * 4));
      }

      let value = '';
      for (let k = 0; k < count; k++) {
        value += generator();
      }
      return { value, nextIndex: startIndex + (isLazy ? 2 : 1) };
    }

    // Handle ? (0 or 1)
    if (char === '?') {
      // If we need more length, include it; otherwise 50/50
      const include = remainingLen !== null && remainingLen > 0 ? true : Math.random() > 0.5;
      const value = include ? generator() : '';
      return { value, nextIndex: startIndex + 1 };
    }

    return null;
  }

  function handleEscape(char) {
    switch (char) {
      case 'd': return String(Math.floor(Math.random() * 10));
      case 'w': return randomFrom('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_');
      case 's': return ' '; // Always use space for \s to ensure consistency
      case 'D': return randomFrom('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()');
      case 'W': return randomFrom('!@#$%^&*()-+=[]{}|;:,.<>?/');
      case 'S': return randomFrom('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
      case 't': return '\t';
      case 'n': return '\n';
      case 'r': return '\r';
      default: return char; // Literal escaped character
    }
  }

  function generateFromClass(classContent) {
    const isNegated = classContent[0] === '^';
    const content = isNegated ? classContent.slice(1) : classContent;

    let chars = '';
    let i = 0;

    while (i < content.length) {
      if (content[i] === '\\' && i + 1 < content.length) {
        i++;
        const escaped = handleEscape(content[i]);
        // For character classes, expand escape sequences
        if (content[i] === 'd') {
          chars += '0123456789';
        } else if (content[i] === 'w') {
          chars += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
        } else if (content[i] === 's') {
          chars += ' \t\n\r';
        } else {
          chars += escaped;
        }
        i++;
      } else if (i + 2 < content.length && content[i + 1] === '-') {
        // Handle ranges like a-z, 0-9, A-Z
        const start = content.charCodeAt(i);
        const end = content.charCodeAt(i + 2);
        for (let code = start; code <= end; code++) {
          chars += String.fromCharCode(code);
        }
        i += 3;
      } else {
        chars += content[i];
        i++;
      }
    }

    if (isNegated) {
      // For negated classes, use alphanumeric as default
      const allChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      const filteredChars = allChars.split('').filter(c => !chars.includes(c)).join('');
      return filteredChars.length > 0 ? filteredChars[Math.floor(Math.random() * filteredChars.length)] : '';
    }

    return chars.length > 0 ? chars[Math.floor(Math.random() * chars.length)] : '';
  }

  function findMatchingParen(str, start) {
    let depth = 1;
    for (let i = start + 1; i < str.length; i++) {
      if (str[i] === '\\') {
        i++; // Skip escaped character
        continue;
      }
      if (str[i] === '(') depth++;
      if (str[i] === ')') {
        depth--;
        if (depth === 0) return i;
      }
    }
    return str.length;
  }

  function randomChar() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return chars[Math.floor(Math.random() * chars.length)];
  }

  function randomFrom(str) {
    return str[Math.floor(Math.random() * str.length)];
  }
}

// Export for Node.js and browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = randomStringFromRegex;
} else if (typeof window !== 'undefined') {
  window.randomStringFromRegex = randomStringFromRegex;
}
