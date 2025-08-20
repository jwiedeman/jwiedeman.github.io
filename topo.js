import * as Noise from "https://esm.sh/@chriscourses/perlin-noise";

/* =================== Config =================== */
const MAX_FPS = 30;                 // 0 = uncapped
const thresholdIncrement = 5;       // contour step: 0..100 by 5
const thickLineThresholdMultiple = 3; // every Nth line is thicker
const res = 8;                      // grid cell size (smaller = more detail)
const baseZOffset = 0.00012;        // field evolution speed
const lineColor = "#d2d2d2";      // neutral contour color
const hoverColor = "#FFFFFFCC";     // hover emphasis
const targetFillRatio = 0.20;       // ~20% of visible slices get pages
const matchRadiusPx = 40;           // centroid matching radius per threshold

/* Page gradient palettes */
const pageColors = {
  Work:   ["#ff3b30","#ff9500"],  // red → orange
  Lab:    ["#34c759","#5ac8fa"],  // green → cyan
  Contact:["#af52de","#5856d6"],  // purple → indigo
  About:  ["#ffd60a","#ff9f0a"],  // yellow → orange
  Blog:   ["#0a84ff","#5ac8fa"],  // blue → cyan
  Experiments: ["#ff2d55","#ffcc00"], // pink → yellow
};

function getPageColors(name){
  if (pageColors[name]) return pageColors[name];
  const hue = [...name].reduce((h,c)=>h+c.charCodeAt(0),0) % 360;
  const c1 = `hsl(${hue},70%,60%)`;
  const c2 = `hsl(${(hue+60)%360},70%,60%)`;
  pageColors[name] = [c1,c2];
  return pageColors[name];
}

/* =================== Canvas Setup =================== */
const canvas = document.getElementById("topo-canvas");
const ctx = canvas.getContext("2d", { alpha: true });
let cols=0, rows=0, zOffset=0;
let inputValues=[], zBoostValues=[];
let noiseMin=100, noiseMax=0;

function setupCanvas(){
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  // Reset then scale to avoid compounding
  ctx.setTransform(1,0,0,1,0,0);
  canvas.width  = Math.max(1, Math.floor(rect.width  * dpr));
  canvas.height = Math.max(1, Math.floor(rect.height * dpr));
  ctx.scale(dpr, dpr);
  canvas.style.width  = rect.width+"px";
  canvas.style.height = rect.height+"px";
  cols = Math.floor(canvas.width / res) + 1;
  rows = Math.floor(canvas.height / res) + 1;
  zBoostValues = Array.from({length:rows},()=>Array(cols+1).fill(0));
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
}
window.addEventListener("resize", setupCanvas);
setupCanvas();

/* =================== Page Pool =================== */
function buildPagePool(){
  const anchors = Array.from(document.querySelectorAll("a[href]"));
  const pages = new Set();
  for (const a of anchors){
    let href = a.getAttribute("href") || "";
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("http")) continue;
    href = href.split("?")[0];
    href = href.replace(/^\//,"").replace(/\/$/,"");
    if (!href) continue;
    const seg = href.split("/").pop();
    if (!seg) continue;
    const name = seg.charAt(0).toUpperCase() + seg.slice(1);
    pages.add(name);
  }
  return shuffle(Array.from(pages));
}

