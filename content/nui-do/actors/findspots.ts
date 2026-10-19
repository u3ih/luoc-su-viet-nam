import { mulberry32 } from "@/core/engine/math";
import { height, NUI_DO } from "../terrain";

// Vị trí chấm sáng minh hoạ hiện vật trên sườn núi Đọ. LƯU Ý: đây là hình ảnh minh hoạ cho lời kể
// ("mảnh tước nằm rải trên sườn phía đông và phía tây nam, ở độ cao khoảng 30–40 m so với núi cao 158 m"),
// KHÔNG phải toạ độ thật của hiện vật. Núi trong cảnh thấp hơn thật (đỉnh ~56 m) nên dải độ cao được co theo tỉ lệ
// (30–40/158 ≈ 19–25% chiều cao núi).

export type Spot = { x: number; y: number; z: number };

/** Dải độ cao (m) trong cảnh tương ứng 30–40 m trên núi 158 m. */
const BAND: [number, number] = [NUI_DO.h * (30 / 158) - 2, NUI_DO.h * (40 / 158) + 3];

/** Hướng (góc, rad; 0 = +x/đông, +z = nam) của hai sườn: đông và tây nam. */
const SECTORS: [number, number][] = [
  [0, 0.7],
  [Math.PI * 0.75, 0.7],
];

export function makeSpots(count: number, seed = 1960): Spot[] {
  const rand = mulberry32(seed);
  const out: Spot[] = [];
  for (let tries = 0; out.length < count && tries < count * 80; tries++) {
    const [a0, spread] = SECTORS[out.length % 2];
    const a = a0 + (rand() - 0.5) * 2 * spread;
    const r = 60 + rand() * 60;
    const x = NUI_DO.x + Math.cos(a) * r;
    const z = NUI_DO.z + Math.sin(a) * r;
    const h = height(x, z);
    if (h < BAND[0] || h > BAND[1]) continue;
    out.push({ x, y: h + 0.4, z });
  }
  return out;
}
