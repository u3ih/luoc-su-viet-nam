import * as THREE from "three";
import { bakeModel, getPropMaterial } from "@/core/engine/assets";
import { clamp, easeOut, mulberry32 } from "@/core/engine/math";
import type { Actor } from "@/core/engine/world";
import { height, riverCenter, riverHalfWidth, STAKE_ZONE } from "../terrain";

export const STAKE_TOP = 0.2;
const MODEL_H = 5; // chiều cao cọc trong Blender

/** Bãi cọc ngầm: trồi dần lên theo tham số `built`. */
export async function createStakes(): Promise<Actor> {
  const rand = mulberry32(1938);
  const stakes: { x: number; z: number; base: number; top: number; delay: number; lean: number; yaw: number }[] = [];
  const rows = 6;
  for (let r = 0; r < rows; r++) {
    const z = STAKE_ZONE.z0 + 3 + (r / (rows - 1)) * (STAKE_ZONE.z1 - STAKE_ZONE.z0 - 6);
    const c = riverCenter(z);
    const hw = riverHalfWidth(z) - 1.5;
    const step = 1.7;
    for (let x = -hw + (r % 2) * step * 0.5; x <= hw; x += step) {
      const wx = c + x + (rand() - 0.5) * 0.6;
      const wz = z + (rand() - 0.5) * 1.6;
      stakes.push({
        x: wx,
        z: wz,
        base: height(wx, wz) - 0.8,
        top: STAKE_TOP + (rand() - 0.5) * 0.35,
        delay: rand() * 0.6 + (r / rows) * 0.25,
        lean: 0.2 + rand() * 0.14, // mũi nhọn chĩa về phía biển
        yaw: (rand() - 0.5) * 0.4,
      });
    }
  }

  const mesh = new THREE.InstancedMesh(await bakeModel("coc"), getPropMaterial(), stakes.length);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  mesh.castShadow = true;

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  let last = -1;

  return {
    object: mesh,
    update({ params }) {
      const built = params.built;
      if (Math.abs(built - last) < 1e-4) return;
      last = built;
      stakes.forEach((k, i) => {
        const prog = easeOut(clamp(built * 1.7 - k.delay));
        const len = (k.top - k.base) / Math.cos(k.lean);
        p.set(k.x, k.base - (1 - prog) * (len + 1), k.z);
        q.setFromEuler(e.set(-k.lean, k.yaw, 0));
        m.compose(p, q, s.set(1, len / MODEL_H, 1));
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}
