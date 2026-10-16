import * as THREE from "three";
import { clamp, lerp } from "../engine/math";

// Bảng màu lấy cảm hứng từ tranh sơn mài: nền then, ánh vàng, đỏ son.
// Thứ tự khớp với MOOD trong core/types.ts.
type Mood = { top: string; horizon: string; fog: string; sun: string; hemi: string; ground: string; sunElev: number; sunInt: number; hemiInt: number; fogNear: number; fogFar: number };

const MOODS: Mood[] = [
  // bình minh
  { top: "#3a3150", horizon: "#f0b47a", fog: "#b98a68", sun: "#ffe0b0", hemi: "#e8c7a0", ground: "#4a3424", sunElev: 0.16, sunInt: 3.0, hemiInt: 1.75, fogNear: 110, fogFar: 520 },
  // u ám, gió bấc
  { top: "#4a5a64", horizon: "#c8bc9e", fog: "#8e8a78", sun: "#fbe6c0", hemi: "#d4ccb6", ground: "#3a3022", sunElev: 0.3, sunInt: 2.4, hemiInt: 1.85, fogNear: 90, fogFar: 460 },
  // hoàng hôn đỏ son
  { top: "#4a2232", horizon: "#f58a4a", fog: "#a85a3a", sun: "#ffc27a", hemi: "#e0a07a", ground: "#3e2216", sunElev: 0.07, sunInt: 3.2, hemiInt: 1.6, fogNear: 110, fogFar: 540 },
  // đêm trăng
  { top: "#0b1220", horizon: "#3a4a68", fog: "#1e283a", sun: "#bcd0ff", hemi: "#6a7a9c", ground: "#10141c", sunElev: 0.45, sunInt: 1.1, hemiInt: 0.95, fogNear: 70, fogFar: 380 },
  // ban ngày
  { top: "#4f8ec0", horizon: "#e6ddba", fog: "#bdb8a0", sun: "#fff4dc", hemi: "#e8e2cc", ground: "#4a3c28", sunElev: 0.7, sunInt: 3.0, hemiInt: 1.9, fogNear: 140, fogFar: 620 },
];

const C = (h: string) => new THREE.Color(h);
const parsed = MOODS.map((m) => ({ ...m, c: { top: C(m.top), horizon: C(m.horizon), fog: C(m.fog), sun: C(m.sun), hemi: C(m.hemi), ground: C(m.ground) } }));

export type MoodState = {
  top: THREE.Color;
  horizon: THREE.Color;
  fog: THREE.Color;
  sun: THREE.Color;
  hemi: THREE.Color;
  ground: THREE.Color;
  sunDir: THREE.Vector3;
  sunInt: number;
  hemiInt: number;
  fogNear: number;
  fogFar: number;
};

export function createMoodState(): MoodState {
  return { top: C("#000"), horizon: C("#000"), fog: C("#000"), sun: C("#000"), hemi: C("#000"), ground: C("#000"), sunDir: new THREE.Vector3(), sunInt: 0, hemiInt: 0, fogNear: 0, fogFar: 0 };
}

/** Nội suy giữa hai mood kề nhau theo chỉ số liên tục. */
export function sampleMood(mood: number, out: MoodState) {
  const m = clamp(mood, 0, parsed.length - 1);
  const i = Math.min(Math.floor(m), parsed.length - 2);
  const f = m - i;
  const A = parsed[i];
  const B = parsed[i + 1];
  for (const k of ["top", "horizon", "fog", "sun", "hemi", "ground"] as const) out[k].copy(A.c[k]).lerp(B.c[k], f);
  out.sunInt = lerp(A.sunInt, B.sunInt, f);
  out.hemiInt = lerp(A.hemiInt, B.hemiInt, f);
  out.fogNear = lerp(A.fogNear, B.fogNear, f);
  out.fogFar = lerp(A.fogFar, B.fogFar, f);
  out.sunDir.set(0.35, lerp(A.sunElev, B.sunElev, f), -1).normalize();
  return out;
}

