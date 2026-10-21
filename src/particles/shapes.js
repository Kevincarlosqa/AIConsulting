// Point-cloud shapes the particle field morphs between.
// Shapes live in a unit space roughly ±1.5 wide with y pointing down the screen.

// Graphite greys with gold highlights, so the field never competes with the copy
export const PALETTE = [
  '#c9a45c', // 0 gold
  '#d6d6d4', // 1 silver
  '#9a9a98', // 2 grey
  '#6f6f6d', // 3 graphite
  '#b8b8b5', // 4 pale grey
  '#a8874c', // 5 deep gold
  '#858583', // 6 mid grey
];

// Light theme counterpart, index for index: ink greys and a deeper gold that hold up on paper
export const PALETTE_LIGHT = [
  '#9c7432', // 0 gold
  '#3a3a3d', // 1 ink
  '#6a6a6c', // 2 grey
  '#9a9a98', // 3 pale graphite
  '#4a4a4c', // 4 dark grey
  '#7d5b24', // 5 deep gold
  '#7e7e80', // 6 mid grey
];

export const RIM = 0;

const TAU = Math.PI * 2;

export const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const randDir = (rand) => {
  const u = rand() * 2 - 1;
  const a = rand() * TAU;
  const r = Math.sqrt(1 - u * u);
  return [r * Math.cos(a), u, r * Math.sin(a)];
};

const gauss = (rand) => {
  const u = Math.max(rand(), 1e-6);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * rand());
};

// Weights are ordered like PALETTE
const pick = (rand, weights) => {
  let total = 0;
  for (const w of weights) total += w;
  let r = rand() * total;
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i];
    if (r <= 0) return i;
  }
  return 0;
};

const createShape = (n) => ({
  pos: new Float32Array(n * 3),
  nrm: new Float32Array(n * 3),
  col: new Uint8Array(n),
});

const set = (shape, i, x, y, z, nx = 0, ny = 0, nz = 0) => {
  const j = i * 3;
  shape.pos[j] = x;
  shape.pos[j + 1] = y;
  shape.pos[j + 2] = z;
  shape.nrm[j] = nx;
  shape.nrm[j + 1] = ny;
  shape.nrm[j + 2] = nz;
};

const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// Point on the perimeter of a rounded rectangle, t in [0, 1)
const roundedRectPoint = (t, w, h, r) => {
  const sw = w - 2 * r;
  const sh = h - 2 * r;
  const arc = (Math.PI / 2) * r;
  const segments = [sw, arc, sh, arc, sw, arc, sh, arc];
  const total = segments.reduce((a, b) => a + b, 0);
  let d = t * total;
  const hw = w / 2;
  const hh = h / 2;

  for (let k = 0; k < 8; k++) {
    if (d <= segments[k] || k === 7) {
      const f = segments[k] ? d / segments[k] : 0;
      switch (k) {
        case 0: return [-hw + r + f * sw, -hh];
        case 2: return [hw, -hh + r + f * sh];
        case 4: return [hw - r - f * sw, hh];
        case 6: return [-hw, hh - r - f * sh];
        default: {
          const corners = { 1: [hw - r, -hh + r, -Math.PI / 2], 3: [hw - r, hh - r, 0], 5: [-hw + r, hh - r, Math.PI / 2], 7: [-hw + r, -hh + r, Math.PI] };
          const [cx, cy, a0] = corners[k];
          const a = a0 + f * (Math.PI / 2);
          return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
        }
      }
    }
    d -= segments[k];
  }
  return [0, 0];
};

const rectEdgePoint = (rand, x0, y0, x1, y1) => {
  const w = x1 - x0;
  const h = y1 - y0;
  let d = rand() * 2 * (w + h);
  if (d < w) return [x0 + d, y0];
  d -= w;
  if (d < h) return [x1, y0 + d];
  d -= h;
  if (d < w) return [x1 - d, y1];
  d -= w;
  return [x0, y1 - d];
};

const triPoint = (rand, a, b, c) => {
  let u = rand();
  let v = rand();
  if (u + v > 1) {
    u = 1 - u;
    v = 1 - v;
  }
  return a.map((_, k) => a[k] + u * (b[k] - a[k]) + v * (c[k] - a[k]));
};

const segPoint = (rand, a, b, jitter = 0) => {
  const t = rand();
  return a.map((_, k) => a[k] + (b[k] - a[k]) * t + (rand() - 0.5) * jitter);
};

/* ---------- Shapes ---------- */

