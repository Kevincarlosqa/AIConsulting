import { PALETTE, RIM, aspectShapes, generators, mulberry32, rotations } from './shapes.js';

const TAU = Math.PI * 2;
// Kept low so the field reads as texture behind the copy
const ALPHAS = [0.2, 0.36, 0.56];
const MOBILE = 860;

const TETRA_VERTS = [
  [1, 1, 1],
  [1, -1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
].map((v) => v.map((c) => c / Math.sqrt(3)));
const TETRA_EDGES = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];
const TETRA_COLORS = ['#c9a45c', '#9a9a98', '#d6d6d4', '#6f6f6d'];

const smoothstep = (t) => t * t * (3 - 2 * t);

/**
 * Full-screen canvas of outlined triangles that morph between the shape named
 * by each `[data-shape]` section as it crosses the middle of the viewport.
 */
export class ParticleField {
  constructor(canvas, sections, { reduceMotion = false } = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sections = sections;
    this.reduceMotion = reduceMotion;
    this.pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    this.count = 0;
    this.shapes = {};
    this.smoothScroll = window.scrollY;
    this.start = performance.now();

    this.frame = this.frame.bind(this);
    this.resize = this.resize.bind(this);
    this.buildTetras();
  }

  init() {
    if (!this.ctx || !this.sections.length) return;

    this.resize();
    window.addEventListener('resize', this.resize);
    window.addEventListener('pointermove', (event) => {
      this.pointer.tx = event.clientX / window.innerWidth - 0.5;
      this.pointer.ty = event.clientY / window.innerHeight - 0.5;
    });
    requestAnimationFrame(this.frame);
  }

  resize() {
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);

    // Landscape phones are too short for the stacked layout, so they use the desktop one
    const mobile = this.width < MOBILE && this.height > 500;
    const count = mobile ? 2000 : 3500;
    const aspect = this.width / this.height;
    // Shapes scale with the smaller of height and width so they fit phones, tablets and laptops alike
    this.unit = mobile
      ? Math.min(this.height * 0.32, this.width * 0.36, 200)
      : Math.min(this.height * 0.32, this.width * 0.2);

    if (count !== this.count) {
      this.count = count;
      this.allocate();
      const rand = mulberry32(7);
      Object.keys(generators).forEach((name) => {
        if (!aspectShapes.has(name)) this.shapes[name] = generators[name](count, rand);
      });
    }

    aspectShapes.forEach((name) => (this.shapes[name] = generators[name](this.count, mulberry32(11), aspect)));
    this.ambient = this.shapes.chaos;

