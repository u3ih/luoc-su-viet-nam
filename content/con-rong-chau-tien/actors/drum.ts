import * as THREE from "three";
import { clamp } from "@/core/engine/math";
import type { Actor, FrameCtx } from "@/core/engine/world";

// Mặt trống đồng Ngọc Lũ hiện lên từ lòng đất (phân cảnh "Truyền thuyết và khảo cổ"): một mặt tròn nằm
// trên đồng bằng, ánh đồng loang dần từ ngôi sao giữa ra các vành ngoài như được khai quật.
// Hoa văn KHÔNG tự vẽ: dùng đúng hình public/hoa-van/mat-trong-ngoc-lu.svg mà ornaments/DongSonDrum.tsx đang dùng
// — "Trống Đồng Đông Sơn (alt).svg", bộ "Văn Lang Hoạ Đồ", Wikimedia Commons, public domain:
// https://commons.wikimedia.org/wiki/File:Tr%E1%BB%91ng_%C4%90%E1%BB%93ng_%C4%90%C3%B4ng_S%C6%A1n_(alt).svg
// Mặt phẳng nhìn từ phía trên, mặt trước hướng lên → hình không bị lật gương (giữ đúng chiều đi của người, chim).
// Hình chỉ được tải khi người xem sắp cuộn tới (`load` lần đầu trả true), tải lỗi thì phân cảnh vẫn chạy, chỉ thiếu trống.

const SRC = "/hoa-van/mat-trong-ngoc-lu.svg";
/** Bán kính mặt trống trong hình (viewBox 1660, hình tròn r = 752) — tỉ lệ so với cạnh ảnh. */
const FACE = 752 / 1660;

export type DrumOptions = {
  center: THREE.Vector3;
  /** Bán kính mặt trống (m). */
  radius: number;
  /** Cạnh ảnh raster hoá (điểm ảnh). */
  resolution: number;
  /** Bắt đầu tải hình khi hàm này trả true lần đầu. */
  load: (ctx: FrameCtx) => boolean;
  /** Mức hiện 0..1: 0 chìm dưới đất, 1 đã lộ hết mặt trống. */
  reveal: (ctx: FrameCtx) => number;
  /** Độ hiện chung 0..1. */
  visible: (ctx: FrameCtx) => number;
};

async function rasterize(size: number) {
  const svg = (await (await fetch(SRC)).text()).replace("<svg ", `<svg width="${size}" height="${size}" `);
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = size;
    canvas.getContext("2d")!.drawImage(img, 0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.anisotropy = 4;
    return tex;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function createDrum(o: DrumOptions): Actor {
  const side = o.radius / FACE;
  const geo = new THREE.PlaneGeometry(side, side);
  geo.rotateX(-Math.PI / 2);
  const uniforms = {
    uTex: { value: null as THREE.Texture | null },
    uReveal: { value: 0 },
    uAlpha: { value: 0 },
    uTime: { value: 0 },
    uBase: { value: new THREE.Color("#3b2a16") },
    uBronze: { value: new THREE.Color("#c99a4a") },
    uGold: { value: new THREE.Color("#ffe1a0") },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D uTex;
      uniform float uReveal, uAlpha, uTime;
      uniform vec3 uBase, uBronze, uGold;
      varying vec2 vUv;
      void main() {
        vec2 c = vUv - 0.5;
        float r = length(c) / ${FACE.toFixed(4)};
        if (r > 1.03) discard;
        // phần nổi của hoa văn (hình vẽ đen trên nền trong suốt → lấy kênh alpha)
        float pat = texture2D(uTex, vUv).a;
        // lộ dần từ tâm ra mép, mép lộ có viền sáng như ánh đồng vừa chạm nắng
        float edge = uReveal * 1.08;
        float shown = smoothstep(edge, edge - 0.06, r);
        float rim = smoothstep(0.06, 0.0, abs(r - edge + 0.03)) * step(0.001, uReveal) * (1.0 - smoothstep(0.92, 1.0, uReveal));
        // vệt sáng chậm quét quanh mặt trống
        float ang = atan(c.y, c.x);
        float sweep = pow(0.5 + 0.5 * sin(ang - uTime * 0.35), 12.0) * 0.5;
        vec3 col = mix(uBase, uBronze, pat) + uGold * pat * sweep;
        col = mix(col, uGold, rim * 0.7);
        float a = (0.62 + 0.38 * pat) * shown * smoothstep(1.03, 0.99, r) + rim * 0.5;
        gl_FragColor = vec4(col, clamp(a, 0.0, 1.0) * uAlpha);
      }`,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.renderOrder = 3;
  mesh.visible = false;
  let started = false;
  let ready = false;
  return {
    object: mesh,
    update(ctx) {
      if (!started && o.load(ctx)) {
        started = true;
        rasterize(o.resolution)
          .then((tex) => {
            uniforms.uTex.value = tex;
            ready = true;
          })
          .catch(() => {
            // không có trống thì phân cảnh vẫn chạy bình thường
          });
      }
      const vis = o.visible(ctx);
      mesh.visible = ready && vis > 0.002;
      if (!mesh.visible) return;
      const rv = clamp(o.reveal(ctx));
      uniforms.uReveal.value = rv;
      uniforms.uAlpha.value = vis;
      uniforms.uTime.value = ctx.time;
      // trồi lên từ dưới đất trong nửa đầu, rồi nằm yên
      mesh.position.set(o.center.x, o.center.y - 4 * (1 - clamp(rv * 2)), o.center.z);
    },
    dispose() {
      geo.dispose();
      mat.dispose();
      uniforms.uTex.value?.dispose();
    },
  };
}
