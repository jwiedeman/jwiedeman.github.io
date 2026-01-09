/**
 * CyberChef-style Cryptography Lab
 * Recipe-based encoding/decoding with chainable operations
 */

// ============================================
// OPERATION DEFINITIONS
// ============================================

const operations = {
  // Encoding operations
  base64: {
    name: 'Base64',
    encode: (input) => btoa(unescape(encodeURIComponent(input))),
    decode: (input) => {
      try {
        return decodeURIComponent(escape(atob(input.replace(/\s/g, ''))));
      } catch { return '[Invalid Base64]'; }
    }
  },
  base32: {
    name: 'Base32',
    encode: (input) => base32Encode(input),
    decode: (input) => base32Decode(input)
  },
  base58: {
    name: 'Base58',
    encode: (input) => base58Encode(input),
    decode: (input) => base58Decode(input)
  },
  hex: {
    name: 'Hex',
    encode: (input) => Array.from(new TextEncoder().encode(input)).map(b => b.toString(16).padStart(2, '0')).join(' '),
    decode: (input) => {
      try {
        const hex = input.replace(/\s/g, '');
        const bytes = hex.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) || [];
        return new TextDecoder().decode(new Uint8Array(bytes));
      } catch { return '[Invalid Hex]'; }
    }
  },
  binary: {
    name: 'Binary',
    encode: (input) => Array.from(new TextEncoder().encode(input)).map(b => b.toString(2).padStart(8, '0')).join(' '),
    decode: (input) => {
      try {
        const bins = input.replace(/\s/g, '').match(/.{1,8}/g) || [];
        const bytes = bins.map(b => parseInt(b, 2));
        return new TextDecoder().decode(new Uint8Array(bytes));
      } catch { return '[Invalid Binary]'; }
    }
  },
  ascii85: {
    name: 'ASCII85',
    encode: (input) => ascii85Encode(input),
    decode: (input) => ascii85Decode(input)
  },
  url: {
    name: 'URL Encode',
    encode: (input) => encodeURIComponent(input),
    decode: (input) => {
      try { return decodeURIComponent(input); }
      catch { return '[Invalid URL encoding]'; }
    }
  },
  morse: {
    name: 'Morse Code',
    encode: (input) => morseEncode(input),
    decode: (input) => morseDecode(input)
  },

  // Classical ciphers
  caesar: {
    name: 'Caesar Cipher',
    options: [{ name: 'shift', type: 'number', default: 3, min: 1, max: 25 }],
    encode: (input, opts) => caesarShift(input, opts.shift || 3),
    decode: (input, opts) => caesarShift(input, 26 - ((opts.shift || 3) % 26))
  },
  rot13: {
    name: 'ROT13',
    encode: (input) => caesarShift(input, 13),
    decode: (input) => caesarShift(input, 13)
  },
  atbash: {
    name: 'Atbash',
    encode: (input) => atbashTransform(input),
    decode: (input) => atbashTransform(input)
  },
  vigenere: {
    name: 'Vigenère',
    options: [{ name: 'key', type: 'text', default: 'SECRET' }],
    encode: (input, opts) => vigenereTransform(input, opts.key || 'SECRET', false),
    decode: (input, opts) => vigenereTransform(input, opts.key || 'SECRET', true)
  },
  affine: {
    name: 'Affine Cipher',
    options: [
      { name: 'a', type: 'number', default: 5, min: 1, max: 25 },
      { name: 'b', type: 'number', default: 8, min: 0, max: 25 }
    ],
    encode: (input, opts) => affineTransform(input, opts.a || 5, opts.b || 8, false),
    decode: (input, opts) => affineTransform(input, opts.a || 5, opts.b || 8, true)
  },
  railfence: {
    name: 'Rail Fence',
    options: [{ name: 'rails', type: 'number', default: 3, min: 2, max: 10 }],
    encode: (input, opts) => railFenceEncode(input, opts.rails || 3),
    decode: (input, opts) => railFenceDecode(input, opts.rails || 3)
  },

  // Modern
  xor: {
    name: 'XOR',
    options: [{ name: 'key', type: 'text', default: 'key' }],
    encode: (input, opts) => xorTransform(input, opts.key || 'key'),
    decode: (input, opts) => xorTransform(input, opts.key || 'key')
  },

  // Utilities
  reverse: {
    name: 'Reverse',
    encode: (input) => input.split('').reverse().join(''),
    decode: (input) => input.split('').reverse().join('')
  },
  uppercase: {
    name: 'To Uppercase',
    encode: (input) => input.toUpperCase(),
    decode: (input) => input.toLowerCase()
  },
  lowercase: {
    name: 'To Lowercase',
    encode: (input) => input.toLowerCase(),
    decode: (input) => input.toUpperCase()
  },
  removewhitespace: {
    name: 'Remove Whitespace',
    encode: (input) => input.replace(/\s/g, ''),
    decode: (input) => input
  },
  charcount: {
    name: 'Character Count',
    encode: (input) => `Length: ${input.length} chars, ${new TextEncoder().encode(input).length} bytes`,
    decode: (input) => input
  }
};

