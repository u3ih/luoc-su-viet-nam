import * as THREE from "three";
import { bakeModel, getPropMaterial } from "../engine/assets";
import { clamp, easeOut, mulberry32 } from "../engine/math";
import type { Actor, FrameCtx } from "../engine/world";

// Bãi cọc ngầm dưới lòng sông: các hàng cọc nhọn cắm dọc những đường thẳng, trồi dần lên theo `built` (0 → 1),
// mũi nghiêng về phía `toward` (hướng thuyền địch tới). Dùng model Blender `coc`. Một InstancedMesh, cập nhật
// ma trận chỉ khi `built` đổi. Cọc rơi vào chỗ đất cao hơn ngọn (trên bờ) thì bỏ.

type Pt = [number, number];

export type StakeLine = { from: Pt; to: Pt };

export type StakeFieldOptions = {
  lines: StakeLine[];
  /** Số hàng song song mỗi đường (cách nhau `step`, so le). */
  rows?: number;
  /** Khoảng cách giữa hai cọc (m). */
  step?: number;
  height: (x: number, z: number) => number;
  /** Độ cao ngọn cọc — thường chỉ nhô sát mặt nước hoặc nằm ngay dưới mặt nước. */
  top: number;
  /** Mức dựng xong 0..1 theo frame. */
  built: (ctx: FrameCtx) => number;
  /** Hướng mũi cọc chĩa tới (vector mặt bằng, không cần chuẩn hoá). */
  toward?: Pt;
  seed?: number;
};

const MODEL_H = 5; // chiều cao cọc trong Blender

export async function createStakeField(o: StakeFieldOptions): Promise<Actor> {
  const rand = mulberry32(o.seed ?? 1);
  const rows = o.rows ?? 4;
  const step = o.step ?? 1.7;
  const lean0 = 0.22;
  const dirLen = Math.hypot(o.toward?.[0] ?? 0, o.toward?.[1] ?? 1) || 1;
  const yawBase = Math.atan2((o.toward?.[0] ?? 0) / dirLen, (o.toward?.[1] ?? 1) / dirLen);
  const stakes: { x: number; z: number; base: number; top: number; delay: number; lean: number; yaw: number }[] = [];
  for (const { from, to } of o.lines) {
    const dx = to[0] - from[0];
    const dz = to[1] - from[1];
    const len = Math.hypot(dx, dz) || 1;
    const ux = dx / len;
    const uz = dz / len;
    for (let r = 0; r < rows; r++) {
      for (let s = (r % 2) * step * 0.5; s <= len; s += step) {
        // hàng r lùi dọc pháp tuyến đường một đoạn r * step
        const x = from[0] + ux * s - uz * r * step + (rand() - 0.5) * 0.6;
        const z = from[1] + uz * s + ux * r * step + (rand() - 0.5) * 0.6;
        const ground = o.height(x, z);
        if (ground > o.top - 0.5) continue;
        stakes.push({
          x,
          z,
          base: ground - 0.8,
          top: o.top + (rand() - 0.5) * 0.35,
          delay: rand() * 0.6 + (r / rows) * 0.25,
          lean: lean0 + (rand() - 0.5) * 0.14,
          yaw: yawBase + (rand() - 0.5) * 0.4,
        });
      }
    }
  }

  const mesh = new THREE.InstancedMesh(await bakeModel("coc"), getPropMaterial(), Math.max(1, stakes.length));
  mesh.count = stakes.length;
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  mesh.castShadow = true;

  const m = new THREE.Matrix4();
  const qTilt = new THREE.Quaternion();
  const qYaw = new THREE.Quaternion();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  const X = new THREE.Vector3(1, 0, 0);
  const Y = new THREE.Vector3(0, 1, 0);
  let last = -1;

  return {
    object: mesh,
    update(ctx) {
      const built = o.built(ctx);
      if (Math.abs(built - last) < 1e-4) return;
      last = built;
      mesh.visible = built > 0.001;
      stakes.forEach((k, i) => {
        const prog = easeOut(clamp(built * 1.7 - k.delay));
        const len = (k.top - k.base) / Math.cos(k.lean);
        p.set(k.x, k.base - (1 - prog) * (len + 1), k.z);
        // nghiêng mũi về phía +Z rồi xoay quanh trục đứng cho đúng hướng địch
        qTilt.setFromAxisAngle(X, k.lean);
        qYaw.setFromAxisAngle(Y, k.yaw).multiply(qTilt);
        m.compose(p, qYaw, s.set(1, len / MODEL_H, 1));
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
    dispose() {
      mesh.dispose();
    },
  };
}
