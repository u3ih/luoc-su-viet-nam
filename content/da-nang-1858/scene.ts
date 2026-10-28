import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, BO_BIEN, DON_DONG, DON_TAY, DO_BO, LIEU_TRI, LUY, RA_BIEN, TIEP_VIEN, VINH, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Đà Nẵng 1858 — cảnh CÁCH ĐIỆU. Người = chấm dáng người, nhân vật = đốm sáng, tàu = đốm sáng nổi trên nước; không vẽ tàu chiến, đồn luỹ, trang phục,
// cờ, vũ khí. Vị trí vịnh, các đồn, nơi đóng quân, Liêu Trì, luỹ đất và hướng đi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng
// số quân hay số tàu.
// Son = quân triều Nguyễn; xanh navy = liên quân Pháp – Tây Ban Nha (tàu = đốm sáng xanh nhạt); ngà = tướng chỉ huy; cam = lửa.

const SON = "#a83a24";
const NAVY = "#2f4f7a";
const SHIP = "#a8c8f0";
const IVORY = "#f0e2b8";

const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const onWater = () => WATER + 1.4;
const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["cua-bien", "son-tra", "lieu-tri", "luy-dat", "kho-khan", "vao-nam"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BO_BIEN, 60], [LIEU_TRI, 45], [DON_DONG, 35], [DON_TAY, 35]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#2a4a52", shallow: "#82a08c" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 50, z: 320 } },
    counts: { trees: 620, bushes: 600, grass: 3200, reeds: 900 },
    forestAt: 0.52,
    birds: { center: { x: 0, y: 0, z: 100 }, radius: 230 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1.3 },
    seed: 1858,
  });

  // 1. "cua-bien": một đoàn tàu (chấm sáng xanh nhạt) từ phía bắc xa tiến vào vịnh và neo lại; người (son) tụ về hai đồn trên bờ (diễn hoạ).
  const CB = 26;
  const cb = run("cua-bien", CB);
  world.add(
    createCrowd({
      glow: true,
      size: 4.5,
      height: onWater,
      seed: 301,
      groups: [{ path: [[VINH[0] + 60, 430], [VINH[0] + 30, 340], [VINH[0] + 6, VINH[1] + 20], VINH], count: 14, spread: [60, 50], color: SHIP, timing: [[0.03, 0], [0.7, 1]] }],
      progress: cb,
      visible: () => clock.near("cua-bien"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 302,
      groups: [
        { path: [[DON_DONG[0] + 80, DON_DONG[1] - 160], [DON_DONG[0] + 30, DON_DONG[1] - 70], [DON_DONG[0] - 4, DON_DONG[1] - 14]], count: 22, spread: [24, 40], color: SON, timing: [[0.2, 0], [0.8, 1]] },
        { path: [[DON_TAY[0] - 50, DON_TAY[1] - 160], [DON_TAY[0] - 20, DON_TAY[1] - 70], [DON_TAY[0] - 2, DON_TAY[1] - 14]], count: 20, spread: [24, 40], color: SON, timing: [[0.25, 0], [0.85, 1]] },
      ],
      progress: cb,
      visible: () => clock.near("cua-bien"),
    }),
  );

  // 2. "son-tra": hai đồn bốc lửa lần lượt; một nhóm (navy) từ tàu vào bờ, đổ bộ lên chân bán đảo; người (son) ở hai đồn lùi về phía tây nam,
  //    về hướng Liêu Trì (diễn hoạ — không vẽ cảnh đánh cụ thể).
  const ST = 28;
  const st = run("son-tra", ST);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 303,
      groups: [
        { path: DO_BO, count: 70, spread: [36, 60], color: NAVY, timing: [[0.18, 0], [0.8, 1]] },
        { path: [ring(DON_DONG, 8, 0.4), [DON_DONG[0] - 60, DON_DONG[1] - 100], [LIEU_TRI[0] + 120, LIEU_TRI[1] + 120], LIEU_TRI], count: 22, spread: [24, 36], color: SON, timing: [[0.35, 0], [1, 1]] },
        { path: [ring(DON_TAY, 8, 0.4), [DON_TAY[0] - 60, DON_TAY[1] - 100], [LIEU_TRI[0] + 100, LIEU_TRI[1] + 100], LIEU_TRI], count: 20, spread: [24, 36], color: SON, timing: [[0.4, 0], [1, 1]] },
      ],
      progress: st,
      visible: () => clock.near("son-tra"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 4.5,
      height: onWater,
      seed: 304,
      groups: [{ path: [VINH, [VINH[0] + 10, VINH[1] - 4]], count: 14, spread: [60, 50], color: SHIP }],
      progress: st,
      visible: () => clock.near("son-tra"),
    }),
  );
  world.add(
    createFires({
      sites: [DON_DONG, DON_TAY].flatMap((c, k) =>
        Array.from({ length: 3 }, (_, i) => {
          const [x, z] = ring(c, 20, (i / 3) * Math.PI * 2 + k);
          return { x, y: height(x, z) + 1, z, order: 0.1 + k * 0.25 + i * 0.08, size: 1.5 };
        }),
      ),
      lit: () => clock.near("son-tra") * smoothstep(0.08, 0.7, st()),
      size: 3.8,
      glow: () => 0.9,
    }),
  );

  // 3. "lieu-tri": người (son) từ phía nam về Liêu Trì, tụ lại quanh các điểm sáng; một đốm ngà (tướng mới) từ phía nam tới sau; một nhóm (navy) tiến
  //    ra khỏi nơi đóng một đoạn rồi dừng; lửa sáng ở giữa hai bên (diễn hoạ — không vẽ trận, không vẽ cảnh một tướng ngã).
  const LT = 28;
  const lt = run("lieu-tri", LT);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 305,
      groups: [
        { path: TIEP_VIEN, count: 90, spread: [30, 90], color: SON, timing: [[0.03, 0], [0.6, 1]] },
        { path: [BO_BIEN, [BO_BIEN[0] - 90, BO_BIEN[1] - 50], [LIEU_TRI[0] + 150, LIEU_TRI[1] + 70]], count: 50, spread: [30, 50], color: NAVY, timing: [[0.2, 0], [0.7, 1]] },
      ],
      progress: lt,
      visible: () => clock.near("lieu-tri"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 5,
      groups: [{ path: TIEP_VIEN, count: 1, color: IVORY, size: 1.5, timing: [[0.55, 0], [1, 1]], show: [0.5, 2] }],
      progress: lt,
      visible: () => clock.near("lieu-tri"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 5 }, (_, i) => {
        const [x, z] = ring(LIEU_TRI, 90 + i * 8, 0.1 + i * 0.5);
        return { x: x + 40, y: height(x + 40, z) + 1, z, order: i / 5, size: 1.5 };
      }),
      lit: () => clock.near("lieu-tri") * smoothstep(0.25, 0.85, lt()),
      size: 3.6,
      glow: () => 0.85,
    }),
  );

  // 4. "luy-dat": người xem kéo thanh — người (son) dàn dần dọc đường luỹ vòng quanh nơi liên quân đóng; lửa sáng dọc luỹ; một nhóm (navy) đứng yên ở giữa
  //    (diễn hoạ — không vẽ luỹ, đồn, vũ khí).
  const seal = (ctx: FrameCtx) => clamp((ctx.inputs["dap-luy"] ?? 0) / 0.9);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 306,
      groups: [
        { path: [LIEU_TRI, ...LUY], count: 90, color: SON, drop: true },
        { path: [ring(BO_BIEN, 12, 0.3), ring(BO_BIEN, 14, 0.35)], count: 60, spread: [60, 50], color: NAVY },
      ],
      progress: (ctx) => 0.04 + 0.96 * seal(ctx),
      visible: () => clock.near("luy-dat"),
    }),
  );
  world.add(
    createFires({
      sites: LUY.map(([x, z], i) => ({ x, y: height(x, z) + 1, z, order: i / LUY.length, size: 1.5 })),
      lit: (ctx) => clock.near("luy-dat") * smoothstep(0.1, 0.95, seal(ctx)),
      size: 3.4,
      glow: () => 0.8,
    }),
  );

  // 5. "kho-khan": hàng quân (navy) ở nơi đóng thưa dần, lửa trại le lói và tắt dần; đốm tàu (xanh nhạt) ngoài vịnh đứng yên (diễn hoạ — không phỏng đoán số người).
  const KK = 30;
  const kk = run("kho-khan", KK);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 307,
      groups: [{ path: [ring(BO_BIEN, 10, 0.3), ring(BO_BIEN, 12, 0.35)], count: 80, spread: [70, 60], color: NAVY, mortal: true }],
      progress: kk,
      fall: () => 0.45 * smoothstep(0.15, 0.85, kk()),
      visible: () => clock.near("kho-khan"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 7 }, (_, i) => {
        const [x, z] = ring(BO_BIEN, 40 + (i % 2) * 14, (i / 7) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: 0, size: 1.4 };
      }),
      lit: () => clock.near("kho-khan") * (1 - 0.7 * smoothstep(0.3, 0.95, kk())),
      size: 3.4,
      glow: () => 0.85,
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 4.5,
      height: onWater,
      seed: 308,
      groups: [{ path: [VINH, [VINH[0] + 10, VINH[1] - 4]], count: 14, spread: [60, 50], color: SHIP }],
      progress: kk,
      visible: () => clock.near("kho-khan"),
    }),
  );

  // 6. "vao-nam": phần lớn đoàn tàu (xanh nhạt) rời vịnh, đi vòng ra biển rồi về phía nam; một nhóm nhỏ tàu và một nhóm người (navy) ở lại; ở nơi
  //    đóng quân còn vài điểm lửa (diễn hoạ).
  const VN = 30;
  const vn = run("vao-nam", VN);
  world.add(
    createCrowd({
      glow: true,
      size: 4.5,
      height: onWater,
      seed: 309,
      groups: [
        { path: RA_BIEN, count: 9, spread: [50, 50], color: SHIP, timing: [[0.1, 0], [1, 1]] },
        { path: [VINH, [VINH[0] + 10, VINH[1] - 4]], count: 5, spread: [30, 30], color: SHIP },
      ],
      progress: vn,
      visible: () => clock.near("vao-nam"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 310,
      groups: [{ path: [ring(BO_BIEN, 10, 0.3), ring(BO_BIEN, 12, 0.35)], count: 22, spread: [36, 36], color: NAVY }],
      progress: vn,
      visible: () => clock.near("vao-nam"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 14,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(BO_BIEN[0], ground(BO_BIEN[0], BO_BIEN[1]) + 6, BO_BIEN[1]);
        return 0.8 + 0.2 * Math.sin(ctx.time * 2);
      },
      visible: () => clock.near("vao-nam"),
    }),
  );
};

export default setup;
