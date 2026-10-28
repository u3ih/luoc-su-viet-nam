import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BA_TINH, BEN_SONG, BOUNDS, DAM_LA, GO_CONG, LANG, NORTH, SAI_GON, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Hoà ước Nhâm Tuất và Trương Định — cảnh CÁCH ĐIỆU. Người = chấm dáng người, nhân vật và sứ giả = đốm sáng, tàu = đốm sáng nổi trên sông; không vẽ tàu, đồn,
// trang phục, cờ, vũ khí, không vẽ văn bản hay lễ ký. Vị trí Sài Gòn, Gò Công, Đám lá tối trời, ba tỉnh và hướng đi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều;
// số chấm không tương ứng số người.
// Son = nghĩa quân; xanh navy = quân Pháp; xanh nhạt = tàu; ngà = Trương Định; trắng xám = lệnh, sứ giả; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NAVY = "#2f4f7a";
const SHIP = "#a8c8f0";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";
const ENVOY = "#d6dce6";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const onWater = () => WATER + 1.4;
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hoa-uoc", "bai-binh", "go-cong", "dam-la", "tuong-nho"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[SAI_GON, 55], [GO_CONG, 50], [DAM_LA, 35], ...BA_TINH.map((b): [Pt, number] => [b, 30]), ...LANG.map((l): [Pt, number] => [l, 28])];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#3a4a3e", shallow: "#8a9a6c" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 300, bushes: 700, grass: 3200, reeds: 1500 },
    forestAt: 0.62,
    birds: { center: { x: 0, y: 0, z: 0 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.6 },
    seed: 1862,
  });

  // 1. "hoa-uoc": vài đốm xanh nhạt (tàu) đậu giữa sông ở Sài Gòn; hai đốm trắng xám (sứ) từ phía bắc xa tới bến; một quầng vàng sáng lên trên sông; rồi các nhóm người
  //    (navy) từ Sài Gòn tản ra ba điểm, lửa sáng ở mỗi điểm (diễn hoạ — không vẽ lễ ký, văn bản, cờ).
  const HU = 28;
  const hu = run("hoa-uoc", HU);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: onWater,
      seed: 601,
      groups: [{ path: [[BEN_SONG[0] + 4, BEN_SONG[1] + 8], BEN_SONG], count: 4, spread: [30, 40], color: SHIP }],
      progress: hu,
      visible: () => clock.near("hoa-uoc"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 5,
      groups: [{ path: [NORTH, [-150, 380], [20, 350], [BEN_SONG[0] - 10, BEN_SONG[1] + 6]], count: 2, spread: [14, 18], color: ENVOY, size: 1.2, timing: [[0.03, 0], [0.45, 1]] }],
      progress: hu,
      visible: () => clock.near("hoa-uoc"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 18,
      minPx: 20,
      place: (_, ctx, out) => {
        out.set(BEN_SONG[0], WATER + 9, BEN_SONG[1]);
        return smoothstep(0.45, 0.6, hu()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.8));
      },
      visible: () => clock.near("hoa-uoc"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 602,
      groups: BA_TINH.map((b, i) => ({ path: [SAI_GON, mid(SAI_GON, b), ring(b, 12, i)] as Pt[], count: 22, spread: [26, 44] as [number, number], color: NAVY, timing: [[0.55 + i * 0.03, 0], [0.98, 1]] as [number, number][], show: [0.52 + i * 0.03, 2] as [number, number] })),
      progress: hu,
      visible: () => clock.near("hoa-uoc"),
    }),
  );
  world.add(
    createFires({
      sites: BA_TINH.map(([x, z], i) => ({ x: x + 14, y: height(x + 14, z) + 1, z, order: i / 3, size: 1.6 })),
      lit: () => clock.near("hoa-uoc") * smoothstep(0.65, 0.98, hu()),
      size: 3.8,
      glow: () => 0.85,
    }),
  );

  // 2. "bai-binh": một đốm trắng xám (lệnh) từ phía bắc xa đi qua Sài Gòn xuống Gò Công rồi mờ đi; một đốm ngà (Trương Định) đứng nguyên ở Gò Công giữa nhóm người (son);
  //    nhóm này không rời chỗ (diễn hoạ).
  const BB = 28;
  const bb = run("bai-binh", BB);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 5,
      groups: [
        { path: [NORTH, [-60, 360], SAI_GON, [40, 40], [10, -80], [GO_CONG[0] + 10, GO_CONG[1] + 24]], count: 1, color: ENVOY, size: 1.4, timing: [[0.03, 0], [0.55, 1]], show: [0, 0.78] },
        { path: [ring(GO_CONG, 4, 0.4), ring(GO_CONG, 5, 0.5)], count: 1, color: IVORY, size: 1.5 },
      ],
      progress: bb,
      visible: () => clock.near("bai-binh"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 603,
      groups: [{ path: [ring(GO_CONG, 14, 0.3), ring(GO_CONG, 16, 0.35)], count: 36, spread: [50, 40], color: SON }],
      progress: bb,
      visible: () => clock.near("bai-binh"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 5 }, (_, i) => {
        const [x, z] = ring(GO_CONG, 34, (i / 5) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.4 };
      }),
      lit: () => clock.near("bai-binh") * smoothstep(0.5, 0.9, bb()),
      size: 3.4,
      glow: () => 0.85,
    }),
  );

  // 3. "go-cong": người xem kéo thanh — người (son) từ các làng đi về Gò Công; lửa sáng quanh bản doanh; đốm ngà đứng giữa (diễn hoạ).
  const gather = (ctx: FrameCtx) => clamp((ctx.inputs["nghia-quan"] ?? 0) / 0.9);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 604,
      groups: LANG.map((l, i) => ({ path: [l, mid(l, GO_CONG), ring(GO_CONG, 18 + i * 3, i * 1.2)] as Pt[], count: 24, spread: [30, 50] as [number, number], color: SON })),
      progress: (ctx) => 0.03 + 0.97 * gather(ctx),
      visible: () => clock.near("go-cong"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 16,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(GO_CONG[0], ground(GO_CONG[0], GO_CONG[1]) + 7, GO_CONG[1]);
        return 0.85 + 0.15 * Math.sin(ctx.time * 2);
      },
      visible: () => clock.near("go-cong"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 8 }, (_, i) => {
        const [x, z] = ring(GO_CONG, 30 + (i % 2) * 12, (i / 8) * Math.PI * 2 + 0.2);
        return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.5 };
      }),
      lit: (ctx) => clock.near("go-cong") * smoothstep(0.05, 0.95, gather(ctx)),
      size: 3.6,
      glow: () => 0.85,
    }),
  );

  // 4. "dam-la": một đoàn người (navy) từ Sài Gòn xuống phía nam, men theo các rạch, tới gần bản doanh; người (son) quanh đốm ngà; lửa bừng lên rồi đốm ngà mờ đi
  //    (diễn hoạ — không vẽ cảnh đánh, không vẽ người dẫn đường).
  const DL = 30;
  const dl = run("dam-la", DL);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 605,
      groups: [
        { path: [ring(DAM_LA, 12, 0.4), ring(DAM_LA, 14, 0.5)], count: 28, spread: [40, 40], color: SON, mortal: true },
        { path: [SAI_GON, [50, 120], [20, -40], [-40, -170], [DAM_LA[0] + 30, DAM_LA[1] + 40]], count: 60, spread: [26, 70], color: NAVY, timing: [[0.08, 0], [0.7, 1]] },
      ],
      progress: dl,
      fall: () => 0.5 * smoothstep(0.7, 0.95, dl()),
      visible: () => clock.near("dam-la"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 15,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(DAM_LA[0], ground(DAM_LA[0], DAM_LA[1]) + 7, DAM_LA[1]);
        return (1 - smoothstep(0.78, 0.95, dl())) * (0.85 + 0.15 * Math.sin(ctx.time * 2));
      },
      visible: () => clock.near("dam-la"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(DAM_LA, 28 + (i % 2) * 10, (i / 6) * Math.PI * 2 + 0.6);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.5 };
      }),
      lit: () => clock.near("dam-la") * smoothstep(0.55, 0.9, dl()),
      size: 3.8,
      glow: () => 0.9,
    }),
  );

  // 5. "tuong-nho": người (son) từ các làng tụ về một bãi quanh đền ở Gò Công, rồi đứng lặng; nhiều ngọn đèn nhỏ sáng dần quanh; một quầng vàng dịu ở giữa (diễn hoạ).
  const TN = 30;
  const tn = run("tuong-nho", TN);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 606,
      groups: LANG.map((l, i) => ({ path: [l, mid(l, GO_CONG), ring(GO_CONG, 26 + i * 2, i * 1.3)] as Pt[], count: 14, spread: [30, 40] as [number, number], color: SON, timing: [[0.03 + i * 0.03, 0], [0.6 + i * 0.03, 1]] as [number, number][] })),
      progress: tn,
      visible: () => clock.near("tuong-nho"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 24 }, (_, i) => {
        const [x, z] = ring(GO_CONG, 14 + (i % 3) * 6, (i / 24) * Math.PI * 2);
        return { x, y: height(x, z) + 1, z, order: i / 24, size: 0.9 };
      }),
      lit: () => clock.near("tuong-nho") * smoothstep(0.3, 0.95, tn()),
      size: 2.4,
      glow: () => 0.9,
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 20,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(GO_CONG[0], ground(GO_CONG[0], GO_CONG[1]) + 9, GO_CONG[1]);
        return smoothstep(0.55, 0.9, tn()) * (0.8 + 0.2 * Math.sin(ctx.time * 1.7));
      },
      visible: () => clock.near("tuong-nho"),
    }),
  );
};

export default setup;