// ============================================
// CIPHER IMPLEMENTATIONS
// ============================================

function caesarShift(input, shift) {
  const n = ((shift % 26) + 26) % 26;
  return input.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode((c.charCodeAt(0) - base + n) % 26 + base);
  });
}

function atbashTransform(input) {
  return input.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(base + 25 - (c.charCodeAt(0) - base));
  });
}

function vigenereTransform(input, key, decode) {
  const k = key.toUpperCase().replace(/[^A-Z]/g, '') || 'A';
  let ki = 0;
  return input.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    const shift = k.charCodeAt(ki++ % k.length) - 65;
    const dir = decode ? 26 - shift : shift;
    return String.fromCharCode((c.charCodeAt(0) - base + dir) % 26 + base);
  });
}

function affineTransform(input, a, b, decode) {
  const modInverse = (a, m) => {
    for (let x = 1; x < m; x++) if ((a * x) % m === 1) return x;
    return 1;
  };
  const aInv = modInverse(a, 26);
  return input.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    const x = c.charCodeAt(0) - base;
    const y = decode ? (aInv * (x - b + 26)) % 26 : (a * x + b) % 26;
    return String.fromCharCode(y + base);
  });
}

function railFenceEncode(input, rails) {
  if (rails < 2) return input;
  const fence = Array.from({ length: rails }, () => []);
  let rail = 0, dir = 1;
  for (const c of input) {
    fence[rail].push(c);
    rail += dir;
    if (rail === 0 || rail === rails - 1) dir *= -1;
  }
  return fence.flat().join('');
}

function railFenceDecode(input, rails) {
  if (rails < 2) return input;
  const len = input.length;
  const fence = Array.from({ length: rails }, () => []);
  const pattern = [];
  let rail = 0, dir = 1;
  for (let i = 0; i < len; i++) {
    pattern.push(rail);
    rail += dir;
    if (rail === 0 || rail === rails - 1) dir *= -1;
  }
  const counts = pattern.reduce((acc, r) => { acc[r]++; return acc; }, Array(rails).fill(0));
  let idx = 0;
  for (let r = 0; r < rails; r++) {
    for (let c = 0; c < counts[r]; c++) fence[r].push(input[idx++]);
  }
  const indices = Array(rails).fill(0);
  return pattern.map(r => fence[r][indices[r]++]).join('');
}

function xorTransform(input, key) {
  if (!key) return input;
  return Array.from(input).map((c, i) =>
    String.fromCharCode(c.charCodeAt(0) ^ key.charCodeAt(i % key.length))
  ).join('');
}

