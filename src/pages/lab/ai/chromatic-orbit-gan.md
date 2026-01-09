---
layout: ../../../layouts/Layout.astro
title: "Chromatic Orbit GAN"
description: "Spiral-and-wavefield GAN that paints 64×64 orbital textures directly in the browser."
---
<div class="container">
  <header class="page-header">
    <div class="page-header__meta">
      <span class="section-index">Lab / AI / AI-002</span>
      <span class="classification classification--accent">Interactive Demo</span>
    </div>
    <h1 class="page-header__title">Chromatic Orbit GAN</h1>
    <p class="page-header__subtitle">64×64 Orbital Texture Generator</p>
  </header>

  <p class="mono" style="margin-bottom: var(--space-4);"><a href="/lab/ai/">← Back to AI Lab index</a></p>

## Mission Profile

Chromatic Orbit GAN renders psychedelic orbital textures by blending six handcrafted color basis fields. The generator accepts
an eight-dimensional latent vector, runs it through a two-layer mixer, and outputs signed coefficients that steer spiral, radial,
and interference fields. Everything executes in vanilla JavaScript with typed arrays—no WebGL, no WASM, and no heavyweight
runtime.

## Generator Architecture

| Stage | Details |
| --- | --- |
| Latent sampler | 8 uniform components in \[-1, 1] seeded with Mulberry32 for deterministic playback. |
| Hidden mixer | Dense 8×8 layer with tanh activation produces intermediate orbital descriptors. |
| Coefficient head | Dense 6×8 layer with tanh output, normalized to maintain balanced color energy. |
| Basis decoder | Six 64×64 RGB basis fields generated analytically (spirals, beams, ripples, interference). |
| Output | Canvas rendering with configurable temperature (energy) and optional autoplay loop. |

## Try it live

<section class="gan-panel">
  <div class="gan-controls">
    <div class="gan-control">
      <label class="mono" for="orbit-seed">Seed</label>
      <input id="orbit-seed" type="number" inputmode="numeric" min="0" step="1" data-seed value="4242" />
    </div>
    <div class="gan-control">
      <label class="mono" for="orbit-energy">Energy</label>
      <input
        id="orbit-energy"
        type="range"
        min="0.4"
        max="1.6"
        step="0.05"
        value="1.0"
        data-energy
        aria-describedby="orbit-energy-value"
      />
      <span id="orbit-energy-value" class="gan-value" data-energy-value>1.00</span>
    </div>
    <div class="gan-actions">
      <button type="button" data-generate>Generate frame</button>
      <button type="button" data-randomize>Randomize seed</button>
      <button type="button" data-auto aria-pressed="false">Start autoplay</button>
    </div>
  </div>
  <div class="gan-grid gan-grid--wide" data-gallery aria-live="polite"></div>
  <details class="gan-debug">
    <summary class="mono">Coefficient readout</summary>
    <pre data-coeffs class="gan-debug__output"></pre>
  </details>
</section>

## Implementation Notes

- Basis fields are generated analytically from sine, cosine, and polar transforms, keeping the payload at pure code.
- Coefficient normalization preserves relative intensity so colors stay vivid without clipping.
- Autoplay increments the seed with a prime stride so loops explore the latent space evenly over long runs.

