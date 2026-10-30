import { clamp, lerp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, DUONG, KINH, VAN_MIEU, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Thời Hồng Đức — cảnh CÁCH ĐIỆU. Người = chấm dáng người, bia và thừa tuyên = đốm sáng; không vẽ bia, rùa đá, giếng, cung điện, trang phục. Vị trí kinh thành, Văn Miếu và các thừa tuyên là diễn hoạ,
// khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người. Mười ba đốm thừa tuyên bố trí quanh kinh thành không theo bản đồ thật; tám mươi hai đốm bia xếp hai hàng 41 theo bài tham khảo.
// Son = người; vàng = bia, thừa tuyên; ngà = sách luật.

const SON = "#a83a24";
const GOLD = "#ffd27a";
const IVORY = "#f0e2b8";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

// mười ba thừa tuyên: rải quanh kinh thành, tránh lòng sông
const TUYEN: Pt[] = Array.from({ length: 13 }, (_, i) => {
  const a = (i / 13) * Math.PI * 2 + 0.4;
  const r = 140 + (i % 3) * 55;
  const x = clamp(KINH[0] + Math.cos(a) * r, -340, 150);
  return [x, clamp(KINH[1] + Math.sin(a) * r, -340, 340)] as Pt;
});

// tám mươi hai bia: hai hàng 41 hai bên giếng (ở tâm khu Văn Miếu)
const BIA: Pt[] = Array.from({ length: 82 }, (_, i) => {
  const side = i < 41 ? -1 : 1;
  const k = i % 41;
  return [VAN_MIEU[0] + side * 17, VAN_MIEU[1] - 52 + k * 2.6] as Pt;
});

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["vua-le", "bo-may", "bo-luat", "bia-tien-si", "ngay-nay"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[KINH, 60], [VAN_MIEU, 80]];

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
    counts: { trees: 360, bushes: 600, grass: 3000, reeds: 1000 },
    forestAt: 0.6,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.6 },
    seed: 1483,
  });

  // 1. "vua-le": từng nhóm người (son) từ các hướng đi về kinh thành, tụ lại; một quầng vàng sáng ở giữa; đèn quanh kinh thành bật dần (diễn hoạ).
  const VL = 26;
  const vl = run("vua-le", VL);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1481,
      groups: [
        { path: [[-250, 120], [-100, 80], [0, 60], ring(KINH, 14, 2.9)], count: 24, spread: [26, 60], color: SON, timing: [[0.03, 0], [0.8, 1]] },
        { path: [[-200, -140], [-60, -40], [20, 20], ring(KINH, 14, 3.6)], count: 20, spread: [26, 60], color: SON, timing: [[0.08, 0], [0.85, 1]] },
        { path: [[40, 300], [50, 160], [58, 90], ring(KINH, 12, 1.6)], count: 16, spread: [26, 50], color: SON, timing: [[0.12, 0], [0.9, 1]] },
      ],
      progress: vl,
      visible: () => clock.near("vua-le"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 20,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(KINH[0], ground(KINH[0], KINH[1]) + 8, KINH[1]);
        return 0.7 * smoothstep(0.3, 0.8, vl()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7));
      },
      visible: () => clock.near("vua-le"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 7 }, (_, i) => {
        const [x, z] = ring(KINH, 32 + (i % 2) * 12, (i / 7) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 7, size: 1.2 };
      }),
      lit: () => clock.near("vua-le") * smoothstep(0.4, 0.95, vl()),
      size: 3.2,
      glow: () => 0.8,
    }),
  );

  // 2. "bo-may": mười ba đốm vàng (thừa tuyên) sáng dần quanh kinh thành; từ kinh thành, mỗi hướng một đoàn người (son) đi ra các thừa tuyên (diễn hoạ).
  const BM = 30;
  const bm = run("bo-may", BM);
  world.add(
    createGlows({
      count: TUYEN.length,
      color: GOLD,
      size: 18,
      minPx: 22,
      place: (i, ctx, out) => {
        const [x, z] = TUYEN[i];
        out.set(x, ground(x, z) + 6, z);
        return 0.75 * smoothstep(0.06 + (i / TUYEN.length) * 0.7, 0.14 + (i / TUYEN.length) * 0.7, bm()) * (0.88 + 0.12 * Math.sin(ctx.time * 1.6 + i));
      },
      visible: () => clock.near("bo-may"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1482,
      groups: TUYEN.filter((_, i) => i % 2 === 0).map((p, k) => ({
        path: [ring(KINH, 14, 0.5 * k), [lerp(KINH[0], p[0], 0.5), lerp(KINH[1], p[1], 0.5)] as Pt, p],
        count: 6,
        spread: [12, 18],
        color: SON,
        timing: [[0.05 + k * 0.05, 0], [0.85, 1]] as [number, number][],
      })),
      progress: bm,
      visible: () => clock.near("bo-may"),
    }),
  );

  // 3. "bo-luat": một đốm ngà (sách luật) sáng ở kinh thành; từng nhóm người (son) tụ quanh; ánh đèn quanh sáng dần (diễn hoạ — không vẽ chữ hay sách).
  const BL = 28;
  const bl = run("bo-luat", BL);
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 14,
      minPx: 16,
      place: (_, ctx, out) => {
        out.set(KINH[0] - 4, ground(KINH[0], KINH[1]) + 6, KINH[1]);
        return 0.8 * smoothstep(0.1, 0.5, bl()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.9));
      },
      visible: () => clock.near("bo-luat"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1484,
      groups: [
        { path: [[-120, 100], [-30, 80], ring(KINH, 22, 2.8)], count: 22, spread: [24, 54], color: SON, timing: [[0.05, 0], [0.8, 1]] },
        { path: [[120, -80], [100, -10], ring(KINH, 22, 5.8)], count: 14, spread: [24, 40], color: SON, timing: [[0.12, 0], [0.9, 1]] },
        { path: [[60, 200], [58, 110], ring(KINH, 22, 1.5)], count: 14, spread: [24, 40], color: SON, timing: [[0.15, 0], [0.9, 1]] },
      ],
      progress: bl,
      visible: () => clock.near("bo-luat"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(KINH, 34, (i / 6) * Math.PI * 2 + 0.5);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.1 };
      }),
      lit: () => clock.near("bo-luat") * smoothstep(0.3, 0.9, bl()),
      size: 3,
      glow: () => 0.8,
    }),
  );

  // 4. "bia-tien-si": người xem kéo thanh — tám mươi hai đốm vàng (bia) dựng dần thành hai hàng; một đoàn người (son) từ kinh thành đi tới khu Văn Miếu (diễn hoạ).
  const dung = (ctx: FrameCtx) => clamp((ctx.inputs["dung-bia"] ?? 0) / 0.9);
  world.add(
    createGlows({
      count: BIA.length,
      color: GOLD,
      size: 6,
      minPx: 9,
      place: (i, ctx, out) => {
        const [x, z] = BIA[i];
        const k = i % 41;
        const up = smoothstep(0.02 + (k / 41) * 0.9, 0.1 + (k / 41) * 0.9, dung(ctx));
        out.set(x, ground(x, z) + 1 + up * 4, z);
        return 0.8 * up;
      },
      visible: () => clock.near("bia-tien-si"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1485,
      groups: [{ path: DUONG, count: 20, spread: [22, 56], color: SON, timing: [[0, 0], [1, 1]] }],
      progress: (ctx) => 0.1 + 0.9 * dung(ctx),
      visible: () => clock.near("bia-tien-si"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 5 }, (_, i) => {
        const [x, z] = ring(VAN_MIEU, 48, (i / 5) * Math.PI * 2 + 0.2);
        return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 };
      }),
      lit: (ctx) => clock.near("bia-tien-si") * smoothstep(0.1, 0.8, dung(ctx)),
      size: 3,
      glow: () => 0.8,
    }),
  );

  // 5. "ngay-nay": tám mươi hai đốm vàng (bia) đã dựng, sáng đều; từng nhóm người (son) từ kinh thành đi tới vườn bia và đứng lặng (diễn hoạ).
  const NN = 28;
  const nn = run("ngay-nay", NN);
  world.add(
    createGlows({
      count: BIA.length,
      color: GOLD,
      size: 6,
      minPx: 9,
      place: (i, ctx, out) => {
        const [x, z] = BIA[i];
        out.set(x, ground(x, z) + 5, z);
        return 0.7 * smoothstep(0, 0.15, nn()) * (0.9 + 0.1 * Math.sin(ctx.time * 1.4 + i * 0.7));
      },
      visible: () => clock.near("ngay-nay"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1486,
      groups: [
        { path: DUONG, count: 22, spread: [26, 64], color: SON, timing: [[0.03, 0], [0.8, 0.95]] },
        { path: [[-170, 90], [-140, 40], [VAN_MIEU[0] - 40, VAN_MIEU[1] + 20]], count: 14, spread: [24, 40], color: SON, timing: [[0.1, 0], [0.9, 1]] },
      ],
      progress: nn,
      visible: () => clock.near("ngay-nay"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 8 }, (_, i) => {
        const [x, z] = ring(VAN_MIEU, 52, (i / 8) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.1 };
      }),
      lit: () => clock.near("ngay-nay") * smoothstep(0.3, 0.9, nn()),
      size: 3,
      glow: () => 0.8,
    }),
  );
};

export default setup;