// The problem: fragments scattered across the whole viewport
const chaos = (n, rand, aspect) => {
  const s = createShape(n);
  const ax = aspect * 1.6 + 0.4;
  for (let i = 0; i < n; i++) {
    set(s, i, (rand() * 2 - 1) * ax, (rand() * 2 - 1) * 1.75, (rand() * 2 - 1) * 1.6);
    s.col[i] = pick(rand, [30, 18, 22, 10, 8, 6, 6]);
  }
  return s;
};

// Everything gathering into one point of focus
const cloud = (n, rand) => {
  const s = createShape(n);
  for (let i = 0; i < n; i++) {
    const d = randDir(rand);
    const r = Math.cbrt(rand()) * 1.25;
    set(s, i, d[0] * r * 1.1, d[1] * r, d[2] * r);
    s.col[i] = pick(rand, [30, 28, 18, 8, 6, 4, 6]);
  }
  return s;
};

// Consulting: rising bars with a growth arrow
const chart = (n, rand) => {
  const s = createShape(n);
  const heights = [0.55, 0.85, 1.1, 1.45, 1.9];
  const base = 0.95;
  const w = 0.17;
  const arrow = [[-1.45, 0.25], [-0.75, -0.05], [-0.2, -0.3], [0.35, -0.55], [0.95, -0.95], [1.45, -1.3]];

  for (let i = 0; i < n; i++) {
    const r = rand();

    if (r < 0.68) {
      const k = Math.floor(rand() * heights.length);
      const cx = -1.2 + k * 0.6;
      const top = base - heights[k];
      let x, y, z;

      if (rand() < 0.62) {
        // Box edges
        const e = Math.floor(rand() * 12);
        const t = rand();
        const sx = [-w, w];
        const sz = [-w, w];
        if (e < 4) {
          x = cx + sx[e & 1];
          z = sz[e >> 1];
          y = top + t * heights[k];
        } else if (e < 8) {
          y = e < 6 ? top : base;
          z = sz[e & 1];
          x = cx - w + t * 2 * w;
        } else {
          y = e < 10 ? top : base;
          x = cx + sx[e & 1];
          z = -w + t * 2 * w;
        }
        set(s, i, x, y, z);
      } else {
        // Front face fill, denser at the top
        x = cx + (rand() * 2 - 1) * w;
        y = top + Math.pow(rand(), 1.6) * heights[k];
        set(s, i, x, y, rand() < 0.5 ? -w : w);
      }

      s.col[i] = k > 2 ? pick(rand, [20, 40, 10, 4, 4, 14, 8]) : pick(rand, [6, 26, 34, 4, 10, 0, 20]);
    } else if (r < 0.93) {
      // Arrow polyline with a small tube jitter, then the arrow head
      if (rand() < 0.85) {
        const k = Math.floor(rand() * (arrow.length - 1));
        const [x, y] = lerp2(arrow[k], arrow[k + 1], rand());
        set(s, i, x + (rand() - 0.5) * 0.05, y + (rand() - 0.5) * 0.05, (rand() - 0.5) * 0.08);
      } else {
        const tip = [1.6, -1.42, 0];
        const [x, y] = triPoint(rand, tip, [1.25, -1.38, 0], [1.5, -1.08, 0]);
        set(s, i, x, y, (rand() - 0.5) * 0.06);
      }
      s.col[i] = pick(rand, [50, 20, 0, 6, 0, 24, 0]);
    } else {
      // Baseline
      set(s, i, -1.6 + rand() * 3.2, base + 0.04, (rand() - 0.5) * 0.4);
      s.col[i] = pick(rand, [0, 60, 30, 0, 0, 0, 10]);
    }
  }
  return s;
};

