import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, CAN_GIUOC, LANG, NHAT_TAO, NHA_CHIEU, SAI_GON, TE_DAN, WATER, XOM_NHAT_TAO, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Nhật Tảo – Cần Giuộc 1861 — cảnh CÁCH ĐIỆU. Người = chấm dáng người, nhân vật = đốm sáng, tàu = đốm sáng nổi trên sông; không vẽ tàu, đồn, trang phục, vũ khí,
// không vẽ cảnh hoá trang. Vị trí vàm sông, đồn, các làng, bãi lễ và hướng đi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = nghĩa quân, nghĩa binh; xanh navy = quân Pháp; xanh nhạt = tàu; ngà, vàng = ánh sáng tưởng niệm.

const SON = "#a83a24";
const NAVY = "#2f4f7a";
const SHIP = "#a8c8f0";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["boi-canh", "nhat-tao", "can-giuoc", "le-te", "van-te"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[XOM_NHAT_TAO, 45], [CAN_GIUOC, 45], [SAI_GON, 55], [TE_DAN, 50], [NHA_CHIEU, 30], ...LANG.map((l): [Pt, number] => [l, 30])];

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
    counts: { trees: 320, bushes: 700, grass: 3200, reeds: 1400 },
    forestAt: 0.62,
    birds: { center: { x: 0, y: 0, z: 60 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.6 },
    seed: 1861,
  });

  // 1. "boi-canh": một đoàn người (navy) từ Sài Gòn đi xuống phía nam, dừng giữa vùng; rồi ở các làng, từng nhóm người (son) nổi lên, lửa sáng ở mỗi làng (diễn hoạ).
  const BC = 28;
  const bc = run("boi-canh", BC);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 401,
      groups: [
        { path: [[SAI_GON[0] - 10, SAI_GON[1] - 20], [150, 250], [135, 150], [LANG[1][0] + 60, LANG[1][1] - 10]], count: 50, spread: [30, 70], color: NAVY, timing: [[0.03, 0], [0.5, 1]] },
        ...LANG.map((l, i) => ({ path: [ring(l, 22, i), ring(l, 8, i + 1)] as Pt[], count: 14, spread: [26, 26] as [number, number], color: SON, show: [0.45 + i * 0.07, 2] as [number, number] })),
      ],
      progress: bc,
      visible: () => clock.near("boi-canh"),
    }),
  );
  world.add(
    createFires({
      sites: LANG.map(([x, z], i) => ({ x: x + 12, y: height(x + 12, z) + 1, z, order: i / LANG.length, size: 1.5 })),
      lit: () => clock.near("boi-canh") * smoothstep(0.5, 0.95, bc()),
      size: 3.6,
      glow: () => 0.85,
    }),
  );

  // 2. "nhat-tao": một đốm sáng xanh nhạt (tàu) đậu giữa sông ở vàm; các toán người (son) từ nhiều ngả tụ về xóm bên bờ rồi tiến sát; lửa bùng lên ở chỗ tàu,
  //    đốm tàu tắt dần, người tản ra (diễn hoạ — không vẽ tàu, không vẽ cách tiếp cận).
  const NT = 26;
  const nt = run("nhat-tao", NT);
  const [nx, nz] = NHAT_TAO;
  const [vx, vz] = XOM_NHAT_TAO;
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 402,
      groups: [
        { path: [[vx - 160, vz + 40], [vx - 80, vz + 14], [vx - 6, vz + 2]], count: 22, spread: [24, 40], color: SON, timing: [[0.03, 0], [0.45, 1]] },
        { path: [[vx + 20, vz + 160], [vx + 10, vz + 80], [vx + 2, vz + 8]], count: 20, spread: [24, 40], color: SON, timing: [[0.06, 0], [0.48, 1]] },
        { path: [[vx + 160, vz - 50], [vx + 80, vz - 20], [vx + 6, vz]], count: 18, spread: [24, 40], color: SON, timing: [[0.08, 0], [0.5, 1]] },
        { path: [[vx, vz], [nx - 14, nz + 18], [nx - 30, nz + 26]], count: 14, spread: [20, 24], color: SON, timing: [[0.5, 0], [0.75, 1]], show: [0.46, 2] },
      ],
      progress: nt,
      visible: () => clock.near("nhat-tao"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: SHIP,
      size: 14,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(nx, WATER + 3, nz);
        return (1 - smoothstep(0.62, 0.84, nt())) * (0.85 + 0.15 * Math.sin(ctx.time * 2));
      },
      visible: () => clock.near("nhat-tao"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 5 }, (_, i) => ({ x: nx + (i - 2) * 4, y: WATER + 1.2, z: nz + ((i % 2) - 0.5) * 4, order: i / 7, size: 1.7 })),
      lit: () => clock.near("nhat-tao") * smoothstep(0.58, 0.8, nt()),
      size: 4,
      glow: () => 0.95,
    }),
  );

  // 3. "can-giuoc": người (son) từ các làng tụ về đồn Cần Giuộc; nhóm (navy) ở đồn; vài người (son) ngã xuống dần; lửa sáng ở đồn (diễn hoạ — không phỏng đoán số người).
  const CG = 28;
  const cg = run("can-giuoc", CG);
  const [cx, cz] = CAN_GIUOC;
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 403,
      groups: [
        { path: [ring(CAN_GIUOC, 10, 1.1), ring(CAN_GIUOC, 12, 1.15)], count: 28, spread: [34, 34], color: NAVY },
        { path: [[cx - 190, cz - 30], [cx - 90, cz - 6], [cx - 20, cz]], count: 36, spread: [24, 50], color: SON, timing: [[0.05, 0], [0.55, 1]] },
        { path: [[cx + 40, cz - 190], [cx + 14, cz - 90], [cx + 2, cz - 22]], count: 28, spread: [24, 50], color: SON, timing: [[0.08, 0], [0.58, 1]] },
        { path: [[cx + 20, cz + 170], [cx + 6, cz + 80], [cx, cz + 22]], count: 24, spread: [24, 50], color: SON, timing: [[0.1, 0], [0.6, 1]] },
      ],
      progress: cg,
      visible: () => clock.near("can-giuoc"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 404,
      groups: [{ path: [[cx - 30, cz - 6], [cx - 14, cz - 2]], count: 18, spread: [30, 30], color: SON, mortal: true, show: [0.5, 2] }],
      progress: cg,
      fall: () => 0.55 * smoothstep(0.7, 1, cg()),
      visible: () => clock.near("can-giuoc"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 5 }, (_, i) => {
        const [x, z] = ring(CAN_GIUOC, 22, (i / 5) * Math.PI * 2 + 0.4);
        return { x, y: height(x, z) + 1, z, order: i / 7, size: 1.5 };
      }),
      lit: () => clock.near("can-giuoc") * smoothstep(0.45, 0.9, cg()),
      size: 3.6,
      glow: () => 0.9,
    }),
  );

  // 4. "le-te": người (son) từ các làng tụ về bãi lễ, vài ngọn đèn sáng dần; một đốm ngà từ bãi lễ đi về nơi ở của người viết văn tế, rồi một đốm vàng (bài văn tế)
  //    trở lại bãi lễ (diễn hoạ).
  const LTE = 28;
  const lte = run("le-te", LTE);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 405,
      groups: LANG.slice(0, 4).map((l, i) => ({ path: [ring(l, 30, i), [(l[0] + TE_DAN[0]) / 2, (l[1] + TE_DAN[1]) / 2], ring(TE_DAN, 20 + i * 4, i * 1.6)] as Pt[], count: 10, spread: [30, 40] as [number, number], color: SON, timing: [[0.03 + i * 0.03, 0], [0.55 + i * 0.03, 1]] as [number, number][] })),
      progress: lte,
      visible: () => clock.near("le-te"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 5,
      groups: [
        { path: [TE_DAN, [(TE_DAN[0] + NHA_CHIEU[0]) / 2, (TE_DAN[1] + NHA_CHIEU[1]) / 2], NHA_CHIEU], count: 1, color: IVORY, size: 1.4, timing: [[0.2, 0], [0.55, 1]], show: [0.18, 0.62] },
        { path: [NHA_CHIEU, [(TE_DAN[0] + NHA_CHIEU[0]) / 2, (TE_DAN[1] + NHA_CHIEU[1]) / 2], TE_DAN], count: 1, color: GOLD, size: 1.4, timing: [[0.62, 0], [0.95, 1]], show: [0.6, 2] },
      ],
      progress: lte,
      visible: () => clock.near("le-te"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(TE_DAN, 12, (i / 6) * Math.PI * 2);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 0.9 };
      }),
      lit: () => clock.near("le-te") * smoothstep(0.3, 0.95, lte()),
      size: 2.4,
      glow: () => 0.8,
    }),
  );

  // 5. "van-te": người xem kéo thanh — những ngọn đèn nhỏ (nhiều hàng quanh bãi lễ) sáng dần lên; một nhóm người (son) đứng lặng quanh bãi (diễn hoạ).
  const light = (ctx: FrameCtx) => clamp((ctx.inputs["thap-huong"] ?? 0) / 0.9);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 406,
      groups: [{ path: [ring(TE_DAN, 40, 0.2), ring(TE_DAN, 42, 0.25)], count: 36, spread: [80, 30], color: SON }],
      progress: () => 1,
      visible: () => clock.near("van-te"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 30 }, (_, i) => {
        const a = (i / 30) * Math.PI * 2;
        const [x, z] = ring(TE_DAN, 18 + (i % 3) * 7, a);
        return { x, y: height(x, z) + 1, z, order: i / 30, size: 0.9 };
      }),
      lit: (ctx) => clock.near("van-te") * smoothstep(0.02, 0.95, light(ctx)),
      size: 2.4,
      glow: () => 0.9,
    }),
  );
};

export default setup;
