import * as THREE from "three";
import { getPropMaterial } from "../engine/assets";
import { mulberry32 } from "../engine/math";
import type { Quality } from "../engine/quality";
import type { Actor } from "../engine/world";
import { createChunked, type Instance } from "./instancing";
import { noise2 } from "./terrain";

export type RocksOptions = {
  count: number;
  area: { x0: number; x1: number; z0: number; z1: number };
  accept: (x: number, z: number) => number | null;
  scale?: [number, number];
  /** Màu đá và màu rêu phủ mặt trên. */
  stone?: string;
  moss?: string;
  seed?: number;
  quality: Quality;
  maxDistance?: number;
};

/** Một hòn đá: khối đa diện méo, dẹt, có cạnh sắc; rêu bám mặt hướng lên. */
function rockGeometry(rand: () => number, stone: THREE.Color, moss: THREE.Color, lite: boolean) {
  const g = lite ? new THREE.DodecahedronGeometry(1, 0) : new THREE.IcosahedronGeometry(1, 1);
  const p = g.attributes.position as THREE.BufferAttribute;
  const off = rand() * 50;
  const sx = 0.8 + rand() * 0.6;
  const sz = 0.8 + rand() * 0.6;
  const sy = 0.45 + rand() * 0.35;
  // gom đỉnh trùng nhau trước khi méo để mặt không bị rách
  const key = (i: number) => `${p.getX(i).toFixed(3)},${p.getY(i).toFixed(3)},${p.getZ(i).toFixed(3)}`;
  const moved = new Map<string, [number, number, number]>();
  for (let i = 0; i < p.count; i++) {
    const k = key(i);
    let v = moved.get(k);
    if (!v) {
      const x = p.getX(i);
      const y = p.getY(i);
      const z = p.getZ(i);
      const r = 0.75 + noise2(x * 1.8 + off, z * 1.8 + y * 2.3) * 0.5;
      v = [x * r * sx, Math.max(y * r * sy, -0.15), z * r * sz];
      moved.set(k, v);
    }
    p.setXYZ(i, v[0], v[1], v[2]);
  }
  g.computeVertexNormals();
  const n = g.attributes.normal as THREE.BufferAttribute;
  const col = new Float32Array(p.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    c.copy(stone).multiplyScalar(0.8 + noise2(p.getX(i) * 4 + off, p.getZ(i) * 4) * 0.4);
    c.lerp(moss, Math.max(0, n.getY(i) - 0.55) * 1.8 * (0.6 + rand() * 0.4));
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.deleteAttribute("uv");
  return g;
}

/** Đá tảng rải ven bờ, chân đồi — vài hình dáng, chia ô; ô xa dùng khối 12 mặt. */
export function createRocks(o: RocksOptions): Actor {
  const rand = mulberry32(o.seed ?? 23);
  const stone = new THREE.Color(o.stone ?? "#756b5d");
  const moss = new THREE.Color(o.moss ?? "#5d7a3a");
  const [s0, s1] = o.scale ?? [0.4, 1.6];
  const instances: Instance[] = [];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const p = new THREE.Vector3();
  const sc = new THREE.Vector3();
  for (let tries = 0; instances.length < o.count && tries < o.count * 8; tries++) {
    const x = o.area.x0 + rand() * (o.area.x1 - o.area.x0);
    const z = o.area.z0 + rand() * (o.area.z1 - o.area.z0);
    const y = o.accept(x, z);
    if (y === null) continue;
    // phân bố lệch: nhiều đá nhỏ, ít đá lớn
    const s = s0 + Math.pow(rand(), 2.5) * (s1 - s0);
    q.setFromEuler(e.set((rand() - 0.5) * 0.3, rand() * 6.28, (rand() - 0.5) * 0.3));
    instances.push({ matrix: m.compose(p.set(x, y - s * 0.15, z), q, sc.setScalar(s)).clone() });
  }
  const base = (o.seed ?? 23) * 31;
  const variants = [0, 1, 2, 3].map((i) => {
    const lite = rockGeometry(mulberry32(base + i), stone, moss, true);
    return { full: o.quality.lite ? lite : rockGeometry(mulberry32(base + i), stone, moss, false), lite };
  });
  return createChunked({ variants, material: getPropMaterial(), instances, quality: o.quality, cell: 70, maxDistance: o.maxDistance ?? 260, receiveShadow: true });
}
