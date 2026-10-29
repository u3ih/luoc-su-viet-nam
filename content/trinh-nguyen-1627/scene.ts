import { clamp, lerp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, GIANH_MID, NGUYEN, NHAT_LE, TRINH, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Sông Gianh (1627–1672) — cảnh CÁCH ĐIỆU. Người, quân = chấm dáng người; hai miền, các trận, ranh giới = đốm sáng; không vẽ thuyền chiến, luỹ, cờ hiệu, trang phục. Vị trí hai kinh đô, sông Gianh, cửa Nhật Lệ là diễn hoạ,
// khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số quân.
// Xanh nhạt = Đàng Ngoài (phía bắc); ngà = Đàng Trong (phía nam); son = dân; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const BAC = "#a8c8f0";
const NAM = "#f0e2b8";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

// bảy đốm "trận" (diễn hoạ): rải dọc dải đất từ bắc xuống nam
const TRAN: Pt[] = [[-30, -150], [90, -170], [20, -120], [-20, -60], [80, 40], [30, 90], [-40, 140]];

const DUONG_VAO: Pt[] = [[30, 300], [40, 180], [55, 60], [60, 5], [60, -80], [NHAT_LE[0] - 10, NHAT_LE[1] + 22]];
const DUONG_PHU_XUAN: Pt[] = [[60, 20], [40, -110], [20, -220], [NGUYEN[0] + 6, NGUYEN[1] + 26]];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hai-mien", "nam-1627", "cac-tran", "song-gianh", "ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[TRINH, 55], [NGUYEN, 55], [GIANH_MID, 50], [NHAT_LE, 45]];

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
    seed: 1627,
  });

  // 1. "hai-mien": hai đốm sáng — xanh nhạt ở phía bắc, ngà ở phía nam — sáng dần; người (son) đi lại quanh mỗi bên (diễn hoạ).
  const HM = 26;
  const hm = run("hai-mien", HM);
  world.add(
    createGlows({
      count: 2,
      color: (i) => (i === 0 ? BAC : NAM),
      size: 18,
      minPx: 18,
      place: (i, ctx, out) => {
        const p = i === 0 ? TRINH : NGUYEN;
        out.set(p[0], ground(p[0], p[1]) + 8, p[1]);
        return 0.8 * smoothstep(0.1 * i, 0.4 + 0.1 * i, hm()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i));
      },
      visible: () => clock.near("hai-mien"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1621,
      groups: [
        { path: [[-80, 250], [-20, 300], ring(TRINH, 14, 3.4)], count: 18, spread: [26, 50], color: SON, timing: [[0.05, 0], [0.8, 1]] },
        { path: [[-60, -250], [-10, -300], ring(NGUYEN, 14, 3.4)], count: 18, spread: [26, 50], color: SON, timing: [[0.1, 0], [0.85, 1]] },
      ],
      progress: hm,
      visible: () => clock.near("hai-mien"),
    }),
  );
  for (const [k, c] of [[0, TRINH], [1, NGUYEN]] as [number, Pt][]) {
    world.add(
      createFires({
        sites: Array.from({ length: 4 }, (_, i) => {
          const [x, z] = ring(c, 30, (i / 4) * Math.PI * 2 + 0.4 + k);
          return { x, y: height(x, z) + 1, z, order: i / 4, size: 1.1 };
        }),
        lit: () => clock.near("hai-mien") * smoothstep(0.3, 0.9, hm()),
        size: 3,
        glow: () => 0.8,
      }),
    );
  }

  // 2. "nam-1627": đoàn xanh nhạt (quân phía bắc) đi vào nam tới cửa Nhật Lệ rồi rút; nhóm ngà (phía nam) đứng giữ ở đó (diễn hoạ).
  const N27 = 30;
  const n27 = run("nam-1627", N27);
  const go = () => smoothstep(0.05, 0.6, n27()) * (1 - 0.55 * smoothstep(0.7, 1, n27()));
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 3,
      seed: 1622,
      groups: [{ path: DUONG_VAO, count: 34, spread: [30, 70], color: BAC, size: 1.1 }],
      progress: () => 0.02 + 0.98 * go(),
      visible: () => clock.near("nam-1627"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 3,
      seed: 1623,
      groups: [{ path: [ring(NHAT_LE, 50, 3.9), ring(NHAT_LE, 24, 3.6)], count: 18, spread: [40, 24], color: NAM, size: 1.1 }],
      progress: () => 1,
      visible: () => clock.near("nam-1627"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 5 }, (_, i) => {
        const [x, z] = ring(NHAT_LE, 40, (i / 5) * Math.PI * 2 + 0.4);
        return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.1 };
      }),
      lit: () => clock.near("nam-1627") * smoothstep(0.2, 0.8, n27()),
      size: 3,
      glow: () => 0.8,
    }),
  );

  // 3. "cac-tran": bảy đốm vàng sáng lần lượt dọc dải đất; hai đoàn (xanh nhạt, ngà) đi lại giữa hai đầu (diễn hoạ — không tương ứng địa điểm thật).
  const CT = 34;
  const ct = run("cac-tran", CT);
  const swing = (ctx: FrameCtx, ph: number) => 0.5 + 0.5 * Math.sin(ctx.time * 0.32 + ph);
  world.add(
    createGlows({
      count: TRAN.length,
      color: GOLD,
      size: 14,
      minPx: 18,
      place: (i, ctx, out) => {
        const [x, z] = TRAN[i];
        out.set(x, ground(x, z) + 6, z);
        const t = smoothstep(0.04 + i * 0.11, 0.1 + i * 0.11, ct());
        return 0.85 * t * (0.85 + 0.15 * Math.sin(ctx.time * 1.8 + i));
      },
      visible: () => clock.near("cac-tran"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 3,
      seed: 1624,
      groups: [
        { path: [[40, 250], [50, 120], [55, 30]], count: 22, spread: [28, 56], color: BAC, size: 1.1 },
        { path: [[30, -250], [40, -140], [58, -30]], count: 22, spread: [28, 56], color: NAM, size: 1.1 },
      ],
      progress: (ctx) => 0.1 + 0.8 * swing(ctx, 0) * smoothstep(0, 0.15, ct()),
      visible: () => clock.near("cac-tran"),
    }),
  );

  // 4. "song-gianh": người xem kéo thanh — dải đốm vàng dọc sông Gianh sáng dần từ tây sang đông (ranh giới); nhóm xanh nhạt ở bờ bắc, nhóm ngà ở bờ nam đứng yên (diễn hoạ).
  const chia = (ctx: FrameCtx) => clamp((ctx.inputs["chia-doi"] ?? 0) / 0.9);
  const LINE = 30;
  world.add(
    createGlows({
      count: LINE,
      color: GOLD,
      size: 8,
      minPx: 12,
      place: (i, ctx, out) => {
        const x = lerp(-300, 290, i / (LINE - 1));
        const z = 22 * Math.sin(x * 0.012) + 6;
        out.set(x, ground(x, z) + 4, z);
        return 0.85 * smoothstep(0.02 + (i / LINE) * 0.9, 0.1 + (i / LINE) * 0.9, chia(ctx));
      },
      visible: () => clock.near("song-gianh"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 3,
      seed: 1625,
      groups: [
        { path: [[-40, 120], [40, 60]], count: 20, spread: [60, 30], color: BAC, size: 1.1 },
        { path: [[-40, -110], [40, -60]], count: 20, spread: [60, 30], color: NAM, size: 1.1 },
      ],
      progress: () => 1,
      visible: () => clock.near("song-gianh"),
    }),
  );

  // 5. "ve-sau": đoàn xanh nhạt (quân phía bắc) đi từ sông Gianh xuống Phú Xuân; đốm ngà (phía nam) mờ dần; lửa ở Phú Xuân bật lên rồi tắt (diễn hoạ).
  const VS = 30;
  const vs = run("ve-sau", VS);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 3,
      seed: 1626,
      groups: [{ path: DUONG_PHU_XUAN, count: 30, spread: [30, 70], color: BAC, size: 1.1, timing: [[0.05, 0], [0.85, 1]] }],
      progress: vs,
      visible: () => clock.near("ve-sau"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: NAM,
      size: 18,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(NGUYEN[0], ground(NGUYEN[0], NGUYEN[1]) + 8, NGUYEN[1]);
        return 0.8 * (1 - 0.8 * smoothstep(0.55, 0.95, vs())) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7));
      },
      visible: () => clock.near("ve-sau"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(NGUYEN, 34, (i / 6) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.2 };
      }),
      lit: () => clock.near("ve-sau") * smoothstep(0.5, 0.95, vs()),
      size: 3.2,
      glow: () => 0.8,
    }),
  );
};

export default setup;