    this.states = this.sections.map((el) => {
      const d = el.dataset;
      const value = (key, fallback) => {
        const mobileKey = `m${key}`;
        if (mobile && d[mobileKey] !== undefined) return Number(d[mobileKey]);
        return d[key] !== undefined ? Number(d[key]) : fallback;
      };
      return { el, shape: d.shape, x: value('x', 0.5), y: value('y', 0.5), scale: value('scale', 1) };
    });
  }

  allocate() {
    const n = this.count;
    const rand = mulberry32(3);
    this.ambientStart = Math.floor(n * 0.9);

    this.px = new Float32Array(n);
    this.py = new Float32Array(n);
    this.pp = new Float32Array(n);
    this.size = new Float32Array(n);
    this.speed = new Float32Array(n);
    this.stagger = new Float32Array(n);
    this.angle = new Float32Array(n * 6);
    this.a = this.buffers(n);
    this.b = this.buffers(n);

    for (let i = 0; i < n; i++) {
      this.px[i] = rand() * window.innerWidth;
      this.py[i] = rand() * window.innerHeight;
      this.pp[i] = 1;
      this.size[i] = 0.7 + rand() * 0.7;
      this.speed[i] = 0.035 + rand() * 0.09;
      this.stagger[i] = 0.3 + rand() * 0.4;
      // Mostly upright triangles, a few tumbling ones
      const base = rand() < 0.88 ? -Math.PI / 2 + (rand() - 0.5) * 0.7 : rand() * TAU;
      for (let k = 0; k < 3; k++) {
        this.angle[i * 6 + k * 2] = Math.cos(base + (k * TAU) / 3);
        this.angle[i * 6 + k * 2 + 1] = Math.sin(base + (k * TAU) / 3);
      }
    }

    this.buckets = Array.from({ length: PALETTE.length * ALPHAS.length }, () => new Int32Array(n));
    this.bucketCounts = new Int32Array(this.buckets.length);
  }

  buffers(n) {
    // g flags particles that glow at full strength (signal pulses, highlights)
    return { x: new Float32Array(n), y: new Float32Array(n), p: new Float32Array(n), c: new Uint8Array(n), g: new Uint8Array(n) };
  }

  buildTetras() {
    const rand = mulberry32(23);
    this.tetras = Array.from({ length: 20 }, () => {
      const depth = 0.25 + rand() * 0.75;
      const big = rand() < 0.15;
      return {
        x: rand(),
        y: rand(),
        depth,
        size: (big ? 34 + rand() * 30 : 7 + rand() * 16) * (0.6 + depth * 0.6),
        color: TETRA_COLORS[Math.floor(rand() * TETRA_COLORS.length)],
        alpha: big ? 0.14 : 0.18 + rand() * 0.16,
        rx: rand() * TAU,
        ry: rand() * TAU,
        vx: (rand() - 0.5) * 0.4,
        vy: (rand() - 0.5) * 0.4,
      };
    });
  }

  // Blend the two section states that straddle the middle of the viewport.
  // Sections taller than the viewport hold their shape until their last screen.
  blend() {
    const vh = this.height;
    const mid = vh / 2;
    const spans = this.states.map(({ el }) => {
      const rect = el.getBoundingClientRect();
      const start = rect.top + Math.min(rect.height, vh) / 2;
      return [start, Math.max(start, rect.bottom - vh / 2)];
    });

    const last = spans.length - 1;
    for (let i = 0; i <= last; i++) {
      const [start, end] = spans[i];
      if (mid < start && i === 0) return [this.states[0], this.states[0], 0];
      if (mid >= start && mid <= end) return [this.states[i], this.states[i], 0];
      if (i < last && mid > end && mid < spans[i + 1][0]) {
        const t = (mid - end) / (spans[i + 1][0] - end);
        return [this.states[i], this.states[i + 1], smoothstep(t)];
      }
    }
    return [this.states[last], this.states[last], 0];
  }

  project(state, time, out) {
    const shape = this.shapes[state.shape];
    if (shape.animate && !this.reduceMotion) shape.animate(time);

    const [rx, ry, rz] = rotations[state.shape](time);
    const cxr = Math.cos(rx), sxr = Math.sin(rx);
    const cyr = Math.cos(ry), syr = Math.sin(ry);
    const czr = Math.cos(rz), szr = Math.sin(rz);

    // Rz · Rx · Ry
    const m00 = czr * cyr - szr * sxr * syr;
    const m01 = -szr * cxr;
    const m02 = czr * syr + szr * sxr * cyr;
    const m10 = szr * cyr + czr * sxr * syr;
    const m11 = czr * cxr;
    const m12 = szr * syr - czr * sxr * cyr;
    const m20 = -cxr * syr;
    const m21 = sxr;
    const m22 = cxr * cyr;

    const unit = this.unit;
    const focal = this.height * 1.8;
    const S = unit * state.scale;
    const cx = state.x * this.width + this.pointer.x * -22;
    const cy = state.y * this.height + this.pointer.y * -14;
    const { pos, nrm, col, glow } = shape;
    const { stagger } = this;

    for (let i = 0; i < this.ambientStart; i++) {
      const j = i * 3;
      const x = pos[j];
      const y = pos[j + 1];
      const z = pos[j + 2];
      const Z = m20 * x + m21 * y + m22 * z;
      const p = focal / (focal + Z * S);
      out.x[i] = cx + (m00 * x + m01 * y + m02 * z) * S * p;
      out.y[i] = cy + (m10 * x + m11 * y + m12 * z) * S * p;
      out.p[i] = p;

      let c = col[i];
      const nx = nrm[j];
      const ny = nrm[j + 1];
      const nz = nrm[j + 2];
      if (nx !== 0 || ny !== 0 || nz !== 0) {
        // Silhouette particles catch the light in champagne
        const NZ = m20 * nx + m21 * ny + m22 * nz;
        if (1 - Math.abs(NZ) > 0.42 + stagger[i] * 0.4) c = RIM;
      }
      out.c[i] = c;
      out.g[i] = glow ? glow[i] : 0;
    }
  }

  // Ambient sparks ignore the section shape and float across the whole viewport
  projectAmbient(time) {
    const ry = time * 0.025;
    const c = Math.cos(ry);
    const s = Math.sin(ry);
    const unit = this.height * 0.32;
    const focal = this.height * 1.8;
    const { pos, col } = this.ambient;
    const { a, b } = this;

    for (let i = this.ambientStart; i < this.count; i++) {
      const j = i * 3;
      const X = c * pos[j] + s * pos[j + 2];
      const Z = -s * pos[j] + c * pos[j + 2];
      const p = focal / (focal + Z * unit);
      a.x[i] = b.x[i] = this.width / 2 + X * unit * p + this.pointer.x * -30;
      a.y[i] = b.y[i] = this.height / 2 + pos[j + 1] * unit * p + this.pointer.y * -20;
      a.p[i] = b.p[i] = p;
      a.c[i] = b.c[i] = col[i];
      a.g[i] = b.g[i] = 0;
    }
  }

  drawTetras(time) {
    const { ctx, dpr, width, height, pointer } = this;
    const span = height + 200;
    ctx.lineWidth = 1.2 * dpr;

    this.tetras.forEach((t) => {
      const rx = t.rx + time * t.vx;
      const ry = t.ry + time * t.vy;
      const cx = Math.cos(rx);
      const sx = Math.sin(rx);
      const cy = Math.cos(ry);
      const sy = Math.sin(ry);

      const x0 = t.x * width + pointer.x * -40 * t.depth;
      let y0 = (t.y * span - this.smoothScroll * t.depth * 0.5) % span;
      if (y0 < 0) y0 += span;
      y0 -= 100;

      const pts = TETRA_VERTS.map(([x, y, z]) => {
        const y1 = y * cx - z * sx;
        const z1 = y * sx + z * cx;
        return [(x0 + (x * cy + z1 * sy) * t.size) * dpr, (y0 + y1 * t.size) * dpr];
      });

      ctx.strokeStyle = t.color;
      ctx.globalAlpha = t.alpha;
      ctx.beginPath();
      TETRA_EDGES.forEach(([p, q]) => {
        ctx.moveTo(pts[p][0], pts[p][1]);
        ctx.lineTo(pts[q][0], pts[q][1]);
      });
      ctx.stroke();
    });
  }

  frame(now) {
    const { ctx, canvas, pointer, a, b, px, py, pp, speed, stagger, buckets, bucketCounts, reduceMotion } = this;
    const time = reduceMotion ? 0 : (now - this.start) / 1000;

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    this.smoothScroll += (window.scrollY - this.smoothScroll) * 0.1;

    const [stateA, stateB, t] = this.blend();
    const same = stateA === stateB;
    this.project(stateA, time, a);
    if (!same) this.project(stateB, time, b);
    this.projectAmbient(time);

    bucketCounts.fill(0);
    const { width, height } = this;

    for (let i = 0; i < this.count; i++) {
      const tx = same ? a.x[i] : a.x[i] + (b.x[i] - a.x[i]) * t;
      const ty = same ? a.y[i] : a.y[i] + (b.y[i] - a.y[i]) * t;
      const tp = same ? a.p[i] : a.p[i] + (b.p[i] - a.p[i]) * t;
      // Signal pulses track their target tightly so they read as light moving along a trace
      const k = reduceMotion ? 1 : same && a.g[i] ? 0.5 : speed[i];

      px[i] += (tx - px[i]) * k;
      py[i] += (ty - py[i]) * k;
      pp[i] += (tp - pp[i]) * k;

      if (px[i] < -20 || px[i] > width + 20 || py[i] < -20 || py[i] > height + 20) continue;

      const fromA = same || t < stagger[i];
      const color = fromA ? a.c[i] : b.c[i];
      const glowing = fromA ? a.g[i] : b.g[i];
      // Ambient sparks always use the faintest level so they never sit loud behind text
      const level = glowing ? 2 : i >= this.ambientStart ? 0 : pp[i] > 1.05 ? 2 : pp[i] > 0.92 ? 1 : 0;
      const bucket = color * ALPHAS.length + level;
      buckets[bucket][bucketCounts[bucket]++] = i;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = this.dpr;

    const baseSize = 3.4 * this.dpr * Math.min(Math.max(Math.min(height, width) / 1000, 0.6), 1.2);
    const { angle, size, dpr } = this;

    for (let bucket = 0; bucket < buckets.length; bucket++) {
      const n = bucketCounts[bucket];
      if (!n) continue;
      const list = buckets[bucket];
      ctx.strokeStyle = PALETTE[Math.floor(bucket / ALPHAS.length)];
      ctx.globalAlpha = ALPHAS[bucket % ALPHAS.length];
      ctx.beginPath();
      for (let j = 0; j < n; j++) {
        const i = list[j];
        const r = baseSize * size[i] * pp[i];
        const x = px[i] * dpr;
        const y = py[i] * dpr;
        const o = i * 6;
        ctx.moveTo(x + angle[o] * r, y + angle[o + 1] * r);
        ctx.lineTo(x + angle[o + 2] * r, y + angle[o + 3] * r);
        ctx.lineTo(x + angle[o + 4] * r, y + angle[o + 5] * r);
        ctx.closePath();
      }
      ctx.stroke();
    }

    this.drawTetras(time);
    requestAnimationFrame(this.frame);
  }
}