function shuffle(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

let pagePool = [];
function initPagePool(){
  pagePool = buildPagePool();
}
if (document.readyState === "loading"){
  document.addEventListener("DOMContentLoaded", initPagePool);
} else {
  initPagePool();
}

/* =================== Entities (by slice) =================== */
const entityTTL = 12; // frames of grace when a slice yields no segments
let entities = new Map(); // key: threshold number -> { id, threshold, centroid, ttl, page, segCount }
let nextId = 1;

function touchEntity(threshold, centroid, segCount){
  const key = threshold;
  let e = entities.get(key);
  if (!e) {
    e = { id: nextId++, threshold, centroid, ttl: entityTTL, page: null, segCount };
    entities.set(key, e);
  } else {
    e.centroid = centroid;
    e.ttl = entityTTL;
    e.segCount = segCount;
  }
  return e;
}

function decayAndRebalance(){
  // decay
  for (const [k,e] of entities) {
    e.ttl--;
    if (e.ttl <= 0) {
      if (e.page) pagePool.push(e.page);
      entities.delete(k);
    }
  }
  // rebalance to ~20% assigned
  const list = [...entities.values()];
  if (list.length === 0) return;
  const assigned = list.filter(e => !!e.page).length;
  const target = Math.ceil(list.length * targetFillRatio);
  if (assigned < target) {
    // assign to unassigned slices with most segments first (more visible)
    const candidates = list.filter(e => !e.page).sort((a,b)=> (b.segCount|0)-(a.segCount|0));
    for (const e of candidates) {
      if ([...entities.values()].filter(x=>x.page).length >= target) break;
      e.page = pagePool.shift() || null;
    }
  }
}

/* =================== Mouse / Hover =================== */
let mouse = { x:-9999, y:-9999, inside:false };
let hoverThreshold = null;
canvas.addEventListener("mousemove", (e)=>{
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  mouse.inside = true;
});
canvas.addEventListener("mouseleave", ()=>{ mouse.inside=false; hoverThreshold=null; });
canvas.addEventListener("click", ()=>{
  if (hoverThreshold == null) return;
  const ent = entities.get(hoverThreshold);
  if (ent && ent.page) {
    console.log("NAV → /" + ent.page.toLowerCase());
    // window.location.href = "/" + ent.page.toLowerCase(); // enable in your site
  }
});

/* =================== Render Loop =================== */
function animate(){
  setTimeout(()=>requestAnimationFrame(animate), MAX_FPS ? 1000/MAX_FPS : 0);
  ctx.clearRect(0,0,canvas.width,canvas.height);
  zOffset += baseZOffset;
  generateNoise();

  // We iterate a fixed 0..100 range so slice keys are stable.
  const tMin = 0;
  const tMax = 100;
  const newObservations = []; // {threshold, centroid, segCount}

  // Determine hover threshold from sampled noise under cursor
  hoverThreshold = null;
  if (mouse.inside) {
    const xi = Math.max(0, Math.min(cols-1, Math.floor(mouse.x / res)));
    const yi = Math.max(0, Math.min(rows-1, Math.floor(mouse.y / res)));
    const v = (inputValues[yi] && inputValues[yi][xi] != null) ? inputValues[yi][xi] : null;
    if (v != null) {
      const rounded = Math.round(v / thresholdIncrement) * thresholdIncrement;
      hoverThreshold = clamp(rounded, tMin, tMax);
    }
  }

  // Draw all thresholds; collect midpoints for centroids per threshold
  for (let t=tMin; t<=tMax; t+=thresholdIncrement){
    const isHovered = (hoverThreshold != null && Math.abs(t - hoverThreshold) < 0.5);
    const { segCount, centroid } = drawThresholdContours(t, isHovered);
    if (segCount > 0) {
      newObservations.push({threshold: t, centroid, segCount});
    }
  }

  // Update entities
  for (const o of newObservations) touchEntity(o.threshold, o.centroid, o.segCount);
  decayAndRebalance();

  // Debug
  debugOut();
}

/* =================== Noise =================== */
function generateNoise(){
  noiseMin = 100; noiseMax = 0;
  for (let y=0;y<rows;y++){
    inputValues[y]=[];
    for (let x=0;x<=cols;x++){
      const val = Noise.noise(x*0.02, y*0.02, zOffset + (zBoostValues[y]?.[x] || 0)) * 100;
      inputValues[y][x] = val;
      if (val < noiseMin) noiseMin = val;
      if (val > noiseMax) noiseMax = val;
      if (zBoostValues[y]?.[x] > 0) zBoostValues[y][x] *= 0.99;
    }
  }
}

/* =================== Contours (Marching Squares) =================== */
/* For each threshold, we traverse the grid, compute segment endpoints, and stroke.
   We accumulate segment midpoints to derive a per-threshold centroid. */
function drawThresholdContours(threshold, emphasize = false){
  let segCount = 0;
  let sumX = 0, sumY = 0;

  const isThick = (threshold % (thresholdIncrement * thickLineThresholdMultiple) === 0);
  const ent = entities.get(threshold);
  const hasPage = !!(ent && ent.page);

  let lastStrokeStyle = lineColor; // capture the last used stroke style

  for (let y = 0; y < inputValues.length - 1; y++){
    for (let x = 0; x < inputValues[y].length - 1; x++){
      const nw = inputValues[y][x];
      const ne = inputValues[y][x + 1];
      const se = inputValues[y + 1][x + 1];
      const sw = inputValues[y + 1][x];

      const above = (nw > threshold) + (ne > threshold) + (se > threshold) + (sw > threshold);
      if (above === 0 || above === 4) continue;

      const code = ((nw > threshold) << 3) | ((ne > threshold) << 2) | ((se > threshold) << 1) | (sw > threshold);
      const seg = segmentForCell(code, x, y, nw, ne, se, sw, threshold);
      if (!seg) continue;

      const [p0, p1] = seg;

      if (hasPage){
        const [c1, c2] = getPageColors(ent.page);
        const grad = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
        grad.addColorStop(0, c1); grad.addColorStop(1, c2);
        ctx.strokeStyle = grad;
        ctx.lineWidth = isThick ? 2 : 1;
        lastStrokeStyle = c1; // store base color to tint popup
      } else {
        ctx.strokeStyle = emphasize ? hoverColor : lineColor;
        ctx.lineWidth = (isThick || emphasize) ? 2 : 1;
        lastStrokeStyle = ctx.strokeStyle;
      }

      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.stroke();

      const mx = (p0[0] + p1[0]) * 0.5;
      const my = (p0[1] + p1[1]) * 0.5;
      sumX += mx; sumY += my; segCount++;
    }
  }

  const centroid = (segCount > 0) ? { x: sumX / segCount, y: sumY / segCount } : null;

  // Hovered slice label → follow mouse, tint to match contour color
  if (emphasize && hasPage){
    const lx = mouse.inside ? mouse.x + 14 : (centroid?.x ?? 0);
    const ly = mouse.inside ? mouse.y - 6  : (centroid?.y ?? 0);
    drawLabel(lx, ly, "→ " + ent.page, lastStrokeStyle);
  }

  return { segCount, centroid: centroid || { x: 0, y: 0 } };
}

function segmentForCell(code, x, y, nw, ne, se, sw, t){
  // Linear interpolation helpers
  const lerpX = (v0,v1)=> x*res + res * ((t - v0) / (v1 - v0));
  const lerpY = (v0,v1)=> y*res + res * ((t - v0) / (v1 - v0));

  switch(code){
    case 0b0001: case 0b1110: { // sw only / except sw
      const px = x*res; const y0 = lerpY(nw,sw); const x1 = lerpX(sw,se); const y1 = y*res+res;
      return [[px, y0],[x1, y1]];
    }
    case 0b0010: case 0b1101: { // se only
      const x0 = x*res+res; const y0 = lerpY(ne,se); const x1 = lerpX(sw,se); const y1 = y*res+res;
      return [[x0, y0],[x1, y1]];
    }
    case 0b0011: case 0b1100: { // se, sw
      const x0 = x*res+res; const y0 = lerpY(ne,se); const px = x*res; const y1 = lerpY(nw,sw);
      return [[px, y1],[x0, y0]];
    }
    case 0b0100: case 0b1011: { // ne only
      const x0 = lerpX(nw,ne); const y0 = y*res; const x1 = x*res+res; const y1 = lerpY(ne,se);
      return [[x0, y0],[x1, y1]];
    }
    case 0b0101: { // ne, sw (two segments; we draw one; topology ambiguity)
      const a0 = [lerpX(nw,ne), y*res];
      const a1 = [x*res, lerpY(nw,sw)];
      return [a0, a1];
    }
    case 0b0110: case 0b1001: { // ne, se or nw, sw
      const a0 = [lerpX(nw,ne), y*res];
      const a1 = [lerpX(sw,se), y*res+res];
      return [a0, a1];
    }
    case 0b0111: case 0b1000: { // all but nw / nw only
      const a0 = [lerpX(nw,ne), y*res];
      const a1 = [x*res, lerpY(nw,sw)];
      return [a0, a1];
    }
    case 0b1010: { // nw, se (two segments ambiguity); draw one
      const a0 = [lerpX(nw,ne), y*res];
      const a1 = [lerpX(sw,se), y*res+res];
      return [a0, a1];
    }
    default: return null;
  }
}

/* =================== Overlay label =================== */
function drawLabel(x,y,text,color="#CFE9FF"){
  ctx.save();
  ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textBaseline = "top";
  const pad = 4;
  const w = Math.ceil(ctx.measureText(text).width) + pad*2;
  const h = 16 + pad*2;
  const rx = Math.min(Math.max(x - w/2, 6), canvas.width - w - 6);
  const ry = Math.min(Math.max(y - h - 8, 6), canvas.height - h - 6);

  ctx.fillStyle = "rgba(10,12,15,1)";
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.rect(rx, ry, w, h); ctx.fill(); ctx.stroke();

  ctx.fillStyle = color;
  ctx.fillText(text, rx+pad, ry+pad);
  ctx.restore();
}

/* =================== Debug =================== */
function debugOut(){
  const dbg = document.getElementById("debug-pane");
  const list = [...entities.values()].sort((a,b)=>a.threshold-b.threshold);
  const lines = [
    `z=${zOffset.toFixed(4)}  noise=[${Math.floor(noiseMin)}..${Math.ceil(noiseMax)}]`,
    `entities: ${list.length}  assigned: ${list.filter(e=>!!e.page).length}  pool: [${pagePool.join(", ")}]`,
    ``,
    ...list.map(e=> `#${e.id}  t=${e.threshold}  segs=${e.segCount|0}  ttl=${e.ttl}  page=${e.page ?? "-"}`)
  ];
  dbg.textContent = lines.join("\n");
}

/* =================== Utils =================== */
function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

/* =================== Go =================== */
requestAnimationFrame(animate);
