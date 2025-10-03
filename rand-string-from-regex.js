/**
 * rand-string-from-regex v4.0.0
 * Complete architectural redesign with AST-based generation
 *
 * Key improvements:
 * - Regex fixed lengths take absolute priority
 * - Intelligent length distribution
 * - Backreference support
 * - True lazy/greedy behavior
 * - Pre-calculated length validation
 */

function randomStringFromRegex(pattern, options = {}) {
  const opts = {
    min: options.min !== undefined ? options.min : null,
    max: options.max !== undefined ? options.max : null,
    maxRetries: options.maxRetries || 100,
    transform: options.transform || null
  };

  // Extract pattern and flags
  let patternStr;
  let flags = {};

  if (typeof pattern === 'string') {
    patternStr = pattern;
  } else {
    patternStr = pattern.source;
    flags.ignoreCase = pattern.ignoreCase || pattern.flags.includes('i');
    flags.dotAll = pattern.dotAll || pattern.flags.includes('s');
    flags.multiline = pattern.multiline || pattern.flags.includes('m');
  }

  // Remove anchors (they don't generate characters)
  // Handle top-level alternation with anchors properly
  let cleanPattern = patternStr;

  // Check if pattern has top-level alternation (not in groups)
  const hasTopLevelAlternation = (() => {
    let depth = 0;
    for (let i = 0; i < cleanPattern.length; i++) {
      if (cleanPattern[i] === '\\') {
        i++; // Skip escaped char
        continue;
      }
      if (cleanPattern[i] === '(') depth++;
      else if (cleanPattern[i] === ')') depth--;
      else if (cleanPattern[i] === '|' && depth === 0) return true;
    }
    return false;
  })();

  if (hasTopLevelAlternation) {
    // Split by top-level |, remove anchors from each part, then rejoin
    const parts = [];
    let currentPart = '';
    let depth = 0;

    for (let i = 0; i < cleanPattern.length; i++) {
      if (cleanPattern[i] === '\\' && i + 1 < cleanPattern.length) {
        currentPart += cleanPattern[i] + cleanPattern[i + 1];
        i++;
        continue;
      }
      if (cleanPattern[i] === '(') depth++;
      else if (cleanPattern[i] === ')') depth--;
      else if (cleanPattern[i] === '|' && depth === 0) {
        parts.push(currentPart.replace(/^\^/, '').replace(/\$$/, ''));
        currentPart = '';
        continue;
      }
      currentPart += cleanPattern[i];
    }
    parts.push(currentPart.replace(/^\^/, '').replace(/\$$/, ''));
    cleanPattern = parts.join('|');
  } else {
    // No top-level alternation, just remove anchors normally
    cleanPattern = cleanPattern.replace(/^\^/, '').replace(/\$$/, '');
  }

  // STEP 1: Parse regex to AST
  const ast = parseToAST(cleanPattern);

  // STEP 2: Calculate fixed and variable length ranges
  const lengthInfo = calculateLengthInfo(ast);

  // STEP 3: Validate constraints
  validateConstraints(lengthInfo, opts);

  // STEP 4: Determine target length
  const targetLength = determineTargetLength(lengthInfo, opts);

  // STEP 5: Generate with captured groups tracking
  const capturedGroups = {};
  const result = generateFromAST(ast, targetLength, flags, capturedGroups);

  // STEP 6: Apply transform if provided
  return opts.transform ? opts.transform(result) : result;
}

// ==================== AST PARSER ====================

function parseToAST(pattern) {
  const tokens = tokenize(pattern);
  return buildAST(tokens);
}

