"use strict";
(() => {
  // node_modules/simplex-noise/dist/esm/simplex-noise.js
  var SQRT3 = /* @__PURE__ */ Math.sqrt(3);
  var SQRT5 = /* @__PURE__ */ Math.sqrt(5);
  var F2 = 0.5 * (SQRT3 - 1);
  var G2 = (3 - SQRT3) / 6;
  var F3 = 1 / 3;
  var G3 = 1 / 6;
  var F4 = (SQRT5 - 1) / 4;
  var G4 = (5 - SQRT5) / 20;
  var fastFloor = (x) => Math.floor(x) | 0;
  var grad3 = /* @__PURE__ */ new Float64Array([
    1,
    1,
    0,
    -1,
    1,
    0,
    1,
    -1,
    0,
    -1,
    -1,
    0,
    1,
    0,
    1,
    -1,
    0,
    1,
    1,
    0,
    -1,
    -1,
    0,
    -1,
    0,
    1,
    1,
    0,
    -1,
    1,
    0,
    1,
    -1,
    0,
    -1,
    -1
  ]);
  function createNoise3D(random = Math.random) {
    const perm = buildPermutationTable(random);
    const permGrad3x = new Float64Array(perm).map((v) => grad3[v % 12 * 3]);
    const permGrad3y = new Float64Array(perm).map((v) => grad3[v % 12 * 3 + 1]);
    const permGrad3z = new Float64Array(perm).map((v) => grad3[v % 12 * 3 + 2]);
    return function noise3D2(x, y, z) {
      let n0, n1, n2, n3;
      const s = (x + y + z) * F3;
      const i = fastFloor(x + s);
      const j = fastFloor(y + s);
      const k = fastFloor(z + s);
      const t2 = (i + j + k) * G3;
      const X0 = i - t2;
      const Y0 = j - t2;
      const Z0 = k - t2;
      const x0 = x - X0;
      const y0 = y - Y0;
      const z0 = z - Z0;
      let i1, j1, k1;
      let i2, j2, k2;
      if (x0 >= y0) {
        if (y0 >= z0) {
          i1 = 1;
          j1 = 0;
          k1 = 0;
          i2 = 1;
          j2 = 1;
          k2 = 0;
        } else if (x0 >= z0) {
          i1 = 1;
          j1 = 0;
          k1 = 0;
          i2 = 1;
          j2 = 0;
          k2 = 1;
        } else {
          i1 = 0;
          j1 = 0;
          k1 = 1;
          i2 = 1;
          j2 = 0;
          k2 = 1;
        }
      } else {
        if (y0 < z0) {
          i1 = 0;
          j1 = 0;
          k1 = 1;
          i2 = 0;
          j2 = 1;
          k2 = 1;
        } else if (x0 < z0) {
          i1 = 0;
          j1 = 1;
          k1 = 0;
          i2 = 0;
          j2 = 1;
          k2 = 1;
        } else {
          i1 = 0;
          j1 = 1;
          k1 = 0;
          i2 = 1;
          j2 = 1;
          k2 = 0;
        }
      }
      const x1 = x0 - i1 + G3;
      const y1 = y0 - j1 + G3;
      const z1 = z0 - k1 + G3;
      const x2 = x0 - i2 + 2 * G3;
      const y2 = y0 - j2 + 2 * G3;
      const z2 = z0 - k2 + 2 * G3;
      const x3 = x0 - 1 + 3 * G3;
      const y3 = y0 - 1 + 3 * G3;
      const z3 = z0 - 1 + 3 * G3;
      const ii = i & 255;
      const jj = j & 255;
      const kk = k & 255;
      let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
      if (t0 < 0)
        n0 = 0;
      else {
        const gi0 = ii + perm[jj + perm[kk]];
        t0 *= t0;
        n0 = t0 * t0 * (permGrad3x[gi0] * x0 + permGrad3y[gi0] * y0 + permGrad3z[gi0] * z0);
      }
      let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
      if (t1 < 0)
        n1 = 0;
      else {
        const gi1 = ii + i1 + perm[jj + j1 + perm[kk + k1]];
        t1 *= t1;
        n1 = t1 * t1 * (permGrad3x[gi1] * x1 + permGrad3y[gi1] * y1 + permGrad3z[gi1] * z1);
      }
      let t22 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
      if (t22 < 0)
        n2 = 0;
      else {
        const gi2 = ii + i2 + perm[jj + j2 + perm[kk + k2]];
        t22 *= t22;
        n2 = t22 * t22 * (permGrad3x[gi2] * x2 + permGrad3y[gi2] * y2 + permGrad3z[gi2] * z2);
      }
      let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
      if (t3 < 0)
        n3 = 0;
      else {
        const gi3 = ii + 1 + perm[jj + 1 + perm[kk + 1]];
        t3 *= t3;
        n3 = t3 * t3 * (permGrad3x[gi3] * x3 + permGrad3y[gi3] * y3 + permGrad3z[gi3] * z3);
      }
      return 32 * (n0 + n1 + n2 + n3);
    };
  }
  function buildPermutationTable(random) {
    const tableSize = 512;
    const p = new Uint8Array(tableSize);
    for (let i = 0; i < tableSize / 2; i++) {
      p[i] = i;
    }
    for (let i = 0; i < tableSize / 2 - 1; i++) {
      const r = i + ~~(random() * (256 - i));
      const aux = p[i];
      p[i] = p[r];
      p[r] = aux;
    }
    for (let i = 256; i < tableSize; i++) {
      p[i] = p[i - 256];
    }
    return p;
  }

  // src/scripts/topo.ts
  var canvas = document.getElementById("topo-canvas");
  var ctx = canvas?.getContext("2d");
  var coord = document.getElementById("coord");
  var finalCoord = "37.7749, -122.4194";
  if (coord) {
    coord.textContent = finalCoord;
  }
  if (!canvas || !ctx) {
    throw new Error("Topographic canvas not found");
  }
  var dpr = window.devicePixelRatio || 1;
  var width;
  var height;
  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }
  window.addEventListener("resize", resize);
  resize();
  var noise3D = createNoise3D();
  var baseFreq = 4e-3;
  var detailFreq = 9e-3;
  var detailAmp = 0.35;
  var levels = [];
  for (let l = -0.6; l <= 0.6; l += 0.15) levels.push(l);
  var cases = {
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
  function interp(a, b, t2) {
    return a + t2 * (b - a);
  }
  function edgePos(edge, x, y, v0, v1, v2, v3, level) {
    switch (edge) {
      case 0:
        return [interp(x, x + 1, (level - v0) / (v1 - v0)), y];
      case 1:
        return [x + 1, interp(y, y + 1, (level - v1) / (v2 - v1))];
      case 2:
        return [interp(x + 1, x, (level - v3) / (v2 - v3)), y + 1];
      case 3:
        return [x, interp(y + 1, y, (level - v0) / (v3 - v0))];
    }
  }
  function marchingSquares(field, cols2, rows2, level) {
    const segs = [];
    for (let y = 0; y < rows2; y++) {
      for (let x = 0; x < cols2; x++) {
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
  var cellSize = 3;
  var cols = 0;
  var rows = 0;
  var segsA = [];
  var segsB = [];
  var frame = 0;
  var t = 0;
  function buildField(time, phase = 0, amp = 1) {
    const f = [];
    for (let y = 0; y <= rows; y++) {
      const row = [];
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
    segsA = levels.map((level) => marchingSquares(fieldA, cols, rows, level));
    segsB = levels.map((level) => marchingSquares(fieldB, cols, rows, level));
  }
  function drawSegments(segs) {
    for (const s of segs) {
      ctx.moveTo(s[0] * cellSize + 0.5, s[1] * cellSize + 0.5);
      ctx.lineTo(s[2] * cellSize + 0.5, s[3] * cellSize + 0.5);
    }
  }
  function drawField(segsArray, alpha) {
    ctx.globalAlpha = alpha;
    segsArray.forEach((segs, idx) => {
      ctx.lineWidth = idx % 3 === 0 ? 2 : 1;
      ctx.beginPath();
      drawSegments(segs);
      ctx.stroke();
    });
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.strokeStyle = getComputedStyle(canvas).getPropertyValue("--contour-color");
    drawField(segsA, 1);
    drawField(segsB, 0.8);
    ctx.globalAlpha = 1;
  }
  var running = true;
  function loop() {
    if (!running) return;
    frame++;
    if (frame % 3 === 0) recompute();
    draw();
    t += 25e-4;
    requestAnimationFrame(loop);
  }
  var media = window.matchMedia("(prefers-reduced-motion: reduce)");
  recompute();
  if (!media.matches) {
    loop();
  } else {
    draw();
  }
  document.addEventListener("visibilitychange", () => {
    running = !document.hidden && !media.matches;
    if (running) requestAnimationFrame(loop);
  });
  var params = new URLSearchParams(location.search);
  if (params.get("debug") === "1") {
    const toggle = document.createElement("button");
    toggle.id = "toggle";
    toggle.className = "toggle mono";
    toggle.textContent = "Pause";
    toggle.setAttribute("aria-pressed", "false");
    canvas.parentElement.appendChild(toggle);
    toggle.addEventListener("click", () => {
      running = !running;
      toggle.textContent = running ? "Pause" : "Play";
      toggle.setAttribute("aria-pressed", (!running).toString());
      if (running) requestAnimationFrame(loop);
    });
  }
})();
