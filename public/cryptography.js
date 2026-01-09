const textInput = document.querySelector('#crypto-input');
const heuristicsSummary = document.querySelector('#heuristics-summary');
const heuristicsToggle = document.querySelector('#auto-heuristics');
const cards = Array.from(document.querySelectorAll('.crypto-card'));

const MORSE_TABLE = {
  A: '.-',
  B: '-...',
  C: '-.-.',
  D: '-..',
  E: '.',
  F: '..-.',
  G: '--.',
  H: '....',
  I: '..',
  J: '.---',
  K: '-.-',
  L: '.-..',
  M: '--',
  N: '-.',
  O: '---',
  P: '.--.',
  Q: '--.-',
  R: '.-.',
  S: '...',
  T: '-',
  U: '..-',
  V: '...-',
  W: '.--',
  X: '-..-',
  Y: '-.--',
  Z: '--..',
  0: '-----',
  1: '.----',
  2: '..---',
  3: '...--',
  4: '....-',
  5: '.....',
  6: '-....',
  7: '--...',
  8: '---..',
  9: '----.',
  '.': '.-.-.-',
  ',': '--..--',
  '?': '..--..',
  '!': '-.-.--',
  '-': '-....-',
  '/': '-..-.',
  '@': '.--.-.',
  '(': '-.--.',
  ')': '-.--.-',
  '&': '.-...',
  ':': '---...',
  ';': '-.-.-.',
  '=': '-...-',
  '+': '.-.-.',
  '"': '.-..-.',
  "'": '.----.',
  '_': '..--.-',
  '$': '...-..-',
  '¿': '..-.-',
  '¡': '--...-'
};

const MORSE_REVERSE = Object.fromEntries(Object.entries(MORSE_TABLE).map(([key, value]) => [value, key]));

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

const algorithms = {
  caesar: {
    encode: (input, options) => rotateCipher(input, Number(options.shift ?? 3)),
    decode: (input, options) => rotateCipher(input, 26 - (Number(options.shift ?? 3) % 26)),
    heuristics: (input, options) =>
      heuristicsFromDecode(rotateCipher(input, 26 - (Number(options.shift ?? 3) % 26)), 'shifted alphabetic characters').withSignal(
        input
      )
  },
  rot13: {
    encode: (input) => rotateCipher(input, 13),
    decode: (input) => rotateCipher(input, 13),
    heuristics: (input) => heuristicsFromDecode(rotateCipher(input, 13), 'ROT13 decode test').withSignal(input)
  },
  atbash: {
    encode: (input) => atbashTransform(input),
    decode: (input) => atbashTransform(input),
    heuristics: (input) => heuristicsFromDecode(atbashTransform(input), 'Atbash decode test').withSignal(input)
  },
  vigenere: {
    encode: (input, options) => vigenereTransform(input, (options.key || 'cipher').toString(), false),
    decode: (input, options) => vigenereTransform(input, (options.key || 'cipher').toString(), true),
    heuristics: (input, options) =>
      heuristicsFromDecode(
        vigenereTransform(input, (options.key || 'cipher').toString(), true),
        'Vigenère decode test'
      ).withSignal(input, (options.key || '').toString())
  },
  base64: {
    encode: (input) => base64Encode(input),
    decode: (input) => base64Decode(input),
    heuristics: (input) => base64Heuristics(input)
  },
  base32: {
    encode: (input) => base32Encode(input),
    decode: (input) => base32Decode(input),
    heuristics: (input) => base32Heuristics(input)
  },
  base58: {
    encode: (input) => base58Encode(input),
    decode: (input) => base58Decode(input),
    heuristics: (input) => base58Heuristics(input)
  },
  ascii85: {
    encode: (input) => ascii85Encode(input),
    decode: (input) => ascii85Decode(input),
    heuristics: (input) => ascii85Heuristics(input)
  },
  hex: {
    encode: (input) => hexEncode(input),
    decode: (input) => hexDecode(input),
    heuristics: (input) => hexHeuristics(input)
  },
  binary: {
    encode: (input) => binaryEncode(input),
    decode: (input) => binaryDecode(input),
    heuristics: (input) => binaryHeuristics(input)
  },
  morse: {
    encode: (input) => morseEncode(input),
    decode: (input) => morseDecode(input),
    heuristics: (input) => morseHeuristics(input)
  },
  url: {
    encode: (input) => urlEncode(input),
    decode: (input) => urlDecode(input),
    heuristics: (input) => urlHeuristics(input)
  },
  railfence: {
    encode: (input, options) => railFenceEncode(input, Number(options.rails ?? 3)),
    decode: (input, options) => railFenceDecode(input, Number(options.rails ?? 3)),
    heuristics: (input, options) =>
      heuristicsFromDecode(railFenceDecode(input, Number(options.rails ?? 3)), 'rail fence decode test').withSignal(input)
  },
  xor: {
    encode: (input, options) => xorEncode(input, (options.key || '').toString()),
    decode: (input, options) => xorDecode(input, (options.key || '').toString()),
    heuristics: (input, options) => xorHeuristics(input, (options.key || '').toString())
  },
  affine: {
    encode: (input, options) => affineTransform(input, Number(options.a ?? 1), Number(options.b ?? 8), false),
    decode: (input, options) => affineTransform(input, Number(options.a ?? 1), Number(options.b ?? 8), true),
    heuristics: (input, options) =>
      heuristicsFromDecode(
        affineTransform(input, Number(options.a ?? 1), Number(options.b ?? 8), true),
        'Affine decode test'
      ).withSignal(input)
  }
};

