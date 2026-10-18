import * as THREE from "three";
import { clamp, lerp, mulberry32 } from "../engine/math";
import type { Actor, FrameCtx } from "../engine/world";

// Đoàn người, đoàn quân nhìn từ xa: mỗi người là một chấm dáng đứng (đầu + thân thuôn), không vẽ mặt mũi,
// trang phục, vũ khí hay cờ hiệu — tránh tự minh hoạ những gì chưa có tư liệu hiện vật. Mỗi nhóm đi theo một
// đường gấp khúc và giữ đội hình (ngang × sâu). Vị trí tính trên CPU (vài trăm chấm, không cấp phát mỗi frame)
// rồi vẽ chung MỘT draw call; độ cao lấy mẫu sẵn dọc đường đi nên không gọi hàm địa hình mỗi frame.

export type CrowdGroup = {
  /** Đường đi [x, z], ít nhất hai điểm. */
  path: [number, number][];
  count: number;
  /** Đội hình: bề ngang, bề sâu (m). Người đầu đội ở đúng điểm trên đường, người sau lùi lại phía sau. */
  spread?: [number, number];
  color: string;
  /** Màu khi đi hết đường (đổi dần theo quãng đã đi) — vd. hai nhóm hợp lại thành một. */
  arrive?: string;
  /** Ánh xạ tiến trình chung → quãng đã đi (0..1): các cặp [tiến trình, quãng] theo tiến trình tăng dần. Mặc định [[0, 0], [1, 1]]. */
  timing?: [number, number][];
  /** Chỉ hiện trong khoảng tiến trình này (mờ dần ở hai đầu). */
  show?: [number, number];
  /** Rải dọc đường: người thứ i dừng lại ở quãng i/count — dấu vết để lại sau lưng người đi đầu. */
  drop?: boolean;
  /** Hệ số kích thước. */
  size?: number;
  /** Nhóm có ngã xuống khi `fall` tăng (người gần giữa đội hình ngã trước). */
  mortal?: boolean;
};

export type CrowdOptions = {
  groups: CrowdGroup[];
  height: (x: number, z: number) => number;
  /** Tiến trình chung 0..1 (thường lấy từ đồng hồ phân cảnh). */
  progress: (ctx: FrameCtx) => number;
  /** Độ hiện chung 0..1 — bằng 0 thì không vẽ, không tính. */
  visible: (ctx: FrameCtx) => number;
  /** Tỉ lệ ngã 0..1 của các nhóm `mortal`. */
  fall?: (ctx: FrameCtx) => number;
  /** Chấm phát sáng cộng màu thay vì chấm mực — cho ánh sáng huyền thoại, người đi đêm. */
  glow?: boolean;
  /** Chiều cao một người (m). */
  size?: number;
  seed?: number;
};

const STEP = 2;

type Track = { xs: Float32Array; zs: Float32Array; ys: Float32Array; n: number; length: number };

function track(path: [number, number][], height: (x: number, z: number) => number): Track {
  const pts: number[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const [ax, az] = path[i];
    const [bx, bz] = path[i + 1];
    const seg = Math.max(1, Math.ceil(Math.hypot(bx - ax, bz - az) / STEP));
    for (let j = 0; j < seg; j++) pts.push(lerp(ax, bx, j / seg), lerp(az, bz, j / seg));
  }
  pts.push(...path[path.length - 1]);
  // lấy mẫu lại cho đều bước để tra theo quãng đường bằng phép chia
  const raw = pts.length / 2;
  const cum = [0];
  for (let i = 1; i < raw; i++) cum.push(cum[i - 1] + Math.hypot(pts[i * 2] - pts[i * 2 - 2], pts[i * 2 + 1] - pts[i * 2 - 1]));
  const length = cum[raw - 1];
  const n = Math.max(2, Math.ceil(length / STEP) + 1);
  const xs = new Float32Array(n);
  const zs = new Float32Array(n);
  const ys = new Float32Array(n);
  let k = 0;
  for (let i = 0; i < n; i++) {
    const d = (i / (n - 1)) * length;
    while (k < raw - 2 && cum[k + 1] < d) k++;
    const f = clamp((d - cum[k]) / (cum[k + 1] - cum[k] || 1));
    xs[i] = lerp(pts[k * 2], pts[k * 2 + 2], f);
    zs[i] = lerp(pts[k * 2 + 1], pts[k * 2 + 3], f);
    ys[i] = height(xs[i], zs[i]);
  }
  return { xs, zs, ys, n, length };
}