function tokenize(pattern) {
  const tokens = [];
  let i = 0;

  while (i < pattern.length) {
    const char = pattern[i];

    // Handle escape sequences
    if (char === '\\' && i + 1 < pattern.length) {
      tokens.push(parseEscape(pattern, i));
      i = tokens[tokens.length - 1].endIndex;
      continue;
    }

    // Handle character classes
    if (char === '[') {
      const classEnd = findCharClassEnd(pattern, i);
      tokens.push({
        type: 'charclass',
        content: pattern.substring(i + 1, classEnd),
        negated: pattern[i + 1] === '^',
        startIndex: i,
        endIndex: classEnd + 1
      });
      i = classEnd + 1;
      continue;
    }

    // Handle groups
    if (char === '(') {
      const groupEnd = findMatchingParen(pattern, i);
      const groupContent = pattern.substring(i + 1, groupEnd);
      const isNonCapturing = groupContent.startsWith('?:');
      const isNamed = groupContent.startsWith('?<');

      tokens.push({
        type: 'group',
        capturing: !isNonCapturing && !isNamed,
        name: isNamed ? extractGroupName(groupContent) : null,
        content: isNonCapturing ? groupContent.substring(2) :
                 isNamed ? groupContent.substring(groupContent.indexOf('>') + 1) :
                 groupContent,
        startIndex: i,
        endIndex: groupEnd + 1
      });
      i = groupEnd + 1;
      continue;
    }

    // Handle alternation
    if (char === '|') {
      tokens.push({ type: 'alternation', startIndex: i, endIndex: i + 1 });
      i++;
      continue;
    }

    // Handle quantifiers
    if ('*+?'.includes(char)) {
      const isLazy = (i + 1 < pattern.length && pattern[i + 1] === '?');
      tokens.push({
        type: 'quantifier',
        kind: char,
        lazy: isLazy,
        startIndex: i,
        endIndex: i + (isLazy ? 2 : 1)
      });
      i += isLazy ? 2 : 1;
      continue;
    }

    // Handle counted quantifiers {n,m}
    if (char === '{') {
      const closeIndex = pattern.indexOf('}', i);
      const quantContent = pattern.substring(i + 1, closeIndex);
      const [min, max] = quantContent.split(',').map(s => s.trim());
      const isLazy = (closeIndex + 1 < pattern.length && pattern[closeIndex + 1] === '?');

      tokens.push({
        type: 'quantifier',
        kind: 'counted',
        min: parseInt(min),
        max: max !== undefined ? (max === '' ? Infinity : parseInt(max)) : parseInt(min),
        lazy: isLazy,
        startIndex: i,
        endIndex: closeIndex + 1 + (isLazy ? 1 : 0)
      });
      i = closeIndex + 1 + (isLazy ? 1 : 0);
      continue;
    }

    // Handle dot (any character)
    if (char === '.') {
      tokens.push({ type: 'dot', startIndex: i, endIndex: i + 1 });
      i++;
      continue;
    }

    // Literal character
    tokens.push({ type: 'literal', value: char, startIndex: i, endIndex: i + 1 });
    i++;
  }

  return tokens;
}

function buildAST(tokens) {
  // Check for top-level alternation first
  // Groups are already tokenized as single tokens, so we just need to find
  // alternation tokens that aren't inside groups
  const alternationIndices = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'alternation') {
      alternationIndices.push(i);
    }
  }

  // If we have alternation tokens, they're top-level (groups handle their own alternation)
  if (alternationIndices.length > 0) {
    const options = [];
    let start = 0;

    for (const altIndex of alternationIndices) {
      options.push(buildSequence(tokens.slice(start, altIndex)));
      start = altIndex + 1;
    }
    options.push(buildSequence(tokens.slice(start)));

    return { type: 'alternation', options };
  }

  // No top-level alternation, build sequence
  return buildSequence(tokens);
}

function buildSequence(tokens) {
  const ast = { type: 'sequence', children: [] };
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    // Check for quantifier following this token
    if (i + 1 < tokens.length && tokens[i + 1].type === 'quantifier') {
      const quantifier = tokens[i + 1];
      ast.children.push({
        type: 'quantified',
        element: token.type === 'group' ? buildAST(tokenize(token.content)) : token,
        quantifier: quantifier
      });
      i += 2;
    } else if (token.type === 'group') {
      ast.children.push({
        ...token,
        ast: buildAST(tokenize(token.content))
      });
      i++;
    } else {
      ast.children.push(token);
      i++;
    }
  }

  return ast;
}

// ==================== LENGTH CALCULATION ====================

