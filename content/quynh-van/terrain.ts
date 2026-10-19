import * as THREE from "three";
import { clamp, mulberry32, smoothstep } from "@/core/engine/math";
import { fbm2, type HeightBounds } from "@/core/world/terrain";
import { MOUND, MOUND_Y } from "./places";

// Vùng ven vịnh biển cổ (CÁCH ĐIỆU, không phải bản đồ có tư liệu): một vịnh nông mở ra phía đông (x dương), đất liền ở phía tây
// với bãi bùn cát thoải dần lên bờ, một cửa sông nhỏ chảy ra vịnh, vài dãy đồi thấp xa xa. Nguồn chỉ cho biết các di tích
// tập trung quanh một vịnh biển cổ, nằm sát bờ biển giữa Holocen, nay đã cách biển do phù sa bồi và mực biển hạ nhẹ. Hình dạng vịnh,
// vị trí cửa sông, đồi và từng cồn đều là gợi ý. Cồn vỏ sò chính ở MOUND; mọi cồn nhỏ khác (SITES) chỉ minh hoạ "nhiều địa điểm quanh
// vịnh" — số lượng và vị trí không phản ánh số liệu thật. 1 đơn vị ≈ 1 m.

export const BOUNDS: HeightBounds = { minX: -420, minZ: -400, sizeX: 840, sizeZ: 800, minH: -7, maxH: 60 };
/** Mực biển ban đầu. Ở phân cảnh cuối nước hạ dần để đường bờ lùi ra xa. */
export const SEA = 0;
export const SEA_DROP = 1.55;

const BAY: [number, number] = [250, 0];
const BAY_R: [number, number] = [260, 230];
/** Độ sâu đáy vịnh quy theo khoảng cách chuẩn hoá tới tâm vịnh: dốc rất thoải (~2%) nên mực nước hạ ít cũng lùi bờ nhiều. */
const SHELF = 5;

export { MOUND, MOUND_Y };

/** Vị trí các cồn: [0] là Quỳnh Văn (giai đoạn sớm), [1] và [2] dùng cho giai đoạn giữa/muộn trong phân cảnh niên đại. Phần còn lại rải quanh vịnh. */
function makeSites(): [number, number][] {
  const rand = mulberry32(4001);
  const ring = (deg: number, f: number): [number, number] => {
    const a = (deg * Math.PI) / 180;
    return [BAY[0] + BAY_R[0] * f * Math.cos(a), BAY[1] + BAY_R[1] * f * Math.sin(a)];
  };
  const out: [number, number][] = [MOUND, ring(150, 1.2), ring(215, 1.2)];
  for (let i = 0; out.length < 21 && i < 200; i++) {
    const p = ring(104 + rand() * 152, 1.14 + rand() * 0.2);
    if (out.every((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) > 70)) out.push(p);
  }
  return out;
}
export const SITES = makeSites();
const MID = SITES[1];
const LATE = SITES[2];
export { MID, LATE };

/** Cửa sông: chảy từ đồi phía tây ra vịnh, ở phía nam cồn chính. */
export function riverZ(x: number) {
  return -118 + 20 * Math.sin(x * 0.016 + 1) + 7 * Math.sin(x * 0.047);
}

/** Khoảng cách chuẩn hoá tới tâm vịnh: < 1 là trong vịnh, 1 là đường bờ ở mực biển SEA. */
const bayD = (x: number, z: number) => Math.hypot((x - BAY[0]) / BAY_R[0], (z - BAY[1]) / BAY_R[1]);

export function height(x: number, z: number) {
  const d = bayD(x, z);
  const inland = (1 - smoothstep(-330, -170, x)) * 0.9 + smoothstep(240, 360, Math.abs(z)) * 0.6;
  let land = 2.7 + (fbm2(x * 0.014 + 3, z * 0.014 - 1, 4) - 0.5) * 2.2;
  land += inland * Math.pow(fbm2(x * 0.008 + 9, z * 0.008 + 5, 4), 1.6) * 52;
  // bãi thoải xuống biển rồi đáy vịnh: cùng một độ dốc ở hai bên đường bờ
  let h = Math.min(land, (d - 1) * SHELF + 0.15);
  // cửa sông
  const dz = Math.abs(z - riverZ(x));
  const carve = 1 - smoothstep(7, 24, dz);
  h = Math.min(h, h * (1 - carve) + (-1.1 - 0.5 * Math.sin(x * 0.03)) * carve);
  // cồn nhỏ rải quanh vịnh
  for (let i = 1; i < SITES.length; i++) {
    const dx = x - SITES[i][0];
    const dd = dx * dx + (z - SITES[i][1]) ** 2;
    if (dd < 2600) h += 2.2 * Math.exp(-dd / 150);
  }
  // mặt bằng quanh cồn chính
  const r = Math.hypot((x - MOUND[0]) / 1.1, z - MOUND[1]);
  h += (MOUND_Y - h) * (1 - smoothstep(50, 84, r));
  return clamp(h, BOUNDS.minH, BOUNDS.maxH);
}

export const slopeAt = (x: number, z: number) => Math.hypot(height(x + 3, z) - height(x - 3, z), height(x, z + 3) - height(x, z - 3)) / 6;

const C = {
  mud: new THREE.Color("#5a4e3d"),
  sand: new THREE.Color("#bfae88"),
  dune: new THREE.Color("#a9a272"),
  grass: new THREE.Color("#79904a"),
  dry: new THREE.Color("#939553"),
  forest: new THREE.Color("#3a5a2d"),
  stone: new THREE.Color("#8a8272"),
};

export function colorize(h: number, x: number, z: number, c: THREE.Color, slope = 0) {
  if (h < 0.35) c.copy(C.mud).lerp(C.sand, smoothstep(-1.4, 0.3, h));
  else if (h < 1.7) c.copy(C.sand).lerp(C.dune, smoothstep(0.35, 1.2, h));
  else {
    const patch = fbm2(x * 0.03 + 2, z * 0.03 - 6, 3);
    c.copy(C.dune).lerp(C.grass, smoothstep(1.7, 2.6, h)).lerp(C.dry, smoothstep(0.42, 0.62, patch) * 0.6 * smoothstep(1.7, 2.6, h));
  }
  if (h > 8) c.lerp(C.forest, smoothstep(8, 30, h) * 0.7);
  c.lerp(C.stone, smoothstep(0.4, 0.7, slope) * 0.6);
}
