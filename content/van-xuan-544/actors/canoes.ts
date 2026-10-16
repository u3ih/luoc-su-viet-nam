import * as THREE from "three";
import { clamp, mulberry32, smoothstep } from "@/core/engine/math";
import type { Actor, FrameCtx } from "@/core/engine/world";

// Thuyền độc mộc: thân cây khoét lòng, mũi và lái vuốt nhỏ — đúng loại thuyền đã gặp trong khảo cổ học
// (không thêm mái che, buồm hay trang trí). Ban ngày nằm ẩn sát bãi; khi `raid` tăng thì lặng lẽ rẽ lau
// sậy sang bờ đông rồi quay về.

function hullGeometry() {
  // một nửa khối trụ dẹt, thon dần hai đầu, lòng khoét nông (mặt trong tối màu hơn)
  const seg = 18;
  const ring = 9;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  const out = new THREE.Color("#5a3c24");
  const inner = new THREE.Color("#2e1f14");
  const L = 7.5;
  for (let i = 0; i <= seg; i++) {
    const t = i / seg;
    const z = (t - 0.5) * L;
    const taper = Math.pow(Math.sin(Math.PI * t), 0.45);
    for (let j = 0; j <= ring; j++) {
      const a = Math.PI * (j / ring); // 0..π: nửa dưới thân gỗ
      const r = 0.42 * taper + 0.02;
      const x = Math.cos(a) * r;
      const y = -Math.sin(a) * r * 0.8 + (t < 0.08 || t > 0.92 ? 0.08 : 0);
      pos.push(x, y + 0.3, z);
      const c = j === 0 || j === ring ? inner : out;
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < seg; i++)
    for (let j = 0; j < ring; j++) {
      const a = i * (ring + 1) + j;
      const b = a + ring + 1;
      idx.push(a, b, a + 1, a + 1, b, b + 1);
    }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

export type CanoesOptions = {
  count: number;
  /** Điểm xuất phát (bãi) và điểm đến (trại giặc). */
  from: THREE.Vector3;
  to: THREE.Vector3;
  raid: (ctx: FrameCtx) => number;
};

export function createCanoes(o: CanoesOptions): Actor {
  const rand = mulberry32(550);
  const boats = Array.from({ length: o.count }, (_, i) => ({
    // chỗ neo quanh mép bãi
    a: (i / o.count) * 1.6 - 0.8 + (rand() - 0.5) * 0.15,
    lane: (rand() - 0.5) * 60,
    delay: rand() * 0.25,
    bob: rand() * 6.28,
  }));
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  const mesh = new THREE.InstancedMesh(hullGeometry(), mat, o.count);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler(0, 0, 0, "YXZ");
  const p = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);
  const dir = new THREE.Vector3().subVectors(o.to, o.from).setY(0);
  const dist = dir.length();
  dir.normalize();
  const side = new THREE.Vector3(-dir.z, 0, dir.x);
  return {
    object: mesh,
    update(ctx) {
      // vài thuyền, luôn dập dềnh: cập nhật mỗi khung (không cấp phát gì trong vòng lặp)
      const raid = o.raid(ctx);
      boats.forEach((b, i) => {
        // đi rồi về: 0 → 0.5 sang trại, 0.5 → 1 quay về
        const k = clamp((raid - b.delay) / (1 - b.delay));
        const go = smoothstep(0, 0.5, k) - smoothstep(0.55, 1, k);
        const back = k > 0.5;
        const startX = o.from.x + Math.cos(b.a) * 46;
        const startZ = o.from.z + Math.sin(b.a) * 46;
        const along = go * (dist - 60);
        const sway = Math.sin(go * Math.PI) * b.lane;
        p.set(startX + dir.x * along + side.x * sway, 0.02 + Math.sin(ctx.time * 1.3 + b.bob) * 0.04, startZ + dir.z * along + side.z * sway);
        const yaw = Math.atan2(dir.x, dir.z) + (back ? Math.PI : 0) + (go < 0.01 ? b.a : 0);
        e.set(Math.sin(ctx.time * 0.9 + b.bob) * 0.02, yaw, Math.sin(ctx.time * 1.1 + b.bob) * 0.03);
        mesh.setMatrixAt(i, m.compose(p, q.setFromEuler(e), one));
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}