function rotateCipher(input, shift) {
  if (!input) return '';
  const normalized = ((shift % 26) + 26) % 26;
  return Array.from(input)
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + normalized) % 26) + 65);
      }
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + normalized) % 26) + 97);
      }
      return char;
    })
    .join('');
}

function atbashTransform(input) {
  if (!input) return '';
  return Array.from(input)
    .map((char) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(90 - (code - 65));
      }
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(122 - (code - 97));
      }
      return char;
    })
    .join('');
}

function normalizeKey(key) {
  return key.replace(/[^A-Za-z]/g, '').toUpperCase();
}

function vigenereTransform(input, rawKey, decode = false) {
  if (!input) return '';
  const key = normalizeKey(rawKey || 'cipher');
  if (!key) return input;
  let keyIndex = 0;
  return Array.from(input)
    .map((char) => {
      const code = char.charCodeAt(0);
      const isUpper = code >= 65 && code <= 90;
      const isLower = code >= 97 && code <= 122;
      if (!isUpper && !isLower) {
        return char;
      }
      const base = isUpper ? 65 : 97;
      const keyShift = key.charCodeAt(keyIndex % key.length) - 65;
      keyIndex += 1;
      const offset = decode ? 26 - keyShift : keyShift;
      return String.fromCharCode(((code - base + offset) % 26) + base);
    })
    .join('');
}

