import * as THREE from "three";
import { lerp, smoothstep } from "@/core/engine/math";
import type { Actor, FrameCtx } from "@/core/engine/world";

// Đốm sáng tự do: mỗi đốm do scene.ts đặt vị trí và độ sáng từng frame (Lạc Long Quân, Âu Cơ, Hùng Vương,
// mười lăm bộ…). Cùng lối trừu tượng với bọc trăm trứng: chỉ là ánh sáng, không vẽ hình người, rồng hay tiên.
// Tất cả đốm của một actor vẽ chung MỘT draw call; vị trí ghi vào mảng có sẵn, không cấp phát mỗi frame.

export type GlowsOptions = {
  count: number;
  /** Màu từng đốm (một màu cho tất cả, hoặc theo chỉ số). */
  color: string | ((i: number) => string);
  /** Đường kính quầng sáng (m), một số cho tất cả hoặc theo chỉ số. */
  size: number | ((i: number) => number);
  /** Kích thước tối thiểu trên màn hình (điểm ảnh ở độ cao 900 px) để đốm ở xa vẫn thấy được. */
  minPx?: number;
  /** Ghi vị trí đốm i vào `out`, trả về độ sáng 0..1. */
  place: (i: number, ctx: FrameCtx, out: THREE.Vector3) => number;
  /** Độ hiện chung 0..1 — bằng 0 thì không tính, không vẽ. */
  visible: (ctx: FrameCtx) => number;
};

export function createGlows(o: GlowsOptions): Actor {
  const n = o.count;
  const pos = new Float32Array(n * 3);
  const alpha = new Float32Array(n);
  const col = new Float32Array(n * 3);
  const sizes = new Float32Array(n);
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    c.set(typeof o.color === "string" ? o.color : o.color(i)).toArray(col, i * 3);
    sizes[i] = typeof o.size === "number" ? o.size : o.size(i);
  }
  const geo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
  const alphaAttr = new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("position", posAttr);
  geo.setAttribute("aAlpha", alphaAttr);
  geo.setAttribute("aColor", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  const uniforms = { uPixel: { value: 1 }, uTime: { value: 0 }, uMin: { value: o.minPx ?? 18 } };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uPixel, uTime, uMin;
      attribute float aAlpha;
      attribute float aSize;
      attribute vec3 aColor;
      varying float vA;
      varying vec3 vColor;
      void main() {
        // lung linh nhẹ, mỗi đốm lệch pha theo vị trí
        float tw = 0.9 + 0.1 * sin(uTime * 2.1 + position.x * 0.37 + position.z * 0.23);
        vA = aAlpha * tw;
        vColor = aColor;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        float px = aSize * (300.0 / -mv.z);
        gl_PointSize = aAlpha > 0.003 ? uPixel * max(px, uMin) * (0.94 + 0.06 * tw) : 0.0;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying float vA;
      varying vec3 vColor;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        // quầng mềm + lõi sáng gần trắng
        float halo = pow(smoothstep(0.5, 0.0, r), 2.2) * 0.75;
        float core = smoothstep(0.13, 0.0, r);
        float a = (halo + core) * vA;
        gl_FragColor = vec4(mix(vColor, vec3(1.0, 0.98, 0.9), core * 0.6) * a, a);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 5;
  points.visible = false;
  const v = new THREE.Vector3();
  return {
    object: points,
    update(ctx) {
      const vis = o.visible(ctx);
      points.visible = vis > 0.002;
      if (!points.visible) return;
      uniforms.uPixel.value = ctx.pixelScale;
      uniforms.uTime.value = ctx.time;
      for (let i = 0; i < n; i++) {
        const a = o.place(i, ctx, v) * vis;
        pos[i * 3] = v.x;
        pos[i * 3 + 1] = v.y;
        pos[i * 3 + 2] = v.z;
        alpha[i] = a;
      }
      posAttr.needsUpdate = true;
      alphaAttr.needsUpdate = true;
    },
    dispose() {
      geo.dispose();
      mat.dispose();
    },
  };
}

/**
 * Đường đi theo mốc thời gian: tới điểm i vào giây `times[i]` (tăng dần), giữa hai mốc đi nhanh dần rồi chậm lại.
 * Trước mốc đầu đứng ở điểm đầu, sau mốc cuối đứng ở điểm cuối. Không cấp phát khi tra.
 */
export function timedPath(points: [number, number, number][], times: number[]) {
  return (t: number, out: THREE.Vector3) => {
    let k = 0;
    while (k < points.length - 2 && t > times[k + 1]) k++;
    const f = smoothstep(times[k], times[k + 1] ?? times[k], t);
    const a = points[k];
    const b = points[Math.min(k + 1, points.length - 1)];
    return out.set(lerp(a[0], b[0], f), lerp(a[1], b[1], f), lerp(a[2], b[2], f));
  };
}