// Automation: three meshing gears that actually turn
const gears = (n, rand) => {
  const s = createShape(n);
  const defs = [
    { cx: -0.42, cy: 0.18, R: 0.85, teeth: 12, hole: 0.28, speed: 0.35, colors: [34, 30, 6, 4, 0, 26, 0] },
    { cx: 0.88, cy: -0.62, R: 0.52, teeth: 8, hole: 0.16, speed: -0.35 * (0.85 / 0.52), colors: [8, 30, 40, 0, 8, 0, 14] },
    { cx: 0.72, cy: 0.62, R: 0.38, teeth: 6, hole: 0.12, speed: -0.35 * (0.85 / 0.38), colors: [26, 20, 0, 34, 10, 10, 0] },
  ];
  const depth = 0.13;
  const thick = 0.14;
  const totalArea = defs.reduce((a, g) => a + g.R * g.R, 0);

  const group = new Uint8Array(n);
  const rho = new Float32Array(n);
  const theta = new Float32Array(n);

  const outer = (g, a) => {
    const tooth = Math.min(Math.max(Math.sin(a * g.teeth) * 2.4, -1), 1) * 0.5 + 0.5;
    return g.R + depth * tooth;
  };

  for (let i = 0; i < n; i++) {
    let r = rand() * totalArea;
    let gi = 0;
    while (gi < defs.length - 1 && r > defs[gi].R * defs[gi].R) {
      r -= defs[gi].R * defs[gi].R;
      gi++;
    }
    const g = defs[gi];
    const a = rand() * TAU;
    const kind = rand();
    let radius;
    let z;

    if (kind < 0.46) {
      radius = outer(g, a);
      z = (rand() * 2 - 1) * thick;
    } else if (kind < 0.88) {
      radius = g.hole + (outer(g, a) - g.hole) * Math.sqrt(rand());
      z = rand() < 0.5 ? -thick : thick;
    } else {
      radius = g.hole;
      z = (rand() * 2 - 1) * thick;
    }

    group[i] = gi;
    rho[i] = radius;
    theta[i] = a;
    set(s, i, g.cx + Math.cos(a) * radius, g.cy + Math.sin(a) * radius, z);
    s.col[i] = pick(rand, g.colors);
  }

  s.animate = (time) => {
    for (let i = 0; i < n; i++) {
      const g = defs[group[i]];
      const a = theta[i] + time * g.speed;
      s.pos[i * 3] = g.cx + Math.cos(a) * rho[i];
      s.pos[i * 3 + 1] = g.cy + Math.sin(a) * rho[i];
    }
  };

  return s;
};

// AI agents: a conversation, with a typing indicator in the main bubble
const chat = (n, rand) => {
  const s = createShape(n);
  const main = { cx: -0.25, cy: 0.12, w: 2.3, h: 1.4, r: 0.38 };
  const reply = { cx: 0.95, cy: -0.98, w: 1.25, h: 0.66, r: 0.3 };
  const depth = 0.1;

  for (let i = 0; i < n; i++) {
    const r = rand();

    if (r < 0.42) {
      const [x, y] = roundedRectPoint(rand(), main.w, main.h, main.r);
      set(s, i, main.cx + x, main.cy + y, (rand() * 2 - 1) * depth);
      s.col[i] = pick(rand, [30, 50, 6, 4, 0, 10, 0]);
    } else if (r < 0.56) {
      // Faint glass fill
      const x = (rand() - 0.5) * (main.w - 0.2);
      const y = (rand() - 0.5) * (main.h - 0.2);
      set(s, i, main.cx + x, main.cy + y, rand() < 0.5 ? -depth : depth);
      s.col[i] = pick(rand, [0, 10, 40, 0, 10, 0, 40]);
    } else if (r < 0.64) {
      // Tail
      const a = [main.cx - 0.75, main.cy + main.h / 2 - 0.02, 0];
      const b = [main.cx - 0.3, main.cy + main.h / 2 - 0.02, 0];
      const tip = [main.cx - 1.0, main.cy + main.h / 2 + 0.42, 0];
      const p = rand() < 0.5 ? segPoint(rand, a, tip, 0.03) : segPoint(rand, tip, b, 0.03);
      set(s, i, p[0], p[1], (rand() * 2 - 1) * depth);
      s.col[i] = pick(rand, [30, 50, 6, 4, 0, 10, 0]);
    } else if (r < 0.82) {
      // Typing dots
      const k = Math.floor(rand() * 3);
      const d = randDir(rand);
      const rad = 0.15;
      set(s, i, main.cx - 0.5 + k * 0.5 + d[0] * rad, main.cy + d[1] * rad, d[2] * rad, ...d);
      s.col[i] = [pick(rand, [60, 10, 0, 0, 0, 30, 0]), pick(rand, [30, 40, 0, 30, 0, 0, 0]), pick(rand, [0, 20, 10, 50, 20, 0, 0])][k];
    } else {
      const [x, y] = roundedRectPoint(rand(), reply.w, reply.h, reply.r);
      set(s, i, reply.cx + x, reply.cy + y, (rand() * 2 - 1) * depth);
      s.col[i] = pick(rand, [0, 20, 40, 0, 30, 0, 10]);
    }
  }
  return s;
};

