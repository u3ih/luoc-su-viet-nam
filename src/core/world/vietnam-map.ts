import * as THREE from "three";
import { MapControls } from "three/addons/controls/MapControls.js";

// Bản đồ Việt Nam 3D cho trang lộ trình: địa hình nổi khối theo độ cao thật, đảo, quần đảo Hoàng Sa – Trường Sa
// trên mặt biển sơn mài. (Sao vàng đánh dấu thủ đô là phần tử HTML trong ui/HistoryMap.tsx — giữ cỡ cố định khi phóng.)
// Chỉ dựng địa lý; nhãn địa danh và mốc sự kiện là phần tử HTML do giao diện tự đặt theo `project()`
// (bấm, rê chuột, đọc màn hình, phím Tab đều dùng được như nút thường).
//
// Dữ liệu (xem public/geo/README.md):
// - ne-10m-vn.json: đường biên, bờ biển — Natural Earth, góc nhìn Việt Nam. Dùng vẽ mặt nạ đất liền (bờ biển sắc nét).
// - do-cao.png: độ cao ETOPO1 (NOAA), mỗi điểm ảnh ~3,7 km; giá trị v → độ cao (v/255)² × 3200 m.

export type GeoData = Record<string, [number, number][][]>;

/** Phép chiếu phẳng quanh tâm Việt Nam: 1° vĩ độ = 10 đơn vị; kinh độ nhân cos(16°) cho đỡ méo. */
const LON0 = 107.6;
const LAT0 = 15.6;
const K = 10;
const COS = Math.cos((16 * Math.PI) / 180);
export const toXZ = (lat: number, lon: number): [number, number] => [(lon - LON0) * COS * K, -(lat - LAT0) * K];
export const fromXZ = (x: number, z: number) => ({ lat: LAT0 - z / K, lon: LON0 + x / (COS * K) });

/** Khung dữ liệu (độ cao và mặt nạ cùng phủ khung này). */
const LON_MIN = 97.5;
const LON_MAX = 119;
const LAT_MIN = 5.5;
const LAT_MAX = 26.5;
/** Mặt đất ở mực 0 m; mỗi km độ cao = VERT đơn vị (phóng đại chiều đứng ~11 lần để núi rõ khối). */
const BASE = 0.25;
const VERT = 1.1;

export type MapView = {
  /** Vẽ một lớp đường ranh giới (vòng phẳng [kinh độ, vĩ độ, …]) bám mặt đất; gọi lại cùng id để thay. */
  setLines(id: string, rings: number[][], color: string, opacity: number, lift?: number): void;
  removeLines(id: string): void;
  /** Điểm bản đồ ở giữa khung nhìn. */
  center(): { lat: number; lon: number };
  /** Toạ độ màn hình (px, so với canvas) của điểm (vĩ độ, kinh độ); `false` nếu ở sau máy quay. */
  project(lat: number, lon: number, out: { x: number; y: number }): boolean;
  /** Khoảng cách máy quay → tâm nhìn (để ẩn bớt nhãn khi thu nhỏ). */
  distance(): number;
  /** Bay tới một điểm. */
  focus(lat: number, lon: number, distance?: number): void;
  zoom(factor: number): void;
  reset(): void;
  dispose(): void;
};

export type MapOptions = {
  geo: GeoData;
  /** Ảnh độ cao (public/geo/do-cao.png). */
  heightUrl: string;
  /** Các đảo nhỏ cần chấm nổi bật (quần đảo) — [vĩ độ, kinh độ]. */
  islets: [number, number][];
  /** Gọi sau mỗi lần vẽ để giao diện đặt lại nhãn. */
  onRender: () => void;
  reducedMotion: boolean;
};

// ---------------------------------------------------------------------------
// Dữ liệu nền: độ cao (từ PNG) và mặt nạ đất liền (vẽ từ đa giác Natural Earth lên canvas)

type Grid = { w: number; h: number; data: Float32Array };

async function loadHeights(url: string): Promise<Grid> {
  const img = new Image();
  img.src = url;
  await img.decode();
  const c = document.createElement("canvas");
  c.width = img.width;
  c.height = img.height;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const px = ctx.getImageData(0, 0, c.width, c.height).data;
  const data = new Float32Array(c.width * c.height);
  for (let i = 0; i < data.length; i++) data[i] = (px[i * 4] / 255) ** 2 * 3200;
  return { w: c.width, h: c.height, data };
}