function base64Encode(input) {
  if (input === undefined || input === null) return '';
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64Decode(input) {
  if (!input) return '';
  try {
    const sanitized = input.replace(/\s+/g, '');
    const binary = atob(sanitized);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  } catch (error) {
    return '';
  }
}

function base64Heuristics(input) {
  const cleaned = (input || '').replace(/\s+/g, '');
  if (!cleaned) {
    return { score: 0, reason: 'Awaiting input for base64 analysis.' };
  }
  const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
  if (cleaned.length % 4 === 0 && base64Regex.test(cleaned)) {
    return { score: 0.92, reason: 'Valid base64 alphabet and padding alignment detected.' };
  }
  if (/^[A-Za-z0-9+/=]+$/.test(cleaned)) {
    return { score: 0.42, reason: 'Mostly base64-safe characters but length is not aligned to 4.' };
  }
  return { score: 0.08, reason: 'Characters fall outside the base64 alphabet.' };
}

function base32Encode(input) {
  if (input === undefined || input === null) return '';
  const bytes = Array.from(new TextEncoder().encode(input));
  if (!bytes.length) return '';
  const output = [];
  for (let i = 0; i < bytes.length; i += 5) {
    const chunk = bytes.slice(i, i + 5);
    const chunkLength = chunk.length;
    while (chunk.length < 5) {
      chunk.push(0);
    }
    const bits = chunk.map((byte) => byte.toString(2).padStart(8, '0')).join('');
    const charCount = [0, 2, 4, 5, 7, 8][chunkLength] || 0;
    for (let j = 0; j < charCount; j += 1) {
      const segment = bits.slice(j * 5, j * 5 + 5);
      output.push(BASE32_ALPHABET[parseInt(segment, 2)]);
    }
    output.push('='.repeat(8 - charCount));
  }
  return output.join('');
}

function base32Decode(input) {
  if (!input) return '';
  const cleaned = input.toUpperCase().replace(/\s+/g, '');
  if (!cleaned) return '';
  if (/[^A-Z2-7=]/.test(cleaned) || cleaned.length % 8 !== 0) {
    return '';
  }
  const bytes = [];
  for (let i = 0; i < cleaned.length; i += 8) {
    const block = cleaned.slice(i, i + 8);
    let bits = '';
    for (const char of block) {
      if (char === '=') {
        bits += '00000';
      } else {
        const value = BASE32_ALPHABET.indexOf(char);
        if (value === -1) {
          return '';
        }
        bits += value.toString(2).padStart(5, '0');
      }
    }
    let expectedBytes = 5;
    if (block.endsWith('======')) {
      expectedBytes = 1;
    } else if (block.endsWith('====')) {
      expectedBytes = 2;
    } else if (block.endsWith('===')) {
      expectedBytes = 3;
    } else if (block.endsWith('=')) {
      expectedBytes = 4;
    }
    for (let j = 0; j < expectedBytes; j += 1) {
      const segment = bits.slice(j * 8, j * 8 + 8);
      if (segment.length < 8) {
        continue;
      }
      bytes.push(parseInt(segment, 2));
    }
  }
  try {
    return new TextDecoder().decode(Uint8Array.from(bytes));
  } catch (error) {
    return '';
  }
}

function base32Heuristics(input) {
  const cleaned = (input || '').replace(/\s+/g, '').toUpperCase();
  if (!cleaned) {
    return { score: 0, reason: 'Awaiting input for base32 analysis.' };
  }
  const base32Regex = /^(?:[A-Z2-7]{8})*(?:[A-Z2-7]{2}={6}|[A-Z2-7]{4}={4}|[A-Z2-7]{5}={3}|[A-Z2-7]{7}=|[A-Z2-7]{8})$/;
  if (base32Regex.test(cleaned)) {
    return { score: 0.86, reason: 'Base32 alphabet and padding alignment detected.' };
  }
  if (/^[A-Z2-7=]+$/.test(cleaned)) {
    return { score: 0.4, reason: 'Mostly base32-safe characters but unusual length or padding.' };
  }
  return { score: 0.12, reason: 'Characters fall outside the base32 alphabet.' };
}

function base58Encode(input) {
  if (input === undefined || input === null) return '';
  const bytes = Array.from(new TextEncoder().encode(input));
  if (!bytes.length) return '';
  let zeros = 0;
  while (zeros < bytes.length && bytes[zeros] === 0) {
    zeros += 1;
  }
  let value = 0n;
  for (const byte of bytes) {
    value = (value << 8n) + BigInt(byte);
  }
  let encoded = '';
  while (value > 0n) {
    const remainder = Number(value % 58n);
    encoded = BASE58_ALPHABET[remainder] + encoded;
    value /= 58n;
  }
  return '1'.repeat(zeros) + encoded;
}

function base58Decode(input) {
  if (!input) return '';
  const cleaned = input.trim();
  if (!cleaned) return '';
  if (/[^123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]/.test(cleaned)) {
    return '';
  }
  let value = 0n;
  for (const char of cleaned) {
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) {
      return '';
    }
    value = value * 58n + BigInt(index);
  }
  const bytes = [];
  while (value > 0n) {
    bytes.push(Number(value % 256n));
    value /= 256n;
  }
  bytes.reverse();
  const leadingZeros = cleaned.match(/^1+/);
  if (leadingZeros) {
    bytes.unshift(...Array.from({ length: leadingZeros[0].length }, () => 0));
  }
  try {
    return new TextDecoder().decode(Uint8Array.from(bytes));
  } catch (error) {
    return '';
  }
}

