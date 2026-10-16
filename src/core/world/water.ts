import * as THREE from "three";
import type { Actor, FrameCtx } from "../engine/world";
import type { HeightBounds } from "./terrain";

const vertex = /* glsl */ `
uniform float uTime;
uniform float uLevel;
varying vec3 vWorld;
#include <fog_pars_vertex>
void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  world.y = uLevel
    + sin(world.x * 0.08 + uTime * 0.9) * 0.07
    + sin(world.z * 0.11 - uTime * 1.1) * 0.05
    + sin((world.x + world.z) * 0.21 + uTime * 1.6) * 0.025;
  vWorld = world.xyz;
  vec4 mvPosition = viewMatrix * world;
  gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;

const fragment = /* glsl */ `
uniform sampler2D uHeight;
uniform vec4 uBounds;
uniform vec2 uRange;
uniform float uLevel;
uniform float uTime;
uniform vec3 uDeep, uShallow, uFoam, uGold, uSky, uSkyTop, uSun, uSunDir;
#if WAKES > 0
uniform vec4 uWakes[WAKES];
#endif
varying vec3 vWorld;
#include <fog_pars_fragment>

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}

#if CHEAP
vec2 ripple(vec2 p, float t) {
  // một lớp nhiễu, đạo hàm xấp xỉ bằng 3 lần lấy mẫu
  float e = 0.2;
  float a = vnoise(p + vec2(t * 0.35, t * 0.12));
  float bx = vnoise(p + vec2(e, 0.0) + vec2(t * 0.35, t * 0.12));
  float bz = vnoise(p + vec2(0.0, e) + vec2(t * 0.35, t * 0.12));
  return vec2(bx - a, bz - a) / e * 1.4;
}
#else
vec2 ripple(vec2 p, float t) {
  // đạo hàm xấp xỉ của tổng nhiễu → độ nghiêng mặt nước
  float e = 0.15;
  float a = vnoise(p + vec2(t * 0.35, t * 0.12)) + vnoise(p * 1.9 - vec2(t * 0.22, -t * 0.3)) * 0.5 + vnoise(p * 4.1 + vec2(t * 0.6, t * 0.4)) * 0.22;
  float bx = vnoise(p + vec2(e, 0.0) + vec2(t * 0.35, t * 0.12)) + vnoise((p + vec2(e, 0.0)) * 1.9 - vec2(t * 0.22, -t * 0.3)) * 0.5 + vnoise((p + vec2(e, 0.0)) * 4.1 + vec2(t * 0.6, t * 0.4)) * 0.22;
  float bz = vnoise(p + vec2(0.0, e) + vec2(t * 0.35, t * 0.12)) + vnoise((p + vec2(0.0, e)) * 1.9 - vec2(t * 0.22, -t * 0.3)) * 0.5 + vnoise((p + vec2(0.0, e)) * 4.1 + vec2(t * 0.6, t * 0.4)) * 0.22;
  return vec2(bx - a, bz - a) / e;
}
#endif

