---
layout: ../../../layouts/Layout.astro
title: "ASCII Converter"
description: "Convert images, GIFs, and videos to ASCII art directly in your browser with full customization controls."
headingTracker: false
---

<div class="container">
  <header class="page-header">
    <div class="page-header__meta">
      <span class="section-index">Lab / Art</span>
      <span class="classification classification--accent">Interactive Tool</span>
    </div>
    <h1 class="page-header__title">ASCII Converter</h1>
    <p class="page-header__subtitle">Transform any media into text-based art</p>
  </header>

  <section class="ascii-tool">
    <div class="ascii-tool__upload">
      <label class="ascii-tool__dropzone" data-dropzone>
        <input type="file" accept="image/*,video/*,.gif" data-file-input hidden />
        <div class="ascii-tool__dropzone-content">
          <span class="ascii-tool__dropzone-icon">⬆</span>
          <span class="ascii-tool__dropzone-text">Drop file here or click to upload</span>
          <span class="ascii-tool__dropzone-hint mono">Supports: PNG, JPG, GIF, MP4, WebM</span>
        </div>
      </label>
    </div>

    <div class="ascii-tool__controls" data-controls hidden>
      <div class="ascii-tool__control-group">
        <label class="mono" for="ascii-width">Output Width</label>
        <input type="range" id="ascii-width" min="40" max="200" value="100" data-width />
        <span class="ascii-tool__value mono" data-width-value>100</span>
      </div>

      <div class="ascii-tool__control-group">
        <label class="mono" for="ascii-chars">Character Set</label>
        <select id="ascii-chars" data-charset>
          <option value="standard">Standard ( .:-=+*#%@)</option>
          <option value="blocks">Blocks ( ░▒▓█)</option>
          <option value="binary">Binary (01)</option>
          <option value="dots">Dots ( ·•●)</option>
          <option value="detailed">Detailed ($@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`'. )</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div class="ascii-tool__control-group" data-custom-chars-group hidden>
        <label class="mono" for="ascii-custom-chars">Custom Characters (dark to light)</label>
        <input type="text" id="ascii-custom-chars" value="@%#*+=-:. " data-custom-chars placeholder="@%#*+=-:. " />
      </div>

      <div class="ascii-tool__control-group">
        <label class="mono" for="ascii-color-mode">Color Mode</label>
        <select id="ascii-color-mode" data-color-mode>
          <option value="none">Monochrome (Text Only)</option>
          <option value="grayscale">Grayscale</option>
          <option value="color">Full Color</option>
          <option value="custom">Custom Color</option>
        </select>
      </div>

      <div class="ascii-tool__control-group" data-custom-color-group hidden>
        <label class="mono" for="ascii-custom-color">Text Color</label>
        <input type="color" id="ascii-custom-color" value="#ff6b35" data-custom-color />
      </div>

      <div class="ascii-tool__control-group">
        <label class="mono" for="ascii-bg">Background</label>
        <select id="ascii-bg" data-bg>
          <option value="transparent">Transparent</option>
          <option value="#141414">Dark (#141414)</option>
          <option value="#000000">Black (#000000)</option>
          <option value="#ffffff">White (#ffffff)</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div class="ascii-tool__control-group" data-custom-bg-group hidden>
        <label class="mono" for="ascii-custom-bg">Custom Background</label>
        <input type="color" id="ascii-custom-bg" value="#141414" data-custom-bg />
      </div>

      <div class="ascii-tool__control-group">
        <label class="mono" for="ascii-font-size">Font Size (px)</label>
        <input type="range" id="ascii-font-size" min="6" max="16" value="10" data-font-size />
        <span class="ascii-tool__value mono" data-font-size-value>10</span>
      </div>

      <div class="ascii-tool__control-group">
        <label class="mono" for="ascii-contrast">Contrast</label>
        <input type="range" id="ascii-contrast" min="0.5" max="2" step="0.1" value="1" data-contrast />
        <span class="ascii-tool__value mono" data-contrast-value>1.0</span>
      </div>

      <div class="ascii-tool__control-group" data-invert-group>
        <label class="ascii-tool__checkbox">
          <input type="checkbox" data-invert />
          <span class="mono">Invert brightness</span>
        </label>
      </div>

      <div class="ascii-tool__actions">
        <button type="button" class="btn" data-render>Render ASCII</button>
        <button type="button" class="btn btn--secondary" data-reset>Reset</button>
      </div>
    </div>

    <div class="ascii-tool__preview" data-preview hidden>
      <div class="ascii-tool__preview-header">
        <span class="mono">Preview</span>
        <div class="ascii-tool__playback" data-playback hidden>
          <button type="button" data-play-pause>⏸</button>
          <span class="mono" data-frame-info>Frame 1/1</span>
        </div>
      </div>
      <div class="ascii-tool__output" data-output></div>
    </div>

    <div class="ascii-tool__export" data-export hidden>
      <div class="ascii-tool__export-header">
        <span class="mono">Export</span>
      </div>
      <div class="ascii-tool__export-actions">
        <button type="button" class="btn" data-download-txt>Download .txt</button>
        <button type="button" class="btn" data-download-html>Download .html</button>
        <button type="button" class="btn" data-copy-text>Copy to Clipboard</button>
      </div>
    </div>
  </section>
</div>

<style>
  .ascii-tool {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
    margin-top: var(--space-4);
  }

  .ascii-tool__dropzone {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    border: 2px dashed var(--border-faint);
    background: var(--surface-panel);
    cursor: pointer;
    transition: border-color 0.2s ease, background 0.2s ease;
  }

  .ascii-tool__dropzone:hover,
  .ascii-tool__dropzone.dragover {
    border-color: var(--color-accent);
    background: rgba(255, 107, 53, 0.05);
  }

  .ascii-tool__dropzone-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    text-align: center;
    padding: var(--space-4);
  }

  .ascii-tool__dropzone-icon {
    font-size: 2rem;
    color: var(--color-muted);
  }

  .ascii-tool__dropzone-text {
    font-size: var(--text-14);
    color: var(--color-text);
  }

  .ascii-tool__dropzone-hint {
    font-size: var(--text-10);
    color: var(--color-muted);
  }

  .ascii-tool__controls {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--surface-panel);
    border: 1px solid var(--border-faint);
  }

  .ascii-tool__control-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .ascii-tool__control-group label {
    font-size: var(--text-10);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .ascii-tool__control-group input[type="range"] {
    width: 100%;
  }

  .ascii-tool__control-group select,
  .ascii-tool__control-group input[type="text"] {
    padding: var(--space-2);
    background: var(--color-bg);
    border: 1px solid var(--border-faint);
    color: var(--color-text);
    font-family: var(--font-mono);
    font-size: var(--text-11);
  }

  .ascii-tool__control-group input[type="color"] {
    width: 100%;
    height: 36px;
    padding: 0;
    border: 1px solid var(--border-faint);
    cursor: pointer;
  }

  .ascii-tool__value {
    font-size: var(--text-10);
    color: var(--color-accent);
  }

  .ascii-tool__checkbox {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    cursor: pointer;
  }

  .ascii-tool__checkbox input {
    width: 16px;
    height: 16px;
  }

  .ascii-tool__actions {
    grid-column: 1 / -1;
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-2);
  }

  .btn {
    padding: var(--space-2) var(--space-4);
    background: var(--color-accent);
    color: var(--color-bg);
    border: none;
    font-family: var(--font-mono);
    font-size: var(--text-11);
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    cursor: pointer;
    transition: opacity 0.2s ease;
  }

  .btn:hover {
    opacity: 0.9;
  }

  .btn--secondary {
    background: transparent;
    color: var(--color-text);
    border: 1px solid var(--border-faint);
  }

  .btn--secondary:hover {
    border-color: var(--color-accent);
    color: var(--color-accent);
  }

  .ascii-tool__preview {
    background: var(--surface-panel);
    border: 1px solid var(--border-faint);
  }

  .ascii-tool__preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--border-faint);
    font-size: var(--text-10);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .ascii-tool__playback {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .ascii-tool__playback button {
    background: none;
    border: none;
    color: var(--color-text);
    cursor: pointer;
    font-size: var(--text-14);
  }

  .ascii-tool__output {
    padding: var(--space-3);
    overflow: auto;
    max-height: 600px;
  }

  .ascii-tool__output pre {
    margin: 0;
    font-family: var(--font-mono);
    line-height: 1.1;
    white-space: pre;
    overflow-x: auto;
  }

  .ascii-tool__export {
    background: var(--surface-panel);
    border: 1px solid var(--border-faint);
  }

  .ascii-tool__export-header {
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid var(--border-faint);
    font-size: var(--text-10);
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--color-muted);
  }

  .ascii-tool__export-actions {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    padding: var(--space-3);
  }

  @media (max-width: 640px) {
    .ascii-tool__controls {
      grid-template-columns: 1fr;
    }

    .ascii-tool__export-actions {
      flex-direction: column;
    }

    .ascii-tool__export-actions .btn {
      width: 100%;
    }
  }
</style>

<script type="module">
  const charsets = {
    standard: ' .:-=+*#%@',
    blocks: ' ░▒▓█',
    binary: '01',
    dots: ' ·•●',
    detailed: '$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,"^`\'. ',
  };

  const state = {
    file: null,
    frames: [],
    currentFrame: 0,
    playing: false,
    playbackTimer: null,
    asciiFrames: [],
    settings: {
      width: 100,
      charset: 'standard',
      customChars: '@%#*+=-:. ',
      colorMode: 'none',
      customColor: '#ff6b35',
      bg: 'transparent',
      customBg: '#141414',
      fontSize: 10,
      contrast: 1,
      invert: false,
    },
  };

  // DOM elements
  const dropzone = document.querySelector('[data-dropzone]');
  const fileInput = document.querySelector('[data-file-input]');
  const controls = document.querySelector('[data-controls]');
  const preview = document.querySelector('[data-preview]');
  const output = document.querySelector('[data-output]');
  const exportSection = document.querySelector('[data-export]');
  const playback = document.querySelector('[data-playback]');

  const widthInput = document.querySelector('[data-width]');
  const widthValue = document.querySelector('[data-width-value]');
  const charsetSelect = document.querySelector('[data-charset]');
  const customCharsGroup = document.querySelector('[data-custom-chars-group]');
  const customCharsInput = document.querySelector('[data-custom-chars]');
  const colorModeSelect = document.querySelector('[data-color-mode]');
  const customColorGroup = document.querySelector('[data-custom-color-group]');
  const customColorInput = document.querySelector('[data-custom-color]');
  const bgSelect = document.querySelector('[data-bg]');
  const customBgGroup = document.querySelector('[data-custom-bg-group]');
  const customBgInput = document.querySelector('[data-custom-bg]');
  const fontSizeInput = document.querySelector('[data-font-size]');
  const fontSizeValue = document.querySelector('[data-font-size-value]');
  const contrastInput = document.querySelector('[data-contrast]');
  const contrastValue = document.querySelector('[data-contrast-value]');
  const invertInput = document.querySelector('[data-invert]');

  const renderBtn = document.querySelector('[data-render]');
  const resetBtn = document.querySelector('[data-reset]');
  const playPauseBtn = document.querySelector('[data-play-pause]');
  const frameInfo = document.querySelector('[data-frame-info]');
  const downloadTxtBtn = document.querySelector('[data-download-txt]');
  const downloadHtmlBtn = document.querySelector('[data-download-html]');
  const copyTextBtn = document.querySelector('[data-copy-text]');

  // File handling
  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFile(file);
  });

  async function handleFile(file) {
    state.file = file;
    state.frames = [];
    state.asciiFrames = [];
    state.currentFrame = 0;
    stopPlayback();

    const isVideo = file.type.startsWith('video/');
    const isGif = file.type === 'image/gif';

    if (isVideo) {
      await extractVideoFrames(file);
    } else if (isGif) {
      await extractGifFrames(file);
    } else {
      await extractImageFrame(file);
    }

    controls.hidden = false;
    playback.hidden = state.frames.length <= 1;
    updateFrameInfo();
  }

  async function extractImageFrame(file) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        state.frames = [img];
        resolve();
      };
      img.src = URL.createObjectURL(file);
    });
  }

  async function extractVideoFrames(file) {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.muted = true;

      video.onloadedmetadata = async () => {
        const duration = video.duration;
        const frameCount = Math.min(Math.floor(duration * 10), 100); // Max 100 frames, ~10fps
        const interval = duration / frameCount;

        for (let i = 0; i < frameCount; i++) {
          video.currentTime = i * interval;
          await new Promise(r => video.onseeked = r);

          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0);

          const img = new Image();
          img.src = canvas.toDataURL();
          await new Promise(r => img.onload = r);
          state.frames.push(img);
        }

        resolve();
      };
    });
  }

  async function extractGifFrames(file) {
    // For GIFs, we'll extract a single frame (first frame)
    // Full GIF parsing would require a library like gifuct-js
    // For simplicity, treat as single image
    return extractImageFrame(file);
  }

  // Control handlers
  widthInput.addEventListener('input', () => {
    state.settings.width = parseInt(widthInput.value);
    widthValue.textContent = widthInput.value;
  });

  charsetSelect.addEventListener('change', () => {
    state.settings.charset = charsetSelect.value;
    customCharsGroup.hidden = charsetSelect.value !== 'custom';
  });

  customCharsInput.addEventListener('input', () => {
    state.settings.customChars = customCharsInput.value || ' ';
  });

  colorModeSelect.addEventListener('change', () => {
    state.settings.colorMode = colorModeSelect.value;
    customColorGroup.hidden = colorModeSelect.value !== 'custom';
  });

  customColorInput.addEventListener('input', () => {
    state.settings.customColor = customColorInput.value;
  });

  bgSelect.addEventListener('change', () => {
    const value = bgSelect.value;
    state.settings.bg = value;
    customBgGroup.hidden = value !== 'custom';
  });

  customBgInput.addEventListener('input', () => {
    state.settings.customBg = customBgInput.value;
  });

  fontSizeInput.addEventListener('input', () => {
    state.settings.fontSize = parseInt(fontSizeInput.value);
    fontSizeValue.textContent = fontSizeInput.value;
  });

  contrastInput.addEventListener('input', () => {
    state.settings.contrast = parseFloat(contrastInput.value);
    contrastValue.textContent = parseFloat(contrastInput.value).toFixed(1);
  });

  invertInput.addEventListener('change', () => {
    state.settings.invert = invertInput.checked;
  });

  // Render
  renderBtn.addEventListener('click', render);

  function render() {
    if (state.frames.length === 0) return;

    state.asciiFrames = state.frames.map(frame => imageToAscii(frame));
    preview.hidden = false;
    exportSection.hidden = false;
    displayFrame(0);
  }

  function imageToAscii(img) {
    const { width, charset, customChars, colorMode, customColor, contrast, invert } = state.settings;
    const chars = charset === 'custom' ? customChars : charsets[charset];
    const reversedChars = invert ? chars : chars.split('').reverse().join('');

    const aspectRatio = img.height / img.width;
    const height = Math.round(width * aspectRatio * 0.5); // Chars are ~2x tall

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    const result = { text: '', html: '', colors: [] };
    let textLines = [];
    let htmlLines = [];

    for (let y = 0; y < height; y++) {
      let textLine = '';
      let htmlLine = '';

      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];

        // Calculate brightness (0-1)
        let brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

        // Apply contrast
        brightness = ((brightness - 0.5) * contrast + 0.5);
        brightness = Math.max(0, Math.min(1, brightness));

        // Map to character
        const charIndex = Math.floor(brightness * (reversedChars.length - 1));
        const char = reversedChars[charIndex] || ' ';

        textLine += char;

        // Apply color
        let color = '';
        if (colorMode === 'grayscale') {
          const gray = Math.round(brightness * 255);
          color = `rgb(${gray},${gray},${gray})`;
        } else if (colorMode === 'color') {
          color = `rgb(${r},${g},${b})`;
        } else if (colorMode === 'custom') {
          color = customColor;
        }

        if (color) {
          htmlLine += `<span style="color:${color}">${escapeHtml(char)}</span>`;
        } else {
          htmlLine += escapeHtml(char);
        }
      }

      textLines.push(textLine);
      htmlLines.push(htmlLine);
    }

    result.text = textLines.join('\n');
    result.html = htmlLines.join('\n');

    return result;
  }

  function escapeHtml(str) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return str.replace(/[&<>"']/g, c => map[c]);
  }

  function displayFrame(index) {
    state.currentFrame = index;
    const frame = state.asciiFrames[index];
    if (!frame) return;

    const { bg, customBg, fontSize, colorMode } = state.settings;
    const bgColor = bg === 'custom' ? customBg : bg;

    let style = `font-size: ${fontSize}px; line-height: 1;`;
    if (bgColor !== 'transparent') {
      style += ` background: ${bgColor}; padding: ${fontSize}px;`;
    }
    if (colorMode === 'none') {
      style += ' color: var(--color-text);';
    }

    output.innerHTML = `<pre style="${style}">${frame.html}</pre>`;
    updateFrameInfo();
  }

  function updateFrameInfo() {
    if (frameInfo) {
      frameInfo.textContent = `Frame ${state.currentFrame + 1}/${state.frames.length}`;
    }
  }

  // Playback
  playPauseBtn?.addEventListener('click', () => {
    if (state.playing) {
      stopPlayback();
    } else {
      startPlayback();
    }
  });

  function startPlayback() {
    if (state.asciiFrames.length <= 1) return;
    state.playing = true;
    playPauseBtn.textContent = '⏸';

    state.playbackTimer = setInterval(() => {
      const next = (state.currentFrame + 1) % state.asciiFrames.length;
      displayFrame(next);
    }, 100);
  }

  function stopPlayback() {
    state.playing = false;
    if (playPauseBtn) playPauseBtn.textContent = '▶';
    if (state.playbackTimer) {
      clearInterval(state.playbackTimer);
      state.playbackTimer = null;
    }
  }

  // Export
  downloadTxtBtn.addEventListener('click', () => {
    const text = state.asciiFrames.map(f => f.text).join('\n\n--- FRAME ---\n\n');
    downloadFile(text, 'ascii-art.txt', 'text/plain');
  });

  downloadHtmlBtn.addEventListener('click', () => {
    const { bg, customBg, fontSize, colorMode } = state.settings;
    const bgColor = bg === 'custom' ? customBg : bg;
    const textColor = colorMode === 'none' ? '#d9d4cc' : '';

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ASCII Art</title>
  <style>
    body { margin: 0; padding: 20px; background: ${bgColor === 'transparent' ? '#141414' : bgColor}; }
    pre { font-family: monospace; font-size: ${fontSize}px; line-height: 1; ${textColor ? `color: ${textColor};` : ''} margin: 0; }
  </style>
</head>
<body>
  <pre>${state.asciiFrames[state.currentFrame]?.html || ''}</pre>
</body>
</html>`;

    downloadFile(html, 'ascii-art.html', 'text/html');
  });

  copyTextBtn.addEventListener('click', async () => {
    const text = state.asciiFrames[state.currentFrame]?.text || '';
    await navigator.clipboard.writeText(text);
    const originalText = copyTextBtn.textContent;
    copyTextBtn.textContent = 'Copied!';
    setTimeout(() => copyTextBtn.textContent = originalText, 2000);
  });

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Reset
  resetBtn.addEventListener('click', () => {
    state.file = null;
    state.frames = [];
    state.asciiFrames = [];
    state.currentFrame = 0;
    stopPlayback();

    fileInput.value = '';
    controls.hidden = true;
    preview.hidden = true;
    exportSection.hidden = true;
  });
</script>