// Morse code
const MORSE = {
  'A':'.-','B':'-...','C':'-.-.','D':'-..','E':'.','F':'..-.','G':'--.','H':'....',
  'I':'..','J':'.---','K':'-.-','L':'.-..','M':'--','N':'-.','O':'---','P':'.--.',
  'Q':'--.-','R':'.-.','S':'...','T':'-','U':'..-','V':'...-','W':'.--','X':'-..-',
  'Y':'-.--','Z':'--..','0':'-----','1':'.----','2':'..---','3':'...--','4':'....-',
  '5':'.....','6':'-....','7':'--...','8':'---..','9':'----.', ' ': '/'
};
const MORSE_REV = Object.fromEntries(Object.entries(MORSE).map(([k,v]) => [v,k]));

function morseEncode(input) {
  return input.toUpperCase().split('').map(c => MORSE[c] || c).join(' ');
}

function morseDecode(input) {
  return input.split(' ').map(c => MORSE_REV[c] || c).join('');
}

// Base32
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32Encode(input) {
  const bytes = new TextEncoder().encode(input);
  let bits = '', result = '';
  for (const b of bytes) bits += b.toString(2).padStart(8, '0');
  while (bits.length % 5) bits += '0';
  for (let i = 0; i < bits.length; i += 5) result += B32[parseInt(bits.slice(i, i+5), 2)];
  while (result.length % 8) result += '=';
  return result;
}

