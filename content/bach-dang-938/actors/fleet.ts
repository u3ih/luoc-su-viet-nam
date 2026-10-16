import * as THREE from "three";
import { bakeModelLod, getPropMaterial } from "@/core/engine/assets";
import type { Quality } from "@/core/engine/quality";
import { clamp, easeInOut, easeOut, lerp, mulberry32 } from "@/core/engine/math";
import type { Actor } from "@/core/engine/world";
import { riverCenter, STAKE_ZONE } from "../terrain";
import { STAKE_TOP } from "./stakes";

const DRAFT = 1.1; // mớn nước thuyền Nam Hán (Blender: đáy ở z = -1.1)
const SHIP_COUNT = 12;
const LURE_COUNT = 5;
const RAIDER_COUNT = 18;
const FINAL_LEAD = -12;
/** Số thuyền có vệt sóng đuôi (đủ cho cả ba nhóm). */
export const WAKE_SLOTS = SHIP_COUNT + LURE_COUNT + RAIDER_COUNT;

/**
 * Ba nhóm thuyền:
 * - thuyền lớn Nam Hán (tiến vào theo `fleet`, mắc cọc khi nước rút, chìm theo `sink`)
 * - thuyền nhẹ khiêu chiến (`lure`): xuống đón địch rồi giả thua chạy ngược dòng
 * - thuyền nhẹ đánh ập (`attack`): từ thượng nguồn và hai bờ lao ra
 * Phát tín hiệu "battle" (0..1) cho âm thanh trống trận.
 */