function calculateLengthInfo(ast) {
  if (!ast) return { min: 0, max: 0, fixed: true };

  if (ast.type === 'root' || ast.type === 'sequence') {
    let minTotal = 0;
    let maxTotal = 0;
    let isFixed = true;

    (ast.children || []).forEach(child => {
      const childInfo = calculateLengthInfo(child);
      minTotal += childInfo.min;
      maxTotal += childInfo.max === Infinity ? Infinity : childInfo.max;
      if (maxTotal !== Infinity && childInfo.max === Infinity) maxTotal = Infinity;
      if (!childInfo.fixed) isFixed = false;
    });

    return { min: minTotal, max: maxTotal, fixed: isFixed };
  }

  if (ast.type === 'alternation') {
    if (!ast.options || ast.options.length === 0) {
      return { min: 0, max: 0, fixed: true };
    }
    const optionsInfo = ast.options.map(opt => calculateLengthInfo(opt));
    return {
      min: Math.min(...optionsInfo.map(o => o.min)),
      max: Math.max(...optionsInfo.map(o => o.max)),
      fixed: false
    };
  }

  if (ast.type === 'quantified') {
    const elemInfo = calculateLengthInfo(ast.element);
    const q = ast.quantifier;

    let min, max;
    if (q.kind === '*') {
      min = 0;
      max = Infinity;
    } else if (q.kind === '+') {
      min = elemInfo.min;
      max = Infinity;
    } else if (q.kind === '?') {
      min = 0;
      max = elemInfo.max;
    } else if (q.kind === 'counted') {
      min = q.min * elemInfo.min;
      max = q.max === Infinity ? Infinity : q.max * elemInfo.max;
    }

    return { min, max, fixed: min === max };
  }

  if (ast.type === 'group') {
    return calculateLengthInfo(ast.ast);
  }

  if (ast.type === 'charclass' || ast.type === 'dot' || ast.type === 'literal') {
    return { min: 1, max: 1, fixed: true };
  }

  if (ast.type === 'escape') {
    // Escapes like \d, \w, \s are 1 char, boundaries are 0
    if (ast.value === 'b' || ast.value === 'B') {
      return { min: 0, max: 0, fixed: true };
    }
    return { min: 1, max: 1, fixed: true };
  }

  if (ast.type === 'backreference') {
    // Backreferences are variable length (depends on captured group)
    // We assume 0-10 for calculation purposes
    return { min: 0, max: 10, fixed: false };
  }

  return { min: 0, max: 0, fixed: true };
}

// ==================== CONSTRAINT VALIDATION ====================

function validateConstraints(lengthInfo, opts) {
  // PRIORITY 1: Regex fixed length
  if (lengthInfo.fixed) {
    const exactLen = lengthInfo.min;
    if (opts.min !== null && opts.min > exactLen) {
      throw new Error(
        `Regex generates exactly ${exactLen} characters (fixed length), ` +
        `but min constraint is ${opts.min}. Regex length takes priority.`
      );
    }
    if (opts.max !== null && opts.max < exactLen) {
      throw new Error(
        `Regex generates exactly ${exactLen} characters (fixed length), ` +
        `but max constraint is ${opts.max}. Regex length takes priority.`
      );
    }
  } else {
    // Variable length - check if constraints are possible
    if (opts.min !== null && lengthInfo.max !== Infinity && opts.min > lengthInfo.max) {
      throw new Error(
        `Impossible: regex can generate at most ${lengthInfo.max} characters, ` +
        `but min is ${opts.min}`
      );
    }
    if (opts.max !== null && opts.max < lengthInfo.min) {
      throw new Error(
        `Impossible: regex requires at least ${lengthInfo.min} characters, ` +
        `but max is ${opts.max}`
      );
    }
  }
}

// ==================== TARGET LENGTH DETERMINATION ====================

function determineTargetLength(lengthInfo, opts) {
  // PRIORITY 1: If regex has fixed length, use it (ignore opts)
  if (lengthInfo.fixed) {
    return lengthInfo.min;
  }

  // PRIORITY 2: If opts specify exact length (min === max), use it
  if (opts.min !== null && opts.max !== null && opts.min === opts.max) {
    return opts.min;
  }

  // PRIORITY 3: Try to meet min if specified
  if (opts.min !== null) {
    return Math.max(lengthInfo.min, opts.min);
  }

  // PRIORITY 4: Use a reasonable default
  const reasonable = Math.min(lengthInfo.min + 5, lengthInfo.max === Infinity ? 20 : lengthInfo.max);
  if (opts.max !== null) {
    return Math.min(reasonable, opts.max);
  }

  return reasonable;
}

// ==================== GENERATION FROM AST ====================