function base58Heuristics(input) {
  const cleaned = (input || '').trim();
  if (!cleaned) {
    return { score: 0, reason: 'Awaiting input for base58 analysis.' };
  }
  if (/^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/.test(cleaned)) {
    const score = Math.min(0.9, 0.45 + cleaned.length * 0.02);
    return { score, reason: 'Base58 alphabet detected without ambiguous glyphs.' };
  }
  return { score: 0.14, reason: 'Characters fall outside the base58 alphabet.' };
}

function ascii85Encode(input) {
  if (input === undefined || input === null) return '';
  const bytes = Array.from(new TextEncoder().encode(input));
  if (!bytes.length) return '';
  let output = '';
  for (let i = 0; i < bytes.length; i += 4) {
    const chunk = bytes.slice(i, i + 4);
    const chunkLength = chunk.length;
    while (chunk.length < 4) {
      chunk.push(0);
    }
    const value =
      ((chunk[0] << 24) >>> 0) +
      ((chunk[1] << 16) >>> 0) +
      ((chunk[2] << 8) >>> 0) +
      (chunk[3] >>> 0);
    if (value === 0 && chunkLength === 4) {
      output += 'z';
      continue;
    }
    let remainder = value;
    const encoded = [];
    for (let j = 0; j < 5; j += 1) {
      encoded.unshift((remainder % 85) + 33);
      remainder = Math.floor(remainder / 85);
    }
    let block = String.fromCharCode(...encoded);
    if (chunkLength < 4) {
      block = block.slice(0, chunkLength + 1);
    }
    output += block;
  }
  return output;
}

