import * as THREE from "three";
import type { Keyframe } from "../types";
import { computeT, story } from "../story/store";
import { createMoodState, createSkyDome, sampleMood } from "../world/sky";
import { clamp, damp, lerp, smoothstep } from "./math";
import { pickQuality, reportSlow, type Quality } from "./quality";
import type { Actor, FrameCtx, SceneSetup, World } from "./world";

export type EngineOptions = {
  /** Keyframe theo thứ tự phân cảnh. */
  keyframes: Keyframe[];
  /** Id phân cảnh tương ứng. */
  ids: string[];
  /** Giá trị mặc định cho Keyframe.params. */
  params: Record<string, number>;
  setup: SceneSetup;
  reducedMotion: boolean;
  onReady: () => void;
};

export type Engine = {
  dispose(): void;
  quality: Quality;
  /** Bầu trời + ánh sáng hiện tại (cho shader nước, v.v.). */
  mood: ReturnType<typeof createMoodState>;
};

function dampVec(v: THREE.Vector3, to: THREE.Vector3, lambda: number, dt: number) {
  v.x = damp(v.x, to.x, lambda, dt);
  v.y = damp(v.y, to.y, lambda, dt);
  v.z = damp(v.z, to.z, lambda, dt);
}

/** Sau lần cuối có chuyển động (cuộn, máy quay trôi, tham số đổi), cảnh còn vẽ đủ tốc độ trong khoảng này. */
const BUSY_MS = 1500;
/** Khi đứng yên, bóng đổ chỉ vẽ lại mỗi N khung (cây lay, thuyền dập dềnh chỉ xê dịch chút ít). */
const IDLE_SHADOW_EVERY = 3;
/**
 * Khoảng cách giữa hai khung lớn hơn mức này là trình duyệt khựng hẳn (tab ẩn thì vòng lặp đã dừng, xem
 * visibilitychange), không đem vào đo. Đủ rộng để máy rất yếu (2–3 fps) vẫn được đo — đó là máy cần hạ bậc nhất.
 */
const MAX_SAMPLE_MS = 1000;
/** Bỏ qua khoảng đầu sau khi mở màn (tải dữ liệu lên GPU, biên dịch nốt shader) — không phải tốc độ thường. */
const SETTLE_MS = 2000;

/** Dừng nhẹ quanh mỗi keyframe để người xem kịp đọc, nhưng không khựng hẳn. */
const dwell = (f: number) => lerp(f, smoothstep(0, 1, f), 0.6);

