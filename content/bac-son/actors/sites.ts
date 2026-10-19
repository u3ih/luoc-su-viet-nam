import { mulberry32 } from "@/core/engine/math";
import { ARC, ARC_R, height, slopeAt, streamCenter } from "../terrain";

// Vị trí các chấm sáng "địa điểm" trong cảnh. LƯU Ý: đây là hình ảnh MINH HOẠ cho lời kể, KHÔNG phải toạ độ thật của
// di tích. Số liệu bám theo nguồn: 43 di tích người Pháp phát hiện đến năm 1932 (27 chấm xếp thành năm cụm, 16 chấm lẻ
// — chỉ là cách chia để vẽ), và vài chấm ở xa vùng lõi cho các di tích muộn hơn nằm ngoài sơn khối Bắc Sơn.

export type Site = {
  x: number;
  y: number;
  z: number;
  /** 0 = trong cụm, 1 = chấm lẻ trong vùng lõi, 2 = ở xa vùng lõi (ngoại vi). */
  kind: 0 | 1 | 2;
  /** Chỉ số cụm (0..4) với kind = 0; -1 với loại khác. */
  cluster: number;
  /** Thứ tự bật sáng ngẫu nhiên cố định, 0..1. */
  rank: number;
};

/** Góc (độ) và số chấm của năm cụm quanh vòng cung. */
export const CLUSTERS: { angle: number; count: number }[] = [
  { angle: 35, count: 6 },
  { angle: 65, count: 5 },
  { angle: 90, count: 6 },
  { angle: 115, count: 5 },
  { angle: 145, count: 5 },
];
export const CORE_COUNT = 43;

/** Chấm ngoại vi: vài hang ở xa vùng lõi (phía đông, nam và tây thung lũng). */
const PERIPHERY: [number, number][] = [
  [330, 60], [352, 150], [296, 14], [383, 98], [262, -80],
  [175, -60], [130, -140], [40, -120],
  [-330, 60], [-262, -70],
];

export function makeSites(): Site[] {
  const rand = mulberry32(1906);
  const out: Site[] = [];
  const ok = (x: number, z: number) => {
    const h = height(x, z);
    return h > 1.2 && h < 12 && slopeAt(x, z) < 0.45 && Math.abs(z - streamCenter(x)) > 12;
  };
  CLUSTERS.forEach((c, ci) => {
    const a = (c.angle * Math.PI) / 180;
    const cx = ARC.x + Math.cos(a) * (ARC_R - 55);
    const cz = ARC.z + Math.sin(a) * (ARC_R - 55);
    for (let n = 0, tries = 0; n < c.count && tries < 400; tries++) {
      const x = cx + (rand() - 0.5) * 60;
      const z = cz + (rand() - 0.5) * 46;
      if (!ok(x, z)) continue;
      out.push({ x, y: height(x, z) + 2.4, z, kind: 0, cluster: ci, rank: 0 });
      n++;
    }
  });
  for (let n = 0, tries = 0; n < CORE_COUNT - out.length && tries < 2000; tries++) {
    const a = ((15 + rand() * 150) * Math.PI) / 180;
    const r = ARC_R - 75 + rand() * 40;
    const x = ARC.x + Math.cos(a) * r;
    const z = ARC.z + Math.sin(a) * r;
    if (!ok(x, z)) continue;
    out.push({ x, y: height(x, z) + 2.4, z, kind: 1, cluster: -1, rank: 0 });
  }
  // thứ tự bật sáng: xáo trộn cố định
  const order = out.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  out.forEach((s, i) => (s.rank = order.indexOf(i) / Math.max(1, out.length - 1)));
  PERIPHERY.forEach(([x, z], i) => out.push({ x, y: Math.max(height(x, z), 1) + 2.4, z, kind: 2, cluster: -1, rank: i / (PERIPHERY.length - 1) }));
  return out;
}