export async function createFleet(quality: Quality, signal: (name: string, v: number) => void, wakes?: Float32Array): Promise<Actor> {
  const rand = mulberry32(939);
  // thuyền là tâm điểm của cảnh: bậc thường luôn dùng bản đầy đủ, bậc lite dùng bản lite
  const [junkGeo, boatGeo] = (await Promise.all([bakeModelLod("thuyen_nam_han", quality), bakeModelLod("thuyen_ngo", quality)])).map((g) => g.full);
  const mat = getPropMaterial();
  const ships = new THREE.InstancedMesh(junkGeo, mat, SHIP_COUNT);
  const lures = new THREE.InstancedMesh(boatGeo, mat, LURE_COUNT);
  const raiders = new THREE.InstancedMesh(boatGeo, mat, RAIDER_COUNT);
  for (const m of [ships, lures, raiders]) {
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.frustumCulled = false;
    m.castShadow = true;
  }

  const shipData = Array.from({ length: SHIP_COUNT }, (_, i) => {
    const r = Math.floor(i / 3);
    const c = i % 3;
    return {
      ox: (c - 1) * 9.5 + (rand() - 0.5) * 2.5 + (r % 2) * 2,
      oz: -r * 10 + (rand() - 0.5) * 2,
      bob: rand() * Math.PI * 2,
      roll: (rand() < 0.5 ? -1 : 1) * (0.25 + rand() * 0.25),
      pitch: (rand() - 0.5) * 0.35,
      sinkDepth: 1.4 + rand() * 1.8,
    };
  });

  const raiderData = Array.from({ length: RAIDER_COUNT }, (_, i) => {
    const target = shipData[i % SHIP_COUNT];
    const tz0 = FINAL_LEAD + target.oz + (rand() - 0.5) * 8;
    const ang = rand() * Math.PI * 2;
    const tx = riverCenter(tz0) + target.ox + Math.cos(ang) * 5.5;
    const tz = tz0 + Math.sin(ang) * 5.5;
    const fromUpstream = i % 2 === 0;
    const sz = fromUpstream ? 50 + rand() * 50 : tz + (rand() - 0.5) * 20;
    const sx = fromUpstream ? riverCenter(sz) + (rand() - 0.5) * 20 : riverCenter(sz) + (rand() < 0.5 ? -1 : 1) * (17 + rand() * 2);
    return { sx, sz, tx, tz, delay: rand() * 0.35, bob: rand() * 6 };
  });

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler(0, 0, 0, "YXZ");
  const p = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);
  const yawAt = (z: number) => Math.atan2(riverCenter(z + 2) - riverCenter(z - 2), 4);
  const inZone = (z: number) => z > STAKE_ZONE.z0 && z < STAKE_ZONE.z1;
  // vận tốc từng thuyền (m/s, đã làm mượt) cho vệt sóng đuôi trên mặt nước. Tính cho mọi thuyền vào `all`,
  // rồi chép những thuyền chạy nhanh nhất vào `wakes` (bậc thấp chỉ có vài ô — mỗi ô là một vòng lặp trên từng
  // điểm ảnh mặt nước).
  const all = new Float32Array(WAKE_SLOTS * 4);
  const order = Array.from({ length: WAKE_SLOTS }, (_, i) => i);
  const speed2 = (i: number) => all[i * 4 + 2] ** 2 + all[i * 4 + 3] ** 2;
  const prev = new Float32Array(WAKE_SLOTS * 2).fill(NaN);
  let dt = 0;
  let tide = 0;
  const wake = (slot: number, x: number, y: number, z: number) => {
    if (!wakes) return;
    const px = prev[slot * 2];
    const pz = prev[slot * 2 + 1];
    prev[slot * 2] = x;
    prev[slot * 2 + 1] = z;
    const o = slot * 4;
    all[o] = x;
    all[o + 1] = z;
    // thuyền mắc cạn / chìm sâu thì không tạo sóng
    const afloat = y > tide - 1.2 ? 1 : 0;
    if (Number.isNaN(px) || dt <= 0) return;
    const k = 1 - Math.exp(-6 * dt);
    all[o + 2] += (((x - px) / dt) * afloat - all[o + 2]) * k;
    all[o + 3] += (((z - pz) / dt) * afloat - all[o + 3]) * k;
  };
  const put = (mesh: THREE.InstancedMesh, i: number, x: number, y: number, z: number, slot: number) => {
    m.compose(p.set(x, y, z), q.setFromEuler(e), one);
    mesh.setMatrixAt(i, m);
    wake(slot, x, y, z);
  };

  const group = new THREE.Group();
  group.add(ships, lures, raiders);

  return {
    object: group,
    update({ params: s, time, dt: frameDt }) {
      dt = frameDt;
      tide = s.tide;
      const lead = lerp(-440, FINAL_LEAD, easeOut(clamp(s.fleet)));
      const rest = STAKE_TOP + DRAFT - 0.35; // độ cao khi thân thuyền tì lên mũi cọc

      shipData.forEach((d, i) => {
        const z = lead + d.oz;
        const water = s.tide + Math.sin(time * 0.8 + d.bob) * 0.08;
        let y = water;
        let stuck = 0;
        if (s.built > 0.6 && inZone(z) && water < rest) {
          y = rest;
          stuck = clamp((rest - water) / 2.6);
        }
        const sink = clamp(s.sink * 1.3 - (i % 4) * 0.08);
        y -= sink * d.sinkDepth;
        const sway = Math.sin(time * 0.6 + d.bob) * 0.025 * (1 - stuck);
        e.set(d.pitch * stuck + sink * d.pitch * 0.6, yawAt(z), d.roll * stuck + sink * d.roll * 0.8 + sway);
        put(ships, i, riverCenter(z) + d.ox, y, z, i);
      });
      ships.instanceMatrix.needsUpdate = true;

      for (let i = 0; i < LURE_COUNT; i++) {
        const ahead = lead + 24 + i * 3.5;
        const l = clamp(s.lure);
        let z = l < 0.5 ? lerp(16 + i * 3.5, ahead, easeInOut(l * 2)) : ahead;
        let x = riverCenter(z) + (i - 2) * 3.5;
        let yaw = yawAt(z) + (l > 0 && l < 0.5 ? Math.PI : 0);
        if (s.attack > 0) {
          const r = raiderData[i];
          const a = easeInOut(clamp(s.attack * 1.2));
          x = lerp(x, r.tx + 2, a);
          z = lerp(z, r.tz - 3, a);
          yaw = lerp(yaw, Math.PI, a);
        }
        e.set(0, yaw, Math.sin(time * 1.1 + i) * 0.03);
        put(lures, i, x, s.tide + Math.sin(time * 1.4 + i) * 0.06, z, SHIP_COUNT + i);
      }
      lures.instanceMatrix.needsUpdate = true;

      raiderData.forEach((r, i) => {
        const a = easeInOut(clamp((s.attack - r.delay) / (1 - r.delay)));
        e.set(0, Math.atan2(r.tx - r.sx, r.tz - r.sz), Math.sin(time + r.bob) * 0.04);
        put(raiders, i, lerp(r.sx, r.tx, a), s.tide + Math.sin(time * 1.3 + r.bob) * 0.06 - (a <= 0 ? 5 : 0), lerp(r.sz, r.tz, a), SHIP_COUNT + LURE_COUNT + i);
      });
      raiders.instanceMatrix.needsUpdate = true;

      if (wakes) {
        const n = wakes.length / 4;
        if (n < WAKE_SLOTS) order.sort((a, b) => speed2(b) - speed2(a));
        for (let i = 0; i < n; i++) wakes.set(all.subarray(order[i] * 4, order[i] * 4 + 4), i * 4);
      }

      signal("battle", clamp(Math.max(s.attack * (1 - s.sink * 0.7), s.lure * 0.25 * (1 - s.attack))));
    },
  };
}
