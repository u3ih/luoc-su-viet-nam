import { clamp } from "../engine/math";
import type { Keyframe } from "../types";

// Giữ khung hình thoáng: không rải cây, nhà, đá sát chỗ đặt máy quay, và không để ngọn cây chắn đường nhìn
// từ máy quay tới điểm nhìn của từng keyframe.

export type Clearance = {
  /** (x, z) cách vị trí máy quay của keyframe nào đó dưới `r` mét (theo mặt bằng). */
  nearCam(x: number, z: number, r?: number): boolean;
  /** Đặt vật cao `tall` mét ở (x, z, chân ở độ cao h) mà không sát máy quay, không chắn tia nhìn nào. */
  clearOfCam(x: number, z: number, h: number, tall?: number): boolean;
};

export function cameraClearance(keyframes: Record<string, Keyframe>, o: { radius?: number; corridor?: number } = {}): Clearance {
  const radius = o.radius ?? 30;
  const corridor = (o.corridor ?? 24) ** 2;
  const cams = Object.values(keyframes).map((k) => k.cam);
  const looks = Object.values(keyframes).map((k) => k.look);
  const nearCam = (x: number, z: number, r = radius) => cams.some(([cx, , cz]) => (cx - x) ** 2 + (cz - z) ** 2 < r * r);
  // vật nằm gần đoạn máy quay → điểm nhìn (theo mặt bằng) mà ngọn cao hơn tia nhìn tại chỗ ấy thì chắn
  const blocks = (x: number, z: number, top: number, [ax, ay, az]: number[], [bx, by, bz]: number[]) => {
    const dx = bx - ax;
    const dz = bz - az;
    const t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1));
    const d2 = (ax + dx * t - x) ** 2 + (az + dz * t - z) ** 2;
    return d2 < corridor && top > ay + (by - ay) * t;
  };
  return {
    nearCam,
    clearOfCam: (x, z, h, tall = 10) => !nearCam(x, z) && cams.every((c, i) => !blocks(x, z, h + tall, c, looks[i])),
  };
}
