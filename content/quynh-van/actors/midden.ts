import * as THREE from "three";
import { clamp, smoothstep } from "@/core/engine/math";
import type { Actor, FrameCtx } from "@/core/engine/world";

// Cồn vỏ sò minh hoạ: bảy tấm hình nón cụt xếp chồng thành một ụ tròn thoải, tấm dưới cùng lớn nhất. CHỈ MINH HOẠ ý "đống vỏ nhuyễn thể
// dày nhiều mét, tích tụ dần" — nguồn ghi lớp vỏ dày khoảng 5–6 m (báo chí) hoặc tới 7 m (Nguyễn Khắc Sử 2022); bảy tấm × 1,6 m ở đây là phóng cao cho dễ thấy. Số tấm, màu từng tấm,
// độ rộng, độ dốc đều là cách điệu, KHÔNG phản ánh số lớp, màu hay hình dạng thật của cồn. Một Mesh (một draw call); đỉnh chỉ cập nhật
// lại khi tiến độ đổi.

export const LAYERS = 7;
/** Bề dày mỗi tấm (m). */
export const THICK = 1.6;
/** Mỗi tấm thu nhỏ so với tấm dưới nó (đỉnh tấm dưới = đáy tấm trên → mặt cồn liền, chỉ đổi màu theo dải). */
const RATIO = [0.97, 0.95, 0.93, 0.9, 0.86, 0.8, 0.7];
/** Vỏ sò trắng ngà xen lớp tro, đất sẫm. Màu minh hoạ. */
const PALETTE = ["#a79d86", "#e4dac2", "#b3a98f", "#ece3cc", "#aea48a", "#e8dfc7", "#d9cfb6"];
const SEG = 40;

export type MiddenOptions = {
  x: number;
  z: number;
  /** Độ cao đáy cồn. */
  groundY: number;
  /** Bán kính đáy theo hai trục (m). */
  radius: [number, number];
  /** Số tấm đã chồng lên: 0..1 (từ dưới lên). */
  progress: (ctx: FrameCtx) => number;
  /** Làm sáng các tấm quanh `center` (0 = đáy, 1 = đỉnh), bề rộng `width`; width = 0 thì không làm sáng. */
  highlight: (ctx: FrameCtx) => { center: number; width: number };
};

/** Độ cao đỉnh cồn khi đã đủ bảy tấm, so với đáy. */
export const MOUND_HEIGHT = LAYERS * THICK;