// Web: a browser window with a page layout inside
const browser = (n, rand) => {
  const s = createShape(n);
  const W = 2.9;
  const H = 1.9;
  const top = -H / 2;
  const depth = 0.07;
  const lines = [[0.4, -0.42, 1.25], [0.4, -0.28, 1.1], [0.4, -0.14, 1.2], [0.4, 0.0, 0.95]];

  for (let i = 0; i < n; i++) {
    const r = rand();
    let x, y;
    let col;

    if (r < 0.26) {
      [x, y] = roundedRectPoint(rand(), W, H, 0.12);
      col = pick(rand, [10, 70, 10, 0, 0, 10, 0]);
    } else if (r < 0.32) {
      x = -W / 2 + rand() * W;
      y = top + 0.28;
      col = pick(rand, [0, 40, 50, 0, 0, 0, 10]);
    } else if (r < 0.36) {
      const k = Math.floor(rand() * 3);
      const a = rand() * TAU;
      const rad = Math.sqrt(rand()) * 0.055;
      x = -W / 2 + 0.18 + k * 0.15 + Math.cos(a) * rad;
      y = top + 0.14 + Math.sin(a) * rad;
      col = [3, 0, 4][k];
    } else if (r < 0.5) {
      // Hero image block
      [x, y] = rand() < 0.6 ? rectEdgePoint(rand, -1.25, -0.5, 0.2, 0.28) : [-1.25 + rand() * 1.45, -0.5 + rand() * 0.78];
      col = pick(rand, [46, 10, 0, 14, 0, 30, 0]);
    } else if (r < 0.64) {
      // Copy lines
      const [x0, ly, x1] = lines[Math.floor(rand() * lines.length)];
      x = x0 + rand() * (x1 - x0);
      y = ly + (rand() - 0.5) * 0.03;
      col = pick(rand, [0, 60, 30, 0, 0, 0, 10]);
    } else if (r < 0.69) {
      // Call-to-action pill
      [x, y] = roundedRectPoint(rand(), 0.5, 0.16, 0.08);
      x += 0.65;
      y += 0.17;
      col = pick(rand, [70, 10, 0, 0, 0, 20, 0]);
    } else {
      // Card row
      const k = Math.floor(rand() * 3);
      const x0 = -1.25 + k * 0.85;
      [x, y] = rand() < 0.75 ? rectEdgePoint(rand, x0, 0.42, x0 + 0.72, 0.8) : [x0 + rand() * 0.72, 0.42 + rand() * 0.38];
      col = [pick(rand, [0, 20, 20, 0, 0, 0, 60]), pick(rand, [0, 20, 60, 0, 20, 0, 0]), pick(rand, [0, 20, 0, 20, 60, 0, 0])][k];
    }

    set(s, i, x, y, (rand() * 2 - 1) * depth);
    s.col[i] = col;
  }
  return s;
};

// Projects: a rolling surface that the work floats above
const wave = (n, rand, aspect) => {
  const s = createShape(n);
  const span = Math.max(2.6, aspect * 1.7);
  for (let i = 0; i < n; i++) {
    const x = (rand() * 2 - 1) * span;
    const z = (rand() * 2 - 1) * 1.5;
    set(s, i, x, 0, z);
    const f = (x / span + 1) / 2;
    s.col[i] = f < 0.33 ? pick(rand, [4, 20, 50, 0, 10, 0, 16]) : f < 0.66 ? pick(rand, [10, 26, 10, 10, 0, 4, 40]) : pick(rand, [46, 20, 0, 14, 0, 20, 0]);
  }

  s.animate = (time) => {
    for (let i = 0; i < n; i++) {
      const x = s.pos[i * 3];
      const z = s.pos[i * 3 + 2];
      s.pos[i * 3 + 1] =
        0.26 * Math.sin(x * 1.5 + time * 0.8) * Math.cos(z * 1.2 + time * 0.5) +
        0.1 * Math.sin((x + z) * 2.6 - time * 1.1);
    }
  };

  return s;
};

// Process: a double helix of steps linked by rungs
const helix = (n, rand) => {
  const s = createShape(n);
  const len = 2.3;
  const radius = 0.5;
  const twist = 2.2;

  for (let i = 0; i < n; i++) {
    const r = rand();
    if (r < 0.72) {
      const strand = rand() < 0.5 ? 0 : Math.PI;
      const x = (rand() * 2 - 1) * len;
      const a = x * twist + strand;
      const j = 0.035;
      set(s, i, x + (rand() - 0.5) * j, Math.cos(a) * radius + (rand() - 0.5) * j, Math.sin(a) * radius + (rand() - 0.5) * j, 0, Math.cos(a), Math.sin(a));
      s.col[i] = strand ? pick(rand, [0, 20, 44, 0, 6, 0, 30]) : pick(rand, [50, 20, 0, 6, 0, 24, 0]);
    } else {
      const x = Math.round(((rand() * 2 - 1) * len) / 0.22) * 0.22;
      const a = x * twist;
      const t = rand() * 2 - 1;
      set(s, i, x, Math.cos(a) * radius * t, Math.sin(a) * radius * t);
      s.col[i] = pick(rand, [10, 60, 0, 20, 10, 0, 0]);
    }
  }
  return s;
};