const out = { x: 0, y: 0, z: 0, dx: 0, dz: 1 };
/** Điểm ở quãng d (m) trên đường; ngoài hai đầu thì kéo dài theo hướng đoạn đầu/cuối. */
function sample(t: Track, d: number) {
  const u = clamp(d / (t.length || 1)) * (t.n - 1);
  const i = Math.min(t.n - 2, Math.floor(u));
  const f = u - i;
  const dx = t.xs[i + 1] - t.xs[i];
  const dz = t.zs[i + 1] - t.zs[i];
  const len = Math.hypot(dx, dz) || 1;
  out.dx = dx / len;
  out.dz = dz / len;
  out.x = lerp(t.xs[i], t.xs[i + 1], f);
  out.z = lerp(t.zs[i], t.zs[i + 1], f);
  out.y = lerp(t.ys[i], t.ys[i + 1], f);
  const extra = d < 0 ? d : d > t.length ? d - t.length : 0;
  out.x += out.dx * extra;
  out.z += out.dz * extra;
  return out;
}

function remap(keys: [number, number][] | undefined, p: number) {
  if (!keys) return clamp(p);
  if (p <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [a, va] = keys[i - 1];
    const [b, vb] = keys[i];
    if (p <= b) return lerp(va, vb, clamp((p - a) / (b - a || 1)));
  }
  return keys[keys.length - 1][1];
}