/** `cheap`: mây 3 lớp nhiễu thay vì 5, bỏ lớp mây mỏng thứ hai (bậc low). */
export function createSkyDome(cheap = false) {
  const uniforms = {
    uTop: { value: new THREE.Color() },
    uHorizon: { value: new THREE.Color() },
    uSun: { value: new THREE.Color() },
    uSunDir: { value: new THREE.Vector3() },
    uTime: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    defines: { OCTAVES: cheap ? 3 : 5, CHEAP: cheap ? 1 : 0 },
    side: THREE.BackSide,
    depthWrite: false,
    uniforms,
    vertexShader: /* glsl */ `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_Position = p.xyww;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uTop, uHorizon, uSun, uSunDir;
      uniform float uTime;
      varying vec3 vDir;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float vnoise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
      }
      float fbm(vec2 p) {
        float s = 0.0, a = 0.5;
        for (int i = 0; i < OCTAVES; i++) { s += a * vnoise(p); p = p * 2.07 + vec2(1.7, 9.2); a *= 0.5; }
        return s;
      }
      void main() {
        vec3 d = normalize(vDir);
        float h = clamp(d.y, -0.2, 1.0);
        float s = max(dot(d, uSunDir), 0.0);

        // nền trời: chân trời ấm, đỉnh sâu, thêm dải sương sáng sát mặt đất
        vec3 col = mix(uHorizon, uTop, pow(smoothstep(-0.02, 0.65, h), 0.6));
        col = mix(col, uHorizon * 1.12 + uSun * 0.08, (1.0 - smoothstep(0.0, 0.09, abs(h - 0.01))) * 0.55);
        // tán xạ quanh mặt trời: lõi, quầng, vầng rộng
        col += uSun * (pow(s, 900.0) * 3.0 + pow(s, 48.0) * 0.4 + pow(s, 6.0) * 0.22);

        // hai lớp mây trôi ngược nhau, viền sáng phía mặt trời
        vec2 q = d.xz / max(d.y + 0.12, 0.04);
        float band = smoothstep(0.0, 0.07, h) * (1.0 - smoothstep(0.32, 0.62, h));
        vec2 w1 = q * 0.9 + vec2(uTime * 0.006, uTime * 0.002);
        #if CHEAP
        float c1 = fbm(w1 * vec2(0.5, 1.6) + vnoise(w1 * 0.7) * 0.8);
        #else
        float c1 = fbm(w1 * vec2(0.5, 1.6) + fbm(w1 * 0.7) * 0.8);
        #endif
        float m1 = smoothstep(0.5, 0.78, c1) * band;
        float edge = smoothstep(0.5, 0.62, c1) - smoothstep(0.62, 0.8, c1);
        vec3 cloudShade = mix(uTop * 0.6 + uHorizon * 0.5, uHorizon * 1.05, 0.55 + 0.45 * h);
        vec3 cloudLit = mix(cloudShade, uSun * 1.15, pow(s, 3.0) * 0.8 + 0.2);
        col = mix(col, cloudLit, m1 * 0.7);
        col += uSun * edge * band * pow(s, 2.0) * 0.45;

        #if !CHEAP
        vec2 w2 = q * 2.4 - vec2(uTime * 0.01, 0.0);
        float c2 = fbm(w2 * vec2(0.35, 2.8));
        float m2 = smoothstep(0.58, 0.82, c2) * smoothstep(0.08, 0.2, h) * (1.0 - smoothstep(0.55, 0.9, h));
        col = mix(col, mix(uHorizon, uSun, 0.3 + s * 0.5) * 1.08, m2 * 0.35);
        #endif

        // sao mờ khi trời tối (uTop ở không gian tuyến tính nên ngưỡng rất thấp)
        float dark = 1.0 - smoothstep(0.006, 0.025, dot(uTop, vec3(0.299, 0.587, 0.114)));
        vec2 sp = d.xz / max(d.y, 0.05) * 90.0;
        float star = step(0.9965, hash(floor(sp))) * smoothstep(0.15, 0.5, h);
        col += vec3(star) * dark * (0.6 + 0.4 * sin(uTime * 2.0 + hash(floor(sp) + 3.1) * 40.0));

        // hạt nhiễu nhẹ chống dải màu
        col += (hash(gl_FragCoord.xy + fract(uTime)) - 0.5) / 255.0;
        gl_FragColor = vec4(col, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1000, 48, 24), mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = -1;
  return { mesh, uniforms };
}
