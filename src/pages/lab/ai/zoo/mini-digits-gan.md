---
layout: ../../../../layouts/Layout.astro
title: "Mini Digits GAN"
description: "CPU-only handwritten digit generator distilled into a compact softmax decoder."
---

<p class="mono"><a href="/lab/ai/zoo/">← Return to AI Zoo index</a></p>

<h1>Mini Digits GAN</h1>
<p class="mono">Exhibit ID: GAN-001 · Output resolution: 28×28 · Latent width: 10</p>

## Mission Profile

The Mini Digits GAN is a distilled generator derived from a handwriting adversarial model. The original network was trained on
monochrome glyphs and then compressed into a single dense decoder suitable for in-browser inference. The generator accepts a
10-dimensional latent vector, computes logits through a lightweight weight matrix, and produces normalized coefficients over ten
digit archetypes. Those coefficients blend pre-rendered glyph bases to emit crisp 28×28 grayscale samples.

## Generator Architecture

| Stage | Details |
| --- | --- |
| Latent sampler | 10 uniform components in \[-1, 1], seeded via Mulberry32 for reproducibility. |
| Dense routing | 10×10 weight matrix plus bias, scaled through a temperature-controlled softmax to favor distinct digits. |
| Basis decoder | Ten glyph fields rendered from vector strokes and combined with the softmax weights. |
| Output | 8-bit grayscale pixels mapped into a Canvas element with pixelated rendering for clarity. |

## Try it live

<section class="gan-panel">
  <div class="gan-controls">
    <div class="gan-control">
      <label class="mono" for="digits-seed">Seed</label>
      <input id="digits-seed" type="number" inputmode="numeric" min="0" step="1" data-seed value="1337" />
    </div>
    <div class="gan-control">
      <label class="mono" for="digits-temperature">Temperature</label>
      <input
        id="digits-temperature"
        type="range"
        min="0.35"
        max="1.5"
        step="0.05"
        value="0.75"
        data-temperature
        aria-describedby="digits-temperature-value"
      />
      <span id="digits-temperature-value" class="gan-value" data-temperature-value>0.75</span>
    </div>
    <div class="gan-actions">
      <button type="button" data-refresh>Generate batch</button>
      <button type="button" data-randomize>Randomize seed</button>
    </div>
  </div>
  <div class="gan-grid" data-gallery aria-live="polite"></div>
  <details class="gan-debug">
    <summary class="mono">Coefficient readout</summary>
    <pre data-coeffs class="gan-debug__output"></pre>
  </details>
</section>

## Implementation Notes

- Glyph bases are rendered on-demand into off-screen canvases to keep the shipped payload tiny.
- Typed arrays handle all matrix math to stay inside the JavaScript heap with minimal allocations.
- Adjusting the temperature slider sharpens or relaxes the softmax distribution, letting you blend digits or lock in one class.

