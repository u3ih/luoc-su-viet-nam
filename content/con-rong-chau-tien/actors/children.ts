import * as THREE from "three";
import { mulberry32 } from "@/core/engine/math";
import type { Actor, FrameCtx } from "@/core/engine/world";

// Bọc trăm trứng: một quầng sáng trên gò giữa đồng bằng, trong có trăm đốm sáng xoay quanh.
// Khi `spread` tăng từ 0 → 1, bọc tan, năm mươi đốm bay lên núi, năm mươi đốm bay ra biển theo đường vòng cung.
// Cách thể hiện trừu tượng (đốm sáng), không vẽ hình người hay rồng, tiên — tránh tự "minh hoạ" truyền thuyết.

export type ChildrenOptions = {
  center: THREE.Vector3;
  /** Điểm đến của nhóm theo mẹ lên núi và nhóm theo cha xuống biển. */
  mountain: THREE.Vector3[];
  sea: THREE.Vector3[];
  /** Độ hiện của bọc (0..1), độ chia (0..1), độ sáng chung về sau (0..1). */
  orb: (ctx: FrameCtx) => number;
  spread: (ctx: FrameCtx) => number;
  glow: (ctx: FrameCtx) => number;
  /** Trứng nở (0..1): 0 = trăm trứng nằm im trong bọc, 1 = đã nở, bay lượn. Mặc định 1. */
  hatch?: (ctx: FrameCtx) => number;
};

export function createChildren(o: ChildrenOptions): Actor {
  const rand = mulberry32(100);
  const ends = [...o.mountain.map((p) => [p, 0] as const), ...o.sea.map((p) => [p, 1] as const)];
  const n = ends.length + 1; // +1: chính cái bọc
  const start = new Float32Array(n * 3);
  const end = new Float32Array(n * 3);
  const data = new Float32Array(n * 3); // seed, nhóm (0 núi, 1 biển, 2 bọc), độ cao vòng cung
  ends.forEach(([p, g], i) => {
    start.set([o.center.x, o.center.y, o.center.z], i * 3);
    end.set([p.x, p.y, p.z], i * 3);
    data.set([rand(), g, 22 + rand() * 34], i * 3);
  });
  start.set([o.center.x, o.center.y, o.center.z], ends.length * 3);
  end.set([o.center.x, o.center.y, o.center.z], ends.length * 3);
  data.set([0.5, 2, 0], ends.length * 3);

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(start, 3));
  geo.setAttribute("aEnd", new THREE.BufferAttribute(end, 3));
  geo.setAttribute("aData", new THREE.BufferAttribute(data, 3));
  const uniforms = {
    uTime: { value: 0 },
    uPixel: { value: 1 },
    uOrb: { value: 0 },
    uSpread: { value: 0 },
    uGlow: { value: 1 },
    uHatch: { value: 1 },
    uMountain: { value: new THREE.Color("#ffd98a") },
    uSea: { value: new THREE.Color("#9fe0d0") },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      uniform float uTime, uPixel, uOrb, uSpread, uGlow, uHatch;
      attribute vec3 aEnd;
      attribute vec3 aData;
      varying float vA;
      varying float vGroup;
      varying float vCore;
      varying float vHatch;
      void main() {
        float seed = aData.x, group = aData.y, arc = aData.z;
        vec3 p;
        float size;
        if (group > 1.5) {
          // cái bọc: phập phồng như hơi thở, tan dần khi trứng nở
          p = position + vec3(0.0, sin(uTime * 0.8) * 0.3, 0.0);
          size = 60.0 * (1.0 + sin(uTime * 1.6) * 0.06) * (1.0 + uSpread * 0.8);
          vA = uOrb * (1.0 - smoothstep(0.0, 0.35, uSpread)) * 0.95;
          vCore = 1.0;
          vHatch = 1.0;
        } else {
          // mỗi đốm rời bọc lệch nhau một chút, bay theo vòng cung rồi lơ lửng ở nơi đến
          float e = smoothstep(seed * 0.35, seed * 0.35 + 0.65, uSpread);
          float a = seed * 40.0 + uTime * (0.5 + seed * 0.4);
          vec3 orbit = vec3(cos(a), sin(a * 1.3) * 0.6, sin(a)) * (1.2 + seed * 1.6);
          // trước khi nở: trứng nằm im, xếp chặt quanh tâm bọc; mỗi trứng nở lệch nhau, loé lên một chút
          float h = smoothstep(fract(seed * 7.31) * 0.8, fract(seed * 7.31) * 0.8 + 0.2, uHatch);
          vec3 egg = vec3(cos(seed * 91.0), sin(seed * 57.0) * 0.6, sin(seed * 91.0)) * (0.35 + fract(seed * 13.0) * 0.55);
          p = mix(position + mix(egg, orbit, h), aEnd, e);
          p.y += sin(e * 3.14159) * arc + sin(uTime * 0.9 + seed * 20.0) * 0.4 * e;
          size = (6.0 + seed * 2.5) * mix(0.55, 1.0, h) * (1.0 + h * (1.0 - h) * 4.0);
          vA = uOrb * mix(1.0, uGlow, e) * mix(0.55, 1.0, h);
          vHatch = h;
          vCore = 0.0;
        }
        vGroup = group;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        // đốm ở xa vẫn giữ tối thiểu vài điểm ảnh để thấy được đường bay
        gl_PointSize = uPixel * (group > 1.5 ? size * (120.0 / -mv.z) : max(size * (120.0 / -mv.z), 11.0));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uMountain, uSea;
      varying float vA;
      varying float vGroup;
      varying float vCore;
      varying float vHatch;
      void main() {
        float r = length(gl_PointCoord - 0.5);
        // trứng chưa nở màu trắng ngà, nở rồi mới mang màu của nhóm
        vec3 col = mix(vec3(1.0, 0.95, 0.85), vGroup > 0.5 && vGroup < 1.5 ? uSea : uMountain, vHatch);
        // bọc: lõi sáng trắng vàng + quầng loang; đốm: chấm sáng có viền mềm
        float a = vCore > 0.5 ? pow(smoothstep(0.5, 0.0, r), 1.6) + smoothstep(0.12, 0.0, r) * 0.8 : pow(smoothstep(0.5, 0.0, r), 2.2) * 0.7 + smoothstep(0.16, 0.0, r);
        a *= vA;
        gl_FragColor = vec4(col * a, a);
      }`,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 4;
  return {
    object: points,
    update(ctx) {
      uniforms.uTime.value = ctx.time;
      uniforms.uPixel.value = ctx.pixelScale;
      uniforms.uOrb.value = o.orb(ctx);
      uniforms.uSpread.value = o.spread(ctx);
      uniforms.uGlow.value = o.glow(ctx);
      uniforms.uHatch.value = o.hatch ? o.hatch(ctx) : 1;
      points.visible = uniforms.uOrb.value > 0.002;
    },
  };
}
