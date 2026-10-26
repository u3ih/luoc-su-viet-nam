import { clamp, lerp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createFoliage } from "@/core/world/foliage";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, CU_LAO, HA_TIEN, MY_THO, RACH_GAM, WATER, XOAI_MUT, bankDist, colorize, height, riverZ } from "./terrain";

type Pt = [number, number];

// Rạch Gầm – Xoài Mút — cảnh CÁCH ĐIỆU. Thuyền KHÔNG được vẽ (chưa có tư liệu hiện vật về từng loại thuyền hai bên): mỗi chiếc là một
// chấm sáng trên mặt sông; người = chấm dáng người. Số chấm không tương ứng số quân hay số thuyền trong sử sách.
// Vàng nhạt = đoàn thuyền Xiêm, cam = quân Tây Sơn ven bờ và hai đầu sông, ngà = Nguyễn Ánh, son = người bờ sông.

const PALE = "#ffe7a8";
const EMBER = "#ff8a50";
const IVORY = "#f0e2b8";
const SON = "#a83a24";
const EARTH = "#8a7a5a";

const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const rev = (pts: Pt[]): Pt[] => [...pts].reverse();
const roundTrip = (pts: Pt[]): Pt[] => [...pts, ...rev(pts).slice(1)];
const shuttle = (pts: Pt[], n: number): Pt[] => Array.from({ length: n }, () => roundTrip(pts).slice(0, -1)).flat().concat([pts[0]]);