function base32Decode(input) {
  try {
    const clean = input.toUpperCase().replace(/=+$/, '');
    let bits = '';
    for (const c of clean) {
      const idx = B32.indexOf(c);
      if (idx < 0) return '[Invalid Base32]';
      bits += idx.toString(2).padStart(5, '0');
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) bytes.push(parseInt(bits.slice(i, i+8), 2));
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch { return '[Invalid Base32]'; }
}

// Base58
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
function base58Encode(input) {
  const bytes = new TextEncoder().encode(input);
  let num = 0n;
  for (const b of bytes) num = num * 256n + BigInt(b);
  let result = '';
  while (num > 0) { result = B58[Number(num % 58n)] + result; num /= 58n; }
  for (const b of bytes) { if (b === 0) result = '1' + result; else break; }
  return result || '1';
}

function base58Decode(input) {
  try {
    let num = 0n;
    for (const c of input) {
      const idx = B58.indexOf(c);
      if (idx < 0) return '[Invalid Base58]';
      num = num * 58n + BigInt(idx);
    }
    const hex = num.toString(16).padStart(2, '0');
    const bytes = hex.match(/.{2}/g)?.map(h => parseInt(h, 16)) || [];
    let leading = 0;
    for (const c of input) { if (c === '1') leading++; else break; }
    return new TextDecoder().decode(new Uint8Array([...Array(leading).fill(0), ...bytes]));
  } catch { return '[Invalid Base58]'; }
}

// ASCII85
function ascii85Encode(input) {
  const bytes = new TextEncoder().encode(input);
  let result = '<~';
  for (let i = 0; i < bytes.length; i += 4) {
    let val = 0;
    const chunk = bytes.slice(i, i + 4);
    for (let j = 0; j < 4; j++) val = val * 256 + (chunk[j] || 0);
    if (val === 0 && chunk.length === 4) { result += 'z'; continue; }
    const chars = [];
    for (let j = 4; j >= 0; j--) { chars[j] = String.fromCharCode((val % 85) + 33); val = Math.floor(val / 85); }
    result += chars.slice(0, chunk.length + 1).join('');
  }
  return result + '~>';
}

function ascii85Decode(input) {
  try {
    let data = input.replace(/^<~|~>$/g, '').replace(/\s/g, '');
    data = data.replace(/z/g, '!!!!!');
    const bytes = [];
    for (let i = 0; i < data.length; i += 5) {
      let chunk = data.slice(i, i + 5);
      while (chunk.length < 5) chunk += 'u';
      let val = 0;
      for (const c of chunk) val = val * 85 + (c.charCodeAt(0) - 33);
      const chunkBytes = [];
      for (let j = 3; j >= 0; j--) { chunkBytes[j] = val & 0xff; val >>= 8; }
      const keep = data.slice(i, i + 5).length - 1;
      bytes.push(...chunkBytes.slice(0, keep));
    }
    return new TextDecoder().decode(new Uint8Array(bytes));
  } catch { return '[Invalid ASCII85]'; }
}

// ============================================
// RECIPE MANAGEMENT
// ============================================

let recipe = [];
let recipeId = 0;

function addToRecipe(opId, mode = 'encode') {
  const op = operations[opId];
  if (!op) return;

  const item = {
    id: recipeId++,
    opId,
    mode,
    options: {}
  };

  // Set default options
  if (op.options) {
    op.options.forEach(opt => {
      item.options[opt.name] = opt.default;
    });
  }

  recipe.push(item);
  renderRecipe();
  if (document.getElementById('auto-bake')?.checked) bake();
}

function removeFromRecipe(itemId) {
  recipe = recipe.filter(r => r.id !== itemId);
  renderRecipe();
  if (document.getElementById('auto-bake')?.checked) bake();
}

function moveRecipeItem(itemId, direction) {
  const idx = recipe.findIndex(r => r.id === itemId);
  if (idx < 0) return;
  const newIdx = idx + direction;
  if (newIdx < 0 || newIdx >= recipe.length) return;
  [recipe[idx], recipe[newIdx]] = [recipe[newIdx], recipe[idx]];
  renderRecipe();
  if (document.getElementById('auto-bake')?.checked) bake();
}

function updateRecipeOption(itemId, optName, value) {
  const item = recipe.find(r => r.id === itemId);
  if (item) {
    item.options[optName] = value;
    if (document.getElementById('auto-bake')?.checked) bake();
  }
}

function toggleRecipeMode(itemId) {
  const item = recipe.find(r => r.id === itemId);
  if (item) {
    item.mode = item.mode === 'encode' ? 'decode' : 'encode';
    renderRecipe();
    if (document.getElementById('auto-bake')?.checked) bake();
  }
}

function clearRecipe() {
  recipe = [];
  renderRecipe();
  document.getElementById('output').value = '';
}

function renderRecipe() {
  const list = document.getElementById('recipe-list');
  if (!list) return;

  if (recipe.length === 0) {
    list.innerHTML = '<p class="cyberchef__recipe-empty mono">Click operations to add them here</p>';
    return;
  }

  list.innerHTML = recipe.map((item, idx) => {
    const op = operations[item.opId];
    const optsHtml = op.options ? op.options.map(opt => `
      <div class="cyberchef__recipe-item-option">
        <label>${opt.name}:</label>
        ${opt.type === 'number'
          ? `<input type="number" value="${item.options[opt.name]}" min="${opt.min || 0}" max="${opt.max || 100}" data-item="${item.id}" data-opt="${opt.name}">`
          : `<input type="text" value="${item.options[opt.name] || ''}" data-item="${item.id}" data-opt="${opt.name}">`
        }
      </div>
    `).join('') : '';

    return `
      <div class="cyberchef__recipe-item" data-item-id="${item.id}">
        <div class="cyberchef__recipe-item-header">
          <span class="cyberchef__recipe-item-name mono">${op.name}</span>
          <div class="cyberchef__recipe-item-controls">
            <button class="cyberchef__recipe-item-btn mono" data-action="mode" data-item="${item.id}" title="Toggle encode/decode">${item.mode === 'encode' ? 'ENC' : 'DEC'}</button>
            <button class="cyberchef__recipe-item-btn mono" data-action="up" data-item="${item.id}" ${idx === 0 ? 'disabled' : ''}>↑</button>
            <button class="cyberchef__recipe-item-btn mono" data-action="down" data-item="${item.id}" ${idx === recipe.length - 1 ? 'disabled' : ''}>↓</button>
            <button class="cyberchef__recipe-item-btn cyberchef__recipe-item-btn--delete mono" data-action="delete" data-item="${item.id}">×</button>
          </div>
        </div>
        ${optsHtml ? `<div class="cyberchef__recipe-item-options">${optsHtml}</div>` : ''}
      </div>
    `;
  }).join('');

  // Add event listeners
  list.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const itemId = parseInt(btn.dataset.item);
      switch (btn.dataset.action) {
        case 'delete': removeFromRecipe(itemId); break;
        case 'up': moveRecipeItem(itemId, -1); break;
        case 'down': moveRecipeItem(itemId, 1); break;
        case 'mode': toggleRecipeMode(itemId); break;
      }
    });
  });

  list.querySelectorAll('[data-opt]').forEach(input => {
    input.addEventListener('input', () => {
      const itemId = parseInt(input.dataset.item);
      const value = input.type === 'number' ? parseInt(input.value) : input.value;
      updateRecipeOption(itemId, input.dataset.opt, value);
    });
  });
}