function ascii85Decode(input) {
  if (!input) return '';
  const cleaned = input.replace(/\s+/g, '');
  if (!cleaned) return '';
  const bytes = [];
  let group = [];
  for (let i = 0; i < cleaned.length; i += 1) {
    const char = cleaned[i];
    if (char === 'z') {
      if (group.length !== 0) {
        return '';
      }
      bytes.push(0, 0, 0, 0);
      continue;
    }
    const code = char.charCodeAt(0);
    if (code < 33 || code > 117) {
      return '';
    }
    group.push(code - 33);
    if (group.length === 5) {
      let value = 0;
      group.forEach((part) => {
        value = value * 85 + part;
      });
      bytes.push((value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff);
      group = [];
    }
  }
  if (group.length > 0) {
    const missing = 5 - group.length;
    for (let i = 0; i < missing; i += 1) {
      group.push(84);
    }
    let value = 0;
    group.forEach((part) => {
      value = value * 85 + part;
    });
    let tail = [(value >>> 24) & 0xff, (value >>> 16) & 0xff, (value >>> 8) & 0xff, value & 0xff];
    tail = tail.slice(0, group.length - 1);
    bytes.push(...tail);
  }
  try {
    return new TextDecoder().decode(Uint8Array.from(bytes));
  } catch (error) {
    return '';
  }
}

function ascii85Heuristics(input) {
  const cleaned = (input || '').replace(/\s+/g, '');
  if (!cleaned) {
    return { score: 0, reason: 'Awaiting input for ASCII85 analysis.' };
  }
  if (/^[\x21-\x75z]+$/.test(cleaned)) {
    const hasCompression = cleaned.includes('z');
    return {
      score: hasCompression ? 0.74 : 0.6,
      reason: hasCompression
        ? 'ASCII85 alphabet detected along with zero-compression blocks.'
        : 'ASCII85-safe printable range detected.'
    };
  }
  return { score: 0.1, reason: 'Contains characters outside ASCII85 printable range.' };
}

function hexEncode(input) {
  if (input === undefined || input === null) return '';
  return Array.from(new TextEncoder().encode(input))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join(' ')
    .toUpperCase();
}

function hexDecode(input) {
  if (!input) return '';
  const cleaned = input.replace(/[^0-9A-Fa-f]/g, '');
  if (cleaned.length % 2 !== 0) return '';
  const bytes = cleaned.match(/.{1,2}/g) || [];
  try {
    return new TextDecoder().decode(Uint8Array.from(bytes.map((byte) => parseInt(byte, 16))));
  } catch (error) {
    return '';
  }
}

function hexHeuristics(input) {
  const cleaned = (input || '').replace(/\s+/g, '');
  if (!cleaned) {
    return { score: 0, reason: 'Awaiting input for hexadecimal detection.' };
  }
  if (/^[0-9A-Fa-f]+$/.test(cleaned) && cleaned.length % 2 === 0) {
    return { score: 0.88, reason: 'Even-length hexadecimal byte pattern detected.' };
  }
  if (/^[0-9A-Fa-f\s]+$/.test(input)) {
    return { score: 0.36, reason: 'Hexadecimal alphabet detected but byte alignment is irregular.' };
  }
  return { score: 0.1, reason: 'Contains characters outside hexadecimal ranges.' };
}

function binaryEncode(input) {
  if (input === undefined || input === null) return '';
  return Array.from(new TextEncoder().encode(input))
    .map((byte) => byte.toString(2).padStart(8, '0'))
    .join(' ');
}

function binaryDecode(input) {
  if (!input) return '';
  const bits = input.trim().split(/\s+/);
  if (bits.some((segment) => !/^[01]{1,8}$/.test(segment))) {
    return '';
  }
  const bytes = bits.map((segment) => parseInt(segment, 2));
  try {
    return new TextDecoder().decode(Uint8Array.from(bytes));
  } catch (error) {
    return '';
  }
}

function binaryHeuristics(input) {
  const cleaned = (input || '').trim();
  if (!cleaned) {
    return { score: 0, reason: 'Awaiting input for binary detection.' };
  }
  const segments = cleaned.split(/\s+/);
  const isBinary = segments.every((segment) => /^[01]+$/.test(segment));
  if (!isBinary) {
    return { score: 0.12, reason: 'Non-binary characters present.' };
  }
  const validLength = segments.every((segment) => segment.length === 8);
  if (validLength) {
    return { score: 0.9, reason: 'All segments are 8-bit binary groups.' };
  }
  return { score: 0.44, reason: 'Binary digits detected but byte lengths vary.' };
}

function morseEncode(input) {
  if (!input) return '';
  return input
    .toUpperCase()
    .split('')
    .map((char) => MORSE_TABLE[char] || '')
    .filter(Boolean)
    .join(' ');
}

function morseDecode(input) {
  if (!input) return '';
  return input
    .trim()
    .split(/\s*\/\s*|\s{3,}/)
    .map((word) =>
      word
        .trim()
        .split(/\s+/)
        .map((symbol) => MORSE_REVERSE[symbol] || '')
        .join('')
    )
    .join(' ')
    .trim();
}

function morseHeuristics(input) {
  const cleaned = (input || '').trim();
  if (!cleaned) {
    return { score: 0, reason: 'Awaiting input for Morse code analysis.' };
  }
  if (/^[.\-\s\/]+$/.test(cleaned)) {
    return { score: 0.85, reason: 'Only dots, dashes, slashes, and spaces detected — Morse likely.' };
  }
  return { score: 0.1, reason: 'Contains symbols outside Morse alphabet.' };
}

function urlEncode(input) {
  if (input === undefined || input === null) return '';
  return encodeURIComponent(input);
}

function urlDecode(input) {
  if (!input) return '';
  try {
    return decodeURIComponent(input.replace(/\+/g, ' '));
  } catch (error) {
    return '';
  }
}

function urlHeuristics(input) {
  if (!input) {
    return { score: 0, reason: 'Awaiting input for URL encoding analysis.' };
  }
  if (/%[0-9A-Fa-f]{2}/.test(input)) {
    return { score: 0.78, reason: 'Percent-encoded octets detected.' };
  }
  if (/^[A-Za-z0-9\-_.~%]+$/.test(input)) {
    return { score: 0.4, reason: 'Safe URL character set detected without encoded bytes.' };
  }
  return { score: 0.12, reason: 'Contains characters that are usually not percent-encoded.' };
}

function railFenceEncode(input, rails) {
  if (!input) return '';
  const sanitizedRails = Math.max(2, Math.min(Number.isFinite(rails) ? rails : 3, 10));
  const rows = Array.from({ length: sanitizedRails }, () => []);
  let rail = 0;
  let direction = 1;
  for (const char of input) {
    rows[rail].push(char);
    rail += direction;
    if (rail === sanitizedRails - 1 || rail === 0) {
      direction *= -1;
    }
  }
  return rows.flat().join('');
}

function railFenceDecode(input, rails) {
  if (!input) return '';
  const sanitizedRails = Math.max(2, Math.min(Number.isFinite(rails) ? rails : 3, 10));
  const pattern = new Array(input.length);
  let rail = 0;
  let direction = 1;
  for (let i = 0; i < input.length; i += 1) {
    pattern[i] = rail;
    rail += direction;
    if (rail === sanitizedRails - 1 || rail === 0) {
      direction *= -1;
    }
  }
  const counts = Array.from({ length: sanitizedRails }, () => 0);
  pattern.forEach((r) => {
    counts[r] += 1;
  });
  const railsContent = counts.map(() => []);
  let pointer = 0;
  for (let r = 0; r < sanitizedRails; r += 1) {
    railsContent[r] = input.slice(pointer, pointer + counts[r]).split('');
    pointer += counts[r];
  }
  return pattern.map((r) => railsContent[r].shift()).join('');
}

function xorEncode(input, key) {
  const bytes = xorBytes(input, key);
  if (!bytes.length) {
    return '';
  }
  return bytes
    .map((byte) => byte.toString(16).padStart(2, '0').toUpperCase())
    .join(' ');
}

function xorDecode(input, key) {
  if (!key) return '';
  if (!input) return '';
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/[^0-9A-Fa-f\s]/.test(trimmed)) {
    return '';
  }
  const sanitized = trimmed.replace(/[^0-9A-Fa-f]/g, '');
  if (sanitized.length % 2 !== 0 || !sanitized.length) {
    return '';
  }
  const keyBytes = new TextEncoder().encode(key);
  if (!keyBytes.length) {
    return '';
  }
  const cipherBytes = sanitized.match(/.{2}/g) || [];
  const decoded = cipherBytes.map((pair, index) => {
    const value = parseInt(pair, 16);
    return value ^ keyBytes[index % keyBytes.length];
  });
  try {
    return new TextDecoder().decode(Uint8Array.from(decoded));
  } catch (error) {
    return '';
  }
}

