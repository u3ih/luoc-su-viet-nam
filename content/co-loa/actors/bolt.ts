import * as THREE from "three";
import type { Actor, FrameCtx } from "@/core/engine/world";

// Phát nỏ trong truyền thuyết: một vệt sáng vàng bay theo đường cong từ mặt thành tới giữa đội quân,
// trúng thì loé sáng. Khi nỏ "mất linh", vệt sáng bay được nửa đường thì chúi xuống, tắt dần, không loé.
// Thể hiện bằng ánh sáng trừu tượng — không vẽ hình chiếc nỏ (chưa có hiện vật để đối chiếu).

export type BoltOptions = {
  from: THREE.Vector3;
  to: THREE.Vector3;
  /** Độ vồng của đường bay (m). */
  arc?: number;
  /** Pha: < 0 chưa bắn; 0..1 đang bay; 1..2 loé sáng rồi tắt; > 2 xong. */
  phase: (ctx: FrameCtx) => number;
  /** Nỏ mất linh: rơi giữa chừng. */
  fizzle?: boolean;
};

const TRAIL = 48;

export function createBolt(o: BoltOptions): Actor {
  const n = TRAIL + 1;
  const idx = new Float32Array(n);
  for (let i = 0; i < n; i++) idx[i] = i;
  const geo = new THREE.BufferGeometry();
  // vị trí thật tính trong shader; position chỉ để three.js biết số đỉnh
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  geo.setAttribute("aIdx", new THREE.BufferAttribute(idx, 1));
  const uniforms = {
    uPixel: { value: 1 },
    uPhase: { value: -1 },
    uFrom: { value: o.from.clone() },
    uTo: { value: o.to.clone() },
    uArc: { value: o.arc ?? 14 },
    uFizzle: { value: o.fizzle ? 1 : 0 },
    uColor: { value: new THREE.Color("#ffd27a") },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uPixel, uPhase, uArc, uFizzle;
      uniform vec3 uFrom, uTo;
      attribute float aIdx;
      varying float vA;
      vec3 at(float s) {
        vec3 p = mix(uFrom, uTo, s);
        p.y += sin(s * 3.14159) * uArc;
        // mất linh: quá nửa đường thì chúi xuống đất
        p.y -= uFizzle * pow(max(s - 0.35, 0.0) * 2.2, 2.0) * uArc * 1.4;
        return p;
      }
      void main() {
        float size;
        vec3 p;
        float reach = uFizzle > 0.5 ? 0.62 : 1.0;
        if (aIdx < 0.5) {
          // loé sáng ở chỗ trúng
          p = uTo + vec3(0.0, 2.0, 0.0);
          float k = uPhase - 1.0;
          vA = uFizzle > 0.5 ? 0.0 : step(0.0, k) * (1.0 - smoothstep(0.0, 1.0, k)) * 1.4;
          size = 48.0 + k * 70.0;
        } else {
          // đầu mũi + đuôi sáng mờ dần phía sau
          float lag = (aIdx - 1.0) * 0.005;
          float s = clamp(uPhase - lag, 0.0, 1.0) * reach;
          p = at(s);
          float head = 1.0 - (aIdx - 1.0) / ${TRAIL.toFixed(1)};
          float flying = step(0.0, uPhase - lag) * (1.0 - step(1.0, uPhase - lag));
          float dim = uFizzle > 0.5 ? 1.0 - smoothstep(0.55, 1.0, uPhase) : 1.0;
          vA = flying * head * dim;
          size = 3.2 * (0.3 + head);
        }
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = vA > 0.003 ? uPixel * max(size * (300.0 / -mv.z), 3.0) : 0.0;
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vA;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        float a = (pow(smoothstep(0.5, 0.0, r), 2.0) + smoothstep(0.12, 0.0, r)) * vA;
        gl_FragColor = vec4(mix(uColor, vec3(1.0, 0.97, 0.85), smoothstep(0.2, 0.0, r)) * a, a);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 5;
  points.visible = false;
  return {
    object: points,
    update(ctx) {
      const ph = o.phase(ctx);
      points.visible = ph > 0 && ph < 2.2;
      uniforms.uPhase.value = ph;
      uniforms.uPixel.value = ctx.pixelScale;
    },
    dispose() {
      geo.dispose();
      mat.dispose();
    },
  };
}