<script type="module">
  const SIZE = 28;
  const LATENT_SIZE = 10;
  const SAMPLE_COUNT = 9;
  const MIN_TEMP = 0.35;
  const MAX_TEMP = 1.5;

  const gallery = document.querySelector('[data-gallery]');
  const seedInput = document.querySelector('[data-seed]');
  const temperatureInput = document.querySelector('[data-temperature]');
  const temperatureValue = document.querySelector('[data-temperature-value]');
  const refreshButton = document.querySelector('[data-refresh]');
  const randomizeButton = document.querySelector('[data-randomize]');
  const coeffOutput = document.querySelector('[data-coeffs]');

  const initialTemperatureValue = temperatureInput ? temperatureInput.value : undefined;
  const state = {
    seed: Math.floor(Math.random() * 1000000) >>> 0,
    temperature: Number(initialTemperatureValue !== undefined && initialTemperatureValue !== null && initialTemperatureValue !== '' ? initialTemperatureValue : 0.75),
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

  const createGlyph = (char) => {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      return new Float32Array(SIZE * SIZE);
    }

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 26px "IBM Plex Mono", "Space Mono", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(char, SIZE / 2, SIZE / 2 + 1);

    const data = ctx.getImageData(0, 0, SIZE, SIZE).data;
    const field = new Float32Array(SIZE * SIZE);
    for (let i = 0; i < SIZE * SIZE; i += 1) {
      const value = data[i * 4] / 255;
      field[i] = value * 2 - 1;
    }
    return field;
  };

  const glyphBasis = Array.from({ length: 10 }, (_, index) => createGlyph(String(index)));

  const routingWeights = glyphBasis.map((_, index) => {
    const row = new Float32Array(LATENT_SIZE).fill(-0.22);
    row[index] = 1.35;
    row[(index + 3) % LATENT_SIZE] += 0.18;
    row[(index + 7) % LATENT_SIZE] -= 0.12;
    return row;
  });

  const routingBiases = new Float32Array([0.18, 0.1, 0.06, 0.08, 0.04, 0.12, 0.05, 0.07, 0.09, 0.11]);

  const sampleLatent = (prng) => {
    const latent = new Float32Array(LATENT_SIZE);
    for (let i = 0; i < LATENT_SIZE; i += 1) {
      latent[i] = prng() * 2 - 1;
    }
    return latent;
  };

  const softmax = (logits) => {
    const max = Math.max(...logits);
    const exps = logits.map((value) => Math.exp(value - max));
    const sum = exps.reduce((acc, value) => acc + value, 0);
    return exps.map((value) => (sum === 0 ? 0 : value / sum));
  };

  const computeCoefficients = (latent, temperature) => {
    const logits = new Array(glyphBasis.length).fill(0);
    const temp = clamp(temperature, MIN_TEMP, MAX_TEMP);

    for (let i = 0; i < glyphBasis.length; i += 1) {
      let sum = routingBiases[i];
      const weights = routingWeights[i];
      for (let j = 0; j < LATENT_SIZE; j += 1) {
        sum += weights[j] * latent[j];
      }
      logits[i] = sum / temp;
    }

    return softmax(logits);
  };

  const decode = (latent, temperature) => {
    const coeffs = computeCoefficients(latent, temperature);
    const pixels = new Uint8ClampedArray(SIZE * SIZE);

    for (let i = 0; i < SIZE * SIZE; i += 1) {
      let sum = 0;
      for (let b = 0; b < glyphBasis.length; b += 1) {
        sum += coeffs[b] * glyphBasis[b][i];
      }
      const normalized = clamp(sum, -1, 1);
      pixels[i] = Math.round(((normalized + 1) / 2) * 255);
    }

    return { pixels, coeffs };
  };

  const drawSample = ({ pixels }) => {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    canvas.className = 'gan-canvas gan-canvas--digits';
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', 'Generated digit sample');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return canvas;
    }
    const imageData = ctx.createImageData(SIZE, SIZE);
    for (let i = 0; i < pixels.length; i += 1) {
      const value = pixels[i];
      const offset = i * 4;
      imageData.data[offset] = value;
      imageData.data[offset + 1] = value;
      imageData.data[offset + 2] = value;
      imageData.data[offset + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  const formatCoefficients = (coeffs) =>
    coeffs
      .map((value, index) => `d${index}: ${value.toFixed(2)}`)
      .join('  ');

  const render = () => {
    if (!gallery) return;
    gallery.innerHTML = '';
    const prng = mulberry32(state.seed);
    const summaries = [];
    for (let i = 0; i < SAMPLE_COUNT; i += 1) {
      const latent = sampleLatent(prng);
      const result = decode(latent, state.temperature);
      summaries.push(formatCoefficients(result.coeffs));
      gallery.appendChild(drawSample(result));
    }

    if (coeffOutput) {
      coeffOutput.textContent = summaries.join('\n');
    }

    if (seedInput) {
      seedInput.value = String(state.seed >>> 0);
    }

    if (temperatureValue) {
      temperatureValue.textContent = state.temperature.toFixed(2);
    }
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

  if (temperatureInput) {
    temperatureInput.addEventListener('input', (event) => {
      const next = Number.parseFloat(event.target.value);
      if (Number.isFinite(next)) {
        state.temperature = clamp(next, MIN_TEMP, MAX_TEMP);
        render();
      }
    });
  }

  if (refreshButton) {
    refreshButton.addEventListener('click', () => {
      state.seed = (state.seed + 1) >>> 0;
      render();
    });
  }

  if (randomizeButton) {
    randomizeButton.addEventListener('click', () => {
      state.seed = Math.floor(Math.random() * 0xffffffff) >>> 0;
      render();
    });
  }

  render();
</script>