function xorBytes(input, key) {
  if (!input || !key) {
    return [];
  }
  const keyBytes = new TextEncoder().encode(key);
  if (!keyBytes.length) {
    return [];
  }
  const inputBytes = new TextEncoder().encode(input);
  if (!inputBytes.length) {
    return [];
  }
  return inputBytes.map((byte, index) => byte ^ keyBytes[index % keyBytes.length]);
}

function xorHeuristics(input, key) {
  const trimmed = (input || '').replace(/\s+/g, '');
  if (!trimmed) {
    return { score: 0, reason: 'Awaiting input before running XOR analysis.' };
  }
  if (!key) {
    return { score: 0.05, reason: 'Provide a key to attempt XOR decoding.' };
  }
  const decoded = xorDecode(input, key);
  if (!decoded) {
    return { score: 0.08, reason: 'XOR decode did not produce printable text with this key.' };
  }
  const base = heuristicsFromDecode(decoded, 'XOR decode test').withSignal(input);
  return {
    score: base.score,
    reason: `${base.reason} Key length ${key.length}.`
  };
}

function affineTransform(input, rawA, rawB, decode = false) {
  if (!input) return '';
  const a = sanitizeAffineMultiplier(rawA);
  const b = sanitizeOffset(rawB);
  if (decode) {
    const inverse = modularInverse(a, 26);
    if (inverse === null) {
      return '';
    }
    return Array.from(input)
      .map((char) => affineShift(char, (code, base) => {
        const value = code - base;
        const shifted = (inverse * ((value - b + 26) % 26)) % 26;
        return String.fromCharCode(shifted + base);
      }))
      .join('');
  }
  return Array.from(input)
    .map((char) => affineShift(char, (code, base) => {
      const value = code - base;
      const shifted = (a * value + b) % 26;
      return String.fromCharCode(shifted + base);
    }))
    .join('');
}

