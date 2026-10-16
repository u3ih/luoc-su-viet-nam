import * as THREE from "three";
import { getSwayMaterial, wind } from "../engine/assets";
import { mulberry32 } from "../engine/math";
import type { Quality } from "../engine/quality";
import type { Actor } from "../engine/world";
import { createChunked, type Instance } from "./instancing";

export type GrassOptions = {
  count: number;
  area: { x0: number; x1: number; z0: number; z1: number };
  /** Trả độ cao đặt khóm cỏ, hoặc null nếu chỗ này không mọc. */
  accept: (x: number, z: number) => number | null;
  /** Chiều cao lá (m). */
  height?: [number, number];
  blades?: number;
  base?: string;
  tip?: string;
  /** Độ lệch theo gió ở độ cao 1 m. */
  sway?: number;
  seed?: number;
  quality: Quality;
  /** Ẩn ô cỏ xa hơn khoảng này (m) — cỏ ở xa chỉ còn là vài điểm ảnh lấm tấm. */
  maxDistance?: number;
};

/** Một khóm lá: các lá hình tam giác mảnh xoè quanh gốc, gốc tối, ngọn sáng. */
function tuft(blades: number, rand: () => number, base: THREE.Color, tip: THREE.Color) {
  const pos: number[] = [];
  const col: number[] = [];
  for (let i = 0; i < blades; i++) {
    const a = (i / blades) * Math.PI * 2 + rand() * 0.8;
    const lean = 0.15 + rand() * 0.35;
    const h = 0.7 + rand() * 0.3;
    const w = 0.035 + rand() * 0.03;
    const r = rand() * 0.12;
    const cx = Math.cos(a) * r;
    const cz = Math.sin(a) * r;
    const px = -Math.sin(a) * w;
    const pz = Math.cos(a) * w;
    pos.push(cx - px, 0, cz - pz, cx + px, 0, cz + pz, cx + Math.cos(a) * lean, h, cz + Math.sin(a) * lean);
    col.push(base.r, base.g, base.b, base.r, base.g, base.b, tip.r, tip.g, tip.b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  // pháp tuyến hướng lên cho cỏ sáng đều như mặt đất, không loang lổ theo hướng lá
  const n = g.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < n.count; i++) n.setXYZ(i, n.getX(i) * 0.3, 1, n.getZ(i) * 0.3);
  return g;
}

/** Cỏ, lau sậy rải dày — chia ô, ô xa dùng khóm ít lá hơn, ô quá xa ẩn hẳn; lay theo gió dùng chung với cây. */
export function createGrass(o: GrassOptions): Actor {
  const rand = mulberry32(o.seed ?? 77);
  const [h0, h1] = o.height ?? [0.6, 1.2];
  const base = new THREE.Color(o.base ?? "#3f5a26");
  const tip = new THREE.Color(o.tip ?? "#b8c46a");
  const blades = o.blades ?? 7;
  const lite = tuft(Math.max(3, Math.round(blades * 0.55)), mulberry32((o.seed ?? 77) + 1), base, tip);
  const geo = { full: o.quality.lite ? lite : tuft(blades, rand, base, tip), lite };
  const instances: Instance[] = [];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  for (let tries = 0; instances.length < o.count && tries < o.count * 6; tries++) {
    const x = o.area.x0 + rand() * (o.area.x1 - o.area.x0);
    const z = o.area.z0 + rand() * (o.area.z1 - o.area.z0);
    const y = o.accept(x, z);
    if (y === null) continue;
    const hh = h0 + rand() * (h1 - h0);
    const ww = 0.8 + rand() * 0.6;
    const v = 0.82 + rand() * 0.36;
    instances.push({
      matrix: m.compose(p.set(x, y, z), q.setFromAxisAngle(up, rand() * 6.28), s.set(ww, hh, ww)).clone(),
      color: new THREE.Color(v * (0.95 + rand() * 0.15), v, v * 0.9),
    });
  }
  const chunked = createChunked({
    variants: [geo],
    material: getSwayMaterial(o.sway ?? 0.12),
    instances,
    quality: o.quality,
    cell: 50,
    maxDistance: o.maxDistance ?? 170,
    receiveShadow: true,
  });
  return {
    object: chunked.object,
    update(ctx) {
      wind.uWindTime.value = ctx.time;
      chunked.update?.(ctx);
    },
  };
}