/** Mặt nạ đất liền: kênh R = Việt Nam, kênh G = nước khác. */
function landMask(geo: GeoData, size: number, readSize: number) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);
  const draw = (rings: [number, number][][], color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (const r of rings)
      r.forEach(([lon, lat], i) => {
        const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * size;
        const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * size;
        if (i) ctx.lineTo(x, y);
        else ctx.moveTo(x, y);
      });
    ctx.fill("evenodd");
  };
  for (const [k, rings] of Object.entries(geo)) if (k !== "VNM") draw(rings, "#00ff00");
  draw(geo.VNM ?? [], "#ff0000");
  // CPU chỉ cần mặt nạ ở độ phân giải của lưới địa hình (tô màu đỉnh): đọc bản thu nhỏ thay vì cả ảnh lớn
  const small = Math.min(size, readSize);
  const sc = document.createElement("canvas");
  sc.width = sc.height = small;
  const sctx = sc.getContext("2d", { willReadFrequently: true })!;
  sctx.drawImage(c, 0, 0, small, small);
  const px = sctx.getImageData(0, 0, small, small).data;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.NoColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.generateMipmaps = false;
  return { tex, px, size: small };
}

function sample(g: Grid, lat: number, lon: number) {
  const fx = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (g.w - 1);
  const fy = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (g.h - 1);
  if (fx < 0 || fy < 0 || fx > g.w - 1 || fy > g.h - 1) return 0;
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(g.w - 1, x0 + 1);
  const y1 = Math.min(g.h - 1, y0 + 1);
  const tx = fx - x0;
  const ty = fy - y0;
  const d = g.data;
  const a = d[y0 * g.w + x0] * (1 - tx) + d[y0 * g.w + x1] * tx;
  const b = d[y1 * g.w + x0] * (1 - tx) + d[y1 * g.w + x1] * tx;
  return a * (1 - ty) + b * ty;
}

// ---------------------------------------------------------------------------