// Contact: a paper plane trailing a dotted flight path
const plane = (n, rand) => {
  const s = createShape(n);
  const N = [1.5, 0, 0];
  const L = [-1.05, -0.05, -1.0];
  const R = [-1.05, -0.05, 1.0];
  const C = [-0.9, 0, 0];
  const K = [-0.9, 0.42, 0];
  const faces = [[N, L, C], [N, R, C], [N, C, K]];

  for (let i = 0; i < n; i++) {
    const r = rand();
    if (r < 0.48) {
      const f = faces[Math.floor(rand() * 3)];
      const k = Math.floor(rand() * 3);
      const p = segPoint(rand, f[k], f[(k + 1) % 3], 0.02);
      set(s, i, ...p);
      s.col[i] = pick(rand, [24, 70, 0, 0, 0, 6, 0]);
    } else if (r < 0.88) {
      const fi = Math.floor(rand() * 3);
      const p = triPoint(rand, ...faces[fi]);
      set(s, i, ...p);
      s.col[i] = fi === 2 ? pick(rand, [30, 10, 0, 30, 0, 30, 0]) : pick(rand, [40, 40, 6, 6, 0, 8, 0]);
    } else {
      // Dashed trail curling back from the tail
      const t = rand();
      if (Math.floor(t * 18) % 2) {
        i--;
        continue;
      }
      const x = -1.1 - t * 2.4;
      set(s, i, x, 0.15 + Math.sin(t * Math.PI * 1.4) * 0.55, (rand() - 0.5) * 0.04);
      s.col[i] = pick(rand, [0, 30, 50, 0, 0, 0, 20]);
    }
  }
  return s;
};

// Side view of the cerebrum, front (frontal lobe) towards +x. The dip between
// the frontal and temporal lobes is the Sylvian fissure.
const CEREBRUM = [
  [1.3, -0.12], [1.24, -0.5], [1.02, -0.82], [0.62, -1.03], [0.12, -1.1], [-0.4, -1.04],
  [-0.86, -0.84], [-1.2, -0.52], [-1.36, -0.14], [-1.3, 0.18], [-1.08, 0.36], [-0.7, 0.42],
  [-0.32, 0.44], [0.02, 0.56], [0.38, 0.66], [0.74, 0.62], [0.98, 0.45], [1.02, 0.26],
  [0.86, 0.13], [1.12, 0.12], [1.28, 0.04],
];

