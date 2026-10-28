import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BAI_SAY, BOUNDS, CAU_DUONG, HAI_DUONG, HA_NOI, HUYEN, KE_SAT, TRAI_SON, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Khởi nghĩa Bãi Sậy — cảnh CÁCH ĐIỆU. Người = chấm dáng người, nhân vật = đốm sáng; không vẽ đồn, nhà, súng, trang phục, cờ, vũ khí. Vị trí Bãi Sậy, Hà Nội, Hải Dương, Trại Sơn, các huyện
// và hướng đi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = nghĩa quân; xanh navy = quân Pháp; ngà = thủ lĩnh; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NAVY = "#2f4f7a";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["mo-quan", "can-cu", "tap-kich", "tuan-canh", "tan-ra"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BAI_SAY, 55], [HA_NOI, 55], [HAI_DUONG, 45], [TRAI_SON, 45], [CAU_DUONG, 28], [KE_SAT, 28], ...HUYEN.map((h): [Pt, number] => [h, 28])];

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
    counts: { trees: 280, bushes: 600, grass: 3000, reeds: 1500 },
    forestAt: 0.64,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.5 },
    seed: 1883,
  });

  // 1. "mo-quan": người (son) từ nhiều ngả tụ về một chỗ ở giữa vùng; một đốm ngà (Nguyễn Thiện Thuật) ở đó; một nhóm đi về phía bắc rồi quay lại, không tới Hà Nội; lửa trại sáng dần (diễn hoạ).
  const MQ = 26;
  const mq = run("mo-quan", MQ);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1001,
      groups: [
        { path: [[-170, -60], [-90, -20], ring(BAI_SAY, 22, 3.4)], count: 24, spread: [30, 44], color: SON, timing: [[0.03, 0], [0.5, 1]] },
        { path: [[150, -90], [80, -30], ring(BAI_SAY, 24, 5.5)], count: 22, spread: [30, 44], color: SON, timing: [[0.06, 0], [0.55, 1]] },
        { path: [[30, 190], [14, 90], ring(BAI_SAY, 20, 1.5)], count: 22, spread: [30, 44], color: SON, timing: [[0.08, 0], [0.6, 1]] },
        { path: [ring(BAI_SAY, 14, 0.2), [10, 120], [-30, 200], [10, 120], ring(BAI_SAY, 14, 0.2)], count: 14, spread: [24, 30], color: SON, timing: [[0.5, 0], [1, 1]], show: [0.46, 2] },
      ],
      progress: mq,
      visible: () => clock.near("mo-quan"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 15,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(BAI_SAY[0], ground(BAI_SAY[0], BAI_SAY[1]) + 7, BAI_SAY[1]);
        return smoothstep(0.35, 0.6, mq()) * (0.85 + 0.15 * Math.sin(ctx.time * 2));
      },
      visible: () => clock.near("mo-quan"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 5 }, (_, i) => {
        const [x, z] = ring(BAI_SAY, 28 + (i % 2) * 10, (i / 5) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.4 };
      }),
      lit: () => clock.near("mo-quan") * smoothstep(0.4, 0.9, mq()),
      size: 3.4,
      glow: () => 0.85,
    }),
  );

  // 2. "can-cu": người xem kéo thanh — nghĩa quân (son) từ căn cứ lan ra các huyện, lửa sáng ở mỗi nơi; đốm ngà đứng giữa căn cứ (diễn hoạ).
  const fan = (ctx: FrameCtx) => clamp((ctx.inputs["lan-ra"] ?? 0) / 0.9);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1002,
      groups: HUYEN.map((h, i) => ({ path: [ring(BAI_SAY, 20, i * 1.6), mid(BAI_SAY, h), ring(h, 10, i)] as Pt[], count: 22, spread: [26, 46] as [number, number], color: SON })),
      progress: (ctx) => 0.03 + 0.97 * fan(ctx),
      visible: () => clock.near("can-cu"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 15,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(BAI_SAY[0], ground(BAI_SAY[0], BAI_SAY[1]) + 7, BAI_SAY[1]);
        return 0.85 + 0.15 * Math.sin(ctx.time * 2);
      },
      visible: () => clock.near("can-cu"),
    }),
  );
  world.add(
    createFires({
      sites: [...Array.from({ length: 3 }, (_, i) => {
        const [x, z] = ring(BAI_SAY, 26, (i / 3) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: 0, size: 1.4 };
      }), ...HUYEN.map(([x, z], i) => ({ x: x + 12, y: height(x + 12, z) + 1, z, order: 0.1 + (i / HUYEN.length) * 0.8, size: 1.5 }))],
      lit: (ctx) => clock.near("can-cu") * smoothstep(0, 0.95, fan(ctx)),
      size: 3.6,
      glow: () => 0.85,
    }),
  );

  // 3. "tap-kich": ban đêm, các nhóm (son) từ căn cứ đi về phía bắc, vượt sông, tới gần Hà Nội, và về phía đông bắc tới Hải Dương; lửa sáng lên ở các điểm tập kích (Cầu Đuống, Kẻ Sặt, Hải Dương);
  //    nhóm (navy) ở Hà Nội và Hải Dương đứng yên (diễn hoạ — không vẽ trận đánh cụ thể).
  const TK = 30;
  const tk = run("tap-kich", TK);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1003,
      groups: [
        { path: [ring(BAI_SAY, 20, 1.6), [-30, 90], [-110, 200], ring(CAU_DUONG, 20, 4.2)], count: 36, spread: [26, 50], color: SON, timing: [[0.05, 0], [0.55, 1]] },
        { path: [ring(BAI_SAY, 20, 0.7), mid(BAI_SAY, KE_SAT), ring(KE_SAT, 14, 3.5)], count: 28, spread: [24, 40], color: SON, timing: [[0.2, 0], [0.7, 1]], show: [0.16, 2] },
        { path: [ring(KE_SAT, 14, 0.4), mid(KE_SAT, HAI_DUONG), ring(HAI_DUONG, 20, 4.0)], count: 28, spread: [24, 40], color: SON, timing: [[0.45, 0], [0.95, 1]], show: [0.4, 2] },
        { path: [ring(HA_NOI, 14, 5.0), ring(HA_NOI, 16, 5.05)], count: 20, spread: [34, 34], color: NAVY },
        { path: [ring(HAI_DUONG, 12, 1.0), ring(HAI_DUONG, 14, 1.05)], count: 20, spread: [30, 30], color: NAVY },
      ],
      progress: tk,
      visible: () => clock.near("tap-kich"),
    }),
  );
  world.add(
    createFires({
      sites: [CAU_DUONG, KE_SAT, HAI_DUONG].map(([x, z], i) => ({ x: x + 16, y: height(x + 16, z) + 1, z, order: 0.25 + i * 0.25, size: 1.6 })),
      lit: () => clock.near("tap-kich") * smoothstep(0.3, 0.9, tk()),
      size: 3.8,
      glow: () => 0.95,
    }),
  );

  // 4. "tuan-canh": một đoàn người (navy) từ phía bắc đi xuống, vây dần quanh Trại Sơn; nhóm (son) ở Trại Sơn; lửa quanh trại sáng lên rồi lụi dần (diễn hoạ — không vẽ cảnh đánh).
  const TC = 30;
  const tc = run("tuan-canh", TC);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 1004,
      groups: [
        { path: [ring(TRAI_SON, 14, 0.5), ring(TRAI_SON, 16, 0.55)], count: 40, spread: [40, 40], color: SON },
        ...[0.3, 1.9, 3.6, 5.2].map((a, i) => ({ path: [ring(TRAI_SON, 240, a), ring(TRAI_SON, 130, a), ring(TRAI_SON, 60, a)] as Pt[], count: 22, spread: [24, 50] as [number, number], color: NAVY, timing: [[0.05 + i * 0.04, 0], [0.75, 1]] as [number, number][] })),
      ],
      progress: tc,
      visible: () => clock.near("tuan-canh"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(TRAI_SON, 32 + (i % 2) * 10, (i / 6) * Math.PI * 2 + 0.2);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.4 };
      }),
      lit: () => clock.near("tuan-canh") * smoothstep(0.1, 0.5, tc()) * (1 - 0.6 * smoothstep(0.75, 1, tc())),
      size: 3.4,
      glow: () => 0.85,
    }),
  );

  // 5. "tan-ra": người (son) từ căn cứ tản ra các hướng và mờ dần; một đốm ngà đi về phía tây rồi ra mép bản đồ; lửa lụi dần; còn lại một quầng vàng nhẹ ở căn cứ (diễn hoạ).
  const TR = 32;
  const tr = run("tan-ra", TR);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1005,
      groups: [0.4, 1.9, 3.5, 5.0].map((a, i) => ({ path: [ring(BAI_SAY, 18, a), ring(BAI_SAY, 120, a), ring(BAI_SAY, 220, a)] as Pt[], count: 14, spread: [26, 40] as [number, number], color: SON, timing: [[0.1 + i * 0.05, 0], [0.9, 1]] as [number, number][], show: [-1, 1.05] as [number, number] })),
      progress: tr,
      visible: () => clock.near("tan-ra"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 5,
      groups: [{ path: [ring(BAI_SAY, 16, 3.2), [-150, -10], [-260, -30], [-380, -40]], count: 1, color: IVORY, size: 1.4, timing: [[0.1, 0], [0.8, 1]], show: [-1, 0.92] }],
      progress: tr,
      visible: () => clock.near("tan-ra"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(BAI_SAY, 28 + (i % 2) * 10, (i / 6) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.4 };
      }),
      lit: () => clock.near("tan-ra") * (1 - 0.9 * smoothstep(0.2, 0.9, tr())),
      size: 3.4,
      glow: () => 0.8,
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 18,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(BAI_SAY[0], ground(BAI_SAY[0], BAI_SAY[1]) + 8, BAI_SAY[1]);
        return 0.5 * smoothstep(0.7, 1, tr()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7));
      },
      visible: () => clock.near("tan-ra"),
    }),
  );
};

export default setup;