export function createMidden(o: MiddenOptions): Actor & { radiusAt: (layer: number) => [number, number] } {
  // bán kính từng vành: vành i là đáy tấm i; vành LAYERS là đỉnh
  const rings = [1];
  for (let i = 0; i < LAYERS; i++) rings.push(rings[i] * RATIO[i]);
  // bờ cồn gợn nhẹ theo góc, cố định cho mọi tấm → mặt cồn liền
  const wobble = (a: number) => 1 + 0.07 * Math.sin(a * 3 + 1.1) + 0.04 * Math.sin(a * 5 + 0.3);

  const vertsPerSlab = (SEG + 1) * 2;
  const total = LAYERS * vertsPerSlab + (SEG + 2); // thêm nắp đỉnh
  const pos = new Float32Array(total * 3);
  const col = new Float32Array(total * 3);
  const index: number[] = [];
  for (let l = 0; l < LAYERS; l++) {
    const b = l * vertsPerSlab;
    for (let s = 0; s < SEG; s++) {
      const a = b + s * 2;
      index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
    }
  }
  const capBase = LAYERS * vertsPerSlab;
  for (let s = 0; s < SEG; s++) index.push(capBase, capBase + 1 + s, capBase + 2 + s);

  const geo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage);
  const colAttr = new THREE.BufferAttribute(col, 3).setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute("position", posAttr);
  geo.setAttribute("color", colAttr);
  geo.setIndex(index);
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.visible = false;
  mesh.receiveShadow = false;

  const [rx, rz] = o.radius;
  const fill = (prog: number) => {
    // lớp l lớn dần từ đáy lên khi tiến độ đi qua nó; đỉnh các tấm trên chưa tới thì thấp xuống bằng mặt tấm dưới
    let y = o.groundY - 0.35;
    let lastR = 1;
    let lastY = y;
    for (let l = 0; l < LAYERS; l++) {
      const f = clamp(prog * LAYERS - l);
      const h = f * THICK + (l === 0 ? 0.35 : 0);
      const r0 = rings[l];
      const r1 = rings[l + 1];
      const rTop = r0 + (r1 - r0) * f; // tấm đang lớn: đỉnh còn rộng, thu dần khi đủ chiều cao
      const b = l * vertsPerSlab;
      for (let s = 0; s <= SEG; s++) {
        const a = (s / SEG) * Math.PI * 2;
        const w = wobble(a);
        const cx = Math.cos(a);
        const sz = Math.sin(a);
        const i0 = (b + s * 2) * 3;
        pos[i0] = o.x + cx * rx * r0 * w;
        pos[i0 + 1] = y;
        pos[i0 + 2] = o.z + sz * rz * r0 * w;
        pos[i0 + 3] = o.x + cx * rx * rTop * w;
        pos[i0 + 4] = y + h;
        pos[i0 + 5] = o.z + sz * rz * rTop * w;
      }
      lastR = rTop;
      y += h;
      lastY = y;
    }
    // nắp đỉnh
    const c0 = capBase * 3;
    pos[c0] = o.x;
    pos[c0 + 1] = lastY;
    pos[c0 + 2] = o.z;
    for (let s = 0; s <= SEG; s++) {
      const a = (s / SEG) * Math.PI * 2;
      const w = wobble(a);
      const i = (capBase + 1 + s) * 3;
      pos[i] = o.x + Math.cos(a) * rx * lastR * w;
      pos[i + 1] = lastY;
      pos[i + 2] = o.z + Math.sin(a) * rz * lastR * w;
    }
    posAttr.needsUpdate = true;
    geo.computeVertexNormals();
  };

  const base = PALETTE.map((c) => new THREE.Color(c));
  const tmp = new THREE.Color();
  let lastHi = -9;
  const setColors = (center: number, width: number, pulse: number) => {
    for (let l = 0; l < LAYERS; l++) {
      const c = (l + 0.5) / LAYERS;
      const boost = width > 0 ? 1 - smoothstep(0, width, Math.abs(c - center)) : 0;
      tmp.copy(base[l]).multiplyScalar((width > 0 ? 0.62 : 0.9) + boost * (0.7 + 0.15 * pulse));
      tmp.r += boost * 0.08;
      tmp.g += boost * 0.05;
      const b = l * vertsPerSlab;
      for (let v = 0; v < vertsPerSlab; v++) {
        // chân tấm hơi sẫm hơn đỉnh tấm — nổi rõ ranh giới các lớp
        const k = v % 2 === 0 ? 0.86 : 1;
        col.set([tmp.r * k, tmp.g * k, tmp.b * k], (b + v) * 3);
      }
    }
    const top = base[LAYERS - 1];
    for (let v = 0; v < SEG + 2; v++) col.set([top.r * 0.9, top.g * 0.9, top.b * 0.9], (capBase + v) * 3);
    colAttr.needsUpdate = true;
  };
  setColors(0, 0, 0);

  let lastP = -1;
  return {
    object: mesh,
    radiusAt: (layer) => {
      const l = clamp(layer, 0, LAYERS);
      const i = Math.min(Math.floor(l), LAYERS - 1);
      const r = rings[i] + (rings[i + 1] - rings[i]) * (l - i);
      return [rx * r, rz * r];
    },
    update(ctx) {
      const prog = clamp(o.progress(ctx));
      mesh.visible = prog > 0.003;
      if (!mesh.visible) return;
      if (Math.abs(prog - lastP) > 0.0008) {
        lastP = prog;
        fill(prog);
      }
      const hi = o.highlight(ctx);
      // chỉ tô lại khi đang nhấn (hoặc vừa dừng nhấn)
      if (hi.width > 0 || lastHi > 0) setColors(hi.center, hi.width, Math.sin(ctx.time * 2.2));
      lastHi = hi.width;
    },
    dispose() {
      geo.dispose();
      mat.dispose();
    },
  };
}