const FLEET = 26;
const BANK_N = 18;
const BLOCK_N = 8;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["cau-vien", "nhu-dich", "rach-gam", "bo-chay", "ket"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => Math.hypot(x - MY_THO[0], z - MY_THO[1]) > 45,
    water: { deep: "#3a4f43", shallow: "#8a9a70" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 40, z: 320 } },
    counts: { trees: 380, bushes: 500, grass: 2600, reeds: 1800 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 0 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.5 },
    seed: 1785,
  });
  // dừa nước, cây ven sông: rải thêm bằng cây dừa dựng bằng code
  world.add(
    createFoliage({
      quality: world.quality,
      kind: "palm",
      count: Math.round(260 * world.quality.density),
      area: { x0: -390, x1: 390, z0: -390, z1: 390 },
      accept: (x, z) => {
        const h = height(x, z);
        return h > 1.6 && bankDist(x, z) > 4 && bankDist(x, z) < 90 && Math.hypot(x - MY_THO[0], z - MY_THO[1]) > 45 ? h - 0.2 : null;
      },
      scale: [1.0, 1.6],
      seed: 1786,
      maxDistance: 420,
    }),
  );

  // ---- đường tim sông & đoàn thuyền (chấm sáng) ----
  const mid = (x: number) => riverZ(x);
  const wob = (i: number) => ((i * 37) % 7) - 3;
  const fleetGlows = (id: string, head: (ctx: FrameCtx) => number, glow: (ctx: FrameCtx) => number, fade: (i: number, ctx: FrameCtx) => number = () => 1) =>
    createGlows({
      count: FLEET,
      color: PALE,
      size: 8,
      minPx: 14,
      place: (i, ctx, out) => {
        const x = head(ctx) - i * 13;
        const z = mid(x) + wob(i) * 11;
        out.set(x, WATER + 1.2, z);
        return glow(ctx) * fade(i, ctx) * (0.85 + 0.15 * Math.sin(ctx.time * 2.2 + i));
      },
      visible: () => clock.near(id),
    });

  // 1. "cau-vien": một đoàn chấm sáng (đoàn thuyền Xiêm) từ rìa phía tây tiến về Hà Tiên, nơi một đốm ngà (Nguyễn Ánh) đứng chờ (diễn hoạ).
  const CV = 22;
  const cv = run("cau-vien", CV);
  world.add(
    createGlows({
      count: FLEET,
      color: PALE,
      size: 8,
      minPx: 14,
      place: (i, ctx, out) => {
        const t = clamp(cv() * 1.25 - (i / FLEET) * 0.35, 0, 1);
        const x = lerp(-440 - i * 6, HA_TIEN[0] + 20 + (i % 5) * 9, t);
        const z = lerp(mid(-440) + wob(i) * 12, HA_TIEN[1] + 36 + wob(i) * 8, t);
        out.set(x, WATER + 1, z);
        return smoothstep(0, 0.1, t) * (0.85 + 0.15 * Math.sin(ctx.time * 2 + i));
      },
      visible: () => clock.near("cau-vien"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 11,
      minPx: 16,
      place: (_, ctx, out) => {
        out.set(HA_TIEN[0] + 40, ground(HA_TIEN[0] + 40, HA_TIEN[1] - 10) + 5, HA_TIEN[1] - 10);
        return 0.55 + 0.25 * smoothstep(0.5, 0.9, cv()) + 0.1 * Math.sin(ctx.time * 1.8);
      },
      visible: () => clock.near("cau-vien"),
    }),
  );

  // 2. "nhu-dich": quân Tây Sơn (son) từ phía đông tiến vào Mỹ Tho; một toán nhỏ (cam) lùi dần trên sông phía trước đoàn thuyền Xiêm, nhử
  //    đoàn thuyền tiến lên khúc sông (diễn hoạ).
  const ND = 28;
  const nd = run("nhu-dich", ND);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 91,
      groups: [
        { path: [[430, -150], [260, -150], [MY_THO[0] + 20, MY_THO[1] + 6]], count: 60, spread: [24, 70], color: SON, timing: [[0.02, 0], [0.8, 1]] },
        { path: [[430, -110], [300, -130], [MY_THO[0] + 40, MY_THO[1] - 10]], count: 30, spread: [20, 40], color: SON, timing: [[0.1, 0], [0.9, 1]] },
      ],
      progress: nd,
      visible: () => clock.near("nhu-dich"),
    }),
  );
  world.add(fleetGlows("nhu-dich", () => lerp(-330, RACH_GAM[0] + 20, smoothstep(0.02, 0.95, nd())), () => smoothstep(0, 0.1, nd())));
  world.add(
    createGlows({
      count: 5,
      color: EMBER,
      size: 5,
      minPx: 10,
      place: (i, ctx, out) => {
        const x = lerp(-260, RACH_GAM[0] + 80, smoothstep(0.02, 0.95, nd())) + 60 + i * 11;
        out.set(x, WATER + 1.2, mid(x) + wob(i) * 9);
        return smoothstep(0.05, 0.2, nd()) * (0.85 + 0.15 * Math.sin(ctx.time * 2.4 + i));
      },
      visible: () => clock.near("nhu-dich"),
    }),
  );

  // 3. "rach-gam": người xem kéo thanh — đoàn thuyền Xiêm (vàng nhạt) tiến lên khúc sông; hai bờ sáng dần chấm cam (pháo, quân phục kích), hai nhóm
  //    cam từ hai đầu sông khép lại, đoàn thuyền Xiêm tối dần. (diễn hoạ — không vẽ thuyền, pháo, trận đồ)
  const close = (ctx: FrameCtx) => clamp((ctx.inputs["phuc-kich"] ?? 0) / 0.9);
  world.add(
    fleetGlows(
      "rach-gam",
      (ctx) => lerp(-110, 90, smoothstep(0, 0.6, close(ctx))) + 30 * Math.sin(ctx.time * 0.4) * (1 - close(ctx)),
      () => 1,
      (i, ctx) => 1 - 0.9 * smoothstep(0.55 + (i / FLEET) * 0.3, 1, close(ctx)),
    ),
  );
  world.add(
    createGlows({
      count: BANK_N * 2,
      color: EMBER,
      size: 6.5,
      minPx: 12,
      place: (i, ctx, out) => {
        const side = i % 2 === 0 ? 1 : -1;
        const x = -170 + Math.floor(i / 2) * (340 / BANK_N);
        const z = mid(x) + side * (62 + ((i * 13) % 5));
        out.set(x, ground(x, z) + 1.5, z);
        return smoothstep(0.05 + (i / (BANK_N * 2)) * 0.25, 0.4, close(ctx)) * (0.8 + 0.2 * Math.sin(ctx.time * 3 + i));
      },
      visible: () => clock.near("rach-gam"),
    }),
  );
  world.add(
    createGlows({
      count: BLOCK_N * 2,
      color: EMBER,
      size: 8,
      minPx: 14,
      place: (i, ctx, out) => {
        const head = i < BLOCK_N;
        const k = head ? i : i - BLOCK_N;
        const x = head ? lerp(XOAI_MUT[0] + 200, XOAI_MUT[0] - 40, smoothstep(0.1, 0.9, close(ctx))) + k * 7 : lerp(RACH_GAM[0] - 220, RACH_GAM[0] + 20, smoothstep(0.1, 0.9, close(ctx))) - k * 7;
        out.set(x, WATER + 1.2, mid(x) + (k % 3 - 1) * 16);
        return smoothstep(0.05, 0.25, close(ctx)) * (0.85 + 0.15 * Math.sin(ctx.time * 2.6 + i));
      },
      visible: () => clock.near("rach-gam"),
    }),
  );
  world.add(
    createFires({
      sites: [-120, -60, 40, 100].flatMap((x, k) => [1, -1].map((s, j) => ({ x, z: mid(x) + s * 74, y: ground(x, mid(x) + s * 74) + 1, order: (k * 2 + j) / 8, size: 1.5 }))),
      lit: (ctx) => clock.near("rach-gam") * smoothstep(0.2, 1, close(ctx)),
      size: 4.5,
      glow: () => 0.8,
    }),
  );

  // 4. "bo-chay": đốm ngà (Nguyễn Ánh) rời sông về phía đông ra mép bản đồ (hướng các đảo ngoài khơi); vài chấm sáng còn lại của đoàn thuyền Xiêm
  //    quay về phía tây (diễn hoạ).
  const BC = 24;
  const bc = run("bo-chay", BC);
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 11,
      minPx: 16,
      place: (_, ctx, out) => {
        const t = smoothstep(0.05, 0.95, bc());
        const x = lerp(80, 440, t);
        out.set(x, WATER + 2.5, mid(x) + 6 * Math.sin(t * 8));
        return 0.9 * (0.85 + 0.15 * Math.sin(ctx.time * 2.4)) * (1 - smoothstep(0.9, 1, bc()));
      },
      visible: () => clock.near("bo-chay"),
    }),
  );
  world.add(
    createGlows({
      count: 7,
      color: PALE,
      size: 5,
      minPx: 10,
      place: (i, ctx, out) => {
        const t = smoothstep(0.1 + i * 0.02, 0.98, bc());
        const x = lerp(30 - i * 10, -440, t);
        out.set(x, WATER + 1.2, mid(x) + ((i % 3) - 1) * 14);
        return (0.5 + 0.3 * Math.sin(ctx.time * 2 + i)) * (1 - smoothstep(0.9, 1, t));
      },
      visible: () => clock.near("bo-chay"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 92,
      groups: [{ path: shuttle([[CU_LAO[0] - 80, mid(CU_LAO[0]) + 70], [CU_LAO[0] + 120, mid(CU_LAO[0] + 120) + 66]], 2), count: 36, spread: [30, 14], color: SON }],
      progress: bc,
      visible: () => clock.near("bo-chay"),
    }),
  );

  // 5. "ket": khi trận đã yên, lửa trại sáng dần dọc hai bờ; người dân (đất) đi lại ven sông và chợ Mỹ Tho (diễn hoạ).
  const KT = 22;
  const kt = run("ket", KT);
  world.add(
    createFires({
      sites: Array.from({ length: 10 }, (_, i) => {
        const x = -150 + i * 55;
        const side = i % 2 === 0 ? -1 : 1;
        const z = mid(x) + side * 72;
        return { x, y: ground(x, z) + 1, z, order: i / 10, size: 1.4 };
      }),
      lit: () => clock.near("ket") * smoothstep(0.1, 0.9, kt()),
      size: 4,
      glow: () => 0.9,
    }),
  );
  world.add(
    createCrowd({
      size: 4,
      height: ground,
      seed: 93,
      groups: [
        { path: shuttle([[MY_THO[0] - 40, MY_THO[1] + 10], [MY_THO[0] + 60, MY_THO[1] - 10]], 3), count: 22, spread: [24, 12], color: EARTH },
        { path: shuttle([[-60, mid(-60) - 66], [60, mid(60) - 70]], 3), count: 16, spread: [20, 10], color: EARTH, timing: [[0.1, 0], [1, 1]] },
      ],
      progress: kt,
      visible: () => clock.near("ket"),
    }),
  );
};

export default setup;
