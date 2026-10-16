import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { getPropMaterial, getSwayMaterial, wind } from "../engine/assets";
import { mulberry32 } from "../engine/math";
import type { Quality } from "../engine/quality";
import type { Actor } from "../engine/world";
import { createChunked, type Instance } from "./instancing";
import { noise2 } from "./terrain";

// Cây & bụi dựng bằng code (không cần model Blender) để phủ kín đồi xa, bờ bụi rậm.
// Mỗi loại một InstancedMesh, tán lá dùng pháp tuyến hình cầu cho bóng mềm như khối lá thật.

type Area = { x0: number; x1: number; z0: number; z1: number };

export type FoliageOptions = {
  kind: "bush" | "tree" | "palm";
  count: number;
  area: Area;
  /** Trả độ cao gốc, hoặc null nếu không mọc. */
  accept: (x: number, z: number) => number | null;
  /** Hệ số kích thước [min, max]. */
  scale?: [number, number];
  /** Màu lá tối (trong tán) và sáng (ngọn đón nắng). */
  dark?: string;
  light?: string;
  shadow?: boolean;
  seed?: number;
  quality: Quality;
  /** Ẩn ô cây xa hơn khoảng này (m). */
  maxDistance?: number;
};

const tmp = new THREE.Color();

/**
 * Một khối lá: khối đa diện méo theo nhiễu, pháp tuyến hướng từ tâm ra.
 * Bản lite dùng khối 12 mặt ngũ giác (36 tam giác thay vì 80) — khối 20 mặt tam giác trông như pha lê.
 */
function leafBlob(cx: number, cy: number, cz: number, r: number, rand: () => number, dark: THREE.Color, light: THREE.Color, lite = false) {
  const g = lite ? new THREE.DodecahedronGeometry(1, 0) : new THREE.IcosahedronGeometry(1, 1);
  const p = g.attributes.position as THREE.BufferAttribute;
  const n = new Float32Array(p.count * 3);
  const col = new Float32Array(p.count * 3);
  const sx = 1 + (rand() - 0.5) * 0.3;
  const sy = 0.6 + rand() * 0.25;
  const off = rand() * 100;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const k = r * (0.82 + noise2(x * 2.1 + off, z * 2.1 + y * 1.7) * 0.36);
    p.setXYZ(i, cx + x * k * sx, cy + y * k * sy, cz + z * k);
    // pháp tuyến: nửa cầu + nửa hướng lên → mặt dưới tán không đen kịt
    const len = Math.hypot(x, y + 0.6, z);
    n.set([x / len, (y + 0.6) / len, z / len], i * 3);
    // màu theo vị trí (không ngẫu nhiên từng đỉnh) để mặt lá liền, không lốm đốm từng tam giác
    const lit = y * 0.45 + 0.45 + (noise2(x * 3.3 + off, z * 3.3 - y * 2.1) - 0.5) * 0.5;
    tmp.copy(dark).lerp(light, Math.min(1, Math.max(0, lit)));
    col.set([tmp.r, tmp.g, tmp.b], i * 3);
  }
  g.setAttribute("normal", new THREE.BufferAttribute(n, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.deleteAttribute("uv");
  return g;
}

function trunk(h: number, r: number, lean: number, color: THREE.Color, sides = 6) {
  const g = new THREE.CylinderGeometry(r * 0.6, r, h, sides, 1, true);
  g.translate(0, h / 2, 0);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) + (p.getY(i) / h) * lean);
  const col = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) col.set([color.r, color.g, color.b], i * 3);
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  g.deleteAttribute("uv");
  return g.toNonIndexed();
}