function affineShift(char, transform) {
  const code = char.charCodeAt(0);
  if (code >= 65 && code <= 90) {
    return transform(code, 65);
  }
  if (code >= 97 && code <= 122) {
    return transform(code, 97);
  }
  return char;
}

function sanitizeAffineMultiplier(value) {
  const candidate = Number.isFinite(value) ? Math.floor(value) : 1;
  const normalized = ((candidate % 26) + 26) % 26;
  const valid = [1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25];
  return valid.includes(normalized) ? normalized : 1;
}

function sanitizeOffset(value) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  const normalized = Math.floor(value);
  return ((normalized % 26) + 26) % 26;
}

function modularInverse(a, m) {
  let t = 0;
  let newT = 1;
  let r = m;
  let newR = a % m;
  while (newR !== 0) {
    const quotient = Math.floor(r / newR);
    [t, newT] = [newT, t - quotient * newT];
    [r, newR] = [newR, r - quotient * newR];
  }
  if (r > 1) {
    return null;
  }
  if (t < 0) {
    t += m;
  }
  return t;
}

function heuristicsFromDecode(decoded, description) {
  return {
    withSignal(input, key) {
      const trimmed = (input || '').replace(/\s+/g, '');
      if (!trimmed) {
        return { score: 0, reason: `Awaiting input before running ${description}.` };
      }
      if (!decoded) {
        return { score: 0.05, reason: 'Decoder did not produce printable text.' };
      }
      const printableCharacters = decoded.match(/[\x20-\x7E]/g) || [];
      const printableRatio = printableCharacters.length / decoded.length;
      const alphaCount = (decoded.match(/[A-Za-z]/g) || []).length;
      const total = decoded.length;
      const alphaRatio = total ? alphaCount / total : 0;
      const vowelCount = (decoded.match(/[AEIOUaeiou]/g) || []).length;
      const vowelRatio = alphaCount ? vowelCount / alphaCount : 0;
      const coherence = Math.min(1, alphaRatio * 0.5 + printableRatio * 0.3 + Math.min(vowelRatio * 1.2, 0.4));
      const keyNote = key && !normalizeKey(key) ? ' Key is empty or lacks alphabetic characters.' : '';
      const baseReason = coherence > 0.55 ? 'Decoded output resembles natural language.' : 'Decoded output is noisy.';
      return {
        score: coherence,
        reason: `${baseReason}${keyNote}`
      };
    }
  };
}