function seaMaterial() {
  return new THREE.ShaderMaterial({
    uniforms: { uDeep: { value: new THREE.Color("#0d0806") }, uNear: { value: new THREE.Color("#22140d") }, uGold: { value: new THREE.Color("#d4a24c") } },
    vertexShader: /* glsl */ `
      varying vec2 vXZ;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vXZ = w.xz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uDeep, uNear, uGold;
      varying vec2 vXZ;
      void main() {
        float r = length(vXZ) / 220.0;
        vec3 col = mix(uNear, uDeep, smoothstep(0.1, 1.0, r));
        // lưới kinh vĩ tuyến mảnh mỗi 2° — gợi bản đồ cổ
        vec2 cell = vXZ / vec2(${(20 * COS).toFixed(4)}, 20.0);
        vec2 g = abs(fract(cell + 0.5) - 0.5) / fwidth(cell);
        float line = 1.0 - min(min(g.x, g.y), 1.0);
        col += uGold * line * 0.07 * (1.0 - smoothstep(0.4, 1.0, r));
        gl_FragColor = vec4(col, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

// màu theo độ cao: đồng bằng lúa → rừng trung du → rừng núi sẫm → núi đá → đỉnh cao ánh vàng sơn mài
const C = {
  delta: new THREE.Color("#8a9446"),
  mid: new THREE.Color("#4f7d34"),
  forest: new THREE.Color("#2c5428"),
  high: new THREE.Color("#5e5232"),
  peak: new THREE.Color("#c9963f"),
  other: new THREE.Color("#2b1a12"),
  otherHigh: new THREE.Color("#3d2a1d"),
  sea: new THREE.Color("#120b08"),
};

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Địa hình: lưới nổi theo độ cao, tô màu theo độ cao + nước; phần biển bị loại bằng mặt nạ ở fragment shader. */
function terrainMesh(heights: Grid, mask: ReturnType<typeof landMask>, seg: number) {
  const [x0, z1] = toXZ(LAT_MIN, LON_MIN);
  const [x1, z0] = toXZ(LAT_MAX, LON_MAX);
  const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, seg, seg);
  geo.rotateX(-Math.PI / 2);
  geo.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const { lat, lon } = fromXZ(pos.getX(i), pos.getZ(i));
    const mx = Math.min(mask.size - 1, Math.max(0, Math.round(((lon - LON_MIN) / (LON_MAX - LON_MIN)) * (mask.size - 1))));
    const my = Math.min(mask.size - 1, Math.max(0, Math.round(((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * (mask.size - 1))));
    const vn = mask.px[(my * mask.size + mx) * 4] / 255;
    const h = sample(heights, lat, lon);
    pos.setY(i, BASE + (h / 1000) * VERT);
    const k = Math.min(1, h / 2600);
    if (vn > 0.5) {
      // đồng bằng lúa (dưới ~100 m) → rừng trung du → rừng núi sẫm (~600 m) → núi đá (trên ~1.500 m) → đỉnh ánh vàng
      const t = Math.sqrt(h / 2600);
      c.copy(C.delta)
        .lerp(C.mid, smooth(0.1, 0.32, t))
        .lerp(C.forest, smooth(0.3, 0.5, t))
        .lerp(C.high, smooth(0.62, 0.8, t))
        .lerp(C.peak, smooth(0.82, 0.98, t) * 0.8);
    } else {
      c.copy(C.other).lerp(C.otherHigh, k);
      // nước láng giềng mờ dần về mép khung dữ liệu (không lộ cạnh hình chữ nhật)
      const edge = Math.min(lon - LON_MIN, LON_MAX - lon, lat - LAT_MIN, LAT_MAX - lat);
      c.lerp(C.sea, 1 - Math.min(1, Math.max(0, edge / 2.6)));
    }
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uMask = { value: mask.tex };
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec2 vMaskUv;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        vec4 wpos = modelMatrix * vec4(transformed, 1.0);
        float lon = ${LON0.toFixed(4)} + wpos.x / ${(COS * K).toFixed(5)};
        float lat = ${LAT0.toFixed(4)} - wpos.z / ${K.toFixed(1)};
        vMaskUv = vec2((lon - ${LON_MIN.toFixed(2)}) / ${(LON_MAX - LON_MIN).toFixed(2)}, (lat - ${LAT_MIN.toFixed(2)}) / ${(LAT_MAX - LAT_MIN).toFixed(2)});`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform sampler2D uMask;\nvarying vec2 vMaskUv;")
      .replace(
        "#include <clipping_planes_fragment>",
        `#include <clipping_planes_fragment>
        vec4 m = texture2D(uMask, vMaskUv);
        if (m.r + m.g < 0.5) discard;`,
      );
  };
  mat.customProgramCacheKey = () => "vn-terrain";
  return new THREE.Mesh(geo, mat);
}

export async function createVietnamMap(canvas: HTMLCanvasElement, o: MapOptions): Promise<MapView> {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  // nhường main thread giữa các bước nặng để trang không đứng hình
  const pause = () => new Promise((r) => setTimeout(r, 0));
  const heights = await loadHeights(o.heightUrl);
  await pause();
  const seg = coarse ? 300 : 560;
  const mask = landMask(o.geo, coarse ? 1536 : 2560, seg * 2);
  await pause();
  const groundAt = (lat: number, lon: number) => BASE + (sample(heights, lat, lon) / 1000) * VERT;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0d0806");
  scene.fog = new THREE.Fog("#0d0806", 260, 520);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.5, 2000);

  scene.add(new THREE.HemisphereLight("#f1e6d2", "#2a1810", 1.25));
  // nắng xiên từ tây bắc cho sườn núi đổ khối rõ
  const sun = new THREE.DirectionalLight("#ffd9a0", 2.6);
  sun.position.set(-120, 90, -60);
  scene.add(sun);

  const sea = new THREE.Mesh(new THREE.PlaneGeometry(1200, 1200), seaMaterial());
  sea.rotation.x = -Math.PI / 2;
  sea.position.y = BASE - 0.02;
  scene.add(sea);
  scene.add(terrainMesh(heights, mask, seg));

  // chấm vàng cho các đảo trong quần đảo (nhiều đảo nhỏ hơn một điểm ảnh ở tầm nhìn toàn cảnh)
  const dot = new THREE.CylinderGeometry(0.28, 0.36, 0.6, 12);
  const dots = new THREE.InstancedMesh(dot, new THREE.MeshStandardMaterial({ color: "#e8c47e", roughness: 0.4, metalness: 0.4, emissive: "#6a4a10" }), o.islets.length);
  const m = new THREE.Matrix4();
  o.islets.forEach(([lat, lon], i) => {
    const [x, z] = toXZ(lat, lon);
    dots.setMatrixAt(i, m.makeTranslation(x, BASE + 0.3, z));
  });
  scene.add(dots);

  // ---- máy quay ----
  const [hx, hz] = toXZ(15.6, 108.6);
  const home = { target: new THREE.Vector3(hx, 0, hz), dist: 185 };
  const controls = new MapControls(camera, canvas);
  controls.enableDamping = !o.reducedMotion;
  controls.dampingFactor = 0.08;
  controls.minDistance = 10;
  controls.maxDistance = 420;
  controls.maxPolarAngle = 1.2;
  controls.zoomToCursor = true;
  function placeHome() {
    controls.target.copy(home.target);
    camera.position.copy(home.target).add(new THREE.Vector3(0, home.dist * 0.86, home.dist * 0.5));
    controls.update();
  }
  placeHome();

  // bay mượt tới điểm (focus / reset)
  let fly: { from: THREE.Vector3; to: THREE.Vector3; camFrom: THREE.Vector3; camTo: THREE.Vector3; t: number } | null = null;
  let dirty = true;
  function flyTo(target: THREE.Vector3, dist: number, dir = camera.position.clone().sub(controls.target).normalize()) {
    const camTo = target.clone().addScaledVector(dir, dist);
    if (o.reducedMotion) {
      controls.target.copy(target);
      camera.position.copy(camTo);
      controls.update();
      dirty = true;
      return;
    }
    fly = { from: controls.target.clone(), to: target, camFrom: camera.position.clone(), camTo, t: 0 };
  }

  // ---- vẽ theo yêu cầu: chỉ khi có thay đổi (kéo, phóng, bay) ----
  controls.addEventListener("change", () => (dirty = true));
  function resize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // màn dọc (điện thoại): góc rộng hơn để thấy trọn chiều dài đất nước
    camera.fov = camera.aspect < 1 ? 52 : 40;
    camera.updateProjectionMatrix();
    dirty = true;
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  let last = performance.now();
  renderer.setAnimationLoop(() => {
    const now = performance.now();
    const dt = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (fly) {
      fly.t = Math.min(1, fly.t + dt / 1.2);
      const e = 1 - Math.pow(1 - fly.t, 3);
      controls.target.lerpVectors(fly.from, fly.to, e);
      camera.position.lerpVectors(fly.camFrom, fly.camTo, e);
      if (fly.t >= 1) fly = null;
      dirty = true;
    }
    controls.update(dt);
    if (!dirty) return;
    dirty = false;
    renderer.render(scene, camera);
    o.onRender();
  });

  const lines = new Map<string, THREE.LineSegments>();
  function removeLines(id: string) {
    const l = lines.get(id);
    if (!l) return;
    scene.remove(l);
    l.geometry.dispose();
    (l.material as THREE.Material).dispose();
    lines.delete(id);
    dirty = true;
  }

  const v = new THREE.Vector3();
  const view: MapView = {
    setLines(id, rings, color, opacity, lift = 0.12) {
      removeLines(id);
      let n = 0;
      for (const r of rings) n += r.length / 2 - 1;
      const pos = new Float32Array(n * 6);
      let k = 0;
      for (const r of rings)
        for (let i = 0; i < r.length / 2 - 1; i++) {
          const la0 = r[i * 2 + 1];
          const lo0 = r[i * 2];
          const la1 = r[i * 2 + 3];
          const lo1 = r[i * 2 + 2];
          const [x0, z0] = toXZ(la0, lo0);
          const [x1, z1] = toXZ(la1, lo1);
          pos.set([x0, groundAt(la0, lo0) + lift, z0, x1, groundAt(la1, lo1) + lift, z1], k);
          k += 6;
        }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      const l = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
      lines.set(id, l);
      scene.add(l);
      dirty = true;
    },
    removeLines,
    center: () => fromXZ(controls.target.x, controls.target.z),
    project(lat, lon, out) {
      const [x, z] = toXZ(lat, lon);
      v.set(x, groundAt(lat, lon) + 0.3, z).project(camera);
      out.x = ((v.x + 1) / 2) * canvas.clientWidth;
      out.y = ((1 - v.y) / 2) * canvas.clientHeight;
      return v.z < 1;
    },
    distance: () => camera.position.distanceTo(controls.target),
    focus(lat, lon, dist = 60) {
      const [x, z] = toXZ(lat, lon);
      flyTo(new THREE.Vector3(x, groundAt(lat, lon), z), dist);
    },
    zoom(f) {
      const d = THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) * f, controls.minDistance, controls.maxDistance);
      flyTo(controls.target.clone(), d);
    },
    reset() {
      flyTo(home.target.clone(), home.dist, new THREE.Vector3(0, 0.86, 0.5).normalize());
      if (o.reducedMotion) placeHome();
      dirty = true;
    },
    dispose() {
      renderer.setAnimationLoop(null);
      ro.disconnect();
      controls.dispose();
      mask.tex.dispose();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | undefined;
        mat?.dispose?.();
      });
      renderer.dispose();
    },
  };
  // đường bờ biển, biên giới Việt Nam (vàng) — bám theo mặt đất
  view.setLines("vn", (o.geo.VNM ?? []).map((r) => r.flat()), "#e8c47e", 0.9, 0.1);
  return view;
}
