import * as THREE from "three";
import type { LodGeometry } from "../engine/assets";
import type { Quality } from "../engine/quality";
import type { Actor, FrameCtx } from "../engine/world";

// Đạo cụ rải hàng loạt, chia theo ô vuông trên mặt đất.
//
// Một InstancedMesh trải khắp bản đồ thì không bao giờ bị frustum culling loại (khối bao của nó chứa cả cảnh),
// nên GPU vẽ cả nghìn cây sau lưng máy quay. Chia ô: mỗi ô một InstancedMesh có khối bao riêng → ô ngoài khung
// nhìn bị bỏ, ô xa đổi sang hình lite, ô quá xa (đã chìm trong sương) thì ẩn hẳn.
//
// Mỗi ô dùng MỘT biến thể hình dáng (chọn theo vị trí ô) để số draw call ≈ số ô thấy được, không nhân với
// số biến thể; xoay / co giãn / pha màu từng bản sao vẫn giữ cho cảnh không lặp.

export type Instance = { matrix: THREE.Matrix4; color?: THREE.Color };

export type ChunkedOptions = {
  /** Các biến thể hình dáng (đầy đủ + lite). */
  variants: LodGeometry[];
  material: THREE.Material;
  instances: Instance[];
  quality: Quality;
  /** Cạnh ô (m). */
  cell?: number;
  /** Ô xa hơn khoảng này (m, trước khi nhân `quality.drawDistance`) thì ẩn. Mặc định: không ẩn. */
  maxDistance?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
};

type Chunk = { mesh: THREE.InstancedMesh; geo: LodGeometry; center: THREE.Vector3; radius: number; lite: boolean };

export function createChunked(o: ChunkedOptions): Actor & { object: THREE.Group } {
  const cell = o.cell ?? 80;
  const buckets = new Map<string, Instance[]>();
  const pos = new THREE.Vector3();
  for (const inst of o.instances) {
    pos.setFromMatrixPosition(inst.matrix);
    const key = `${Math.floor(pos.x / cell)},${Math.floor(pos.z / cell)}`;
    let list = buckets.get(key);
    if (!list) buckets.set(key, (list = []));
    list.push(inst);
  }

  const group = new THREE.Group();
  const chunks: Chunk[] = [];
  const startLite = o.quality.lite || o.quality.lodDistance <= 0;
  for (const [key, list] of buckets) {
    const [cx, cz] = key.split(",").map(Number);
    // biến thể theo ô: băm toạ độ ô để hai ô cạnh nhau thường khác dáng
    const geo = o.variants[Math.abs((cx * 73856093) ^ (cz * 19349663)) % o.variants.length];
    const mesh = new THREE.InstancedMesh(startLite ? geo.lite : geo.full, o.material, list.length);
    list.forEach((inst, i) => {
      mesh.setMatrixAt(i, inst.matrix);
      if (inst.color) mesh.setColorAt(i, inst.color);
    });
    mesh.instanceMatrix.needsUpdate = true;
    // khối bao tính trên bản đầy đủ (lớn hơn hoặc bằng bản lite) để đổi LOD không làm ô bị cắt sai
    mesh.geometry = geo.full;
    mesh.computeBoundingSphere();
    mesh.geometry = startLite ? geo.lite : geo.full;
    mesh.castShadow = !!o.castShadow;
    mesh.receiveShadow = !!o.receiveShadow;
    mesh.matrixAutoUpdate = false;
    group.add(mesh);
    const bs = mesh.boundingSphere!;
    chunks.push({ mesh, geo, center: bs.center.clone(), radius: bs.radius, lite: startLite });
  }

  const lod = o.quality.lite ? 0 : o.quality.lodDistance;
  const hide = o.maxDistance ? o.maxDistance * o.quality.drawDistance : Infinity;
  const camPos = new THREE.Vector3();
  let frame = 0;

  return {
    object: group,
    update(ctx: FrameCtx) {
      // khoảng cách đổi chậm theo máy quay: kiểm tra mỗi 6 khung là đủ, rải đều chi phí
      if (frame++ % 6) return;
      camPos.copy(ctx.camera.position);
      for (const c of chunks) {
        const d = Math.max(0, c.center.distanceTo(camPos) - c.radius);
        c.mesh.visible = d < hide;
        if (!c.mesh.visible || lod <= 0) continue;
        // trễ 10 % để ô nằm ngay ngưỡng không nhấp nháy qua lại
        const lite = c.lite ? d > lod * 0.9 : d > lod * 1.1;
        if (lite !== c.lite) {
          c.lite = lite;
          c.mesh.geometry = lite ? c.geo.lite : c.geo.full;
        }
      }
    },
  };
}