function updateCard(card) {
  const id = card.dataset.algorithm;
  const algorithm = algorithms[id];
  if (!algorithm) return null;
  const options = {};
  card.querySelectorAll('[data-option-input]').forEach((input) => {
    const key = input.dataset.option;
    if (!key) return;
    if (input.type === 'number' || input.type === 'range') {
      options[key] = Number(input.value);
    } else {
      options[key] = input.value;
    }
    const display = card.querySelector(`[data-option-display="${key}"]`);
    if (display) {
      display.textContent = input.value;
    }
  });

  const inputValue = textInput ? textInput.value : '';
  let encodeResult = '';
  let decodeResult = '';
  try {
    encodeResult = algorithm.encode(inputValue, options) || '';
  } catch (error) {
    encodeResult = '';
  }
  try {
    decodeResult = algorithm.decode(inputValue, options) || '';
  } catch (error) {
    decodeResult = '';
  }

  const encodeTarget = card.querySelector('[data-encode]');
  const decodeTarget = card.querySelector('[data-decode]');
  if (encodeTarget) {
    encodeTarget.textContent = encodeResult || '—';
  }
  if (decodeTarget) {
    decodeTarget.textContent = decodeResult || '—';
  }

  const heuristicTarget = card.querySelector('[data-heuristic]');
  if (!heuristicTarget) {
    return null;
  }

  const heuristicsResult = algorithm.heuristics
    ? algorithm.heuristics(inputValue, options)
    : { score: 0, reason: 'No heuristics available.' };

  if (!heuristicsToggle || !heuristicsToggle.checked) {
    heuristicTarget.textContent = 'Heuristics disabled.';
    heuristicTarget.dataset.level = '';
    return { id, score: 0, label: card.dataset.algorithmLabel, title: card.dataset.algorithmTitle, reason: '' };
  }

  heuristicTarget.textContent = heuristicsResult.reason;
  heuristicTarget.dataset.level = heuristicsResult.score > 0.66 ? 'high' : heuristicsResult.score > 0.33 ? 'medium' : 'low';
  return {
    id,
    score: heuristicsResult.score || 0,
    label: card.dataset.algorithmLabel,
    title: card.dataset.algorithmTitle,
    reason: heuristicsResult.reason
  };
}

function updateHeuristicsSummary(results) {
  if (!heuristicsSummary) return;
  heuristicsSummary.innerHTML = '';
  if (!heuristicsToggle || !heuristicsToggle.checked) {
    const li = document.createElement('li');
    li.textContent = 'Enable heuristics to see ranked decoder suggestions.';
    heuristicsSummary.append(li);
    return;
  }

  const filtered = results
    .filter(Boolean)
    .filter((item) => item.score && item.score > 0.05)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (!filtered.length) {
    const li = document.createElement('li');
    li.textContent = 'No strong heuristic matches yet — try adjusting options or a different sample.';
    heuristicsSummary.append(li);
    return;
  }

  filtered.forEach((item) => {
    const li = document.createElement('li');
    const score = Math.round((item.score || 0) * 100);
    li.innerHTML = `<span class="score">${score.toString().padStart(2, '0')}%</span> ${item.title}: ${item.reason}`;
    heuristicsSummary.append(li);
  });
}

function updateAll() {
  const results = cards.map((card) => updateCard(card));
  updateHeuristicsSummary(results);
}

cards.forEach((card) => {
  card.querySelectorAll('[data-option-input]').forEach((input) => {
    input.addEventListener('input', updateAll);
    input.addEventListener('change', updateAll);
  });
});

if (textInput) {
  textInput.addEventListener('input', updateAll);
}

if (heuristicsToggle) {
  heuristicsToggle.addEventListener('change', updateAll);
}

document.querySelectorAll('.btn[data-action]').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (!textInput) return;
    if (action === 'clear') {
      textInput.value = '';
      updateAll();
    }
    if (action === 'sample') {
      textInput.value = 'Gur synt vf va gur qrpevcgvba.';
      updateAll();
    }
  });
});

updateAll();
