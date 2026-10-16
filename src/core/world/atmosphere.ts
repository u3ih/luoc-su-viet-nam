import * as THREE from "three";
import { mulberry32 } from "../engine/math";
import type { Actor, FrameCtx } from "../engine/world";
import type { MoodState } from "./sky";

const NOISE = /* glsl */ `
float aHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float aNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(aHash(i), aHash(i + vec2(1, 0)), u.x), mix(aHash(i + vec2(0, 1)), aHash(i + vec2(1, 1)), u.x), u.y);
}
float aFbm(vec2 p) { return aNoise(p) * 0.5 + aNoise(p * 2.1 + 3.7) * 0.3 + aNoise(p * 4.3 + 9.1) * 0.2; }`;

// ---------------------------------------------------------------------------
// Khói bếp: cột hạt bốc lên, loe rộng, bị gió đẩy lệch, tan dần.

export type SmokeOptions = {
  sources: THREE.Vector3Like[];
  perSource?: number;
  /** Chiều cao cột khói (m). */
  height?: number;
  color?: string;
  /** Hướng gió đẩy khói (xz). */
  wind?: [number, number];
};

export function createSmoke(o: SmokeOptions): Actor {
  const per = o.perSource ?? 36;
  const n = o.sources.length * per;
  const rand = mulberry32(313);
  const pos = new Float32Array(n * 3);
  const seed = new Float32Array(n);
  o.sources.forEach((s, j) => {
    for (let i = 0; i < per; i++) {
      const k = j * per + i;
      pos.set([s.x, s.y, s.z], k * 3);
      seed[k] = (i + rand() * 0.6) / per;
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const uniforms = {
    uTime: { value: 0 },
    uPixel: { value: 1 },
    uHeight: { value: o.height ?? 16 },
    uWind: { value: new THREE.Vector2(...(o.wind ?? [1.0, 0.4])) },
    uColor: { value: new THREE.Color(o.color ?? "#d8d0c4") },
    uLight: { value: new THREE.Color(1, 1, 1) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      uniform float uTime, uPixel, uHeight;
      uniform vec2 uWind;
      attribute float aSeed;
      varying float vA;
      varying float vSeed;
      void main() {
        float life = fract(aSeed + uTime * 0.035);
        vec3 p = position;
        float rise = life * uHeight;
        p.y += rise;
        // gió đẩy lệch dần theo độ cao + uốn lượn
        p.xz += uWind * rise * rise * 0.04;
        p.x += sin(uTime * 0.5 + aSeed * 30.0 + rise * 0.3) * life * 1.4;
        p.z += cos(uTime * 0.4 + aSeed * 21.0 + rise * 0.25) * life * 1.1;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uPixel * (1.2 + life * 9.0) * (60.0 / -mv.z);
        vA = smoothstep(0.0, 0.08, life) * (1.0 - smoothstep(0.45, 1.0, life)) * 0.32;
        vSeed = aSeed;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uLight;
      varying float vA;
      varying float vSeed;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r = length(c);
        float a = smoothstep(0.5, 0.1, r) * vA;
        gl_FragColor = vec4(uColor * uLight * (0.85 + 0.3 * (0.5 - c.y)), a);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  return {
    object: points,
    update(ctx) {
      uniforms.uTime.value = ctx.time;
      uniforms.uPixel.value = ctx.pixelScale;
    },
  };
}

// ---------------------------------------------------------------------------
// Sương mỏng là là mặt nước / ruộng: vài lớp mặt phẳng trong suốt, nhiễu trôi chậm.

export type MistOptions = {
  center: THREE.Vector3Like;
  size: [number, number];
  /** Độ đặc theo frame (vd. dày lúc bình minh, tan lúc trưa). */
  density: (ctx: FrameCtx) => number;
  layers?: number;
  /** Mực đáy lớp sương theo frame (vd. bám mặt nước). */
  base?: (ctx: FrameCtx) => number;
  mood: MoodState;
};

export function createMist(o: MistOptions): Actor {
  const layers = o.layers ?? 3;
  const group = new THREE.Group();
  const shared = {
    uTime: { value: 0 },
    uDensity: { value: 0 },
    uColor: { value: new THREE.Color() },
    uSun: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3() },
  };
  for (let i = 0; i < layers; i++) {
    const geo = new THREE.PlaneGeometry(o.size[0], o.size[1], 1, 1);
    geo.rotateX(-Math.PI / 2);
    const mat = new THREE.ShaderMaterial({
      uniforms: { ...shared, uLayer: { value: i / Math.max(1, layers - 1) } },
      transparent: true,
      depthWrite: false,
      vertexShader: /* glsl */ `
        varying vec3 vWorld;
        void main() {
          vec4 w = modelMatrix * vec4(position, 1.0);
          vWorld = w.xyz;
          gl_Position = projectionMatrix * viewMatrix * w;
        }`,
      fragmentShader: /* glsl */ `
        uniform float uTime, uDensity, uLayer;
        uniform vec3 uColor, uSun, uSunDir;
        varying vec3 vWorld;
        ${NOISE}
        void main() {
          vec2 p = vWorld.xz * (0.018 + uLayer * 0.01) + vec2(uTime * (0.006 + uLayer * 0.004), uTime * 0.003);
          float n = aFbm(p + aFbm(p * 0.7 + uLayer * 5.0));
          float a = smoothstep(0.35, 0.85, n) * uDensity * (0.55 - uLayer * 0.15);
          // mờ ở gần máy quay để khỏi thành tấm kính phẳng
          float d = distance(vWorld, cameraPosition);
          a *= smoothstep(6.0, 40.0, d) * (1.0 - smoothstep(260.0, 480.0, d));
          vec3 V = normalize(vWorld - cameraPosition);
          vec3 col = mix(uColor, uSun, pow(max(dot(V, uSunDir), 0.0), 6.0) * 0.6);
          gl_FragColor = vec4(col, a);
        }`,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(o.center.x, o.center.y + i * 1.6, o.center.z);
    mesh.renderOrder = 2;
    mesh.frustumCulled = false;
    group.add(mesh);
  }
  const white = new THREE.Color(1, 1, 1);
  return {
    object: group,
    update(ctx) {
      shared.uTime.value = ctx.time;
      shared.uDensity.value = o.density(ctx);
      shared.uColor.value.copy(o.mood.fog).lerp(white, 0.35);
      shared.uSun.value.copy(o.mood.sun);
      shared.uSunDir.value.copy(o.mood.sunDir);
      const base = o.base ? o.base(ctx) : o.center.y;
      group.children.forEach((m, i) => (m.position.y = base + 0.4 + i * 1.6));
      group.visible = shared.uDensity.value > 0.01;
    },
  };
}

// ---------------------------------------------------------------------------
// Dãy núi xa: các vòng sống núi chồng lớp, màu nhạt dần về chân trời (phối cảnh khí quyển).

export type RangesOptions = {
  center: THREE.Vector3Like;
  /** Bán kính lớp gần nhất; mỗi lớp sau xa thêm `spacing`. */
  radius: number;
  spacing?: number;
  layers?: number;
  /** Chiều cao sống núi theo góc (rad, 0 = +x, π/2 = +z) và lớp (0 gần). Trả ≤ 0 để bỏ trống (vd. hướng biển). */
  profile: (angle: number, layer: number) => number;
  mood: MoodState;
};

export function createRanges(o: RangesOptions): Actor {
  const layers = o.layers ?? 3;
  const spacing = o.spacing ?? 120;
  const seg = 360;
  const group = new THREE.Group();
  const mats: THREE.MeshBasicMaterial[] = [];
  for (let l = 0; l < layers; l++) {
    const r = o.radius + l * spacing;
    const pos: number[] = [];
    const col: number[] = [];
    for (let i = 0; i <= seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      const h = Math.max(0, o.profile(a, l));
      const x = o.center.x + Math.cos(a) * r;
      const z = o.center.z + Math.sin(a) * r;
      pos.push(x, o.center.y - 20, z, x, o.center.y + h, z);
      // chân núi đậm, sống núi nhạt dần trong sương
      col.push(1, 1, 1, 0.82, 0.82, 0.82);
    }
    const idx: number[] = [];
    for (let i = 0; i < seg; i++) {
      const a = i * 2;
      idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    geo.setIndex(idx);
    const mat = new THREE.MeshBasicMaterial({ vertexColors: true, fog: false, side: THREE.DoubleSide });
    mats.push(mat);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.frustumCulled = false;
    mesh.renderOrder = -1 + l * -0.01;
    group.add(mesh);
  }
  return {
    object: group,
    update() {
      // lớp gần: pha tối từ màu sương; lớp xa: gần như tan vào chân trời
      mats.forEach((m, l) => {
        const k = layers > 1 ? l / (layers - 1) : 0;
        m.color.copy(o.mood.fog).multiplyScalar(0.62 + k * 0.22).lerp(o.mood.horizon, 0.25 + k * 0.45);
      });
    },
  };
}
