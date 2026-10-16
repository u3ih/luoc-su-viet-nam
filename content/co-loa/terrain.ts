import * as THREE from "three";
import { clamp, lerp, smoothstep } from "@/core/engine/math";
import { fbm2, noise2, type HeightBounds } from "@/core/world/terrain";

// Cổ Loa (cách điệu, thu nhỏ khoảng 1/6): đồng bằng phẳng, sông Hoàng chảy phía đông, ba vòng thành đất.
// Tỉ lệ chu vi ba vòng theo số liệu khảo cổ: ngoài ~8 km, giữa ~6,5 km, trong ~1,6 km (vòng trong gần chữ nhật).
// Hào nước chạy sát chân thành phía ngoài mỗi vòng.

export const BOUNDS: HeightBounds = { minX: -360, minZ: -360, sizeX: 720, sizeZ: 720, minH: -6, maxH: 60 };
export const WATER = 0.2;

export type Wall = {
  /** Điểm trên đường tim thành theo góc (rad) — trả [x, z]. */
  at: (a: number) => [number, number];
  /** Bề rộng chân, mặt thành và chiều cao (m, đã thu nhỏ). */
  base: number;
  top: number;
  height: number;
};

const radial = (cx: number, cz: number, R: number, k: number, seed: number) => (a: number): [number, number] => {
  const r = R * (1 + k * Math.sin(2 * a + seed) + k * 0.6 * Math.sin(3 * a + seed * 2.1) + k * 0.4 * (noise2(Math.cos(a) * 2 + seed, Math.sin(a) * 2) - 0.5));
  return [cx + Math.cos(a) * r, cz + Math.sin(a) * r];
};

/** Vòng trong: hình chữ nhật bo góc (dùng "siêu elip" để góc hơi tròn như đất đắp). */
const rect = (cx: number, cz: number, hx: number, hz: number, rot: number) => (a: number): [number, number] => {
  const c = Math.cos(a);
  const s = Math.sin(a);
  const n = 6;
  const r = 1 / Math.pow(Math.pow(Math.abs(c) / hx, n) + Math.pow(Math.abs(s) / hz, n), 1 / n);
  const x = c * r;
  const z = s * r;
  return [cx + x * Math.cos(rot) - z * Math.sin(rot), cz + x * Math.sin(rot) + z * Math.cos(rot)];
};

export const WALLS: Wall[] = [
  { at: radial(0, 0, 238, 0.07, 1.3), base: 16, top: 6, height: 7.5 },
  { at: radial(8, 18, 168, 0.07, 4.1), base: 13, top: 5, height: 6 },
  { at: rect(14, 34, 58, 38, 0.12), base: 10, top: 4, height: 5 },
];

export function riverCenter(z: number) {
  return 322 + 16 * Math.sin(z * 0.009 + 0.8) + 6 * Math.sin(z * 0.031);
}

// khoảng cách gần đúng tới đường tim một vòng thành (các vòng gần tròn/gần elip quanh tâm)
const centers = WALLS.map((w) => {
  let sx = 0;
  let sz = 0;
  for (let i = 0; i < 64; i++) {
    const [x, z] = w.at((i / 64) * Math.PI * 2);
    sx += x;
    sz += z;
  }
  return [sx / 64, sz / 64] as const;
});
/** Khoảng cách có dấu tới tim thành thứ k: dương = phía ngoài. */
export function wallDistance(k: number, x: number, z: number) {
  const [cx, cz] = centers[k];
  const a = Math.atan2(z - cz, x - cx);
  const [wx, wz] = WALLS[k].at(a);
  return Math.hypot(x - cx, z - cz) - Math.hypot(wx - cx, wz - cz);
}

export function height(x: number, z: number) {
  let h = 2.2 + (fbm2(x * 0.012 + 3, z * 0.012 - 1, 4) - 0.5) * 2.4;
  // đồi thấp xa xa phía bắc
  h += smoothstep(220, 340, z) * Math.pow(fbm2(x * 0.02, z * 0.02, 4), 2) * 50;
  // hào ngoài chân mỗi vòng thành
  WALLS.forEach((w, k) => {
    const d = wallDistance(k, x, z) - w.base * 0.5 - 2;
    const width = 7 + k * -1.2;
    if (d > -1 && d < width + 2) h = lerp(h, -1.4, smoothstep(-1, 1.2, d) * (1 - smoothstep(width - 1, width + 2, d)));
  });
  // sông Hoàng
  const dr = Math.abs(x - riverCenter(z));
  h = lerp(-2.6, h, smoothstep(14, 30, dr));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

const C = {
  mud: new THREE.Color("#5a4129"),
  sand: new THREE.Color("#a98e62"),
  paddy: new THREE.Color("#7f9a44"),
  paddyWet: new THREE.Color("#6a8a52"),
  grass: new THREE.Color("#628c3c"),
  forest: new THREE.Color("#2e5228"),
  dirt: new THREE.Color("#8a6a44"),
};
const tmp = new THREE.Color();

export function paddyCell(x: number, z: number) {
  return noise2(Math.floor(x / 11) * 1.7, Math.floor(z / 9) * 2.3);
}

/** Ô ruộng nằm ngoài vòng thành ngoài cùng (trong thành là đất ở, vườn). */
export const outsideCity = (x: number, z: number) => wallDistance(0, x, z) > 22;

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.5) c.copy(C.mud).lerp(C.sand, smoothstep(-1.5, 0.5, h));
  else c.copy(C.grass);
  if (h > 1.2 && h < 4.5 && outsideCity(x, z) && Math.abs(x - riverCenter(z)) > 40) {
    const cell = paddyCell(x, z);
    tmp.copy(cell < 0.4 ? C.paddyWet : C.paddy).multiplyScalar(0.86 + cell * 0.3);
    c.lerp(tmp, 0.85);
    const fx = Math.abs((x / 11) % 1);
    const fz = Math.abs((z / 9) % 1);
    if (fx < 0.07 || fz < 0.09) c.lerp(C.sand, 0.3);
  }
  if (h > 8) c.lerp(C.forest, smoothstep(8, 24, h) * 0.8);
  c.lerp(C.dirt, smoothstep(0.2, 0.4, slope) * 0.6);
}
