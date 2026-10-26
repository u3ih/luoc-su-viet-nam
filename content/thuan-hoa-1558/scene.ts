import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { AI_TU, BOUNDS, NORTH, PASS, ROUTE, SOUTH_ROUTE, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Nguyễn Hoàng vào Thuận Hoá — cảnh CÁCH ĐIỆU. Người = chấm dáng người, Nguyễn Hoàng và các nhân vật = đốm sáng; không vẽ trang phục, cờ,
// thuyền, dinh thự. Vị trí doanh trại, đèo, dinh Ái Tử, hướng đi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều.
// Son = đoàn người đi theo Nguyễn Hoàng, ngà = Nguyễn Hoàng, vàng / cam = ánh sáng tượng trưng.

const SON = "#a83a24";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";
const EMBER = "#e0864a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["nam-trieu", "xin-di", "vao-nam", "ai-tu", "quang-nam"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => Math.hypot(x - AI_TU[0], z - AI_TU[1]) > 55 && Math.hypot(x - NORTH[0], z - NORTH[1]) > 55,
    water: { deep: "#2a4a52", shallow: "#82a08c" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 50, z: 320 } },
    counts: { trees: 650, bushes: 600, grass: 3500, reeds: 900 },
    forestAt: 0.52,
    birds: { center: { x: 0, y: 0, z: 100 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1.3 },
    seed: 1558,
  });

  // 1. "nam-trieu": quanh doanh trại phía bắc, một quầng sáng vàng (quyền chỉ huy cũ) lụi đi; người tụ dần về một quầng sáng khác (cam) —
  //    quyền chỉ huy đổi tay; một đốm sáng nhỏ ở rìa lụi sau (diễn hoạ — không vẽ lại các sự việc cụ thể).
  const NT = 22;
  const nt = run("nam-trieu", NT);
  const [nx, nz] = NORTH;
  const camp2: Pt = [nx + 38, nz - 6];
  world.add(
    createCrowd({
      size: 4,
      height: ground,
      seed: 71,
      groups: [
        { path: [[nx - 120, nz + 40], [nx - 40, nz + 12], [nx - 14, nz + 4]], count: 28, spread: [26, 30], color: SON, timing: [[0.02, 0], [0.4, 1]] },
        { path: [[nx - 20, nz + 110], [nx - 8, nz + 40], [nx - 4, nz + 12]], count: 24, spread: [24, 30], color: SON, timing: [[0.05, 0], [0.42, 1]] },
        { path: [[nx - 14, nz + 4], [camp2[0] - 6, camp2[1]]], count: 52, spread: [26, 26], color: SON, timing: [[0.5, 0], [0.85, 1]], show: [0.46, 2] },
      ],
      progress: nt,
      visible: () => clock.near("nam-trieu"),
    }),
  );
  const placeGlow = (x: number, z: number, lift: number, out: { set: (x: number, y: number, z: number) => void }) => out.set(x, height(x, z) + lift, z);
  world.add(
    createGlows({
      count: 3,
      color: (i) => (i === 1 ? EMBER : i === 2 ? GOLD : GOLD),
      size: (i) => (i === 2 ? 9 : 16),
      minPx: 18,
      place: (i, ctx, out) => {
        const pulse = 0.85 + 0.15 * Math.sin(ctx.time * 2 + i);
        if (i === 0) {
          placeGlow(nx - 14, nz + 4, 5, out);
          return (1 - smoothstep(0.3, 0.55, nt())) * pulse;
        }
        if (i === 1) {
          placeGlow(camp2[0], camp2[1], 5, out);
          return smoothstep(0.4, 0.7, nt()) * pulse;
        }
        placeGlow(nx - 50, nz + 36, 4, out);
        return (1 - smoothstep(0.62, 0.85, nt())) * pulse * 0.8;
      },
      visible: () => clock.near("nam-trieu"),
    }),
  );

  // 2. "xin-di": một người đưa tin (ngà) đi lại giữa nơi ở của Nguyễn Hoàng và trướng chỉ huy; rồi người từ nhiều ngả tụ về quanh đốm sáng
  //    của Nguyễn Hoàng — họ hàng, thuộc hạ, người quê xa (diễn hoạ).
  const XD = 26;
  const xd = run("xin-di", XD);
  const home: Pt = [nx - 30, nz - 14];
  const hq: Pt = [nx + 60, nz + 6];
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: (x, z) => ground(x, z) + 4,
      groups: [{ path: [home, [nx + 10, nz + 22], hq, [nx + 10, nz + 22], home], count: 1, color: IVORY, size: 1.2, timing: [[0.05, 0], [0.5, 1]] }],
      progress: xd,
      visible: () => clock.near("xin-di") * (1 - smoothstep(0.5, 0.6, xd())),
    }),
  );
  world.add(
    createCrowd({
      size: 4,
      height: ground,
      seed: 72,
      groups: [
        { path: [[nx - 190, nz + 20], [nx - 90, nz - 10], [home[0] - 8, home[1] + 2]], count: 30, spread: [20, 36], color: SON, timing: [[0.45, 0], [0.9, 1]] },
        { path: [[nx - 70, nz - 190], [nx - 50, nz - 90], [home[0], home[1] - 10]], count: 26, spread: [20, 32], color: SON, timing: [[0.5, 0], [0.92, 1]] },
        { path: [[nx + 110, nz - 130], [nx + 30, nz - 60], [home[0] + 10, home[1] - 6]], count: 22, spread: [18, 30], color: SON, timing: [[0.55, 0], [0.95, 1]] },
      ],
      progress: xd,
      visible: () => clock.near("xin-di"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 13,
      minPx: 18,
      place: (_, ctx, out) => {
        placeGlow(home[0], home[1], 5, out);
        return 0.85 + 0.15 * Math.sin(ctx.time * 2);
      },
      visible: () => clock.near("xin-di"),
    }),
  );

  // 3. "vao-nam": người xem kéo thanh — đoàn người (son) đi theo lối qua đèo xuống phía nam; Nguyễn Hoàng (ngà) đi đầu. Kéo xong thì lửa
  //    dinh trại Ái Tử sáng lên ở cuối đường (diễn hoạ).
  const march = (ctx: FrameCtx) => clamp((ctx.inputs["vao-nam"] ?? 0) / 0.9);
  const sinceIn = (ctx: FrameCtx) => (ctx.completedAt["vao-nam"] ? (ctx.now - ctx.completedAt["vao-nam"]) / 1000 : 0);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 73,
      groups: [
        { path: ROUTE, count: 90, spread: [18, 90], color: SON },
        { path: ROUTE, count: 1, color: IVORY, size: 1.4, timing: [[0, -0.03], [1, 0.97]] },
      ],
      progress: (ctx) => 0.03 + 0.97 * march(ctx),
      visible: () => clock.near("vao-nam"),
    }),
  );
  world.add(
    createFires({
      sites: [0, 1, 2, 3].map((i) => {
        const [x, z] = ring(AI_TU, 26, i * 1.6 + 0.4);
        return { x, y: height(x, z) + 1, z, order: i / 4, size: 1.4 };
      }),
      lit: (ctx) => clock.near("vao-nam") * smoothstep(0.5, 5, sinceIn(ctx)),
      size: 4,
      glow: () => 0.8,
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 14,
      minPx: 16,
      place: (_, ctx, out) => {
        placeGlow(PASS[0], PASS[1], 8, out);
        return 0.6 * (0.85 + 0.15 * Math.sin(ctx.time * 1.6)) * (1 - smoothstep(0.55, 0.8, march(ctx)));
      },
      visible: () => clock.near("vao-nam"),
    }),
  );

  // 4. "ai-tu": đoàn người từ bờ sông tản vào, đứng thành vòng dựng dinh quanh Ái Tử; lửa trại sáng dần; Nguyễn Hoàng (ngà) ở giữa.
  const AT = 24;
  const at = run("ai-tu", AT);
  const camp = (n: number, r: number, off: number): Pt[] => Array.from({ length: n }, (_, i) => ring(AI_TU, r, (i / n) * Math.PI * 2 + off));
  const spots = camp(30, 24, 0.2).concat(camp(30, 40, 0.5));
  world.add(
    createCrowd({
      size: 4,
      height: ground,
      seed: 74,
      groups: spots.map(([x, z], i) => ({
        path: [[AI_TU[0] + 24, AI_TU[1] - 50 - (i % 5) * 4], [x, z]] as Pt[],
        count: 1,
        color: SON,
        timing: [[0.03 + (i % 12) * 0.04, 0], [0.5 + (i % 12) * 0.04, 1]] as [number, number][],
      })),
      progress: at,
      visible: () => clock.near("ai-tu"),
    }),
  );
  world.add(
    createFires({
      sites: camp(8, 33, 0.1).map(([x, z], i) => ({ x, y: height(x, z) + 1, z, order: i / 8, size: 1.4 })),
      lit: () => clock.near("ai-tu") * smoothstep(0.3, 0.9, at()),
      size: 3.6,
      glow: () => 0.9,
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 15,
      minPx: 18,
      place: (_, ctx, out) => {
        placeGlow(AI_TU[0], AI_TU[1], 6, out);
        return smoothstep(0.08, 0.3, at()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.8));
      },
      visible: () => clock.near("ai-tu"),
    }),
  );

  // 5. "quang-nam": từ Ái Tử, ánh lửa lần lượt sáng dọc đường xuống phía nam; một đoàn người (son) đi theo, Nguyễn Hoàng (ngà) dẫn đầu (diễn hoạ).
  const QN = 24;
  const qn = run("quang-nam", QN);
  const fireSites: Pt[] = [[-70, -160], [-40, -220], [-58, -275], [-90, -330], [-80, -385], [-30, -300], [10, -240]];
  world.add(
    createFires({
      sites: fireSites.map(([x, z], i) => ({ x, y: height(x, z) + 1, z, order: i / fireSites.length, size: 2 })),
      lit: () => clock.near("quang-nam") * smoothstep(0.1, 0.9, qn()),
      size: 10,
      glow: () => 0.9,
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 75,
      groups: [
        { path: SOUTH_ROUTE, count: 70, spread: [18, 70], color: SON, timing: [[0.05, 0], [0.95, 1]] },
        { path: SOUTH_ROUTE, count: 1, color: IVORY, size: 1.4, timing: [[0.05, 0.02], [0.95, 1.02]] },
      ],
      progress: qn,
      visible: () => clock.near("quang-nam"),
    }),
  );
};

export default setup;