export function createCrowd(o: CrowdOptions): Actor {
  const rand = mulberry32(o.seed ?? 7);
  const tracks = o.groups.map((g) => track(g.path, o.height));
  const n = o.groups.reduce((s, g) => s + g.count, 0);
  // mỗi người: nhóm, lệch ngang, lùi sau, seed, thứ tự ngã
  const who = new Uint16Array(n);
  const lat = new Float32Array(n);
  const back = new Float32Array(n);
  const seed = new Float32Array(n);
  const rank = new Float32Array(n);
  let k = 0;
  o.groups.forEach((g, gi) => {
    const [w, d] = g.spread ?? [0, 0];
    const cols = Math.max(1, Math.round(Math.sqrt((g.count * (w || 1)) / (d || 1))));
    for (let i = 0; i < g.count; i++, k++) {
      const c = i % cols;
      const r = Math.floor(i / cols);
      const rows = Math.ceil(g.count / cols);
      who[k] = gi;
      lat[k] = (cols > 1 ? c / (cols - 1) - 0.5 : 0) * w + (rand() - 0.5) * (w / cols) * 0.7;
      back[k] = (rows > 1 ? r / (rows - 1) : 0) * d + rand() * (d / rows) * 0.6;
      seed[k] = rand();
      // giữa đội hình ngã trước, rìa ngã sau (như trúng một phát vào giữa)
      const cx = w ? lat[k] / (w / 2) : 0;
      const cz = d ? back[k] / d - 0.5 : 0;
      rank[k] = clamp(Math.hypot(cx, cz * 2) * 0.55 + rand() * 0.4);
    }
  });

  const pos = new Float32Array(n * 3);
  const alpha = new Float32Array(n);
  const col = new Float32Array(n * 3);
  const sizes = new Float32Array(n);
  const anyArrive = o.groups.some((g) => g.arrive);
  const from = o.groups.map((g) => new THREE.Color(g.color));
  const to = o.groups.map((g) => new THREE.Color(g.arrive ?? g.color));
  for (let i = 0; i < n; i++) {
    const g = o.groups[who[i]];
    sizes[i] = (g.size ?? 1) * (0.9 + seed[i] * 0.2);
    from[who[i]].toArray(col, i * 3);
  }
  const geo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
  const alphaAttr = new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage);
  const colAttr = new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("position", posAttr);
  geo.setAttribute("aAlpha", alphaAttr);
  geo.setAttribute("aColor", colAttr);
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  const uniforms = { uPixel: { value: 1 }, uSize: { value: o.size ?? 1.8 } };
  const glow = !!o.glow;
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: glow ? THREE.AdditiveBlending : THREE.NormalBlending,
    defines: glow ? { GLOW: 1 } : {},
    vertexShader: /* glsl */ `
      uniform float uPixel, uSize;
      attribute float aAlpha;
      attribute float aSize;
      attribute vec3 aColor;
      varying float vA;
      varying vec3 vColor;
      void main() {
        vA = aAlpha;
        vColor = aColor;
        vec3 p = position;
        float s = uSize * aSize;
        #ifdef GLOW
          s *= 3.0;
        #else
          p.y += s * 0.5; // tâm chấm ở giữa thân, chân chạm đất
        #endif
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        // ở xa vẫn giữ tối thiểu vài điểm ảnh để thấy đoàn người di chuyển
        float px = s * (300.0 / -mv.z);
        gl_PointSize = aAlpha > 0.003 ? uPixel * max(px, ${glow ? "12.0" : "3.5"}) : 0.0;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying float vA;
      varying vec3 vColor;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        #ifdef GLOW
          float r = length(c);
          float a = (pow(smoothstep(0.5, 0.0, r), 2.0) * 0.8 + smoothstep(0.14, 0.0, r)) * vA;
          gl_FragColor = vec4(vColor * a, a);
        #else
          // dáng người đứng: đầu tròn + thân thuôn dần xuống chân
          float head = length(c - vec2(0.0, -0.33)) - 0.11;
          float w = mix(0.17, 0.09, clamp((c.y + 0.2) / 0.7, 0.0, 1.0));
          float body = max(abs(c.x) - w, max(-0.2 - c.y, c.y - 0.5));
          float d = min(head, body);
          float a = smoothstep(0.04, -0.02, d) * vA;
          if (a < 0.01) discard;
          gl_FragColor = vec4(vColor, a);
        #endif
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = glow ? 4 : 2;
  points.visible = false;

  return {
    object: points,
    update(ctx) {
      const vis = o.visible(ctx);
      points.visible = vis > 0.002;
      if (!points.visible) return;
      uniforms.uPixel.value = ctx.pixelScale;
      const p = o.progress(ctx);
      const fall = o.fall ? o.fall(ctx) : 0;
      let gi = -1;
      let f = 0;
      let show = 1;
      let g = o.groups[0];
      let tr = tracks[0];
      for (let i = 0; i < n; i++) {
        if (who[i] !== gi) {
          gi = who[i];
          g = o.groups[gi];
          tr = tracks[gi];
          f = remap(g.timing, p);
          show = 1;
          if (g.show) {
            const [a, b] = g.show;
            show = clamp((p - a) / 0.04) * clamp((b - p) / 0.04);
          }
        }
        let a = vis * show;
        let s: typeof out;
        if (g.drop) {
          const at = (seed[i] * 0.15 + (i % g.count) / g.count) * 0.92;
          s = sample(tr, at * tr.length);
          a *= clamp((f - at) * 40);
        } else {
          s = sample(tr, f * tr.length - back[i]);
        }
        // lệch ngang theo pháp tuyến đường đi + đi lại lững thững tại chỗ
        const wob = ctx.time * (0.6 + seed[i] * 0.5) + seed[i] * 40;
        const x = s.x - s.dz * lat[i] + Math.sin(wob) * 0.35;
        const z = s.z + s.dx * lat[i] + Math.cos(wob * 0.8) * 0.35;
        let y = s.y + 0.05;
        if (g.mortal && fall > rank[i]) {
          const down = clamp((fall - rank[i]) * 7);
          a *= 1 - down;
          y -= down * 1.2;
        }
        pos[i * 3] = x;
        pos[i * 3 + 1] = y;
        pos[i * 3 + 2] = z;
        alpha[i] = a;
        if (g.arrive) {
          const c0 = from[gi];
          const c1 = to[gi];
          const m = clamp((f - 0.7) / 0.3);
          col[i * 3] = lerp(c0.r, c1.r, m);
          col[i * 3 + 1] = lerp(c0.g, c1.g, m);
          col[i * 3 + 2] = lerp(c0.b, c1.b, m);
        }
      }
      posAttr.needsUpdate = true;
      alphaAttr.needsUpdate = true;
      if (anyArrive) colAttr.needsUpdate = true;
    },
    dispose() {
      geo.dispose();
      mat.dispose();
    },
  };
}