function generateFromAST(ast, targetLength, flags, capturedGroups, groupIndex = { value: 0 }) {
  if (!ast) return '';

  if (ast.type === 'root' || ast.type === 'sequence') {
    return generateSequence(ast.children || [], targetLength, flags, capturedGroups, groupIndex);
  }

  if (ast.type === 'alternation') {
    if (!ast.options || ast.options.length === 0) {
      return '';
    }
    const chosen = ast.options[Math.floor(Math.random() * ast.options.length)];
    return generateFromAST(chosen, targetLength, flags, capturedGroups, groupIndex);
  }

  if (ast.type === 'quantified') {
    return generateQuantified(ast, targetLength, flags, capturedGroups, groupIndex);
  }

  if (ast.type === 'group') {
    return generateGroup(ast, targetLength, flags, capturedGroups, groupIndex);
  }

  if (ast.type === 'charclass') {
    return generateCharClass(ast, flags);
  }

  if (ast.type === 'dot') {
    return generateDot(flags);
  }

  if (ast.type === 'literal') {
    return applyFlags(ast.value, flags);
  }

  if (ast.type === 'escape') {
    return generateEscape(ast, flags);
  }

  if (ast.type === 'backreference') {
    return capturedGroups[ast.index] || '';
  }

  return '';
}

function generateSequence(children, targetLength, flags, capturedGroups, groupIndex) {
  // Calculate fixed vs variable parts
  const parts = children.map(child => ({
    ast: child,
    lengthInfo: calculateLengthInfo(child)
  }));

  const fixedLength = parts
    .filter(p => p.lengthInfo.fixed)
    .reduce((sum, p) => sum + p.lengthInfo.min, 0);

  const variableParts = parts.filter(p => !p.lengthInfo.fixed);

  // Budget is the space available AFTER accounting for minimums
  const variableMinimum = variableParts.reduce((sum, p) => sum + p.lengthInfo.min, 0);
  const variableBudget = Math.max(0, targetLength - fixedLength - variableMinimum);

  // Distribute budget across variable parts
  const allocations = distributeLength(variableParts, variableBudget);

  // Generate each part
  let result = '';
  let allocationIndex = 0;

  for (const part of parts) {
    if (part.lengthInfo.fixed) {
      result += generateFromAST(part.ast, part.lengthInfo.min, flags, capturedGroups, groupIndex);
    } else {
      const allocated = allocations[allocationIndex++] || part.lengthInfo.min;
      result += generateFromAST(part.ast, allocated, flags, capturedGroups, groupIndex);
    }
  }

  return result;
}

function distributeLength(parts, budget) {
  if (parts.length === 0) return [];
  if (budget === 0) return parts.map(p => p.lengthInfo.min);

  // Simple distribution: proportional to capacity
  const allocations = [];
  let remaining = budget;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    const capacity = part.lengthInfo.max === Infinity ? budget :
                     (part.lengthInfo.max - part.lengthInfo.min);

    if (i === parts.length - 1) {
      // Last part gets remainder
      allocations.push(part.lengthInfo.min + remaining);
    } else {
      // Distribute proportionally
      const share = Math.min(Math.floor(remaining / (parts.length - i)), capacity);
      allocations.push(part.lengthInfo.min + share);
      remaining -= share;
    }
  }

  return allocations;
}

function generateQuantified(ast, targetLength, flags, capturedGroups, groupIndex) {
  const elemInfo = calculateLengthInfo(ast.element);
  const q = ast.quantifier;

  // CRITICAL: Prevent infinite loops with zero-length elements
  // If element can be zero-length (min === 0), cap repetitions
  const MAX_SAFE_REPS = 100;

  // Calculate how many repetitions
  let count;

  if (q.kind === 'counted') {
    // Fixed count range {n,m}
    if (q.lazy) {
      count = q.min; // Lazy: use minimum
    } else {
      // Greedy: use maximum that fits in target
      if (elemInfo.min === 0) {
        // Zero-length element: use a reasonable cap
        count = Math.min(q.max === Infinity ? MAX_SAFE_REPS : q.max, MAX_SAFE_REPS);
      } else {
        const maxPossible = Math.floor(targetLength / elemInfo.min);
        count = Math.min(q.max === Infinity ? maxPossible : q.max, maxPossible);
      }
    }
  } else if (q.kind === '*') {
    if (q.lazy) {
      count = 0; // Lazy *: prefer zero
    } else {
      // Greedy *: use target length
      if (elemInfo.min === 0) {
        // Zero-length element: cap at reasonable number
        count = Math.min(MAX_SAFE_REPS, 5);
      } else {
        count = Math.floor(targetLength / elemInfo.min);
      }
    }
  } else if (q.kind === '+') {
    if (q.lazy) {
      count = 1; // Lazy +: use minimum (1)
    } else {
      // Greedy +: use target length
      if (elemInfo.min === 0) {
        // Zero-length element: cap at reasonable number
        count = Math.min(MAX_SAFE_REPS, 5);
      } else {
        count = Math.max(1, Math.floor(targetLength / elemInfo.min));
      }
    }
  } else if (q.kind === '?') {
    count = q.lazy ? 0 : (Math.random() > 0.5 ? 1 : 0);
  }

  // Cap count at safe maximum ONLY for zero-length elements to prevent hangs
  if (elemInfo.min === 0) {
    count = Math.min(count, MAX_SAFE_REPS);
  }

  // Generate repetitions
  let result = '';
  const perElemLength = count > 0 ? Math.floor(targetLength / count) : elemInfo.min;
  const safePerElemLength = perElemLength || elemInfo.min || 1;

  for (let i = 0; i < count; i++) {
    result += generateFromAST(ast.element, safePerElemLength, flags, capturedGroups, groupIndex);
  }

  return result;
}