/** Lá dừa nước/cau: dải lá cong rủ từ ngọn. */
function frond(len: number, angle: number, droop: number, top: number, color: THREE.Color, tip: THREE.Color, seg = 5) {
  const pos: number[] = [];
  const col: number[] = [];
  const ca = Math.cos(angle);
  const sa = Math.sin(angle);
  const pt = (t: number, side: number) => {
    const d = t * len;
    const w = Math.sin(Math.PI * Math.min(1, t * 1.2)) * len * 0.12 * side;
    const y = top + d * 0.5 - droop * t * t * len;
    return [ca * d - sa * w, y, sa * d + ca * w];
  };
  for (let i = 0; i < seg; i++) {
    const t0 = i / seg;
    const t1 = (i + 1) / seg;
    const a = pt(t0, -1), b = pt(t0, 1), c = pt(t1, -1), d = pt(t1, 1);
    pos.push(...a, ...b, ...c, ...b, ...d, ...c);
    const c0 = color.clone().lerp(tip, t0);
    const c1 = color.clone().lerp(tip, t1);
    col.push(c0.r, c0.g, c0.b, c0.r, c0.g, c0.b, c1.r, c1.g, c1.b, c0.r, c0.g, c0.b, c1.r, c1.g, c1.b, c1.r, c1.g, c1.b);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const n = g.attributes.normal as THREE.BufferAttribute;
  for (let i = 0; i < n.count; i++) n.setY(i, Math.abs(n.getY(i)) + 0.5);
  return g;
}

/**
 * Dựng một biến thể hình dáng. Bản lite dùng cùng chuỗi số ngẫu nhiên (cùng `seed`) nên cùng dáng tổng thể,
 * chỉ thô hơn — ô cây đổi LOD ở xa không bị "nhảy" hình.
 */
function buildGeometry(kind: FoliageOptions["kind"], seed: number, dark: THREE.Color, light: THREE.Color, lite: boolean) {
  const rand = mulberry32(seed);
  const bark = new THREE.Color("#4a3626");
  const parts: THREE.BufferGeometry[] = [];
  const blob = (x: number, y: number, z: number, r: number) => leafBlob(x, y, z, r, rand, dark, light, lite);
  if (kind === "bush") {
    const n = 3 + Math.floor(rand() * 3);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const b = blob(Math.cos(a) * 0.7, 0.55 + rand() * 0.3, Math.sin(a) * 0.7, (0.75 + rand() * 0.3) * (lite ? 1.1 : 1));
      if (!lite || i % 2 === 0) parts.push(b);
    }
    parts.push(blob(0, 1.0, 0, lite ? 1.05 : 0.9));
  } else if (kind === "tree") {
    const h = 3.2 + rand() * 1.5;
    const lean = (rand() - 0.5) * 0.6;
    parts.push(trunk(h + 0.6, 0.22, lean, bark, lite ? 4 : 6));
    // tán xoè rộng, dẹt như cây gỗ nhiệt đới; vài cụm thấp hơn để mép tán không tròn đều
    const n = 5 + Math.floor(rand() * 2);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rand() * 0.9;
      const r = i === 0 ? 0 : 1.0 + rand() * 0.9;
      const y = h + (i === 0 ? 0.8 : (rand() - 0.3) * 1.1);
      const size = i === 0 ? 1.4 : 0.9 + rand() * 0.5;
      // lite: giữ khối giữa + một nửa khối quanh, phóng to bù phần bị bỏ (vẫn dựng để dãy ngẫu nhiên khớp bản đầy đủ)
      const b = blob(lean + Math.cos(a) * r, y, Math.sin(a) * r, size * (lite ? 1.2 : 1));
      if (!lite || i === 0 || i % 2 === 1) parts.push(b);
    }
  } else {
    const h = 6 + rand() * 3;
    const lean = 0.4 + rand() * 0.8;
    parts.push(trunk(h, 0.16, lean, new THREE.Color("#7a6a52"), lite ? 4 : 6));
    const n = lite ? 6 : 8;
    for (let i = 0; i < n; i++) {
      const g = frond(2.4 + rand() * 0.6, (i / n) * Math.PI * 2 + rand() * 0.4, 0.55 + rand() * 0.3, h, dark, light, lite ? 3 : 5);
      g.translate(lean, 0, 0);
      parts.push(g);
    }
  }
  const geo = mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)));
  geo.computeBoundingSphere();
  return geo;
}

/** Rải cây/bụi procedural — vài biến thể hình dáng, chia ô (instancing.ts), ô xa dùng bản lite. */
export function createFoliage(o: FoliageOptions): Actor {
  const rand = mulberry32(o.seed ?? 11);
  const dark = new THREE.Color(o.dark ?? "#1f3a1c");
  const light = new THREE.Color(o.light ?? "#6f9a42");
  const [s0, s1] = o.scale ?? [0.8, 1.4];
  const instances: Instance[] = [];
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const up = new THREE.Vector3(0, 1, 0);
  const p = new THREE.Vector3();
  const sc = new THREE.Vector3();
  for (let tries = 0; instances.length < o.count && tries < o.count * 6; tries++) {
    const x = o.area.x0 + rand() * (o.area.x1 - o.area.x0);
    const z = o.area.z0 + rand() * (o.area.z1 - o.area.z0);
    const y = o.accept(x, z);
    if (y === null) continue;
    const s = s0 + rand() * (s1 - s0);
    const v = 0.8 + rand() * 0.4;
    instances.push({
      matrix: m.compose(p.set(x, y, z), q.setFromAxisAngle(up, rand() * 6.28), sc.set(s, s * (0.85 + rand() * 0.3), s)).clone(),
      color: new THREE.Color(v * (0.92 + rand() * 0.2), v, v * (0.85 + rand() * 0.2)),
    });
  }
  const base = (o.seed ?? 11) * 101;
  const variants = [0, 1, 2].map((i) => {
    const seed = base + i;
    const lite = buildGeometry(o.kind, seed, dark, light, true);
    // bậc lite không cần dựng bản đầy đủ
    return { full: o.quality.lite ? lite : buildGeometry(o.kind, seed, dark, light, false), lite };
  });
  const chunked = createChunked({
    variants,
    material: o.kind === "bush" ? getPropMaterial() : getSwayMaterial(o.kind === "palm" ? 0.004 : 0.006),
    instances,
    quality: o.quality,
    maxDistance: o.maxDistance,
    castShadow: !!o.shadow,
    receiveShadow: !!o.shadow,
  });
  return {
    object: chunked.object,
    update(ctx) {
      wind.uWindTime.value = ctx.time;
      chunked.update?.(ctx);
    },
  };
}
