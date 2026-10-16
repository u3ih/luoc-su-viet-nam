import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Quality } from "./quality";

// Model xuất từ Blender (pnpm assets) nằm ở /public/models/<ten>.glb.
// "Nướng" mỗi model thành MỘT geometry có màu đỉnh → một draw call, dễ instancing,
// dùng chung một vật liệu cho cả cảnh.

const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const cache = new Map<string, Promise<GLTF>>();

export function loadModel(name: string): Promise<GLTF> {
  let p = cache.get(name);
  if (!p) {
    p = loader.loadAsync(`/models/${name}.glb`);
    cache.set(name, p);
  }
  return p;
}

export type BakeOptions = {
  /** Chỉ lấy các mesh có tên thoả điều kiện (vd. một biến thể đá). */
  filter?: (meshName: string) => boolean;
  /** Đưa tâm XZ về gốc, đáy về y=0. */
  recenter?: boolean;
  /** Làm mượt pháp tuyến (tán lá low-poly trông mềm như khối lá thật). */
  smooth?: boolean;
  /** Định danh của `filter` để cache kết quả nướng (không có thì mỗi lần gọi nướng lại). */
  filterId?: string;
};

/** Trung bình pháp tuyến các đỉnh trùng vị trí — giữ nguyên màu từng mặt. */
function smoothNormals(geo: THREE.BufferGeometry) {
  const p = geo.attributes.position as THREE.BufferAttribute;
  const n = geo.attributes.normal as THREE.BufferAttribute;
  const acc = new Map<string, THREE.Vector3>();
  const key = (i: number) => `${Math.round(p.getX(i) * 200)},${Math.round(p.getY(i) * 200)},${Math.round(p.getZ(i) * 200)}`;
  for (let i = 0; i < p.count; i++) {
    const k = key(i);
    const v = acc.get(k) ?? acc.set(k, new THREE.Vector3()).get(k)!;
    v.x += n.getX(i);
    v.y += n.getY(i);
    v.z += n.getZ(i);
  }
  for (let i = 0; i < p.count; i++) {
    const v = acc.get(key(i))!;
    const len = v.length() || 1;
    n.setXYZ(i, v.x / len, v.y / len, v.z / len);
  }
}

const tmpColor = new THREE.Color();

/** Chuyển thuộc tính (có thể đã lượng tử hoá bởi meshopt) về Float32. */
function toFloat(attr: THREE.BufferAttribute | THREE.InterleavedBufferAttribute, size: number) {
  const out = new Float32Array(attr.count * size);
  for (let i = 0; i < attr.count; i++) {
    out[i * size] = attr.getX(i);
    if (size > 1) out[i * size + 1] = attr.getY(i);
    if (size > 2) out[i * size + 2] = attr.getZ(i);
  }
  return new THREE.BufferAttribute(out, size);
}

// Kết quả nướng được giữ suốt phiên: mở lại chương, hay hai lời gọi cùng model + tuỳ chọn, dùng lại ngay
// (geometry bị dispose cùng renderer cũ sẽ tự tải lại lên GPU khi renderer mới vẽ nó).
const baked = new Map<string, Promise<THREE.BufferGeometry>>();

export function bakeModel(name: string, opts: BakeOptions = {}): Promise<THREE.BufferGeometry> {
  if (opts.filter && !opts.filterId) return bake(name, opts);
  const key = `${name}|${opts.filterId ?? ""}|${opts.recenter ? 1 : 0}|${opts.smooth ? 1 : 0}`;
  let p = baked.get(key);
  if (!p) {
    p = bake(name, opts);
    p.catch(() => baked.delete(key));
    baked.set(key, p);
  }
  return p;
}

// Danh sách model có bản lite (pnpm assets ghi ra) — hỏi một lần, tránh gọi file .lite.glb không tồn tại.
let liteList: Promise<Set<string>> | null = null;
function liteModels() {
  liteList ??= fetch("/models/lite.json")
    .then((r) => (r.ok ? (r.json() as Promise<string[]>) : []))
    .catch(() => [] as string[])
    .then((names) => new Set(names));
  return liteList;
}

export type LodGeometry = { full: THREE.BufferGeometry; lite: THREE.BufferGeometry };

/**
 * Nướng model theo bậc chất lượng: bậc lite chỉ tải bản `.lite.glb`; bậc có LOD tải cả hai
 * (ô ở xa dùng bản lite). Model chưa có bản lite thì cả hai là bản đầy đủ.
 */