// ============================================
// BAKE (EXECUTE RECIPE)
// ============================================

function bake() {
  const input = document.getElementById('input')?.value || '';
  const output = document.getElementById('output');
  if (!output) return;

  if (recipe.length === 0) {
    output.value = input;
    return;
  }

  let result = input;

  for (const item of recipe) {
    const op = operations[item.opId];
    if (!op) continue;

    try {
      const fn = item.mode === 'encode' ? op.encode : op.decode;
      result = fn(result, item.options);
    } catch (e) {
      result = `[Error in ${op.name}: ${e.message}]`;
      break;
    }
  }

  output.value = result;
}

// ============================================
// UI INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Operation buttons
  document.querySelectorAll('[data-op]').forEach(btn => {
    btn.addEventListener('click', () => addToRecipe(btn.dataset.op));
  });

  // Search filter
  const search = document.getElementById('op-search');
  if (search) {
    search.addEventListener('input', () => {
      const q = search.value.toLowerCase();
      document.querySelectorAll('[data-op]').forEach(btn => {
        const name = btn.textContent.toLowerCase();
        const id = btn.dataset.op.toLowerCase();
        btn.hidden = q && !name.includes(q) && !id.includes(q);
      });
      document.querySelectorAll('.cyberchef__category').forEach(cat => {
        const visible = cat.querySelectorAll('[data-op]:not([hidden])').length > 0;
        cat.style.display = visible ? '' : 'none';
      });
    });
  }

  // Clear recipe
  document.getElementById('clear-recipe')?.addEventListener('click', clearRecipe);

  // Bake button
  document.getElementById('bake-btn')?.addEventListener('click', bake);

  // Auto bake on input
  document.getElementById('input')?.addEventListener('input', () => {
    if (document.getElementById('auto-bake')?.checked) bake();
  });

  // Clear input
  document.getElementById('clear-input')?.addEventListener('click', () => {
    const input = document.getElementById('input');
    if (input) { input.value = ''; bake(); }
  });

  // Load sample
  document.getElementById('load-sample')?.addEventListener('click', () => {
    const input = document.getElementById('input');
    if (input) {
      input.value = 'SGVsbG8gV29ybGQhIFRoaXMgaXMgYSB0ZXN0IG1lc3NhZ2Uu';
      bake();
    }
  });

  // Copy output
  document.getElementById('copy-output')?.addEventListener('click', async () => {
    const output = document.getElementById('output');
    if (output) {
      await navigator.clipboard.writeText(output.value);
    }
  });

  // Use output as input
  document.getElementById('use-as-input')?.addEventListener('click', () => {
    const input = document.getElementById('input');
    const output = document.getElementById('output');
    if (input && output) {
      input.value = output.value;
      bake();
    }
  });

  renderRecipe();
});
