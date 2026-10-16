import * as THREE from "three";
import type { Actor } from "../engine/world";
import { mulberry32 } from "../engine/math";

/** Bụi vàng lơ lửng trôi chậm — 1 draw call, tạo chiều sâu không khí. */
export function createDust(count: number, center: THREE.Vector3Like, extent: THREE.Vector3Like, color = "#f0c878"): Actor {
  const rand = mulberry32(1288);
  const pos = new Float32Array(count * 3);
  const seed = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    pos[i * 3] = center.x + (rand() - 0.5) * extent.x;
    pos[i * 3 + 1] = center.y + rand() * extent.y;
    pos[i * 3 + 2] = (rand() - 0.5) * extent.z;
    seed[i] = rand();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  const uniforms = {
    uTime: { value: 0 },
    uColor: { value: new THREE.Color(color) },
    uPixel: { value: 1 },
    uZ: { value: new THREE.Vector2(center.z, extent.z) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uPixel;
      uniform vec2 uZ;
      attribute float aSeed;
      varying float vA;
      void main() {
        vec3 p = position;
        p.x += sin(uTime * 0.12 + aSeed * 40.0) * 3.0;
        p.y += sin(uTime * 0.2 + aSeed * 17.0) * 1.5;
        p.z = uZ.x + mod(p.z + uTime * 0.6 * (0.5 + aSeed) + uZ.y * 0.5, uZ.y) - uZ.y * 0.5;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = uPixel * (1.0 + aSeed * 2.0) * (90.0 / -mv.z);
        vA = (0.35 + 0.65 * (sin(uTime * (0.6 + aSeed) + aSeed * 30.0) * 0.5 + 0.5)) * smoothstep(160.0, 30.0, -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vA;
      void main() {
        float a = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)) * vA * 0.55;
        gl_FragColor = vec4(uColor * a, a);
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