function generateGroup(ast, targetLength, flags, capturedGroups, groupIndex) {
  // Assign group number BEFORE generating content (groups numbered by opening paren)
  let currentIndex = null;
  if (ast.capturing) {
    currentIndex = ++groupIndex.value;
  }

  // Generate the group content
  const result = generateFromAST(ast.ast, targetLength, flags, capturedGroups, groupIndex);

  // Capture the result if this is a capturing group
  if (ast.capturing) {
    capturedGroups[currentIndex] = result;
    if (ast.name) {
      capturedGroups[ast.name] = result;
    }
  }

  return result;
}

function generateCharClass(ast, flags) {
  const isNegated = ast.negated;
  let content = isNegated && ast.content[0] === '^' ? ast.content.slice(1) : ast.content;

  // Expand unicode escapes in character class BEFORE processing
  content = content.replace(/\\u([0-9a-fA-F]{4})/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });
  content = content.replace(/\\u\{([0-9a-fA-F]+)\}/g, (match, hex) => {
    return String.fromCodePoint(parseInt(hex, 16));
  });
  content = content.replace(/\\x([0-9a-fA-F]{2})/g, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  let chars = '';
  let i = 0;

  while (i < content.length) {
    if (content[i] === '\\' && i + 1 < content.length) {
      i++;
      const nextChar = content[i];

      // Handle escaped special characters in character class
      if ('[]()|{}^$.*+?\\'.includes(nextChar)) {
        chars += nextChar;
        i++;
        continue;
      }

      // Expand escape sequences for character classes
      if (nextChar === 'd') {
        chars += '0123456789';
      } else if (nextChar === 'w') {
        chars += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
      } else if (nextChar === 's') {
        chars += ' \t\n\r\f\v'; // All whitespace characters
      } else if (nextChar === 'D') {
        chars += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()';
      } else if (nextChar === 'W') {
        chars += '!@#$%^&*()-+=[]{}|;:,.<>?/';
      } else if (nextChar === 'S') {
        chars += 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      } else if (nextChar === 't') {
        chars += '\t';
      } else if (nextChar === 'n') {
        chars += '\n';
      } else if (nextChar === 'r') {
        chars += '\r';
      } else if (nextChar === '0') {
        chars += '\0';
      } else {
        chars += nextChar;
      }
      i++;
    } else if (i + 2 < content.length && content[i + 1] === '-') {
      // Handle ranges like a-z, 0-9, A-Z
      const start = content.charCodeAt(i);
      const end = content.charCodeAt(i + 2);
      for (let code = start; code <= end; code++) {
        chars += String.fromCharCode(code);
      }
      // For ignoreCase flag, add opposite case for letter ranges
      if (flags.ignoreCase) {
        const startChar = content[i];
        const endChar = content[i + 2];
        if (/[a-z]/.test(startChar) && /[a-z]/.test(endChar)) {
          for (let code = start; code <= end; code++) {
            chars += String.fromCharCode(code - 32);
          }
        } else if (/[A-Z]/.test(startChar) && /[A-Z]/.test(endChar)) {
          for (let code = start; code <= end; code++) {
            chars += String.fromCharCode(code + 32);
          }
        }
      }
      i += 3;
    } else {
      chars += content[i];
      // For ignoreCase flag, add opposite case for individual letters
      if (flags.ignoreCase && /[a-zA-Z]/.test(content[i])) {
        const char = content[i];
        chars += char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
      }
      i++;
    }
  }

  if (isNegated) {
    const allChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+[]{}|;:,.<>?/~`\'" \t\n\r';
    const filteredChars = allChars.split('').filter(c => !chars.includes(c)).join('');
    return filteredChars.length > 0 ? filteredChars[Math.floor(Math.random() * filteredChars.length)] : '';
  }

  return chars.length > 0 ? chars[Math.floor(Math.random() * chars.length)] : '';
}

function generateDot(flags) {
  if (flags.dotAll && Math.random() < 0.1) {
    return '\n';
  }
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return chars[Math.floor(Math.random() * chars.length)];
}

function generateEscape(ast, flags) {
  const char = ast.value;

  // If already converted (from parseEscape for hex/unicode), return as-is
  if (char.length > 1) {
    return applyFlags(char, flags);
  }

  // Handle single-char escapes
  switch (char) {
    case 'd': return String(Math.floor(Math.random() * 10));
    case 'w': {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
      return chars[Math.floor(Math.random() * chars.length)];
    }
    case 's': return ' '; // Use space for \s (preserves formatting)
    case 'D': {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()';
      return chars[Math.floor(Math.random() * chars.length)];
    }
    case 'W': {
      const chars = '!@#$%^&*()-+=[]{}|;:,.<>?/';
      return chars[Math.floor(Math.random() * chars.length)];
    }
    case 'S': {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      return chars[Math.floor(Math.random() * chars.length)];
    }
    case 't': return '\t';
    case 'n': return '\n';
    case 'r': return '\r';
    case '0': return '\0';
    case 'b': return ''; // Word boundary - zero-width
    case 'B': return ''; // Non-word boundary - zero-width
    default: return applyFlags(char, flags); // Literal escaped character
  }
}

function applyFlags(char, flags) {
  if (flags.ignoreCase && /[a-zA-Z]/.test(char)) {
    return Math.random() > 0.5 ? char.toUpperCase() : char.toLowerCase();
  }
  return char;
}

// ==================== HELPER FUNCTIONS ====================

function findCharClassEnd(pattern, start) {
  let i = start + 1;
  if (pattern[i] === '^') i++;
  while (i < pattern.length) {
    if (pattern[i] === '\\') {
      i += 2;
    } else if (pattern[i] === ']') {
      return i;
    } else {
      i++;
    }
  }
  return pattern.length - 1;
}

function findMatchingParen(pattern, start) {
  let depth = 1;
  let i = start + 1;
  while (i < pattern.length && depth > 0) {
    if (pattern[i] === '\\') {
      i += 2;
    } else if (pattern[i] === '(') {
      depth++;
      i++;
    } else if (pattern[i] === ')') {
      depth--;
      i++;
    } else {
      i++;
    }
  }
  return i - 1;
}

function parseEscape(pattern, start) {
  const char = pattern[start + 1];

  // Backreferences (\1, \2, ..., \9)
  if (/[1-9]/.test(char)) {
    return {
      type: 'backreference',
      index: parseInt(char),
      endIndex: start + 2
    };
  }

  // Multi-char escapes - these are pre-converted, so use type 'literal'
  if (char === 'x' && start + 3 < pattern.length) {
    return {
      type: 'literal',
      value: String.fromCharCode(parseInt(pattern.substring(start + 2, start + 4), 16)),
      endIndex: start + 4
    };
  }

  if (char === 'u') {
    if (pattern[start + 2] === '{') {
      const end = pattern.indexOf('}', start + 3);
      return {
        type: 'literal',
        value: String.fromCodePoint(parseInt(pattern.substring(start + 3, end), 16)),
        endIndex: end + 1
      };
    } else if (start + 5 < pattern.length) {
      return {
        type: 'literal',
        value: String.fromCharCode(parseInt(pattern.substring(start + 2, start + 6), 16)),
        endIndex: start + 6
      };
    }
  }

  // Single char escapes
  return {
    type: 'escape',
    value: char,
    endIndex: start + 2
  };
}

function extractGroupName(content) {
  const match = content.match(/^\?<([^>]+)>/);
  return match ? match[1] : null;
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = randomStringFromRegex;
} else if (typeof window !== 'undefined') {
  window.randomStringFromRegex = randomStringFromRegex;
}
