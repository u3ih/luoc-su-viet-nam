import { clamp } from "../engine/math";
import { noise2 } from "./terrain";

// Sông dạng đường gấp khúc có bề rộng: tra khoảng cách tới đường tim / tới mép bờ cho hàm độ cao của chương.
// Chỉ là toán trên mặt bằng (không import three), nên dùng được cả trong terrain.ts lẫn scene.config.ts.

export type River = { pts: [number, number][]; half: number };

function distSeg(px: number, pz: number, ax: number, az: number, bx: number, bz: number) {
  const dx = bx - ax;
  const dz = bz - az;
  const t = clamp(((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1));
  return Math.hypot(ax + dx * t - px, az + dz * t - pz);
}

/**
 * Hai hàm tra nhanh cho một tập sông. `wiggle` là biên độ uốn lượn (m) thêm bằng nhiễu để bờ không thẳng tuột.
 * - `riverDist(r, x, z)`: khoảng cách tới đường tim sông `r`.
 * - `bankDist(x, z)`: khoảng cách có dấu tới mép bờ gần nhất (âm = trong lòng sông).
 */
export function createRivers(rivers: River[], wiggle = 10) {
  const riverDist = (r: River, x: number, z: number) => {
    let d = Infinity;
    for (let i = 0; i < r.pts.length - 1; i++) {
      const a = r.pts[i];
      const b = r.pts[i + 1];
      d = Math.min(d, distSeg(x, z, a[0], a[1], b[0], b[1]));
    }
    return d + (noise2(x * 0.02 + 5, z * 0.02) - 0.5) * wiggle;
  };
  const bankDist = (x: number, z: number) => {
    let d = Infinity;
    for (const r of rivers) d = Math.min(d, riverDist(r, x, z) - r.half);
    return d;
  };
  return { riverDist, bankDist };
}
