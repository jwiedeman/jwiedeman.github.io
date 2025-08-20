import * as ChriscoursesPerlinNoise from "https://esm.sh/@chriscourses/perlin-noise";

let MAX_FPS = 30; // limit frames for smoother rendering
let thresholdIncrement = 5;
let thickLineThresholdMultiple = 3;
let res = 8; // grid resolution
let baseZOffset = 0.00015; // noise evolution speed

const canvas = document.getElementById('topo-canvas');
const ctx = canvas?.getContext('2d');

if (!canvas || !ctx) {
  throw new Error('Topographic canvas not found');
}

let cols = 0;
let rows = 0;
let zOffset = 0;
let inputValues = [];
let zBoostValues = [];
let currentThreshold = 0;
let noiseMin = 100;
let noiseMax = 0;

function setupCanvas() {
  const rect = canvas.parentElement?.getBoundingClientRect() || canvas.getBoundingClientRect();
  canvas.width = rect.width * window.devicePixelRatio;
  canvas.height = rect.height * window.devicePixelRatio;
  ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';
  cols = Math.floor(canvas.width / res) + 1;
  rows = Math.floor(canvas.height / res) + 1;

  zBoostValues = Array.from({ length: rows }, () => Array(cols + 1).fill(0));
}

window.addEventListener('resize', setupCanvas);
setupCanvas();

function animate() {
  setTimeout(() => requestAnimationFrame(animate), MAX_FPS ? 1000 / MAX_FPS : 0);

  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const lineColor = getComputedStyle(canvas).getPropertyValue('--contour-color').trim() || '#EDEDED';

  // Slowly evolve the noise field over time.  Incrementing the Z
  // offset produces a gentle, continuous morphing effect instead of the
  // previous back‑and‑forth oscillation.
  zOffset += baseZOffset;
  generateNoise();

  const roundedNoiseMin = Math.floor(noiseMin / thresholdIncrement) * thresholdIncrement;
  const roundedNoiseMax = Math.ceil(noiseMax / thresholdIncrement) * thresholdIncrement;

  for (let threshold = roundedNoiseMin; threshold < roundedNoiseMax; threshold += thresholdIncrement) {
    currentThreshold = threshold;
    renderAtThreshold(lineColor);
  }
  noiseMin = 100;
  noiseMax = 0;
}

function generateNoise() {
  for (let y = 0; y < rows; y++) {
    inputValues[y] = [];
    for (let x = 0; x <= cols; x++) {
      inputValues[y][x] = ChriscoursesPerlinNoise.noise(x * 0.02, y * 0.02, zOffset + zBoostValues[y]?.[x]) * 100;
      if (inputValues[y][x] < noiseMin) noiseMin = inputValues[y][x];
      if (inputValues[y][x] > noiseMax) noiseMax = inputValues[y][x];
      if (zBoostValues[y]?.[x] > 0) zBoostValues[y][x] *= 0.99;
    }
  }
}

function renderAtThreshold(color) {
  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = currentThreshold % (thresholdIncrement * thickLineThresholdMultiple) === 0 ? 2 : 1;

  for (let y = 0; y < inputValues.length - 1; y++) {
    for (let x = 0; x < inputValues[y].length - 1; x++) {
      if (
        inputValues[y][x] > currentThreshold &&
        inputValues[y][x + 1] > currentThreshold &&
        inputValues[y + 1][x + 1] > currentThreshold &&
        inputValues[y + 1][x] > currentThreshold
      )
        continue;
      if (
        inputValues[y][x] < currentThreshold &&
        inputValues[y][x + 1] < currentThreshold &&
        inputValues[y + 1][x + 1] < currentThreshold &&
        inputValues[y + 1][x] < currentThreshold
      )
        continue;

      const gridValue = binaryToType(
        inputValues[y][x] > currentThreshold ? 1 : 0,
        inputValues[y][x + 1] > currentThreshold ? 1 : 0,
        inputValues[y + 1][x + 1] > currentThreshold ? 1 : 0,
        inputValues[y + 1][x] > currentThreshold ? 1 : 0
      );

      placeLines(gridValue, x, y);
    }
  }
  ctx.stroke();
}

function placeLines(gridValue, x, y) {
  const nw = inputValues[y][x];
  const ne = inputValues[y][x + 1];
  const se = inputValues[y + 1][x + 1];
  const sw = inputValues[y + 1][x];
  let a, b, c, d;

  switch (gridValue) {
    case 1:
    case 14:
      c = [x * res + res * linInterpolate(sw, se), y * res + res];
      d = [x * res, y * res + res * linInterpolate(nw, sw)];
      line(d, c);
      break;
    case 2:
    case 13:
      b = [x * res + res, y * res + res * linInterpolate(ne, se)];
      c = [x * res + res * linInterpolate(sw, se), y * res + res];
      line(b, c);
      break;
    case 3:
    case 12:
      b = [x * res + res, y * res + res * linInterpolate(ne, se)];
      d = [x * res, y * res + res * linInterpolate(nw, sw)];
      line(d, b);
      break;
    case 11:
    case 4:
      a = [x * res + res * linInterpolate(nw, ne), y * res];
      b = [x * res + res, y * res + res * linInterpolate(ne, se)];
      line(a, b);
      break;
    case 5:
      a = [x * res + res * linInterpolate(nw, ne), y * res];
      b = [x * res + res, y * res + res * linInterpolate(ne, se)];
      c = [x * res + res * linInterpolate(sw, se), y * res + res];
      d = [x * res, y * res + res * linInterpolate(nw, sw)];
      line(d, a);
      line(c, b);
      break;
    case 6:
    case 9:
      a = [x * res + res * linInterpolate(nw, ne), y * res];
      c = [x * res + res * linInterpolate(sw, se), y * res + res];
      line(c, a);
      break;
    case 7:
    case 8:
      a = [x * res + res * linInterpolate(nw, ne), y * res];
      d = [x * res, y * res + res * linInterpolate(nw, sw)];
      line(d, a);
      break;
    case 10:
      a = [x * res + res * linInterpolate(nw, ne), y * res];
      b = [x * res + res, y * res + res * linInterpolate(ne, se)];
      c = [x * res + res * linInterpolate(sw, se), y * res + res];
      d = [x * res, y * res + res * linInterpolate(nw, sw)];
      line(a, b);
      line(c, d);
      break;
  }
}

function line(from, to) {
  ctx.moveTo(from[0], from[1]);
  ctx.lineTo(to[0], to[1]);
}

function linInterpolate(x0, x1, y0 = 0, y1 = 1) {
  if (x0 === x1) {
    return 0;
  }
  return y0 + ((y1 - y0) * (currentThreshold - x0)) / (x1 - x0);
}

function binaryToType(nw, ne, se, sw) {
  return [nw, ne, se, sw].reduce((res, x) => (res << 1) | x);
}

requestAnimationFrame(animate);