void main() {
  vec2 uv = (vWorld.xz - uBounds.xy) / uBounds.zw;
  float bed = mix(uRange.x, uRange.y, texture2D(uHeight, uv).r);
  float depth = uLevel - bed;

  vec3 V = normalize(cameraPosition - vWorld);
  float dist = length(cameraPosition - vWorld);

  // màu nước: nông thì trong, sâu thì đậm; vệt phù sa loang chậm
  vec3 col = mix(uShallow, uDeep, smoothstep(0.0, 6.0, depth));
  #if !CHEAP
  float silt = vnoise(vWorld.xz * 0.02 + vec2(uTime * 0.01, 0.0));
  col = mix(col, uShallow * 1.15, smoothstep(0.45, 0.8, silt) * 0.25);
  #endif

  // gợn sóng nhiều tầng, tắt dần theo khoảng cách để không răng cưa
  float amp = 0.11 * (1.0 - smoothstep(50.0, 260.0, dist)) + 0.015;
  vec2 g = ripple(vWorld.xz * 0.45, uTime) * amp;
  vec3 N = normalize(vec3(-g.x, 1.0, -g.y));

  // phản chiếu trời: góc thấp thấy chân trời, nhìn xuống thấy đỉnh trời
  vec3 R = reflect(-V, N);
  vec3 skyCol = mix(uSky, uSkyTop, smoothstep(0.0, 0.5, R.y));
  float fres = 0.04 + 0.96 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
  col = mix(col, skyCol, clamp(fres * 0.9 + 0.08, 0.0, 1.0));

  // vệt nắng: highlight sắc + đường lấp lánh trải về phía mặt trời
  vec3 H = normalize(uSunDir + V);
  float spec = pow(max(dot(N, H), 0.0), 220.0) * 2.2 + pow(max(dot(N, H), 0.0), 24.0) * 0.12;
  col += mix(uSun, uGold, 0.4) * spec;
  #if !CHEAP
  float glint = smoothstep(0.92, 0.99, vnoise(vWorld.xz * 2.6 + vec2(uTime * 0.4, -uTime * 0.25)));
  col += uSun * glint * pow(max(dot(R, uSunDir), 0.0), 12.0) * 0.35 * (1.0 - smoothstep(30.0, 200.0, dist));

  // vảy vàng — gợi chất liệu sơn mài dát vàng
  float gv = vnoise(vWorld.xz * 2.2 + vec2(uTime * 0.05, 0.0));
  col += uGold * smoothstep(0.94, 0.99, gv) * 0.08 * smoothstep(8.0, 30.0, dist) * (1.0 - smoothstep(60.0, 160.0, dist));
  #endif

  // bọt ven bờ dịch theo con nước, mép bọt rách theo nhiễu
  float edgeN = vnoise(vWorld.xz * 0.8 + uTime * 0.2);
  float foam = 1.0 - smoothstep(0.0, 0.5 + edgeN * 0.5, depth);
  float bands = smoothstep(0.6, 0.95, sin(depth * 8.0 - uTime * 1.3 + edgeN * 3.0) * 0.5 + 0.5) * (1.0 - smoothstep(0.0, 1.8, depth));
  col = mix(col, uFoam, clamp(foam * 0.7 + bands * 0.25, 0.0, 1.0));

#if WAKES > 0
  // sóng đuôi thuyền: hai cánh chữ V loe dần + vệt sủi giữa, tắt theo tốc độ & khoảng cách
  float wake = 0.0;
  for (int i = 0; i < WAKES; i++) {
    vec4 w = uWakes[i];
    float sp = length(w.zw);
    if (sp < 0.15) continue;
    vec2 dir = w.zw / sp;
    vec2 rel = vWorld.xz - w.xy;
    float along = -dot(rel, dir);
    if (along < -4.0 || along > 32.0) continue;
    float side = abs(dot(rel, vec2(-dir.y, dir.x)));
    float spread = 1.2 + max(along, 0.0) * 0.34;
    float arms = exp(-pow((side - spread) / (0.3 + along * 0.03), 2.0));
    float trail = exp(-side * side / (0.5 + along * 0.08)) * 0.55;
    float fade = (1.0 - smoothstep(1.0, 32.0, along)) * smoothstep(-4.0, -1.0, along) * clamp(sp / 2.5, 0.0, 1.0);
    wake += (arms + trail) * fade;
  }
  // bọt vỡ thành mảng, không phải dải trơn
  float wn = vnoise(vWorld.xz * 2.3 + vec2(uTime * 0.7, -uTime * 0.5)) * 0.65 + vnoise(vWorld.xz * 6.1 - uTime * 0.9) * 0.35;
  col = mix(col, uFoam, clamp(wake * smoothstep(0.3, 0.75, wn), 0.0, 0.55));
#endif

  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

export type WaterOptions = {
  heightTex: THREE.Texture;
  bounds: HeightBounds;
  segments: number;
  /** Mực nước theo frame (vd. đọc tham số thủy triều). */
  level: (ctx: FrameCtx) => number;
  colors?: Partial<Record<"deep" | "shallow" | "foam" | "gold", string>>;
  /** Shader rẻ (bậc low): một lớp gợn, bỏ lấp lánh / vảy vàng / phù sa. */
  cheap?: boolean;
  /** Vệt sóng đuôi thuyền: mảng [x, z, vx, vz] × n, actor thuyền ghi vào mỗi frame. */
  wakes?: Float32Array;
  /** Lấy màu bầu trời & hướng nắng hiện tại để phản chiếu. */
  sky: () => { horizon: THREE.Color; top: THREE.Color; sun: THREE.Color; sunDir: THREE.Vector3 };
};

export function createWater(o: WaterOptions): Actor & { uniforms: Record<string, THREE.IUniform> } {
  const geo = new THREE.PlaneGeometry(1400, 1400, o.segments, o.segments);
  geo.rotateX(-Math.PI / 2);
  const c = { deep: "#16413f", shallow: "#6e8a5c", foam: "#f0e2bc", gold: "#f0c470", ...o.colors };
  const uniforms = THREE.UniformsUtils.merge([
    THREE.UniformsLib.fog,
    {
      uTime: { value: 0 },
      uLevel: { value: 0 },
      uHeight: { value: null },
      uBounds: { value: new THREE.Vector4(o.bounds.minX, o.bounds.minZ, o.bounds.sizeX, o.bounds.sizeZ) },
      uRange: { value: new THREE.Vector2(o.bounds.minH, o.bounds.maxH) },
      uDeep: { value: new THREE.Color(c.deep) },
      uShallow: { value: new THREE.Color(c.shallow) },
      uFoam: { value: new THREE.Color(c.foam) },
      uGold: { value: new THREE.Color(c.gold) },
      uSky: { value: new THREE.Color() },
      uSkyTop: { value: new THREE.Color() },
      uSun: { value: new THREE.Color(1, 1, 1) },
      uSunDir: { value: new THREE.Vector3(0, 0.3, 1).normalize() },
      uWakes: { value: o.wakes ?? new Float32Array(4) },
    },
  ]);
  uniforms.uHeight.value = o.heightTex;
  if (o.wakes) uniforms.uWakes.value = o.wakes;
  const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms, fog: true, defines: { WAKES: o.wakes ? o.wakes.length / 4 : 0, CHEAP: o.cheap ? 1 : 0 } }));
  mesh.frustumCulled = false;

  return {
    object: mesh,
    uniforms,
    update(ctx) {
      const s = o.sky();
      uniforms.uTime.value = ctx.time;
      uniforms.uLevel.value = o.level(ctx);
      uniforms.uSky.value.copy(s.horizon);
      uniforms.uSkyTop.value.copy(s.top);
      uniforms.uSun.value.copy(s.sun);
      uniforms.uSunDir.value.copy(s.sunDir);
    },
  };
}