<script type="module">
  const SIZE = 64;
  const LATENT_SIZE = 8;
  const HIDDEN_SIZE = 8;
  const BASIS_COUNT = 6;
  const SAMPLE_COUNT = 6;
  const MIN_ENERGY = 0.4;
  const MAX_ENERGY = 1.6;

  const gallery = document.querySelector('[data-gallery]');
  const seedInput = document.querySelector('[data-seed]');
  const energyInput = document.querySelector('[data-energy]');
  const energyValue = document.querySelector('[data-energy-value]');
  const generateButton = document.querySelector('[data-generate]');
  const randomizeButton = document.querySelector('[data-randomize]');
  const autoButton = document.querySelector('[data-auto]');
  const coeffOutput = document.querySelector('[data-coeffs]');

  const initialEnergyValue = energyInput ? energyInput.value : undefined;
  const state = {
    seed: Math.floor(Math.random() * 1000000) >>> 0,
    energy: Number(initialEnergyValue !== undefined && initialEnergyValue !== null && initialEnergyValue !== '' ? initialEnergyValue : 1.0),
    autoplay: false,
    timer: null,
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const mulberry32 = (seed) => {
    let t = seed >>> 0;
    return () => {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  };

  const createField = (generator) => {
    const length = SIZE * SIZE;
    const r = new Float32Array(length);
    const g = new Float32Array(length);
    const b = new Float32Array(length);

    for (let y = 0; y < SIZE; y += 1) {
      for (let x = 0; x < SIZE; x += 1) {
        const nx = (x / (SIZE - 1)) * 2 - 1;
        const ny = (y / (SIZE - 1)) * 2 - 1;
        const radius = Math.sqrt(nx * nx + ny * ny);
        const angle = Math.atan2(ny, nx);
        const index = y * SIZE + x;
        const sample = generator({ nx, ny, radius, angle, index });
        const base = sample.wave ?? 0;
        const saturation = sample.saturation ?? 1;
        const bias = sample.bias ?? 0;
        const wave = base + bias;
        r[index] = Math.sin(wave) * saturation;
        g[index] = Math.sin(wave + 2.09439510239) * saturation;
        b[index] = Math.sin(wave + 4.18879020478) * saturation;
      }
    }

    return { r, g, b };
  };

  const spiralField = createField(({ radius, angle }) => ({
    wave: angle * 5.5 + radius * 9.2,
    saturation: 0.9 - radius * 0.4,
  }));

  const starburstField = createField(({ angle, radius }) => ({
    wave: Math.cos(angle * 12) * 3.2 + radius * 8.4,
    saturation: 0.85,
  }));

  const rippleField = createField(({ radius }) => ({
    wave: radius * radius * 18.0,
    saturation: 1.0 - radius * 0.35,
  }));

  const interferenceField = createField(({ nx, ny }) => ({
    wave: nx * 9.0 + Math.sin(ny * 4.0) * 3.6,
    saturation: 0.75,
  }));

  const orbitField = createField(({ nx, ny, angle }) => ({
    wave: Math.sin(angle * 4.0) * 4.5 + nx * 6.4 - ny * 5.2,
    saturation: 0.95,
  }));

  const plasmaField = createField(({ nx, ny }) => ({
    wave: Math.sin(nx * 7.6) + Math.cos(ny * 8.2) + nx * ny * 5.3,
    saturation: 0.88,
  }));

  const basisFields = [spiralField, starburstField, rippleField, interferenceField, orbitField, plasmaField];

  const weights1 = [
    new Float32Array([1.15, -0.62, 0.48, -0.35, 0.92, -1.08, 0.74, -0.53]),
    new Float32Array([-0.58, 1.12, -0.72, 0.68, -0.34, 0.41, -0.93, 0.77]),
    new Float32Array([0.42, 0.55, -1.06, 0.87, -0.29, 0.36, 0.52, -0.68]),
    new Float32Array([-0.91, -0.44, 0.63, 1.04, -0.57, 0.28, 0.71, -0.32]),
    new Float32Array([0.66, -0.38, -0.45, 0.59, 1.08, -0.72, 0.34, 0.41]),
    new Float32Array([-0.37, 0.83, 0.92, -0.61, 0.25, -0.96, 0.78, 0.53]),
    new Float32Array([0.74, 0.49, -0.28, -0.82, 0.63, 0.91, -0.57, -0.34]),
    new Float32Array([-0.48, -0.72, 0.85, 0.32, -0.94, 0.68, 0.44, 0.97]),
  ];

  const biases1 = new Float32Array([0.12, -0.08, 0.05, -0.11, 0.07, -0.04, 0.06, -0.09]);

  const weights2 = [
    new Float32Array([0.82, -0.63, 0.51, -0.44, 0.37, -0.58, 0.66, -0.41]),
    new Float32Array([-0.57, 0.78, -0.69, 0.62, -0.33, 0.45, -0.54, 0.71]),
    new Float32Array([0.48, 0.36, -0.52, 0.77, -0.66, 0.59, -0.32, 0.41]),
    new Float32Array([-0.63, -0.44, 0.68, 0.52, -0.71, 0.34, 0.57, -0.48]),
    new Float32Array([0.55, -0.29, -0.36, 0.41, 0.72, -0.64, 0.33, 0.52]),
    new Float32Array([-0.42, 0.61, 0.74, -0.53, 0.28, -0.57, 0.69, 0.45]),
  ];

  const biases2 = new Float32Array([0.05, -0.04, 0.02, -0.03, 0.01, -0.02]);

  const activate = (latent) => {
    const hidden = new Float32Array(HIDDEN_SIZE);
    for (let i = 0; i < HIDDEN_SIZE; i += 1) {
      let sum = biases1[i];
      const weights = weights1[i];
      for (let j = 0; j < LATENT_SIZE; j += 1) {
        sum += weights[j] * latent[j];
      }
      hidden[i] = Math.tanh(sum);
    }

    const coeffs = new Float32Array(BASIS_COUNT);
    for (let i = 0; i < BASIS_COUNT; i += 1) {
      let sum = biases2[i];
      const weights = weights2[i];
      for (let j = 0; j < HIDDEN_SIZE; j += 1) {
        sum += weights[j] * hidden[j];
      }
      coeffs[i] = Math.tanh(sum);
    }

    let norm = 0;
    for (let i = 0; i < BASIS_COUNT; i += 1) {
      norm += Math.abs(coeffs[i]);
    }
    norm = norm === 0 ? 1 : norm;

    for (let i = 0; i < BASIS_COUNT; i += 1) {
      coeffs[i] /= norm;
    }

    return coeffs;
  };

  const sampleLatent = (prng) => {
    const latent = new Float32Array(LATENT_SIZE);
    for (let i = 0; i < LATENT_SIZE; i += 1) {
      latent[i] = prng() * 2 - 1;
    }
    return latent;
  };

  const renderImage = (coeffs, energy) => {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    canvas.className = 'gan-canvas gan-canvas--smooth';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Generated orbital pattern');

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return canvas;
    }

    const imageData = ctx.createImageData(SIZE, SIZE);
    const gain = clamp(energy, MIN_ENERGY, MAX_ENERGY);

    for (let index = 0; index < SIZE * SIZE; index += 1) {
      let r = 0;
      let g = 0;
      let b = 0;
      for (let i = 0; i < BASIS_COUNT; i += 1) {
        const weight = coeffs[i] * gain;
        const basis = basisFields[i];
        r += weight * basis.r[index];
        g += weight * basis.g[index];
        b += weight * basis.b[index];
      }
      const offset = index * 4;
      imageData.data[offset] = Math.round(clamp((r + 1) / 2, 0, 1) * 255);
      imageData.data[offset + 1] = Math.round(clamp((g + 1) / 2, 0, 1) * 255);
      imageData.data[offset + 2] = Math.round(clamp((b + 1) / 2, 0, 1) * 255);
      imageData.data[offset + 3] = 255;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  const summarize = (coeffs) =>
    coeffs
      .map((value, index) => `f${index + 1}: ${value.toFixed(2)}`)
      .join('  ');

  const render = () => {
    if (!gallery) return;
    gallery.innerHTML = '';
    const prng = mulberry32(state.seed);
    const summaries = [];
    for (let i = 0; i < SAMPLE_COUNT; i += 1) {
      const latent = sampleLatent(prng);
      const coeffs = activate(latent);
      summaries.push(summarize(coeffs));
      gallery.appendChild(renderImage(coeffs, state.energy));
    }

    if (coeffOutput) {
      coeffOutput.textContent = summaries.join('\n');
    }

    if (seedInput) {
      seedInput.value = String(state.seed >>> 0);
    }

    if (energyValue) {
      energyValue.textContent = state.energy.toFixed(2);
    }
  };

  const stopAutoplay = () => {
    state.autoplay = false;
    if (state.timer !== null) {
      window.clearTimeout(state.timer);
      state.timer = null;
    }
    if (autoButton) {
      autoButton.textContent = 'Start autoplay';
      autoButton.setAttribute('aria-pressed', 'false');
    }
  };

  const stepAutoplay = () => {
    if (!state.autoplay) {
      return;
    }
    state.seed = (state.seed + 97) >>> 0;
    render();
    state.timer = window.setTimeout(stepAutoplay, 1400);
  };

  const startAutoplay = () => {
    if (state.autoplay) {
      return;
    }
    state.autoplay = true;
    if (autoButton) {
      autoButton.textContent = 'Stop autoplay';
      autoButton.setAttribute('aria-pressed', 'true');
    }
    stepAutoplay();
  };

  if (seedInput) {
    seedInput.addEventListener('change', (event) => {
      const nextSeed = Number.parseInt(event.target.value, 10);
      if (Number.isFinite(nextSeed)) {
        state.seed = nextSeed >>> 0;
        render();
      }
    });
  }

  if (energyInput) {
    energyInput.addEventListener('input', (event) => {
      const next = Number.parseFloat(event.target.value);
      if (Number.isFinite(next)) {
        state.energy = clamp(next, MIN_ENERGY, MAX_ENERGY);
        render();
      }
    });
  }

  if (generateButton) {
    generateButton.addEventListener('click', () => {
      state.seed = (state.seed + 53) >>> 0;
      render();
    });
  }

  if (randomizeButton) {
    randomizeButton.addEventListener('click', () => {
      state.seed = Math.floor(Math.random() * 0xffffffff) >>> 0;
      render();
    });
  }

  if (autoButton) {
    autoButton.addEventListener('click', () => {
      if (state.autoplay) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAutoplay();
    }
  });

  render();
</script>
</div>
