import { createNoise3D } from 'simplex-noise';

const canvas = document.getElementById('topo-canvas') as HTMLCanvasElement | null;
const ctx = canvas?.getContext('2d');
const coord = document.getElementById('coord');
const finalCoord = '37.7749, -122.4194';
if (coord) {
  coord.textContent = finalCoord;
}

if (!canvas || !ctx) {
  throw new Error('Topographic canvas not found');
}

const dpr = window.devicePixelRatio || 1;
let width: number, height: number;
function resize() {
  width = canvas!.clientWidth;
  height = canvas!.clientHeight;
  canvas!.width = width * dpr;
  canvas!.height = height * dpr;
  ctx!.setTransform(1, 0, 0, 1, 0, 0);
  ctx!.scale(dpr, dpr);
}
window.addEventListener('resize', resize);
resize();

const noise3D = createNoise3D();
const baseFreq = 0.004;
const detailFreq = 0.009;
const detailAmp = 0.35;
const levels: number[] = [];
for (let l = -0.6; l <= 0.6; l += 0.15) levels.push(l);

const cases: Record<number, number[][]> = {
  0: [],
  1: [[3, 0]],
  2: [[0, 1]],
  3: [[3, 1]],
  4: [[1, 2]],
  5: [[3, 2], [0, 1]],
  6: [[0, 2]],
  7: [[3, 2]],
  8: [[2, 3]],
  9: [[0, 2]],
  10: [[1, 3], [0, 2]],
  11: [[1, 3]],
  12: [[2, 1]],
  13: [[0, 1]],
  14: [[3, 0]],
  15: []
};

function interp(a: number, b: number, t: number) { return a + t * (b - a); }
function edgePos(edge: number, x: number, y: number, v0: number, v1: number, v2: number, v3: number, level: number) {
  switch (edge) {
    case 0: return [interp(x, x + 1, (level - v0) / (v1 - v0)), y];
    case 1: return [x + 1, interp(y, y + 1, (level - v1) / (v2 - v1))];
    case 2: return [interp(x + 1, x, (level - v3) / (v2 - v3)), y + 1];
    case 3: return [x, interp(y + 1, y, (level - v0) / (v3 - v0))];
  }
}

function marchingSquares(field: number[][], cols: number, rows: number, level: number) {
  const segs: number[][] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v0 = field[y][x];
      const v1 = field[y][x + 1];
      const v2 = field[y + 1][x + 1];
      const v3 = field[y + 1][x];
      let idx = 0;
      if (v0 > level) idx |= 1;
      if (v1 > level) idx |= 2;
      if (v2 > level) idx |= 4;
      if (v3 > level) idx |= 8;
      const c = cases[idx];
      for (const pair of c) {
        const p1 = edgePos(pair[0], x, y, v0, v1, v2, v3, level);
        const p2 = edgePos(pair[1], x, y, v0, v1, v2, v3, level);
        segs.push(p1.concat(p2));
      }
    }
  }
  return segs;
}

const cellSize = 3;
let cols = 0, rows = 0;
let segsA: number[][][] = [], segsB: number[][][] = [];
let frame = 0;
let t = 0;

function buildField(time: number, phase = 0, amp = 1) {
  const f: number[][] = [];
  for (let y = 0; y <= rows; y++) {
    const row: number[] = [];
    for (let x = 0; x <= cols; x++) {
      const px = x * cellSize;
      const py = y * cellSize;
      const n1 = noise3D(px * baseFreq, py * baseFreq, time + phase);
      const n2 = noise3D(px * detailFreq, py * detailFreq, (time + phase) * 1.3);
      row.push((n1 + n2 * detailAmp) * amp);
    }
    f.push(row);
  }
  return f;
}

function recompute() {
  cols = Math.round(width / cellSize);
  rows = Math.round(height / cellSize);
  const fieldA = buildField(t);
  const fieldB = buildField(t + 100, 0.8, 0.8);
  segsA = levels.map(level => marchingSquares(fieldA, cols, rows, level));
  segsB = levels.map(level => marchingSquares(fieldB, cols, rows, level));
}

function drawSegments(segs: number[][]) {
  for (const s of segs) {
    ctx!.moveTo(s[0] * cellSize + 0.5, s[1] * cellSize + 0.5);
    ctx!.lineTo(s[2] * cellSize + 0.5, s[3] * cellSize + 0.5);
  }
}

function drawField(segsArray: number[][][], alpha: number) {
  ctx!.globalAlpha = alpha;
  segsArray.forEach((segs, idx) => {
    ctx!.lineWidth = idx % 3 === 0 ? 1.5 : 0.5;
    ctx!.beginPath();
    drawSegments(segs);
    ctx!.stroke();
  });
}

function draw() {
  ctx!.clearRect(0, 0, width, height);
  ctx!.lineCap = ctx!.lineJoin = 'round';
  ctx!.strokeStyle = getComputedStyle(canvas!).getPropertyValue('--contour-color');
  drawField(segsA, 1);
  drawField(segsB, 0.8);
  ctx!.globalAlpha = 1;
}

let running = true;
function loop() {
  if (!running) return;
  frame++;
  if (frame % 5 === 0) recompute();
  draw();
  t += 0.001;
  requestAnimationFrame(loop);
}

const media = window.matchMedia('(prefers-reduced-motion: reduce)');
recompute();
if (!media.matches) {
  loop();
} else {
  draw();
}

document.addEventListener('visibilitychange', () => {
  running = !document.hidden && !media.matches;
  if (running) requestAnimationFrame(loop);
});

const params = new URLSearchParams(location.search);
if (params.get('debug') === '1') {
  const toggle = document.createElement('button');
  toggle.id = 'toggle';
  toggle.className = 'toggle mono';
  toggle.textContent = 'Pause';
  toggle.setAttribute('aria-pressed', 'false');
  canvas!.parentElement!.appendChild(toggle);
  toggle.addEventListener('click', () => {
    running = !running;
    toggle.textContent = running ? 'Pause' : 'Play';
    toggle.setAttribute('aria-pressed', (!running).toString());
    if (running) requestAnimationFrame(loop);
  });
}
