import * as THREE from "three";
import { bakeModelLod, getPropMaterial, getSwayMaterial, wind, type BakeOptions } from "../engine/assets";
import { mulberry32 } from "../engine/math";
import type { Quality } from "../engine/quality";
import type { Actor } from "../engine/world";
import { createChunked } from "./instancing";

export type Placement = { x: number; y: number; z: number; rotY?: number; scale?: number | [number, number, number] };

export type PropOptions = BakeOptions & {
  /** Bậc chất lượng (world.quality): quyết định bản lite / LOD theo khoảng cách. */
  quality: Quality;
  shadow?: boolean;
  /** Lay động theo gió (cây, tre, chuối…) — độ lệch ở độ cao 1 m, xem getSwayMaterial. */
  sway?: number;
  /** Biến thiên độ sáng/sắc từng bản sao (0 = giống hệt nhau). */
  tint?: number;
  /** Ẩn ô đạo cụ xa hơn khoảng này (m). */
  maxDistance?: number;
};

/**
 * Đạo cụ rải hàng loạt (tre, cây, nhà, đá…) từ một model Blender.
 * Chia ô (xem instancing.ts): mỗi ô một draw call, ô ngoài khung nhìn bị bỏ, ô xa dùng bản `.lite.glb`.
 */
export async function createProps(model: string, placements: Placement[], opts: PropOptions): Promise<Actor> {
  const geo = await bakeModelLod(model, opts.quality, opts);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const rand = mulberry32(placements.length * 7919 + model.length);
  const instances = placements.map((pl) => {
    q.setFromAxisAngle(up, pl.rotY ?? 0);
    const sc = pl.scale ?? 1;
    if (Array.isArray(sc)) s.set(...sc);
    else s.setScalar(sc);
    let color: THREE.Color | undefined;
    if (opts.tint) {
      const v = 1 + (rand() - 0.5) * opts.tint;
      color = new THREE.Color(v * (1 + (rand() - 0.5) * opts.tint * 0.4), v, v * (1 - (rand() - 0.5) * opts.tint * 0.3));
    }
    return { matrix: m.compose(p.set(pl.x, pl.y, pl.z), q, s).clone(), color };
  });
  const chunked = createChunked({
    variants: [geo],
    material: opts.sway ? getSwayMaterial(opts.sway) : getPropMaterial(),
    instances,
    quality: opts.quality,
    maxDistance: opts.maxDistance,
    castShadow: !!opts.shadow,
    receiveShadow: !!opts.shadow,
  });
  if (!opts.sway) return chunked;
  return {
    object: chunked.object,
    update(ctx) {
      wind.uWindTime.value = ctx.time;
      chunked.update?.(ctx);
    },
  };
}

/** Rải ngẫu nhiên theo luật: thử nhiều điểm, giữ điểm hợp lệ, giãn cách tối thiểu. */
export function scatter(
  count: number,
  rand: () => number,
  area: { x0: number; x1: number; z0: number; z1: number },
  accept: (x: number, z: number) => number | null,
  minDist = 3,
): Placement[] {
  const out: Placement[] = [];
  const md2 = minDist * minDist;
  for (let tries = 0; out.length < count && tries < count * 40; tries++) {
    const x = area.x0 + rand() * (area.x1 - area.x0);
    const z = area.z0 + rand() * (area.z1 - area.z0);
    const y = accept(x, z);
    if (y === null) continue;
    if (out.some((o) => (o.x - x) ** 2 + (o.z - z) ** 2 < md2)) continue;
    out.push({ x, y, z, rotY: rand() * Math.PI * 2, scale: 0.8 + rand() * 0.5 });
  }
  return out;
}
