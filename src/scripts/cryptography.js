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
