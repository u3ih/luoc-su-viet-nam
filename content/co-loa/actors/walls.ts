import * as THREE from "three";
import type { Quality } from "@/core/engine/quality";
import type { Actor, FrameCtx } from "@/core/engine/world";
import type { Wall } from "../terrain";

// Ba vòng thành đất Cổ Loa: mỗi vòng là một dải mặt cắt hình thang chạy theo đường tim thành.
// Chiều cao "đắp" (0..1) đẩy trong vertex shader nên đắp thành chỉ đổi một uniform, không dựng lại hình.
// Cũng trong shader: vệt sáng vàng chạy dọc đường tim (chỉ cho người xem thấy từng vòng) và độ mòn
// (đất thành sụt thành từng quãng, chỉ còn những đoạn như ngày nay).

export type WallsOptions = {
  walls: Wall[];
  height: (x: number, z: number) => number;
  /** Mức đắp của vòng thứ k (0 = mặt đất, 1 = xong). */
  built: (k: number, ctx: FrameCtx) => number;
  /** Vệt sáng chạy dọc vòng k: đầu vệt (0..1 quanh vòng) và độ sáng (0..1). */
  traceHead?: (k: number, ctx: FrameCtx) => number;
  traceOn?: (k: number, ctx: FrameCtx) => number;
  /** Độ mòn 0..1: 1 = chỉ còn từng đoạn thành. */
  wear?: (ctx: FrameCtx) => number;
  quality: Quality;
};

const SIDE = new THREE.Color("#8a6644");
const TOP = new THREE.Color("#6b8a3c");

function wallGeometry(w: Wall, height: (x: number, z: number) => number, seg: number) {
  // mặt cắt: chân ngoài → vai ngoài → vai trong → chân trong (lift 0/1)
  const profile: [number, number][] = [
    [-w.base / 2, 0],
    [-w.top / 2, 1],
    [w.top / 2, 1],
    [w.base / 2, 0],
  ];
  const pos: number[] = [];
  const base: number[] = [];
  const lift: number[] = [];
  const along: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const P = profile.length;
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const [x, z] = w.at(a);
    const [x2, z2] = w.at(a + 0.002);
    // pháp tuyến ngang (vuông góc đường tim, hướng ra ngoài)
    let nx = z2 - z;
    let nz = -(x2 - x);
    const len = Math.hypot(nx, nz) || 1;
    nx /= len;
    nz /= len;
    for (const [off, l] of profile) {
      const px = x + nx * off;
      const pz = z + nz * off;
      const g = height(px, pz);
      pos.push(px, g + l * w.height, pz);
      base.push(g - 0.6 * (1 - l));
      lift.push(l);
      along.push(i / seg);
      const c = l > 0.5 ? TOP : SIDE;
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < seg; i++) {
    for (let j = 0; j < P - 1; j++) {
      const a = i * P + j;
      const b = (i + 1) * P + j;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("aBase", new THREE.Float32BufferAttribute(base, 1));
  g.setAttribute("aLift", new THREE.Float32BufferAttribute(lift, 1));
  g.setAttribute("aU", new THREE.Float32BufferAttribute(along, 1));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function createWalls(o: WallsOptions): Actor {
  const group = new THREE.Group();
  const rings = o.walls.map(() => ({ uBuilt: { value: 0 }, uHead: { value: 0 }, uTrace: { value: 0 } }));
  const uWear = { value: 0 };
  o.walls.forEach((w, k) => {
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    const r = rings[k];
    const uH = { value: w.height };
    const uSeed = { value: k * 17.3 };
    mat.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, r, { uH, uWear, uSeed });
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          `#include <common>
attribute float aBase;
attribute float aLift;
attribute float aU;
uniform float uBuilt, uH, uWear, uSeed, uHead, uTrace;
varying float vTrace;
float wallHash(float x) { return fract(sin(x * 91.7 + uSeed) * 43758.5); }`,
        )
        .replace(
          "#include <begin_vertex>",
          `#include <begin_vertex>
float wx = aU * 46.0;
float wn = mix(wallHash(floor(wx)), wallHash(floor(wx) + 1.0), smoothstep(0.0, 1.0, fract(wx)));
float keep = mix(1.0, mix(0.18, 1.0, smoothstep(0.42, 0.58, wn)), uWear);
transformed.y = aBase + aLift * uH * uBuilt * keep + (1.0 - aLift) * 0.6 * min(uBuilt * 4.0, 1.0);
float behind = uHead - aU;
vTrace = uTrace * step(0.0, behind) * (0.35 + 0.65 * exp(-behind * 30.0));`,
        );
      shader.fragmentShader = shader.fragmentShader
        .replace("#include <common>", "#include <common>\nvarying float vTrace;")
        .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\ntotalEmissiveRadiance += vec3(0.95, 0.68, 0.25) * vTrace * 0.8;");
    };
    mat.customProgramCacheKey = () => "co-loa-wall";
    const mesh = new THREE.Mesh(wallGeometry(w, o.height, o.quality.lite ? 140 : 280), mat);
    mesh.receiveShadow = true;
    // bóng đổ không đi qua onBeforeCompile (sẽ đổ bóng ở chiều cao đầy đủ) nên thành không đổ bóng
    mesh.castShadow = false;
    mesh.frustumCulled = false;
    group.add(mesh);
  });
  return {
    object: group,
    update(ctx) {
      uWear.value = o.wear ? o.wear(ctx) : 0;
      rings.forEach((r, k) => {
        r.uBuilt.value = o.built(k, ctx);
        r.uHead.value = o.traceHead ? o.traceHead(k, ctx) : 0;
        r.uTrace.value = o.traceOn ? o.traceOn(k, ctx) : 0;
        group.children[k].visible = r.uBuilt.value > 0.002;
      });
    },
  };
}