// Closed Catmull-Rom spline through the control points, resampled evenly
const smoothOutline = (ctrl, samples) => {
  const raw = [];
  const m = ctrl.length;
  for (let k = 0; k < m; k++) {
    const [p0, p1, p2, p3] = [ctrl[(k - 1 + m) % m], ctrl[k], ctrl[(k + 1) % m], ctrl[(k + 2) % m]];
    for (let s = 0; s < 24; s++) {
      const t = s / 24;
      const t2 = t * t;
      const t3 = t2 * t;
      raw.push([0, 1].map((c) => 0.5 * (2 * p1[c] + (-p0[c] + p2[c]) * t + (2 * p0[c] - 5 * p1[c] + 4 * p2[c] - p3[c]) * t2 + (-p0[c] + 3 * p1[c] - 3 * p2[c] + p3[c]) * t3)));
    }
  }
  const cum = [0];
  for (let k = 1; k <= raw.length; k++) {
    const a = raw[k - 1];
    const b = raw[k % raw.length];
    cum.push(cum[k - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = cum[cum.length - 1];
  const out = [];
  let j = 0;
  for (let k = 0; k < samples; k++) {
    const d = (k / samples) * total;
    while (cum[j + 1] < d) j++;
    const f = (d - cum[j]) / (cum[j + 1] - cum[j] || 1);
    const a = raw[j];
    const b = raw[(j + 1) % raw.length];
    out.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]);
  }
  return out;
};

const insidePolygon = (poly, x, y) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

// AI: a 3D brain with a processor set into its side. Circuit traces run from the
// chip across the cortex to vias near the edge, and gold sparks stream along them.
const aiBrain = (n, rand) => {
  const s = createShape(n);
  const glow = new Uint8Array(n);
  const outline = smoothOutline(CEREBRUM, 360);
  const centre = [0, -0.25];
  const W = 0.92;

  const edgeDistance = (x, y) => {
    let best = Infinity;
    for (const [px, py] of outline) best = Math.min(best, (px - x) ** 2 + (py - y) ** 2);
    return Math.sqrt(best);
  };

  // Hemisphere depth at a point of the side view: zero on the outline, full in the middle
  const depthAt = (x, y) => {
    const f = Math.min(edgeDistance(x, y) / 0.62, 1);
    return W * Math.sqrt(1 - (1 - f) ** 2);
  };

  // Negative z is the side facing the camera
  const lift = (p, extra = 0) => [p[0], p[1], -(depthAt(p[0], p[1]) + 0.05 + extra)];

  /* ---------- Anatomy ---------- */

  const anatomyEnd = Math.floor(n * 0.36);
  for (let i = 0; i < anatomyEnd; i++) {
    const r = rand();

    if (r < 0.8) {
      // Cortex shell: a point between the centre and the outline, pushed to the hemisphere surface
      const edge = outline[Math.floor(rand() * outline.length)];
      const k = Math.pow(rand(), 0.4);
      const x = centre[0] + (edge[0] - centre[0]) * k;
      const y = centre[1] + (edge[1] - centre[1]) * k;
      const f = Math.min(edgeDistance(x, y) / 0.62, 1);
      // Gyri: the surface ripples in folds
      const fold = 1 + 0.07 * Math.sin(x * 9 + Math.sin(y * 7) * 2) * Math.cos(y * 8 - x * 3);
      const side = rand() < 0.42 ? -1 : 1;
      const z = side * (W * Math.sqrt(1 - (1 - f) ** 2) * fold + 0.05);
      const dx = edge[0] - centre[0];
      const dy = edge[1] - centre[1];
      const len = Math.hypot(dx, dy) || 1;
      set(s, i, x, y, z, (dx / len) * (1 - f), (dy / len) * (1 - f), side * f);
      s.col[i] = pick(rand, [14, 40, 22, 6, 6, 4, 8]);
    } else if (r < 0.93) {
      // Cerebellum tucked under the back of the brain, with horizontal folia
      const d = randDir(rand);
      const band = Math.round((d[1] + 1) * 4) / 4 - 1;
      const yy = rand() < 0.6 ? band : d[1];
      const x = -0.86 + d[0] * 0.44;
      const y = 0.6 + yy * 0.24;
      set(s, i, x, y, d[2] * 0.62, ...d);
      s.col[i] = pick(rand, [10, 30, 34, 10, 10, 0, 6]);
    } else {
      // Brain stem
      const t = rand();
      const a = rand() * TAU;
      const rad = 0.15 * (1 - 0.25 * t);
      set(s, i, -0.22 + t * 0.14 + Math.cos(a) * rad, 0.5 + t * 0.72, Math.sin(a) * rad, Math.cos(a), 0, Math.sin(a));
      s.col[i] = pick(rand, [10, 30, 34, 10, 10, 0, 6]);
    }
  }

  /* ---------- Circuitry ---------- */

  const chip = { cx: 0.04, cy: -0.24, h: 0.24 };
  const sides = [
    { o: [0, -1], t: [1, 0] },
    { o: [1, 0], t: [0, 1] },
    { o: [0, 1], t: [-1, 0] },
    { o: [-1, 0], t: [0, -1] },
  ];

  // March a segment until it nears the outline, so every trace ends inside the brain
  const fits = (x, y) => insidePolygon(outline, x, y) && edgeDistance(x, y) > 0.11;
  const run = (p, d, max) => {
    let len = 0;
    while (len < max && fits(p[0] + d[0] * (len + 0.02), p[1] + d[1] * (len + 0.02))) len += 0.02;
    return [p[0] + d[0] * len, p[1] + d[1] * len];
  };

  const traces = [];
  sides.forEach(({ o, t }) => {
    for (let k = 0; k < 5; k++) {
      const off = -0.17 + k * 0.085;
      const start = [chip.cx + o[0] * chip.h + t[0] * off, chip.cy + o[1] * chip.h + t[1] * off];
      const pin = [start[0] + o[0] * 0.06, start[1] + o[1] * 0.06];
      const fan = off < 0 ? -1 : 1;
      const diag = [(o[0] + t[0] * fan) * Math.SQRT1_2, (o[1] + t[1] * fan) * Math.SQRT1_2];
      const p1 = run(pin, o, 0.04 + rand() * 0.22);
      const p2 = run(p1, diag, 0.1 + rand() * 0.45);
      // Bend back outward or sideways along the tangent for variety
      const outDir = rand() < 0.6 ? o : [t[0] * fan, t[1] * fan];
      const p3 = run(p2, outDir, 1.4);
      const pts = [start, pin, p1, p2, p3].filter((p, i, a) => i === 0 || Math.hypot(p[0] - a[i - 1][0], p[1] - a[i - 1][1]) > 1e-3);
      if (pts.length < 3) continue;
      const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
      traces.push({ pts, lens, total: lens.reduce((a, b) => a + b, 0) });
    }
  });

  const along = (tr, u) => {
    let d = u * tr.total;
    for (let k = 0; k < tr.lens.length; k++) {
      if (d <= tr.lens[k] || k === tr.lens.length - 1) return lerp2(tr.pts[k], tr.pts[k + 1], tr.lens[k] ? Math.min(d / tr.lens[k], 1) : 0);
      d -= tr.lens[k];
    }
    return tr.pts[0];
  };

  // Sparks travel outward from the chip in short comet-like groups; a few flow back in
  const groups = Array.from({ length: 24 }, () => ({
    trace: traces[Math.floor(rand() * traces.length)],
    u0: rand(),
    speed: 0.22 + rand() * 0.25,
    inward: rand() < 0.25,
  }));
  const sparks = [];

  for (let i = anatomyEnd; i < n; i++) {
    const r = rand();
    let p;
    let extra = 0;

    if (r < 0.16) {
      // Bright outline so the brain silhouette reads clearly
      p = outline[Math.floor(rand() * outline.length)];
      set(s, i, p[0], p[1], -0.02 + (rand() - 0.5) * 0.06);
      s.col[i] = pick(rand, [34, 56, 0, 0, 10, 0, 0]);
      glow[i] = rand() < 0.45 ? 1 : 0;
      continue;
    } else if (r < 0.26) {
      p = roundedRectPoint(rand(), chip.h * 2, chip.h * 2, 0.025);
      p = [chip.cx + p[0], chip.cy + p[1]];
      extra = 0.06;
      s.col[i] = pick(rand, [55, 40, 0, 0, 5, 0, 0]);
      glow[i] = 1;
    } else if (r < 0.3) {
      // Inner die, like the bright square at the heart of a processor
      p = rectEdgePoint(rand, -chip.h * 0.55, -chip.h * 0.55, chip.h * 0.55, chip.h * 0.55);
      p = [chip.cx + p[0], chip.cy + p[1]];
      extra = 0.07;
      s.col[i] = pick(rand, [20, 80, 0, 0, 0, 0, 0]);
      glow[i] = 1;
    } else if (r < 0.33) {
      p = [chip.cx + (rand() * 2 - 1) * chip.h * 0.5, chip.cy + (rand() * 2 - 1) * chip.h * 0.5];
      extra = 0.07;
      s.col[i] = pick(rand, [10, 60, 30, 0, 0, 0, 0]);
    } else if (r < 0.4) {
      const tr = traces[Math.floor(rand() * traces.length)];
      p = lerp2(tr.pts[0], tr.pts[1], rand());
      extra = 0.04;
      s.col[i] = pick(rand, [30, 60, 0, 0, 10, 0, 0]);
      glow[i] = rand() < 0.5 ? 1 : 0;
    } else if (r < 0.68) {
      const tr = traces[Math.floor(rand() * traces.length)];
      p = along(tr, tr.lens[0] / tr.total + rand() * (1 - tr.lens[0] / tr.total));
      s.col[i] = pick(rand, [26, 40, 18, 0, 12, 4, 0]);
      glow[i] = rand() < 0.4 ? 1 : 0;
    } else if (r < 0.78) {
      const tr = traces[Math.floor(rand() * traces.length)];
      const end = tr.pts[tr.pts.length - 1];
      const a = rand() * TAU;
      const rad = 0.028 + rand() * 0.01;
      p = [end[0] + Math.cos(a) * rad, end[1] + Math.sin(a) * rad];
      s.col[i] = pick(rand, [45, 45, 0, 0, 10, 0, 0]);
      glow[i] = rand() < 0.5 ? 1 : 0;
    } else {
      const group = groups[sparks.length % groups.length];
      const offset = Math.floor(sparks.length / groups.length) * 0.014;
      sparks.push({ i, group, offset });
      p = along(group.trace, (group.u0 + 1 - offset) % 1);
      s.col[i] = pick(rand, [85, 10, 0, 0, 0, 5, 0]);
      glow[i] = 1;
    }

    set(s, i, ...lift(p, extra));
  }

  // Spark depth is cached per trace point so the per-frame update stays cheap
  const sparkDepth = new Map();
  const liftCached = (p) => {
    const key = `${Math.round(p[0] * 50)},${Math.round(p[1] * 50)}`;
    if (!sparkDepth.has(key)) sparkDepth.set(key, lift(p, 0.01)[2]);
    return sparkDepth.get(key);
  };

  s.glow = glow;
  s.animate = (time) => {
    for (const { i, group, offset } of sparks) {
      let u = (group.u0 + time * group.speed - offset + 10) % 1;
      if (group.inward) u = 1 - u;
      const p = along(group.trace, u);
      s.pos[i * 3] = p[0];
      s.pos[i * 3 + 1] = p[1];
      s.pos[i * 3 + 2] = liftCached(p);
    }
  };

  return s;
};

// What we do for companies: connected systems, hubs linked by data flows
const network = (n, rand) => {
  const s = createShape(n);
  const nodes = [];
  let guard = 0;

  while (nodes.length < 16 && guard++ < 2000) {
    const p = [(rand() * 2 - 1) * 1.5, (rand() * 2 - 1) * 1.0, (rand() * 2 - 1) * 0.8];
    if (p[0] ** 2 / 2.25 + p[1] ** 2 + p[2] ** 2 / 0.64 > 1) continue;
    if (nodes.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]) < 0.48)) continue;
    nodes.push(p);
  }

  const edges = [];
  nodes.forEach((p, a) => {
    nodes
      .map((q, b) => [b, Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2])])
      .filter(([b]) => b !== a)
      .sort((x, y) => x[1] - y[1])
      .slice(0, 3)
      .forEach(([b]) => {
        if (!edges.some(([x, y]) => (x === a && y === b) || (x === b && y === a))) edges.push([a, b]);
      });
  });

  const radii = nodes.map((_, k) => (k % 5 === 0 ? 0.2 : 0.1 + rand() * 0.06));

  for (let i = 0; i < n; i++) {
    if (rand() < 0.42) {
      const k = Math.floor(rand() * nodes.length);
      const d = randDir(rand);
      const r = radii[k];
      set(s, i, nodes[k][0] + d[0] * r, nodes[k][1] + d[1] * r, nodes[k][2] + d[2] * r, ...d);
      s.col[i] = k % 5 === 0 ? pick(rand, [70, 20, 0, 0, 0, 10, 0]) : pick(rand, [20, 60, 10, 0, 10, 0, 0]);
    } else {
      const [a, b] = edges[Math.floor(rand() * edges.length)];
      const p = segPoint(rand, nodes[a], nodes[b], 0.025);
      set(s, i, ...p);
      s.col[i] = pick(rand, [8, 20, 34, 14, 10, 0, 14]);
    }
  }
  return s;
};

