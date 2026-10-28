import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, DUONG_BIEN, GIUA_BIEN, HAI_BO_NHAT, HAI_BO_VIET, NHAT_BAN, QUANG_NAM, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Phong trào Đông Du — cảnh CÁCH ĐIỆU. Người = chấm dáng người, nhân vật = đốm sáng, tàu = đốm sáng nổi trên biển; không vẽ tàu, nhà, trường học, trang phục, cờ. Hai bờ, biển ở giữa, hướng đi
// là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = thanh niên, hội viên; ngà = Phan Bội Châu; vàng = Cường Để và ánh sáng tượng trưng; trắng xám = chính khách Nhật; xanh nhạt = tàu; xanh navy = phía Pháp.

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
  const clock = createBeatClock(world, ["duy-tan-hoi", "sang-nhat", "thanh-nien", "cong-hien-hoi", "tan-ro"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[QUANG_NAM, 55], [NHAT_BAN, 60]];

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
    counts: { trees: 520, bushes: 500, grass: 2600, reeds: 500 },
    forestAt: 0.5,
    birds: { center: { x: 0, y: 0, z: 0 }, radius: 260 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1.3 },
    seed: 1905,
  });

  // 1. "duy-tan-hoi": người (son) từ nhiều ngả tụ về một chỗ ở Quảng Nam; hai đốm sáng (ngà — Phan Bội Châu, vàng — Cường Để) ở giữa; lửa trại sáng dần (diễn hoạ).
  const DT = 26;
  const dt = run("duy-tan-hoi", DT);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1201,
      groups: [
        { path: [[QUANG_NAM[0] - 130, QUANG_NAM[1] + 110], [QUANG_NAM[0] - 60, QUANG_NAM[1] + 40], ring(QUANG_NAM, 16, 2.4)], count: 22, spread: [30, 44], color: SON, timing: [[0.03, 0], [0.55, 1]] },
        { path: [[QUANG_NAM[0] + 40, QUANG_NAM[1] + 190], [QUANG_NAM[0] + 18, QUANG_NAM[1] + 90], ring(QUANG_NAM, 18, 1.2)], count: 20, spread: [30, 44], color: SON, timing: [[0.06, 0], [0.6, 1]] },
        { path: [[QUANG_NAM[0] + 10, QUANG_NAM[1] - 160], [QUANG_NAM[0] + 4, QUANG_NAM[1] - 80], ring(QUANG_NAM, 16, 4.7)], count: 20, spread: [30, 44], color: SON, timing: [[0.08, 0], [0.62, 1]] },
      ],
      progress: dt,
      visible: () => clock.near("duy-tan-hoi"),
    }),
  );
  world.add(
    createGlows({
      count: 2,
      color: (i) => (i === 0 ? IVORY : GOLD),
      size: 14,
      minPx: 18,
      place: (i, ctx, out) => {
        const [x, z] = ring(QUANG_NAM, 5, i * Math.PI);
        out.set(x, ground(x, z) + 7, z);
        return smoothstep(0.4 + i * 0.1, 0.65 + i * 0.1, dt()) * (0.85 + 0.15 * Math.sin(ctx.time * 2 + i));
      },
      visible: () => clock.near("duy-tan-hoi"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 5 }, (_, i) => {
        const [x, z] = ring(QUANG_NAM, 28 + (i % 2) * 10, (i / 5) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.4 };
      }),
      lit: () => clock.near("duy-tan-hoi") * smoothstep(0.35, 0.9, dt()),
      size: 3.4,
      glow: () => 0.85,
    }),
  );

  // 2. "sang-nhat": một đốm xanh nhạt (tàu) chở ba đốm sáng (ngà, vàng, vàng nhạt) đi từ bờ Việt Nam qua biển sang bờ Nhật; ở bờ Nhật, vài đốm trắng xám (chính khách) hiện lên đón (diễn hoạ).
  const SN = 28;
  const sn = run("sang-nhat", SN);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => (ground(x, z) <= WATER + 0.25 ? WATER + 3 : ground(x, z) + 5),
      groups: [
        { path: [QUANG_NAM, HAI_BO_VIET, ...DUONG_BIEN], count: 1, color: SHIP, size: 1.5, timing: [[0.05, 0], [0.75, 1]] },
        ...[IVORY, GOLD, "#ffe9b0"].map((color, i) => ({ path: [QUANG_NAM, HAI_BO_VIET, ...DUONG_BIEN] as Pt[], count: 1, color, size: 1.1, timing: [[0.05, -0.012 * (i + 1)], [0.75, 1 - 0.012 * (i + 1)]] as [number, number][] })),
      ],
      progress: sn,
      visible: () => clock.near("sang-nhat"),
    }),
  );
  world.add(
    createGlows({
      count: 3,
      color: ENVOY,
      size: 12,
      minPx: 16,
      place: (i, ctx, out) => {
        const [x, z] = ring(NHAT_BAN, 14 + i * 5, i * 2.1);
        out.set(x, ground(x, z) + 6, z);
        return smoothstep(0.68 + i * 0.04, 0.85 + i * 0.04, sn()) * (0.8 + 0.2 * Math.sin(ctx.time * 2 + i));
      },
      visible: () => clock.near("sang-nhat"),
    }),
  );

  // 3. "thanh-nien": người xem kéo thanh — các đốm xanh nhạt (tàu) từ bờ Việt Nam sang bờ Nhật; ở bờ Nhật người (son) hiện dần quanh bến; lửa sáng ở bến (diễn hoạ).
  const cross = (ctx: FrameCtx) => clamp((ctx.inputs["sang-hoc"] ?? 0) / 0.9);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: onWater,
      seed: 1202,
      groups: [0, 1, 2, 3].map((i) => ({ path: [HAI_BO_VIET, ...DUONG_BIEN.slice(1), HAI_BO_NHAT].map(([x, z]): Pt => [x, z + (i - 1.5) * 14]), count: 2, spread: [16, 18] as [number, number], color: SHIP, timing: [[0.02 + i * 0.1, 0], [0.7 + i * 0.07, 1]] as [number, number][] })),
      progress: cross,
      visible: () => clock.near("thanh-nien"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1203,
      groups: [
        { path: [HAI_BO_NHAT, mid(HAI_BO_NHAT, NHAT_BAN), ring(NHAT_BAN, 18, 2.8)], count: 34, spread: [30, 44], color: SON, timing: [[0.55, 0], [1, 1]], show: [0.5, 2] },
        { path: [ring(QUANG_NAM, 16, 5.6), mid(QUANG_NAM, HAI_BO_VIET), HAI_BO_VIET], count: 24, spread: [24, 40], color: SON, timing: [[0.02, 0], [0.4, 1]], show: [-1, 0.5] },
      ],
      progress: cross,
      visible: () => clock.near("thanh-nien"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 4 }, (_, i) => {
        const [x, z] = ring(NHAT_BAN, 30, (i / 4) * Math.PI * 2 + 0.4);
        return { x, y: height(x, z) + 1, z, order: i / 4, size: 1.3 };
      }),
      lit: (ctx) => clock.near("thanh-nien") * smoothstep(0.5, 0.95, cross(ctx)),
      size: 3.2,
      glow: () => 0.8,
    }),
  );

  // 4. "cong-hien-hoi": người (son) ở bờ Nhật tụ thành vòng quanh một quầng vàng (hội); đốm ngà và đốm vàng đứng giữa; lửa quanh vòng sáng dần (diễn hoạ).
  const CH = 28;
  const ch = run("cong-hien-hoi", CH);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1204,
      groups: [
        { path: [ring(NHAT_BAN, 90, 3.0), mid(ring(NHAT_BAN, 90, 3.0), NHAT_BAN), ring(NHAT_BAN, 22, 3.0)], count: 28, spread: [30, 44], color: SON, timing: [[0.03, 0], [0.55, 1]] },
        { path: [ring(NHAT_BAN, 100, 4.6), mid(ring(NHAT_BAN, 100, 4.6), NHAT_BAN), ring(NHAT_BAN, 24, 4.6)], count: 26, spread: [30, 44], color: SON, timing: [[0.06, 0], [0.6, 1]] },
        { path: [ring(NHAT_BAN, 100, 1.6), mid(ring(NHAT_BAN, 100, 1.6), NHAT_BAN), ring(NHAT_BAN, 20, 1.6)], count: 24, spread: [30, 44], color: SON, timing: [[0.09, 0], [0.62, 1]] },
      ],
      progress: ch,
      visible: () => clock.near("cong-hien-hoi"),
    }),
  );
  world.add(
    createGlows({
      count: 3,
      color: (i) => [GOLD, IVORY, GOLD][i],
      size: (i) => (i === 0 ? 20 : 14),
      minPx: 18,
      place: (i, ctx, out) => {
        const [x, z] = i === 0 ? NHAT_BAN : ring(NHAT_BAN, 6, i * 3.1);
        out.set(x, ground(x, z) + 7, z);
        return smoothstep(0.4, 0.7, ch()) * (i === 0 ? 0.65 : 0.9) * (0.85 + 0.15 * Math.sin(ctx.time * 1.9 + i));
      },
      visible: () => clock.near("cong-hien-hoi"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 8 }, (_, i) => {
        const [x, z] = ring(NHAT_BAN, 32, (i / 8) * Math.PI * 2 + 0.2);
        return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.3 };
      }),
      lit: () => clock.near("cong-hien-hoi") * smoothstep(0.35, 0.9, ch()),
      size: 3.2,
      glow: () => 0.85,
    }),
  );

  // 5. "tan-ro": một nhóm (navy) hiện ở bờ Việt Nam, lửa sáng ở đó; một đốm xanh nhạt (phía Pháp) từ bờ Việt Nam và một đốm trắng xám (phía Nhật) từ bờ Nhật đi vào giữa biển gặp nhau; rồi người (son)
  //    ở bờ Nhật tản đi, lửa lụi dần và đốm ngà, đốm vàng mờ đi (diễn hoạ — không vẽ thoả thuận, không vẽ cảnh bị trục xuất).
  const TR = 32;
  const tr = run("tan-ro", TR);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1205,
      groups: [
        { path: [ring(QUANG_NAM, 20, 0.3), ring(QUANG_NAM, 24, 0.35)], count: 24, spread: [40, 30], color: NAVY, show: [0.0, 0.55] },
        ...[0.4, 2.0, 3.6, 5.2].map((a, i) => ({ path: [ring(NHAT_BAN, 20, a), ring(NHAT_BAN, 100, a), ring(NHAT_BAN, 190, a)] as Pt[], count: 10, spread: [26, 36] as [number, number], color: SON, timing: [[0.45 + i * 0.05, 0], [0.98, 1]] as [number, number][], show: [0.4, 1.05] as [number, number] })),
      ],
      progress: tr,
      visible: () => clock.near("tan-ro"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: onWater,
      seed: 1206,
      groups: [
        { path: [HAI_BO_VIET, [-90, -20], GIUA_BIEN], count: 1, color: SHIP, size: 1.4, timing: [[0.05, 0], [0.4, 1]] },
        { path: [HAI_BO_NHAT, [90, 38], GIUA_BIEN], count: 1, color: ENVOY, size: 1.4, timing: [[0.05, 0], [0.4, 1]] },
      ],
      progress: tr,
      visible: () => clock.near("tan-ro"),
    }),
  );
  world.add(
    createFires({
      sites: [
        ...Array.from({ length: 4 }, (_, i) => {
          const [x, z] = ring(QUANG_NAM, 30, (i / 4) * Math.PI * 2 + 0.2);
          return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.4 };
        }),
        ...Array.from({ length: 4 }, (_, i) => {
          const [x, z] = ring(NHAT_BAN, 32, (i / 4) * Math.PI * 2 + 0.2);
          return { x, y: height(x, z) + 1, z, order: 0.5 + i / 8, size: 1.3 };
        }),
      ],
      lit: () => clock.near("tan-ro") * (0.2 + 0.8 * smoothstep(0.05, 0.3, tr())) * (1 - 0.15 * smoothstep(0.5, 1, tr())),
      size: 3.2,
      glow: () => 0.8,
    }),
  );
  world.add(
    createGlows({
      count: 2,
      color: (i) => (i === 0 ? IVORY : GOLD),
      size: 14,
      minPx: 16,
      place: (i, ctx, out) => {
        const [x, z] = ring(NHAT_BAN, 5, i * Math.PI);
        out.set(x, ground(x, z) + 7, z);
        return (1 - smoothstep(0.55 + i * 0.1, 0.85 + i * 0.1, tr())) * (0.85 + 0.15 * Math.sin(ctx.time * 2 + i));
      },
      visible: () => clock.near("tan-ro"),
    }),
  );
};

export default setup;
