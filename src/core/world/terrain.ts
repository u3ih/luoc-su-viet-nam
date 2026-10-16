import * as THREE from "three";
import type { Actor, FrameCtx } from "../engine/world";

export type HeightBounds = { minX: number; minZ: number; sizeX: number; sizeZ: number; minH: number; maxH: number };
export type HeightFn = (x: number, z: number) => number;

export type TerrainOptions = {
  bounds: HeightBounds;
  segments: number;
  height: HeightFn;
  /** Màu theo độ cao / độ dốc (0 = phẳng, 1 = dựng đứng) — trả vào `out`. */
  colorize: (h: number, x: number, z: number, out: THREE.Color, slope: number) => void;
  /** Mực nước hiện tại — đất ngay trên mép nước sẫm lại như vừa bị con nước liếm qua. */
  wetLevel?: (ctx: FrameCtx) => number;
  /** Shader rẻ (bậc low): bỏ nhiễu theo điểm ảnh, chỉ giữ dải ướt. */
  cheap?: boolean;
};

/** Nhiễu giá trị cho shader (dùng chung địa hình, đá…). */
export const GLSL_NOISE = /* glsl */ `
float tHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float tNoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(tHash(i), tHash(i + vec2(1, 0)), u.x), mix(tHash(i + vec2(0, 1)), tHash(i + vec2(1, 1)), u.x), u.y);
}`;

/**
 * Vật liệu đất: màu đỉnh cho mảng lớn + nhiễu theo pixel để nhìn gần không bị nhoè,
 * vệt cỏ chạy theo một hướng, dải ướt ven nước.
 */
function terrainMaterial(uWet: THREE.IUniform<number>, cheap: boolean) {
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  mat.defines = { CHEAP: cheap ? 1 : 0 };
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uWet = uWet;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vTWorld;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvTWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vTWorld;\nuniform float uWet;\n" + GLSL_NOISE)
      .replace(
        "#include <color_fragment>",
        /* glsl */ `#include <color_fragment>
        vec2 wp = vTWorld.xz;
        #if !CHEAP
        float near = 1.0 - smoothstep(30.0, 180.0, distance(vTWorld, cameraPosition));
        float n = tNoise(wp * 0.9) * 0.45 + tNoise(wp * 3.7) * 0.3 + tNoise(wp * 13.0) * 0.25;
        // vệt cỏ/luống kéo dài theo x — gợi thớ đất, ruộng cày
        float streak = tNoise(vec2(wp.x * 0.35, wp.y * 4.0));
        diffuseColor.rgb *= mix(1.0, 0.8 + 0.36 * n + (streak - 0.5) * 0.12, near * 0.9 + 0.1);
        // đốm hoa cỏ/sỏi lấm tấm khi nhìn gần
        float speck = smoothstep(0.78, 0.9, tNoise(wp * 7.0)) * smoothstep(0.6, 0.8, tNoise(wp * 0.5 + 7.0));
        diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * vec3(1.35, 1.3, 1.1), speck * near * 0.5);
        #endif
        // dải ướt: đất sẫm & ngả lạnh trong khoảng 1.5 m trên mép nước, mép răng cưa theo nhiễu
        float wet = 1.0 - smoothstep(uWet + 0.1, uWet + 1.4 + tNoise(wp * 0.6) * 0.8, vTWorld.y);
        diffuseColor.rgb *= mix(vec3(1.0), vec3(0.6, 0.62, 0.66), wet);`,
      );
  };
  mat.customProgramCacheKey = () => `terrain-detail-${cheap ? 1 : 0}`;
  return mat;
}

export function createTerrain(o: TerrainOptions): Actor {
  const { bounds: b } = o;
  const geo = new THREE.PlaneGeometry(b.sizeX, b.sizeZ, o.segments, o.segments);
  geo.rotateX(-Math.PI / 2);
  geo.translate(b.minX + b.sizeX / 2, 0, b.minZ + b.sizeZ / 2);

  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) pos.setY(i, o.height(pos.getX(i), pos.getZ(i)));
  geo.computeVertexNormals();

  // tô màu sau khi có pháp tuyến để biết độ dốc; thêm vệt loang nhỏ cho đất bớt phẳng màu
  const nrm = geo.attributes.normal as THREE.BufferAttribute;
  const colors = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    o.colorize(pos.getY(i), x, z, c, 1 - nrm.getY(i));
    c.multiplyScalar(0.9 + 0.14 * noise2(x * 0.21, z * 0.21) + 0.06 * noise2(x * 0.9, z * 0.9));
    colors.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const uWet = { value: -1e4 };
  const mesh = new THREE.Mesh(geo, terrainMaterial(uWet, !!o.cheap));
  mesh.matrixAutoUpdate = false;
  mesh.updateMatrix();
  mesh.receiveShadow = true;
  return {
    object: mesh,
    update(ctx) {
      if (o.wetLevel) uWet.value = o.wetLevel(ctx);
    },
  };
}

/** Bản đồ độ cao cho shader nước (độ sâu, bọt ven bờ). */
export function createHeightTexture(height: HeightFn, b: HeightBounds, size = 256) {
  const data = new Uint8Array(size * size);
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const x = b.minX + ((i + 0.5) / size) * b.sizeX;
      const z = b.minZ + ((j + 0.5) / size) * b.sizeZ;
      data[j * size + i] = Math.round(((height(x, z) - b.minH) / (b.maxH - b.minH)) * 255);
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RedFormat, THREE.UnsignedByteType);
  tex.magFilter = tex.minFilter = THREE.LinearFilter;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.needsUpdate = true;
  return tex;
}

/** Hàm nhiễu dùng chung để sinh địa hình. */
function hash(x: number, z: number) {
  const h = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
  return h - Math.floor(h);
}
export function noise2(x: number, z: number) {
  const xi = Math.floor(x);
  const zi = Math.floor(z);
  const xf = x - xi;
  const zf = z - zi;
  const u = xf * xf * (3 - 2 * xf);
  const v = zf * zf * (3 - 2 * zf);
  const a = hash(xi, zi);
  const b = hash(xi + 1, zi);
  const c = hash(xi, zi + 1);
  const d = hash(xi + 1, zi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
export function fbm2(x: number, z: number, octaves = 5) {
  let s = 0;
  let a = 0.5;
  let f = 1;
  for (let i = 0; i < octaves; i++) {
    s += a * noise2(x * f, z * f);
    f *= 2.03;
    a *= 0.5;
  }
  return s;
}
