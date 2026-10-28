import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, DON, HA_NOI, LANG, PHON_XUONG, WATER, YEN_THE, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Khởi nghĩa Yên Thế — cảnh CÁCH ĐIỆU. Người = chấm dáng người, nhân vật = đốm sáng; không vẽ đồn luỹ, nhà, trang phục, cờ, vũ khí. Vị trí thung lũng, Phồn Xương, các đồn, Hà Nội
// và hướng đi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = nông dân và nghĩa quân; xanh navy = quân Pháp; vàng = ánh sáng tượng trưng cho thủ lĩnh và căn cứ.

const SON = "#a83a24";
const NAVY = "#2f4f7a";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["yen-the", "nhieu-thu-linh", "hoa-hoan", "phon-xuong", "cuoi-cung"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[YEN_THE, 55], [PHON_XUONG, 40], ...DON.map((d): [Pt, number] => [d, 28]), ...LANG.map((l): [Pt, number] => [l, 28])];

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
    counts: { trees: 640, bushes: 600, grass: 3200, reeds: 700 },
    forestAt: 0.5,
    birds: { center: { x: 0, y: 0, z: 50 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1.2 },
    seed: 1884,
  });

  // 1. "yen-the": người (son) từ các làng ngoài vòng đồi lên thung lũng, tụ thành từng cụm; lửa bếp sáng dần ở các cụm (diễn hoạ).
  const YT = 26;
  const yt = run("yen-the", YT);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 801,
      groups: LANG.map((l, i) => ({ path: [l, mid(l, YEN_THE), ring(YEN_THE, 20 + i * 8, i * 1.7)] as Pt[], count: 16, spread: [30, 44] as [number, number], color: SON, timing: [[0.03 + i * 0.04, 0], [0.7 + i * 0.04, 1]] as [number, number][] })),
      progress: yt,
      visible: () => clock.near("yen-the"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(YEN_THE, 24 + (i % 2) * 14, (i / 6) * Math.PI * 2 + 0.5);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.2 };
      }),
      lit: () => clock.near("yen-the") * smoothstep(0.4, 0.95, yt()),
      size: 3,
      glow: () => 0.8,
    }),
  );

  // 2. "nhieu-thu-linh": vài toán nhỏ (son) đi riêng trên các sườn đồi; một đoàn (navy) từ Hà Nội và các đồn tiến vào; rồi các toán nhỏ quy về một đốm vàng (người lãnh đạo) ở
  //    thung lũng (diễn hoạ — không vẽ trận đánh).
  const NL = 28;
  const nl = run("nhieu-thu-linh", NL);
  const solo: Pt[][] = [
    [[-160, 80], [-110, 40], [-60, 70], [-120, 110]],
    [[110, -40], [70, 20], [120, 70], [150, 10]],
    [[-40, -110], [20, -60], [60, -120], [-10, -150]],
  ];
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 802,
      groups: [
        ...solo.map((p) => ({ path: [...p, YEN_THE] as Pt[], count: 14, spread: [24, 30] as [number, number], color: SON, timing: [[0.05, 0], [0.55, 0.7], [0.9, 1]] as [number, number][], show: [-1, 2] as [number, number] })),
        { path: [HA_NOI, [-200, -150], [-130, -40], [YEN_THE[0] - 50, YEN_THE[1] - 10]], count: 60, spread: [26, 80], color: NAVY, timing: [[0.2, 0], [0.7, 1]], show: [0.16, 0.9] },
      ],
      progress: nl,
      visible: () => clock.near("nhieu-thu-linh"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 16,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(YEN_THE[0], ground(YEN_THE[0], YEN_THE[1]) + 8, YEN_THE[1]);
        return smoothstep(0.55, 0.85, nl()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.8));
      },
      visible: () => clock.near("nhieu-thu-linh"),
    }),
  );

  // 3. "hoa-hoan": một nhóm (navy) từ đồn tiến vào gần thung lũng và dừng ở giữa đường; một nhóm (son) từ thung lũng ra gặp; hai đốm sáng (vàng và vàng nhạt) gặp nhau ở giữa;
  //    sau đó nhóm navy lui về đồn (diễn hoạ — không vẽ lễ giao ước, tiền chuộc).
  const HH = 28;
  const hh = run("hoa-hoan", HH);
  const meet = mid(YEN_THE, DON[0]);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 803,
      groups: [
        { path: [DON[0], mid(DON[0], meet), [meet[0] + 14, meet[1]]], count: 30, spread: [24, 40], color: NAVY, timing: [[0.05, 0], [0.4, 1]] },
        { path: [[meet[0] + 14, meet[1]], mid(DON[0], meet), DON[0]], count: 30, spread: [24, 40], color: NAVY, timing: [[0.65, 0], [1, 1]], show: [0.6, 2] },
        { path: [ring(YEN_THE, 20, 0.2), mid(YEN_THE, meet), [meet[0] - 14, meet[1]]], count: 26, spread: [24, 36], color: SON, timing: [[0.1, 0], [0.45, 1]] },
        { path: [[meet[0] - 14, meet[1]], mid(YEN_THE, meet), ring(YEN_THE, 22, 0.3)], count: 26, spread: [24, 36], color: SON, timing: [[0.65, 0], [1, 1]], show: [0.6, 2] },
      ],
      progress: hh,
      visible: () => clock.near("hoa-hoan"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 16,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(meet[0], ground(meet[0], meet[1]) + 8, meet[1]);
        return smoothstep(0.42, 0.55, hh()) * (1 - smoothstep(0.62, 0.78, hh())) * (0.85 + 0.15 * Math.sin(ctx.time * 2));
      },
      visible: () => clock.near("hoa-hoan"),
    }),
  );

  // 4. "phon-xuong": người xem kéo thanh — người (son) từ các làng tụ về Phồn Xương; lửa sáng quanh căn cứ; một đốm vàng ở giữa (diễn hoạ).
  const gather = (ctx: FrameCtx) => clamp((ctx.inputs["can-cu"] ?? 0) / 0.9);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 804,
      groups: LANG.map((l, i) => ({ path: [l, mid(l, PHON_XUONG), ring(PHON_XUONG, 16 + i * 4, i * 1.6)] as Pt[], count: 22, spread: [30, 50] as [number, number], color: SON })),
      progress: (ctx) => 0.03 + 0.97 * gather(ctx),
      visible: () => clock.near("phon-xuong"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 16,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(PHON_XUONG[0], ground(PHON_XUONG[0], PHON_XUONG[1]) + 8, PHON_XUONG[1]);
        return 0.85 + 0.15 * Math.sin(ctx.time * 1.8);
      },
      visible: () => clock.near("phon-xuong"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 8 }, (_, i) => {
        const [x, z] = ring(PHON_XUONG, 24 + (i % 2) * 12, (i / 8) * Math.PI * 2 + 0.2);
        return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.4 };
      }),
      lit: (ctx) => clock.near("phon-xuong") * smoothstep(0.05, 0.95, gather(ctx)),
      size: 3.4,
      glow: () => 0.85,
    }),
  );

  // 5. "cuoi-cung": các đoàn (navy) từ các đồn và từ Hà Nội kéo vào thung lũng, vòng vây khép dần; người (son) tản ra các hướng; lửa lụi dần và đốm vàng ở Phồn Xương mờ đi;
  //    cuối cùng chỉ còn một quầng vàng nhẹ nơi căn cứ (diễn hoạ — không vẽ cảnh một người cụ thể).
  const CC = 32;
  const cc = run("cuoi-cung", CC);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 805,
      groups: [
        ...DON.map((d, i) => ({ path: [d, mid(d, YEN_THE), ring(YEN_THE, 60, i * 1.6 + 0.4)] as Pt[], count: 24, spread: [26, 50] as [number, number], color: NAVY, timing: [[0.05 + i * 0.03, 0], [0.7, 1]] as [number, number][] })),
        { path: [HA_NOI, [-200, -150], [-130, -40], ring(YEN_THE, 70, 3.5)], count: 40, spread: [26, 80], color: NAVY, timing: [[0.05, 0], [0.75, 1]] },
        ...LANG.map((l, i) => ({ path: [ring(PHON_XUONG, 24, i * 1.5), mid(PHON_XUONG, l), l] as Pt[], count: 8, spread: [26, 30] as [number, number], color: SON, timing: [[0.3, 0], [0.9, 1]] as [number, number][], show: [-1, 1.1] as [number, number] })),
      ],
      progress: cc,
      visible: () => clock.near("cuoi-cung"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 8 }, (_, i) => {
        const [x, z] = ring(PHON_XUONG, 24 + (i % 2) * 12, (i / 8) * Math.PI * 2 + 0.2);
        return { x, y: height(x, z) + 1, z, order: i / 8, size: 1.4 };
      }),
      lit: () => clock.near("cuoi-cung") * (1 - 0.9 * smoothstep(0.4, 0.95, cc())),
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
        out.set(PHON_XUONG[0], ground(PHON_XUONG[0], PHON_XUONG[1]) + 8, PHON_XUONG[1]);
        const k = (1 - smoothstep(0.35, 0.65, cc())) + 0.45 * smoothstep(0.8, 1, cc());
        return clamp(k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.8));
      },
      visible: () => clock.near("cuoi-cung"),
    }),
  );
};

export default setup;
