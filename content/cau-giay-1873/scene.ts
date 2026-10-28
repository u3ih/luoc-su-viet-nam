import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BEN, BOUNDS, CAU_GIAY, DUONG_SONG, HA_NOI, SON_TAY, TIEN_DON, TINH, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Trận Cầu Giấy — cảnh CÁCH ĐIỆU. Người = chấm dáng người, tàu = đốm sáng nổi trên sông; không vẽ tàu, thành, súng, hố, trang phục, cờ, vũ khí. Vị trí Hà Nội, Cầu Giấy,
// Sơn Tây, các tỉnh và hướng đi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số quân.
// Xanh navy = quân Pháp; xám thép = quân Cờ Đen; son = quân triều đình; xanh nhạt = tàu; vàng / cam = lửa.

const NAVY = "#2f4f7a";
const SHIP = "#a8c8f0";
const CO_DEN = "#4a4f5c";
const SON = "#a83a24";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const onWater = () => WATER + 1.4;
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ha-noi", "cac-tinh", "co-den", "cau-giay", "sau-tran"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HA_NOI, 70], [CAU_GIAY, 45], [SON_TAY, 45], [TIEN_DON, 35], ...TINH.map((t): [Pt, number] => [t, 30])];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#35504a", shallow: "#88a078" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 40, z: 320 } },
    counts: { trees: 520, bushes: 600, grass: 3200, reeds: 1200 },
    forestAt: 0.55,
    birds: { center: { x: 0, y: 0, z: 60 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1.0 },
    seed: 1873,
  });

  // 1. "ha-noi": vài đốm xanh nhạt (tàu) đi ngược sông lên bến; một đoàn người (navy) từ bến vào thành; nhóm người (son) quanh thành lui dần; lửa quanh thành sáng lên (diễn hoạ).
  const HN = 26;
  const hn = run("ha-noi", HN);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: onWater,
      seed: 701,
      groups: [{ path: DUONG_SONG, count: 5, spread: [20, 30], color: SHIP, timing: [[0.03, 0], [0.45, 1]] }],
      progress: hn,
      visible: () => clock.near("ha-noi"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 702,
      groups: [
        { path: [BEN, mid(BEN, HA_NOI), ring(HA_NOI, 10, 0.3)], count: 50, spread: [26, 50], color: NAVY, timing: [[0.35, 0], [0.8, 1]], show: [0.32, 2] },
        { path: [ring(HA_NOI, 18, 2.4), ring(HA_NOI, 60, 2.6), [HA_NOI[0] - 120, HA_NOI[1] + 20]], count: 36, spread: [40, 50], color: SON, timing: [[0.4, 0], [0.95, 1]], show: [-1, 1.2] },
      ],
      progress: hn,
      visible: () => clock.near("ha-noi"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(HA_NOI, 32 + (i % 2) * 12, (i / 6) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.4 };
      }),
      lit: () => clock.near("ha-noi") * smoothstep(0.5, 0.95, hn()),
      size: 3.4,
      glow: () => 0.85,
    }),
  );

  // 2. "cac-tinh": các nhóm người (navy) từ Hà Nội tản ra các điểm quanh vùng, lửa sáng ở mỗi điểm; ở phía tây, nhóm (xám thép) từ Sơn Tây tiến lên lấy lại một chốt gần thành
  //    (diễn hoạ — không vẽ trận đánh cụ thể).
  const CT = 28;
  const ct = run("cac-tinh", CT);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 703,
      groups: [
        ...TINH.map((t, i) => ({ path: [HA_NOI, mid(HA_NOI, t), ring(t, 10, i)] as Pt[], count: 16, spread: [24, 40] as [number, number], color: NAVY, timing: [[0.08 + i * 0.05, 0], [0.7 + i * 0.05, 1]] as [number, number][] })),
        { path: [SON_TAY, mid(SON_TAY, TIEN_DON), TIEN_DON, [CAU_GIAY[0] - 60, CAU_GIAY[1] + 30]], count: 40, spread: [30, 50], color: CO_DEN, timing: [[0.3, 0], [0.95, 1]] },
      ],
      progress: ct,
      visible: () => clock.near("cac-tinh"),
    }),
  );
  world.add(
    createFires({
      sites: [...TINH, [CAU_GIAY[0] - 60, CAU_GIAY[1] + 30] as Pt].map(([x, z], i) => ({ x: x + 10, y: height(x + 10, z) + 1, z, order: i / 5, size: 1.5 })),
      lit: () => clock.near("cac-tinh") * smoothstep(0.4, 0.95, ct()),
      size: 3.6,
      glow: () => 0.85,
    }),
  );

  // 3. "co-den": người xem kéo thanh — đoàn người (xám thép) đi từ Sơn Tây qua chặng giữa đường tới gần Cầu Giấy; nhóm (son) từ phía nam tiến song song; nhóm (navy) vẫn ở trong thành
  //    (diễn hoạ).
  const march = (ctx: FrameCtx) => clamp((ctx.inputs["tien-quan"] ?? 0) / 0.9);
  const route: Pt[] = [SON_TAY, TIEN_DON, [-130, 95], [CAU_GIAY[0] - 20, CAU_GIAY[1] + 10]];
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 704,
      groups: [
        { path: route, count: 100, spread: [28, 90], color: CO_DEN },
        { path: [[-230, -60], [-170, -10], [-110, 30], [CAU_GIAY[0] - 24, CAU_GIAY[1] - 16]], count: 50, spread: [26, 60], color: SON },
        { path: [ring(HA_NOI, 14, 0.6), ring(HA_NOI, 16, 0.65)], count: 30, spread: [34, 34], color: NAVY },
      ],
      progress: (ctx) => 0.03 + 0.97 * march(ctx),
      visible: () => clock.near("co-den"),
    }),
  );

  // 4. "cau-giay": nhóm (xám thép) nằm sẵn hai bên đường ở khu Cầu Giấy; một nhóm (navy) từ thành tiến ra phía tây rồi vào giữa khu; một phần nhóm navy ngã xuống; lửa sáng lên ở khu
  //    đó (diễn hoạ — không vẽ hố, súng, cảnh một người cụ thể).
  const CG = 28;
  const cg = run("cau-giay", CG);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 705,
      groups: [
        { path: [ring(CAU_GIAY, 22, 1.2), ring(CAU_GIAY, 24, 1.25)], count: 34, spread: [60, 20], color: CO_DEN },
        { path: [ring(CAU_GIAY, 26, 4.4), ring(CAU_GIAY, 28, 4.45)], count: 30, spread: [60, 20], color: CO_DEN },
      ],
      progress: cg,
      visible: () => clock.near("cau-giay"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 706,
      groups: [{ path: [ring(HA_NOI, 14, 3.1), mid(HA_NOI, CAU_GIAY), CAU_GIAY], count: 44, spread: [24, 50], color: NAVY, mortal: true, timing: [[0.05, 0], [0.55, 1]] }],
      progress: cg,
      fall: () => 0.8 * smoothstep(0.55, 0.85, cg()),
      visible: () => clock.near("cau-giay"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 5 }, (_, i) => {
        const [x, z] = ring(CAU_GIAY, 26 + (i % 2) * 8, (i / 5) * Math.PI * 2 + 0.5);
        return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.5 };
      }),
      lit: () => clock.near("cau-giay") * smoothstep(0.5, 0.9, cg()),
      size: 3.6,
      glow: () => 0.9,
    }),
  );

  // 5. "sau-tran": tàn người (navy) từ Cầu Giấy lui vào thành; nhóm (son) từ phía tây vào cùng thành; sau đó một đoàn (navy) rời thành ra bến rồi tàu (xanh nhạt) đi xuôi sông về phía nam;
  //    lửa quanh thành dịu dần (diễn hoạ).
  const ST = 30;
  const st = run("sau-tran", ST);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 707,
      groups: [
        { path: [ring(CAU_GIAY, 10, 0.2), mid(HA_NOI, CAU_GIAY), ring(HA_NOI, 12, 3.1)], count: 14, spread: [24, 30], color: NAVY, timing: [[0.03, 0], [0.4, 1]] },
        { path: [ring(HA_NOI, 14, 0.3), mid(BEN, HA_NOI), BEN], count: 50, spread: [26, 50], color: NAVY, timing: [[0.5, 0], [0.85, 1]], show: [0.46, 2] },
        { path: [[CAU_GIAY[0] - 100, CAU_GIAY[1] + 30], [CAU_GIAY[0] - 40, CAU_GIAY[1] + 20], ring(HA_NOI, 18, 2.9)], count: 30, spread: [26, 40], color: SON, timing: [[0.3, 0], [0.8, 1]], show: [0.26, 2] },
      ],
      progress: st,
      visible: () => clock.near("sau-tran"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: onWater,
      seed: 708,
      groups: [{ path: [[BEN[0] + 12, BEN[1] - 4], [188, 20], [215, -90], [290, -240], [330, -420]], count: 5, spread: [20, 30], color: SHIP, timing: [[0.6, 0], [1, 1]], show: [0.56, 2] }],
      progress: st,
      visible: () => clock.near("sau-tran"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(HA_NOI, 32 + (i % 2) * 12, (i / 6) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.4 };
      }),
      lit: () => clock.near("sau-tran") * (1 - 0.7 * smoothstep(0.3, 0.95, st())),
      size: 3.4,
      glow: () => 0.8,
    }),
  );
};

export default setup;
