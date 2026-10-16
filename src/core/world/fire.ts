import * as THREE from "three";
import { mulberry32 } from "../engine/math";
import type { Actor, FrameCtx } from "../engine/world";

// Đống lửa, đuốc, lửa hiệu: mỗi điểm lửa là vài hạt sáng cộng màu (lưỡi lửa bập bùng + quầng sáng),
// tất cả trong MỘT draw call. Lửa bật dần theo thứ tự `order` khi `lit` tăng từ 0 → 1 — dùng cho cảnh
// "lửa khởi nghĩa lan khắp các quận", "trại giặc bừng cháy"…

export type FireSite = { x: number; y: number; z: number; /** 0..1 — lửa bật khi lit vượt giá trị này. */ order?: number; /** Hệ số kích thước. */ size?: number };

export type FiresOptions = {
  sites: FireSite[];
  /** Mức bật lửa theo frame: 0 = tắt hết, 1 = cháy hết (theo `order`). */
  lit: (ctx: FrameCtx) => number;
  /** Kích thước lưỡi lửa (m) ở hệ số 1. */
  size?: number;
  /** Số hạt mỗi đống lửa (lưỡi lửa + tàn bay). */
  perSite?: number;
  color?: string;
  /** Quầng sáng toả quanh đống lửa — đẹp về đêm, nhạt đi ban ngày. */
  glow?: (ctx: FrameCtx) => number;
};

export function createFires(o: FiresOptions): Actor {
  const per = Math.max(3, o.perSite ?? 7);
  const n = o.sites.length * per;
  const rand = mulberry32(o.sites.length * 31 + 7);
  const pos = new Float32Array(n * 3);
  const data = new Float32Array(n * 4); // order, seed, kind (0 quầng, 1 lửa, 2 tàn), size
  o.sites.forEach((s, j) => {
    for (let i = 0; i < per; i++) {
      const k = j * per + i;
      pos.set([s.x, s.y, s.z], k * 3);
      data.set([s.order ?? 0, rand(), i === 0 ? 0 : i < per - 2 ? 1 : 2, s.size ?? 1], k * 4);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aData", new THREE.BufferAttribute(data, 4));
  const uniforms = {
    uTime: { value: 0 },
    uPixel: { value: 1 },
    uLit: { value: 0 },
    uGlow: { value: 1 },
    uSize: { value: o.size ?? 1.6 },
    uColor: { value: new THREE.Color(o.color ?? "#ff9a3c") },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uPixel, uLit, uGlow, uSize;
      attribute vec4 aData;
      varying float vA;
      varying float vKind;
      varying float vHeat;
      void main() {
        float order = aData.x, seed = aData.y, kind = aData.z, sz = aData.w * uSize;
        // bật dần: mỗi đống lửa bùng lên trong một khoảng ngắn sau khi uLit vượt ngưỡng của nó
        float on = smoothstep(order * 0.94, order * 0.94 + 0.06, uLit);
        vec3 p = position;
        float flick = 0.75 + 0.25 * sin(uTime * (9.0 + seed * 7.0) + seed * 40.0) * sin(uTime * 5.3 + seed * 13.0);
        float size;
        if (kind < 0.5) {
          // quầng sáng sát mặt đất
          p.y += sz * 0.4;
          size = sz * 7.0 * (0.9 + 0.1 * flick);
          vA = 0.55 * uGlow;
          vHeat = 0.0;
        } else if (kind < 1.5) {
          // lưỡi lửa: bốc lên, co lại, lặp lại liên tục
          float life = fract(seed * 3.7 + uTime * (1.1 + seed * 0.6));
          p.x += sin(seed * 50.0 + uTime * 3.0) * sz * 0.18;
          p.z += cos(seed * 31.0 + uTime * 2.6) * sz * 0.18;
          p.y += life * sz * 1.5;
          size = sz * (1.6 - life * 1.1) * flick;
          vA = (1.0 - life) * 0.9;
          vHeat = 1.0 - life;
        } else {
          // tàn lửa bay lên cao, trôi theo gió
          float life = fract(seed * 5.1 + uTime * 0.35);
          p.y += life * sz * 7.0;
          p.x += sin(seed * 20.0 + uTime) * life * sz * 1.5 + life * life * sz * 1.2;
          size = sz * 0.22;
          vA = (1.0 - life) * smoothstep(0.0, 0.1, life);
          vHeat = 0.6;
        }
        vA *= on;
        vKind = kind;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        // lửa ở xa vẫn giữ tối thiểu vài điểm ảnh (quầng to hơn lưỡi lửa) để thấy được từ góc rộng
        float px = size * (300.0 / -mv.z);
        px = kind < 0.5 ? max(px, 34.0) : kind < 1.5 ? max(px, 8.0) : max(px, 2.0);
        gl_PointSize = on > 0.001 ? uPixel * px : 0.0;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vA;
      varying float vKind;
      varying float vHeat;
      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r = length(c);
        float a;
        vec3 col;
        if (vKind < 0.5) {
          a = pow(smoothstep(0.5, 0.0, r), 1.8);
          col = uColor;
        } else {
          // lõi vàng trắng, viền cam đỏ
          a = smoothstep(0.5, 0.05, r);
          col = mix(uColor * vec3(1.0, 0.55, 0.35), vec3(1.0, 0.92, 0.7), vHeat * smoothstep(0.35, 0.0, r));
        }
        a *= vA;
        gl_FragColor = vec4(col * a, a);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 3;
  return {
    object: points,
    update(ctx) {
      uniforms.uTime.value = ctx.time;
      uniforms.uPixel.value = ctx.pixelScale;
      uniforms.uLit.value = o.lit(ctx);
      uniforms.uGlow.value = o.glow ? o.glow(ctx) : 1;
      points.visible = uniforms.uLit.value > 0.001;
    },
  };
}