export const generators = { aiBrain, chaos, cloud, chart, gears, chat, browser, wave, helix, plane, network };

// Shapes that depend on the viewport aspect are rebuilt on resize
export const aspectShapes = new Set(['chaos', 'wave']);

// [rx, ry, rz] per shape over time (seconds)
export const rotations = {
  // Mostly side-on so the chip and its traces face the viewer
  aiBrain: (t) => [0.06, Math.sin(t * 0.25) * 0.32, 0],
  chaos: (t) => [0, t * 0.025, 0],
  cloud: (t) => [0.1, t * 0.12, 0],
  chart: (t) => [-0.12, -0.42 + Math.sin(t * 0.3) * 0.18, 0],
  gears: (t) => [0.25 + Math.sin(t * 0.2) * 0.08, -0.35 + Math.sin(t * 0.25) * 0.2, 0],
  chat: (t) => [0.05, 0.3 + Math.sin(t * 0.35) * 0.25, 0],
  browser: (t) => [0.12, -0.38 + Math.sin(t * 0.3) * 0.2, 0],
  wave: () => [0.55, 0, 0],
  helix: (t) => [t * 0.35, 0.15, -0.12],
  plane: (t) => [0.38, -0.55 + Math.sin(t * 0.4) * 0.15, -0.18 + Math.sin(t * 0.7) * 0.05],
  network: (t) => [0.15, t * 0.08, 0],
};
