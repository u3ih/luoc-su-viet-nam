import * as THREE from "three";
import { mulberry32 } from "../engine/math";
import type { Actor } from "../engine/world";

export type BirdsOptions = {
  /** Số đàn và số con mỗi đàn. */
  flocks: number;
  perFlock: number;
  center: THREE.Vector3Like;
  /** Bán kính vòng bay và độ cao (min, max). */
  radius: number;
  altitude: [number, number];
  color?: string;
  seed?: number;
};

/** Thân + hai cánh hình mũi tên; cánh vỗ trong vertex shader theo |x|. */
function birdGeometry() {
  const g = new THREE.BufferGeometry();
  // prettier-ignore
  const pos = [
    0, 0, 0.5,   -1, 0.05, -0.15,  0, 0, -0.3,
    0, 0, 0.5,    0, 0, -0.3,      1, 0.05, -0.15,
    0, 0, -0.3,  -0.18, 0, -0.65,  0.18, 0, -0.65,
  ];
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/** Đàn chim lượn vòng trên trời — vài chục con, một draw call. */
export function createBirds(o: BirdsOptions): Actor {
  const rand = mulberry32(o.seed ?? 5);
  const n = o.flocks * o.perFlock;
  const uniforms = { uTime: { value: 0 } };
  const mat = new THREE.MeshLambertMaterial({ color: o.color ?? "#2a211c", side: THREE.DoubleSide });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = uniforms.uTime;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;")
      .replace(
        "#include <begin_vertex>",
        /* glsl */ `#include <begin_vertex>
        float ph = instanceMatrix[3].x * 0.37 + instanceMatrix[3].z * 0.23;
        // vỗ nhanh rồi lượn: nhịp vỗ tắt dần theo chu kỳ dài
        float glide = smoothstep(-0.2, 0.6, sin(uTime * 0.5 + ph * 3.0));
        transformed.y += abs(position.x) * sin(uTime * 9.0 + ph * 5.0) * 0.75 * glide;`,
      );
  };
  const mesh = new THREE.InstancedMesh(birdGeometry(), mat, n);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;

  const birds = Array.from({ length: n }, (_, i) => {
    const f = Math.floor(i / o.perFlock);
    const k = i % o.perFlock;
    return {
      f,
      // đội hình chữ V lỏng
      back: Math.ceil(k / 2) * 2.4 + rand() * 0.8,
      side: (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 2.0 + (rand() - 0.5) * 0.8,
      dy: (rand() - 0.5) * 1.5,
      scale: 0.6 + rand() * 0.3,
    };
  });
  const flocks = Array.from({ length: o.flocks }, () => ({
    r: o.radius * (0.55 + rand() * 0.45),
    y: o.altitude[0] + rand() * (o.altitude[1] - o.altitude[0]),
    speed: (0.025 + rand() * 0.02) * (rand() < 0.5 ? -1 : 1),
    phase: rand() * Math.PI * 2,
    ox: (rand() - 0.5) * o.radius * 0.6,
    oz: (rand() - 0.5) * o.radius * 0.6,
  }));

  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const e = new THREE.Euler(0, 0, 0, "YXZ");
  const p = new THREE.Vector3();
  const s = new THREE.Vector3();

  return {
    object: mesh,
    update(ctx) {
      uniforms.uTime.value = ctx.time;
      birds.forEach((b, i) => {
        const fl = flocks[b.f];
        const a = fl.phase + ctx.time * fl.speed;
        const dir = Math.sign(fl.speed);
        // hướng bay = tiếp tuyến vòng tròn
        const yaw = Math.atan2(-Math.sin(a) * dir, Math.cos(a) * dir);
        const fx = Math.sin(yaw);
        const fz = Math.cos(yaw);
        const cx = o.center.x + fl.ox + Math.cos(a) * fl.r;
        const cz = o.center.z + fl.oz + Math.sin(a) * fl.r;
        p.set(cx - fx * b.back + fz * b.side, fl.y + b.dy + Math.sin(ctx.time * 0.4 + i) * 0.6, cz - fz * b.back - fx * b.side);
        e.set(0, yaw, -dir * 0.18);
        m.compose(p, q.setFromEuler(e), s.setScalar(b.scale));
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}
