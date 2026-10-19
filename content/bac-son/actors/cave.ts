import * as THREE from "three";
import type { Actor, FrameCtx } from "@/core/engine/world";

// Cửa hang (chép từ cảnh hang cùng loại, để chương không import chéo): một mảng phẳng đứng áp vào vách đá, hình vòm, giữa tối sẫm, mép nhoè như bóng đổ của vách.
// `glow` (0..1) rọi sắc ấm từ trong hang ra — gợi hang có người ở; 0 thì chỉ còn bóng tối.
// Hình dáng cửa hang chỉ là gợi ý (tư liệu chỉ nói hang có hai cửa thông nhau).

export type Mouth = { x: number; y: number; z: number; width: number; height: number; /** Độ ngả của vách (rad): đỉnh cửa lùi ra sau so với chân. */ lean?: number };

export function createCave(o: { mouths: Mouth[]; glow: (ctx: FrameCtx) => number }): Actor {
  const group = new THREE.Group();
  const shared = { uGlow: { value: 0 }, uTime: { value: 0 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: shared,
    transparent: true,
    // không kiểm tra độ sâu: ở bậc chất lượng thấp lưới địa hình thô nên vách đá có thể lồi ra trước mảng cửa hang.
    // Máy quay luôn ở phía nam, cửa hang quay về nam nên không bao giờ nhìn xuyên qua núi.
    depthTest: false,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float uGlow, uTime;
      varying vec2 vUv;
      void main() {
        // x ∈ [-1, 1], y ∈ [0, 1]; vòm: nửa elip trên, hai bên thẳng ở nửa dưới
        vec2 p = vec2(vUv.x * 2.0 - 1.0, vUv.y);
        float arch = p.y > 0.4 ? length(vec2(p.x, (p.y - 0.4) / 0.6)) : abs(p.x);
        float shape = 1.0 - smoothstep(0.82, 1.0, arch);
        float depth = smoothstep(1.0, 0.1, arch);
        float flick = 0.88 + 0.12 * sin(uTime * 5.1) * sin(uTime * 3.3 + 1.7);
        vec3 dark = vec3(0.025, 0.018, 0.012);
        vec3 warm = vec3(1.0, 0.58, 0.24);
        float lamp = uGlow * flick * (0.2 + 0.8 * (1.0 - p.y)) * (0.35 + 0.65 * depth) * 0.75;
        vec3 col = dark + warm * lamp;
        gl_FragColor = vec4(col, shape * 0.97);
      }`,
  });
  const geo = new THREE.PlaneGeometry(1, 1);
  geo.translate(0, 0.5, 0);
  geo.rotateY(Math.PI); // mặt nhìn về phía nam (-z)
  for (const m of o.mouths) {
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(m.x, m.y, m.z);
    mesh.scale.set(m.width, m.height, 1);
    mesh.rotation.x = m.lean ?? 0;
    mesh.renderOrder = 1;
    group.add(mesh);
  }
  return {
    object: group,
    update(ctx) {
      shared.uGlow.value = o.glow(ctx);
      shared.uTime.value = ctx.time;
    },
    dispose() {
      geo.dispose();
      mat.dispose();
    },
  };
}
