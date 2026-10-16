import * as THREE from "three";
import type { Quality } from "@/core/engine/quality";
import type { Actor, FrameCtx } from "@/core/engine/world";
import type { Wall } from "../terrain";

// Ba vòng thành đất Cổ Loa: mỗi vòng là một dải mặt cắt hình thang chạy theo đường tim thành.
// Chiều cao "đắp" (0..1) đẩy trong vertex shader nên đắp thành chỉ đổi một uniform, không dựng lại hình.

export type WallsOptions = {
  walls: Wall[];
  height: (x: number, z: number) => number;
  /** Mức đắp của vòng thứ k (0 = mặt đất, 1 = xong). */
  built: (k: number, ctx: FrameCtx) => number;
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
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export function createWalls(o: WallsOptions): Actor {
  const group = new THREE.Group();
  const uniforms = o.walls.map(() => ({ value: 0 }));
  o.walls.forEach((w, k) => {
    const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
    const uBuilt = uniforms[k];
    const uH = { value: w.height };
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uBuilt = uBuilt;
      shader.uniforms.uH = uH;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nattribute float aBase;\nattribute float aLift;\nuniform float uBuilt;\nuniform float uH;")
        .replace("#include <begin_vertex>", "#include <begin_vertex>\ntransformed.y = aBase + aLift * uH * uBuilt + (1.0 - aLift) * 0.6 * min(uBuilt * 4.0, 1.0);");
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
      uniforms.forEach((u, k) => (u.value = o.built(k, ctx)));
      group.children.forEach((m, k) => (m.visible = uniforms[k].value > 0.002));
    },
  };
}
