import * as THREE from "three";
import { bakeModelLod, getPropMaterial } from "@/core/engine/assets";
import type { Quality } from "@/core/engine/quality";
import { mulberry32 } from "@/core/engine/math";
import type { Actor } from "@/core/engine/world";
import { height, riverCenter, riverHalfWidth } from "../terrain";

/**
 * Thuyền nan của dân chài neo sát bờ làng: dập dềnh theo con nước,
 * khi nước rút thì nằm nghiêng trên bãi bùn.
 */
export async function createMoored(quality: Quality, zs: number[]): Promise<Actor> {
  const rand = mulberry32(1937);
  const boats = zs.map((z) => {
    const x = riverCenter(z) + riverHalfWidth(z) - 2.5 - rand() * 2;
    const yaw = Math.atan2(riverCenter(z + 2) - riverCenter(z - 2), 4) + (rand() - 0.5) * 0.5 + (rand() < 0.5 ? Math.PI : 0);
    return { x, z, yaw, ground: height(x, z) + 0.35, bob: rand() * 6.28, tilt: (rand() - 0.5) * 0.3 };
  });
  const mesh = new THREE.InstancedMesh((await bakeModelLod("thuyen_ngo", quality)).full, getPropMaterial(), boats.length);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler(0, 0, 0, "YXZ");
  const p = new THREE.Vector3();
  const s = new THREE.Vector3(0.8, 0.8, 0.8);
  return {
    object: mesh,
    update({ params, time }) {
      boats.forEach((b, i) => {
        const float = params.tide + Math.sin(time * 1.2 + b.bob) * 0.05;
        const grounded = float < b.ground;
        const y = grounded ? b.ground : float;
        const roll = grounded ? b.tilt + Math.sign(b.tilt) * 0.12 : Math.sin(time * 0.9 + b.bob) * 0.04;
        e.set(grounded ? 0.04 : Math.sin(time * 0.7 + b.bob) * 0.02, b.yaw, roll);
        m.compose(p.set(b.x, y, b.z), q.setFromEuler(e), s);
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}