export async function bakeModelLod(name: string, quality: Quality, opts: BakeOptions = {}): Promise<LodGeometry> {
  const hasLite = (await liteModels()).has(name);
  if (!hasLite) {
    const g = await bakeModel(name, opts);
    return { full: g, lite: g };
  }
  if (quality.lite) {
    const g = await bakeModel(`${name}.lite`, opts);
    return { full: g, lite: g };
  }
  const [full, lite] = await Promise.all([bakeModel(name, opts), bakeModel(`${name}.lite`, opts)]);
  return { full, lite };
}

async function bake(name: string, opts: BakeOptions): Promise<THREE.BufferGeometry> {
  const gltf = await loadModel(name);
  gltf.scene.updateMatrixWorld(true);
  const parts: THREE.BufferGeometry[] = [];

  gltf.scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh) return;
    if (opts.filter && !opts.filter(mesh.name) && !opts.filter(mesh.parent?.name ?? "")) return;
    const src = mesh.geometry;
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", toFloat(src.attributes.position, 3));
    if (src.attributes.normal) g.setAttribute("normal", toFloat(src.attributes.normal, 3));
    if (src.index) g.setIndex(src.index.clone());

    const mat = mesh.material as THREE.MeshStandardMaterial;
    const base = mat.color ?? new THREE.Color(1, 1, 1);
    const vc = src.attributes.color;
    const colors = new Float32Array(src.attributes.position.count * 3);
    for (let i = 0; i < src.attributes.position.count; i++) {
      tmpColor.copy(base);
      if (vc) tmpColor.multiply(new THREE.Color(vc.getX(i), vc.getY(i), vc.getZ(i)));
      colors.set([tmpColor.r, tmpColor.g, tmpColor.b], i * 3);
    }
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    g.applyMatrix4(mesh.matrixWorld);
    parts.push(g.index ? g.toNonIndexed() : g);
  });

  if (!parts.length) throw new Error(`[assets] ${name}: không có mesh phù hợp`);
  const geo = mergeGeometries(parts);
  if (!geo.attributes.normal) geo.computeVertexNormals();
  if (opts.smooth) smoothNormals(geo);
  if (opts.recenter) {
    geo.computeBoundingBox();
    const b = geo.boundingBox!;
    geo.translate(-(b.min.x + b.max.x) / 2, -b.min.y, -(b.min.z + b.max.z) / 2);
  }
  geo.computeBoundingSphere();
  return geo;
}

/** Vật liệu dùng chung cho mọi đạo cụ nướng từ Blender. */
let propMaterial: THREE.MeshLambertMaterial | null = null;
export function getPropMaterial() {
  // nhân nhẹ màu đỉnh để model Blender (màu khá trầm) không chìm vào nền
  propMaterial ??= new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, color: new THREE.Color(1.12, 1.12, 1.12) });
  return propMaterial;
}

/** Thời gian gió dùng chung cho mọi vật liệu lay động (cập nhật mỗi frame bởi actor có gió). */
export const wind = { uWindTime: { value: 0 } };

const swayMaterials = new Map<number, THREE.MeshLambertMaterial>();

/**
 * Vật liệu đạo cụ có gió: đỉnh cong theo bình phương chiều cao, thêm rung lá nhỏ.
 * `amount` ≈ độ lệch (m) ở độ cao 1 m; cây cao 8 m với 0.004 lệch ~25 cm.
 */
export function getSwayMaterial(amount: number) {
  let mat = swayMaterials.get(amount);
  if (mat) return mat;
  mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide, color: new THREE.Color(1.12, 1.12, 1.12) });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime = wind.uWindTime;
    shader.uniforms.uSway = { value: amount };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uWindTime;\nuniform float uSway;")
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `#include <begin_vertex>
        #ifdef USE_INSTANCING
          vec3 iOrigin = instanceMatrix[3].xyz;
        #else
          vec3 iOrigin = vec3(0.0);
        #endif
        float hgt = max(position.y, 0.0);
        float bend = hgt * hgt * uSway;
        float ph = dot(iOrigin.xz, vec2(0.11, 0.07));
        float gust = 0.55 + 0.45 * sin(uWindTime * 0.33 + iOrigin.x * 0.015 + iOrigin.z * 0.01);
        transformed.x += (sin(uWindTime * 1.3 + ph) * 0.7 + sin(uWindTime * 2.7 + ph * 1.7) * 0.3) * bend * gust;
        transformed.z += sin(uWindTime * 1.05 + ph * 1.3) * bend * gust * 0.6;
        transformed += sin(uWindTime * 5.5 + dot(position, vec3(2.3, 1.7, 3.1))) * 0.025 * smoothstep(0.5, 3.0, hgt) * gust;`,
      );
  };
  mat.customProgramCacheKey = () => "sway";
  swayMaterials.set(amount, mat);
  return mat;
}
