import * as THREE from "three";
import { mulberry32 } from "@/core/engine/math";
import type { Actor, FrameCtx } from "@/core/engine/world";

// Đốm sáng nhỏ bốc lên chậm từ một số điểm cố định, hiện dần theo `delay` của từng điểm. Dùng để đánh dấu mà
// không phải vẽ hiện vật: chỗ tìm thấy di vật, nơi yên nghỉ, vị trí các di tích. Một draw call.

export type MoteSite = { x: number; y: number; z: number; /** Giây (theo `elapsed`) sau đó điểm này bắt đầu sáng. */ delay?: number };

export type MotesOptions = {
  sites: MoteSite[];
  perSite?: number;
  /** Độ hiện chung 0..1 — bằng 0 thì không vẽ. */
  visible: (ctx: FrameCtx) => number;
  /** Giây kể từ đầu phân cảnh (đồng hồ phân cảnh). */
  elapsed: (ctx: FrameCtx) => number;
  color?: string;
  /** Độ cao bốc lên (m) và kích thước điểm sáng (m). */
  rise?: number;
  size?: number;
  /** Bán kính toả quanh điểm (m). */
  spread?: number;
  seed?: number;
};

export function createMotes(o: MotesOptions): Actor {
  const per = o.perSite ?? 6;
  const n = o.sites.length * per;
  const rand = mulberry32(o.seed ?? 5);
  const pos = new Float32Array(n * 3);
  const data = new Float32Array(n * 3); // seed, delay, lệch ngang
  const spread = o.spread ?? 0.6;
  o.sites.forEach((s, j) => {
    for (let i = 0; i < per; i++) {
      const k = j * per + i;
      pos.set([s.x + (rand() - 0.5) * spread * 2, s.y, s.z + (rand() - 0.5) * spread * 2], k * 3);
      data.set([rand(), s.delay ?? 0, rand() * 6.28], k * 3);
    }
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aData", new THREE.BufferAttribute(data, 3));
  const uniforms = {
    uTime: { value: 0 },
    uElapsed: { value: 0 },
    uVis: { value: 0 },
    uPixel: { value: 1 },
    uRise: { value: o.rise ?? 5 },
    uSize: { value: o.size ?? 0.5 },
    uColor: { value: new THREE.Color(o.color ?? "#ffe3a8") },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uElapsed, uVis, uPixel, uRise, uSize;
      attribute vec3 aData;
      varying float vA;
      void main() {
        float on = smoothstep(aData.y, aData.y + 1.6, uElapsed);
        float life = fract(aData.x + uTime * (0.05 + aData.x * 0.04));
        vec3 p = position;
        p.y += life * uRise;
        p.x += sin(aData.z + uTime * 0.7) * 0.35 * life;
        p.z += cos(aData.z * 1.3 + uTime * 0.6) * 0.35 * life;
        vA = sin(3.14159 * life) * on * uVis;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        float px = uSize * (300.0 / -mv.z);
        gl_PointSize = vA > 0.003 ? uPixel * max(px, 5.0) : 0.0;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vA;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        float a = (pow(smoothstep(0.5, 0.0, r), 2.0) * 0.85 + smoothstep(0.12, 0.0, r)) * vA;
        gl_FragColor = vec4(uColor * a, a);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 4;
  points.visible = false;
  return {
    object: points,
    update(ctx) {
      const v = o.visible(ctx);
      points.visible = v > 0.002;
      if (!points.visible) return;
      uniforms.uTime.value = ctx.time;
      uniforms.uElapsed.value = o.elapsed(ctx);
      uniforms.uVis.value = v;
      uniforms.uPixel.value = ctx.pixelScale;
    },
    dispose() {
      geo.dispose();
      mat.dispose();
    },
  };
}
