import { clamp, lerp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, HA_NOI, HUE, RANH_BAC, RANH_NAM, SAI_GON, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Hoà ước Giáp Thân 1884 — cảnh CÁCH ĐIỆU. Người = chấm dáng người; các phía, các vùng = đốm sáng; không vẽ cung điện, tàu, cờ hiệu, trang phục. Vị trí Huế, Hà Nội, Sài Gòn và hai ranh giới là diễn hoạ,
// khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Ngà = triều đình; xanh nhạt = phía nước Pháp; son = người; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const TRIEU = "#f0e2b8";
const PHAP = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["boi-canh", "ky-uoc", "ba-mien"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HUE, 60], [HA_NOI, 55], [SAI_GON, 55]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#2f4a4a", shallow: "#7f9a7c" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 360, bushes: 600, grass: 2800, reeds: 900 },
    forestAt: 0.6,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.6 },
    seed: 1884,
  });

  // 1. "boi-canh": ba đốm ngà (ba lần lên ngôi nối nhau) sáng rồi mờ lần lượt ở Huế; ở phía bắc, hai đoàn (xanh nhạt và son) đi lại và gặp nhau (diễn hoạ).
  const BC = 30;
  const bc = run("boi-canh", BC);
  world.add(
    createGlows({
      count: 3,
      color: TRIEU,
      size: 14,
      minPx: 16,
      place: (i, ctx, out) => {
        const [x, z] = ring(HUE, 8 + i * 10, 1.4 + i * 1.1);
        out.set(x, ground(x, z) + 8, z);
        const t = smoothstep(i * 0.25, i * 0.25 + 0.15, bc());
        const fade = i < 2 ? 1 - 0.75 * smoothstep(i * 0.25 + 0.3, i * 0.25 + 0.45, bc()) : 1;
        return 0.8 * t * fade * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i));
      },
      visible: () => clock.near("boi-canh"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 3,
      seed: 1841,
      groups: [
        { path: [[150, 250], [90, 300], ring(HA_NOI, 40, 0.3)], count: 22, spread: [30, 56], color: PHAP, size: 1.1, timing: [[0.05, 0], [0.8, 1]] },
        { path: [[-170, 330], [-90, 320], ring(HA_NOI, 40, 3.0)], count: 18, spread: [30, 50], color: SON, size: 1.1, timing: [[0.1, 0], [0.85, 1]] },
      ],
      progress: bc,
      visible: () => clock.near("boi-canh"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 5 }, (_, i) => {
        const [x, z] = ring(HA_NOI, 30, (i / 5) * Math.PI * 2 + 0.4);
        return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 };
      }),
      lit: () => clock.near("boi-canh") * smoothstep(0.4, 0.95, bc()),
      size: 3,
      glow: () => 0.8,
    }),
  );

  // 2. "ky-uoc": đoàn xanh nhạt (phía nước Pháp) từ phía biển và đoàn ngà (triều đình) từ trong thành cùng tụ về một điểm ở Huế; một quầng vàng sáng dần lúc họ gặp nhau (diễn hoạ).
  const KU = 28;
  const ku = run("ky-uoc", KU);
  const MEET: Pt = [HUE[0] - 8, HUE[1] + 6];
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 3,
      seed: 1842,
      groups: [
        { path: [[240, -60], [160, -20], ring(MEET, 14, 0.2)], count: 8, spread: [24, 30], color: PHAP, size: 1.2, timing: [[0.05, 0], [0.75, 1]] },
        { path: [[-120, 70], [-60, 40], ring(MEET, 14, 3.4)], count: 10, spread: [24, 30], color: TRIEU, size: 1.2, timing: [[0.05, 0], [0.75, 1]] },
      ],
      progress: ku,
      visible: () => clock.near("ky-uoc"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1843,
      groups: [{ path: [[-100, -60], [-30, -10], ring(HUE, 30, 4.0)], count: 20, spread: [26, 50], color: SON, timing: [[0.1, 0], [0.9, 1]] }],
      progress: ku,
      visible: () => clock.near("ky-uoc"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 18,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(MEET[0], ground(MEET[0], MEET[1]) + 9, MEET[1]);
        return 0.8 * smoothstep(0.55, 0.9, ku()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.8));
      },
      visible: () => clock.near("ky-uoc"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(HUE, 36, (i / 6) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 };
      }),
      lit: () => clock.near("ky-uoc") * smoothstep(0.3, 0.9, ku()),
      size: 3,
      glow: () => 0.8,
    }),
  );

  // 3. "ba-mien": người xem kéo thanh — hai dải đốm vàng (hai ranh giới) sáng dần từ tây sang đông; ba đốm sáng (ba vùng) hiện lên: hai đốm ngà (Bắc, Trung), một đốm xanh nhạt (Nam) (diễn hoạ).
  const chia = (ctx: FrameCtx) => clamp((ctx.inputs["chia-ba"] ?? 0) / 0.9);
  const LINE = 24;
  world.add(
    createGlows({
      count: LINE * 2,
      color: GOLD,
      size: 8,
      minPx: 12,
      place: (i, ctx, out) => {
        const k = i % LINE;
        const x = lerp(-300, 290, k / (LINE - 1));
        const z = (i < LINE ? RANH_BAC : RANH_NAM) + 14 * Math.sin(x * 0.015 + i);
        out.set(x, ground(x, z) + 4, z);
        return 0.85 * smoothstep(0.02 + (k / LINE) * 0.9, 0.1 + (k / LINE) * 0.9, chia(ctx));
      },
      visible: () => clock.near("ba-mien"),
    }),
  );
  world.add(
    createGlows({
      count: 3,
      color: (i) => (i === 2 ? PHAP : TRIEU),
      size: 18,
      minPx: 18,
      place: (i, ctx, out) => {
        const p = i === 0 ? HA_NOI : i === 1 ? HUE : SAI_GON;
        out.set(p[0], ground(p[0], p[1]) + 9, p[1]);
        return 0.75 * smoothstep(0.1 + i * 0.12, 0.3 + i * 0.12, chia(ctx)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.6 + i));
      },
      visible: () => clock.near("ba-mien"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1844,
      groups: [
        { path: [[-60, 290], ring(HA_NOI, 25, 3.6)], count: 12, spread: [30, 30], color: SON },
        { path: [[-60, 40], ring(HUE, 25, 3.6)], count: 12, spread: [30, 30], color: SON },
        { path: [[-60, -290], ring(SAI_GON, 25, 3.6)], count: 12, spread: [30, 30], color: SON },
      ],
      progress: () => 1,
      visible: () => clock.near("ba-mien"),
    }),
  );
};

export default setup;