export function createEngine(canvas: HTMLCanvasElement, o: EngineOptions): Engine {
  const quality = pickQuality();
  let dpr = Math.min(window.devicePixelRatio || 1, quality.maxDpr);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: quality.antialias && dpr < 1.5, powerPreference: "high-performance", stencil: false });
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  if (quality.shadows) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    // bóng đổ được cache: vòng lặp tự quyết khung nào vẽ lại (xem IDLE_SHADOW_EVERY)
    renderer.shadowMap.autoUpdate = false;
    renderer.shadowMap.needsUpdate = true;
  }

  const scene = new THREE.Scene();
  const fog = new THREE.Fog(0x7c5640, 90, 430);
  scene.fog = fog;
  const camera = new THREE.PerspectiveCamera(50, 1, 0.5, 2000);

  // ---- bầu trời & ánh sáng ----
  const mood = createMoodState();
  const sky = createSkyDome(quality.cheapShaders);
  const hemi = new THREE.HemisphereLight(0xffffff, 0x000000, 1.3);
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  if (quality.shadows) {
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const s = sun.shadow.camera;
    s.left = s.bottom = -70;
    s.right = s.top = 70;
    s.near = 1;
    s.far = 420;
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.04;
    sun.shadow.radius = 3;
  }
  scene.add(sky.mesh, hemi, sun, sun.target);

  // ---- keyframe: camera theo spline, tham số kế thừa keyframe trước ----
  const K = o.keyframes;
  const camCurve = new THREE.CatmullRomCurve3(K.map((k) => new THREE.Vector3(...k.cam)), false, "centripetal");
  const lookCurve = new THREE.CatmullRomCurve3(K.map((k) => new THREE.Vector3(...k.look)), false, "centripetal");
  const paramKeys = Object.keys(o.params);
  const filled: Record<string, number>[] = [];
  K.forEach((k, i) => filled.push({ ...(i ? filled[i - 1] : o.params), ...k.params }));

  const target: Record<string, number> = { ...filled[0], mood: K[0].mood, fov: K[0].fov ?? 50 };
  const params: Record<string, number> = { ...target };
  const camTarget = new THREE.Vector3();
  const lookTarget = new THREE.Vector3();
  // giảm chấn hai tầng (mục tiêu → điểm trung gian → máy quay): tăng tốc êm, không giật khi bắt đầu cuộn
  const camMid = new THREE.Vector3(...K[0].cam);
  const lookMid = new THREE.Vector3(...K[0].look);
  const camPos = new THREE.Vector3(...K[0].cam);
  const lookAt = new THREE.Vector3(...K[0].look);
  const side = new THREE.Vector3();

  function sampleKeys(t: number) {
    const tt = clamp(t, 0, K.length - 1);
    const i = Math.min(Math.floor(tt), K.length - 2);
    const f = dwell(tt - i);
    const u = (i + f) / (K.length - 1);
    camCurve.getPoint(u, camTarget);
    lookCurve.getPoint(u, lookTarget);
    const a = filled[i];
    const b = filled[i + 1];
    for (const k of paramKeys) target[k] = lerp(a[k], b[k], f);
    target.mood = lerp(K[i].mood, K[i + 1].mood, f);
    target.fov = lerp(K[i].fov ?? 50, K[i + 1].fov ?? 50, f);
  }

  // ---- world API cho script của chương ----
  const actors: Actor[] = [];
  const resolvers: ((t: Record<string, number>, ctx: FrameCtx) => void)[] = [];
  const ctx: FrameCtx = { time: 0, dt: 0, now: 0, t: 0, params, inputs: {}, completedAt: story.completedAt, camera, pixelScale: 1 };
  const world: World = {
    scene,
    quality,
    mood,
    add(actor) {
      actors.push(actor);
      if (actor.object) scene.add(actor.object);
      return actor;
    },
    resolve(fn) {
      resolvers.push(fn);
    },
    beat(id) {
      const i = o.ids.indexOf(id);
      if (i < 0) throw new Error(`[engine] không có phân cảnh "${id}"`);
      return i;
    },
    signal(name, value) {
      story.signals[name] = value;
    },
    yield() {
      const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
      return s?.yield ? s.yield() : new Promise((r) => setTimeout(r, 0));
    },
    castShadow(obj, receive = false) {
      if (!quality.shadows) return;
      obj.traverse((c) => {
        c.castShadow = true;
        c.receiveShadow = receive;
      });
    },
  };

  // ---- kích thước & độ phân giải thích ứng ----
  let baseFov = 50;
  function resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    baseFov = camera.aspect < 1 ? lerp(70, 54, camera.aspect) : 50;
    camera.updateProjectionMatrix();
    ctx.pixelScale = dpr * (h / 900);
  }
  resize();
  window.addEventListener("resize", resize);

  // Bộ điều tốc — chỉ đo những khung "bận" liền nhau (khung đứng yên cố ý chạy 30 fps, không phải máy chậm).
  // Chậm thì hạ độ phân giải từng nấc; đã ở mức thấp nhất mà vẫn chậm vài lần liền thì nhớ bậc thấp hơn cho lần sau.
  // Mỗi cửa sổ đo ≥ 1,5 s và ≥ 8 khung (máy 3 fps vẫn kết luận được sau vài giây), lấy trung vị.
  let samples: number[] = [];
  let windowStart = 0;
  let slowAtFloor = 0;
  let builtAt = 0;
  function adapt(gapMs: number, now: number) {
    if (gapMs <= 0 || gapMs > MAX_SAMPLE_MS || now - builtAt < SETTLE_MS) return;
    if (!samples.length) windowStart = now;
    samples.push(gapMs);
    if (samples.length < 8 || now - windowStart < 1500) return;
    samples.sort((a, b) => a - b);
    const median = samples[samples.length >> 1];
    samples = [];
    const ceiling = Math.min(window.devicePixelRatio || 1, quality.maxDpr);
    if (median > 22 && dpr > quality.minDpr) dpr = Math.max(quality.minDpr, dpr - (median > 50 ? 0.5 : 0.25));
    else if (median < 12 && dpr < ceiling) dpr = Math.min(ceiling, dpr + 0.25);
    else {
      // hết đường hạ độ phân giải: chậm hẳn (dưới ~10 fps) thì nhớ ngay, chậm vừa thì đợi 3 lần cho chắc
      if (median > 100) reportSlow(quality, 2);
      else if (median > 22 && ++slowAtFloor === 3) reportSlow(quality);
      return;
    }
    renderer.setPixelRatio(dpr);
    resize();
  }

  // ---- vòng lặp ----
  const timer = new THREE.Timer();
  timer.connect(document);
  let disposed = false;
  let px = 0;
  let py = 0;

  let lastRender = -1;
  let lastActive = 0;
  let prevBusy = false;
  let idleFrames = 0;
  let lastT = -1;
  const idleGap = 1000 / quality.idleFps - 2; // chút dư để màn 120 Hz rơi đúng mỗi 4 vsync

  // chưa dựng xong thì màn mở đầu đang che kín canvas: không vẽ, nhường máy cho việc dựng cảnh
  let built = false;

  function frame(timestamp: number) {
    if (!built) return;
    const now = performance.now();
    const idle = now - lastActive > BUSY_MS;
    if (idle && lastRender >= 0 && now - lastRender < idleGap) return;
    const gap = lastRender < 0 ? 0 : now - lastRender;
    lastRender = now;
    if (!idle && prevBusy) adapt(gap, now);
    prevBusy = !idle;

    timer.update(timestamp);
    const dt = Math.min(timer.getDelta(), 0.1);

    ctx.time += dt;
    ctx.dt = dt;
    ctx.now = now;
    ctx.t = story.t = computeT(window.scrollY, window.innerHeight);
    let moving = Math.abs(ctx.t - lastT) > 1e-4;
    lastT = ctx.t;
    for (const k in story.inputs) {
      ctx.inputs[k] = damp(ctx.inputs[k] ?? 0, story.inputs[k], 3, dt);
      if (Math.abs(ctx.inputs[k] - story.inputs[k]) > 1e-3) moving = true;
    }

    sampleKeys(ctx.t);
    for (const r of resolvers) r(target, ctx);

    const lambda = o.reducedMotion ? 12 : 3.2;
    for (const k in target) {
      params[k] = damp(params[k] ?? target[k], target[k], lambda, dt);
      if (Math.abs(params[k] - target[k]) > 1e-3) moving = true;
    }
    const camLambda = o.reducedMotion ? 14 : 4.2;
    dampVec(camMid, camTarget, camLambda, dt);
    dampVec(camPos, camMid, camLambda, dt);
    dampVec(lookMid, lookTarget, camLambda + 0.6, dt);
    dampVec(lookAt, lookMid, camLambda + 0.6, dt);

    // thị sai theo chuột + "nhịp thở" của máy quay
    px = damp(px, o.reducedMotion ? 0 : story.pointer.x, 2, dt);
    py = damp(py, o.reducedMotion ? 0 : story.pointer.y, 2, dt);
    if (
      moving ||
      camPos.distanceToSquared(camTarget) > 0.01 ||
      lookAt.distanceToSquared(lookTarget) > 0.01 ||
      Math.abs(px - story.pointer.x) + Math.abs(py - story.pointer.y) > 0.01
    )
      lastActive = now;
    camera.position.copy(camPos);
    side.subVectors(lookAt, camPos).cross(camera.up).normalize();
    camera.position.addScaledVector(side, px * 2.2);
    camera.position.y += py * 1.2 + Math.sin(ctx.time * 0.3) * 0.18;
    camera.position.addScaledVector(side, Math.sin(ctx.time * 0.17) * 0.25);
    camera.lookAt(lookAt);
    const fov = baseFov * (params.fov / 50);
    if (Math.abs(camera.fov - fov) > 0.01) {
      camera.fov = fov;
      camera.updateProjectionMatrix();
    }

    sampleMood(params.mood, mood);
    sky.uniforms.uTop.value.copy(mood.top);
    sky.uniforms.uHorizon.value.copy(mood.horizon);
    sky.uniforms.uSun.value.copy(mood.sun);
    sky.uniforms.uSunDir.value.copy(mood.sunDir);
    sky.uniforms.uTime.value = ctx.time;
    sky.mesh.position.copy(camera.position);
    fog.color.copy(mood.fog);
    fog.near = mood.fogNear;
    fog.far = mood.fogFar;
    hemi.color.copy(mood.hemi);
    hemi.groundColor.copy(mood.ground);
    hemi.intensity = mood.hemiInt;
    sun.color.copy(mood.sun);
    sun.intensity = mood.sunInt;
    sun.target.position.copy(lookAt);
    sun.position.copy(lookAt).addScaledVector(mood.sunDir, 200);

    for (const a of actors) a.update?.(ctx);
    if (quality.shadows && (!idle || ++idleFrames % IDLE_SHADOW_EVERY === 0)) renderer.shadowMap.needsUpdate = true;
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(frame);

  // Biên dịch shader trước khi mở màn. Có KHR_parallel_shader_compile thì driver biên dịch song song, không chặn
  // main thread. Không có (driver phần mềm, vài GPU cũ) thì mỗi chương trình shader chặn cả trăm ms: biên dịch
  // từng nhóm object một, nhường main thread giữa các nhóm để màn mở đầu không đứng hình vài giây.
  async function compileShaders() {
    if (renderer.extensions.has("KHR_parallel_shader_compile")) return renderer.compileAsync(scene, camera);
    // driver kiểu này chỉ thật sự biên dịch ở lần vẽ đầu: vẽ lần lượt từng nhóm (đèn luôn bật để shader đúng biến thể)
    // vào một điểm ảnh, sau màn mở đầu
    const kids = [...scene.children];
    const shown = kids.map((k) => k.visible);
    renderer.setScissorTest(true);
    renderer.setScissor(0, 0, 1, 1);
    for (let i = 0; i < kids.length && !disposed; i++) {
      if ((kids[i] as THREE.Light).isLight || !shown[i]) continue;
      kids.forEach((k, j) => (k.visible = (k as THREE.Light).isLight || (j === i && shown[j])));
      renderer.render(scene, camera);
      await world.yield();
    }
    kids.forEach((k, j) => (k.visible = shown[j]));
    renderer.setScissorTest(false);
  }

  void Promise.resolve(o.setup(world))
    .then(() => (disposed ? undefined : compileShaders()))
    .then(() => {
      if (disposed) return;
      built = true;
      builtAt = performance.now();
      requestAnimationFrame(() => o.onReady());
    })
    .catch((err) => {
      console.error("[engine] dựng cảnh lỗi", err);
      built = true;
      o.onReady();
    });

  function onVisibility() {
    renderer.setAnimationLoop(document.hidden ? null : frame);
  }
  document.addEventListener("visibilitychange", onVisibility);

  return {
    quality,
    mood,
    dispose() {
      disposed = true;
      renderer.setAnimationLoop(null);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
      timer.dispose();
      for (const a of actors) a.dispose?.();
      scene.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        mesh.geometry?.dispose();
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else mat?.dispose();
      });
      renderer.dispose();
    },
  };
}
