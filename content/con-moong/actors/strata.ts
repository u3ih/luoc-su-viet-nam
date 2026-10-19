import * as THREE from "three";
import { clamp, smoothstep } from "@/core/engine/math";
import type { Actor, FrameCtx } from "@/core/engine/world";

// Cột lớp đất: mười tấm xếp chồng, tấm dưới cùng cũ nhất. CHỈ MINH HOẠ thứ tự các lớp địa tầng (nguồn ghi nhận
// mười lớp, dày trung bình khoảng 9,5 m) — màu và độ dày từng tấm là cách điệu, không phải màu đất hay độ dày
// thật của từng lớp. Một InstancedMesh (một draw call); ma trận chỉ cập nhật khi tiến độ đổi.

export const LAYERS = 10;

// Từ lớp dưới cùng (cũ nhất) lên trên cùng: đất nâu đỏ sẫm → vàng nâu → nâu xám nhạt. Màu minh hoạ.
const PALETTE = ["#6b4630", "#74492f", "#7e5232", "#8a5c37", "#96673d", "#a07243", "#a97f4e", "#b28a58", "#b99565", "#c2a074"];

export type StrataOptions = {
  x: number;
  z: number;
  /** Độ cao mặt đất chỗ đặt cột (đáy cột chôn nhẹ xuống). */
  groundY: number;
  /** Số lớp đã chồng lên: 0..1 (từ dưới lên). */
  progress: (ctx: FrameCtx) => number;
  /** Làm sáng các lớp quanh `center` (0 = đáy cột, 1 = đỉnh), bề rộng `width`; width = 0 thì không làm sáng. */
  highlight: (ctx: FrameCtx) => { center: number; width: number };
  width?: number;
  depth?: number;
  thickness?: number;
};

export function createStrata(o: StrataOptions): Actor & { top: number } {
  const W = o.width ?? 15;
  const D = o.depth ?? 6.5;
  const T = o.thickness ?? 1.9;
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshLambertMaterial({ color: "#ffffff" });
  const mesh = new THREE.InstancedMesh(geo, mat, LAYERS);
  mesh.frustumCulled = false;
  mesh.visible = false;
  const base = PALETTE.map((c) => new THREE.Color(c));
  const col = new THREE.Color();
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();
  let lastP = -1;
  const y0 = o.groundY - 0.6;

  const setColors = (center: number, width: number, pulse: number) => {
    for (let i = 0; i < LAYERS; i++) {
      const c = (i + 0.5) / LAYERS;
      const boost = width > 0 ? 1 - smoothstep(0, width, Math.abs(c - center)) : 0;
      // đậm dần theo lớp thường, các lớp được nhấn thì sáng và ngả vàng
      col.copy(base[i]).multiplyScalar((width > 0 ? 0.6 : 0.85) + boost * (0.95 + 0.2 * pulse));
      col.r += boost * 0.1;
      col.g += boost * 0.06;
      mesh.setColorAt(i, col);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  };
  setColors(0, 0, 0);

  return {
    object: mesh,
    top: y0 + LAYERS * T,
    update(ctx) {
      const prog = clamp(o.progress(ctx));
      mesh.visible = prog > 0.002;
      if (!mesh.visible) return;
      if (Math.abs(prog - lastP) > 0.0008) {
        lastP = prog;
        for (let i = 0; i < LAYERS; i++) {
          // lớp i lớn dần từ đáy lên khi tiến độ đi qua nó
          const f = clamp(prog * LAYERS - i);
          const h = Math.max(f * (T - 0.07), 0.0001);
          m.compose(p.set(o.x, y0 + i * T + h / 2, o.z), q, s.set(W * (1 - i * 0.012), h, D));
          mesh.setMatrixAt(i, m);
        }
        mesh.instanceMatrix.needsUpdate = true;
      }
      const hi = o.highlight(ctx);
      setColors(hi.center, hi.width, Math.sin(ctx.time * 2.2));
    },
    dispose() {
      geo.dispose();
      mat.dispose();
      mesh.dispose();
    },
  };
}
