import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BA_DINH, BOUNDS, DONG_BIEN, DUONG_PHAP, DUONG_RUT, LANG_BA, LUY, MA_CAO, THANH_HOA, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Căn cứ Ba Đình — cảnh CÁCH ĐIỆU. Người = chấm dáng người, nhân vật = đốm sáng; không vẽ luỹ, hào, đồn, súng, trang phục, cờ, vũ khí. Vị trí ba làng, Đồng Biên, Mã Cao, Thanh Hoá và hướng đi
// là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = nghĩa quân; xanh navy = quân Pháp; ngà, vàng, trắng xám = ba thủ lĩnh (đốm sáng); cam = lửa.

const SON = "#a83a24";
const NAVY = "#2f4f7a";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";
const ENVOY = "#d6dce6";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["dong-bien", "chien-luy", "vay-ham", "mat-ba-dinh", "sau-do"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BA_DINH, 100], [DONG_BIEN, 45], [MA_CAO, 45], [THANH_HOA, 50]];

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
    counts: { trees: 480, bushes: 600, grass: 3000, reeds: 1300 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1.0 },
    seed: 1886,
  });

  // 1. "dong-bien": người (son) từ nhiều ngả tụ về Đồng Biên; ba đốm sáng (ngà, vàng, trắng xám — ba thủ lĩnh) ở đó rồi cùng đi về phía đông tới Ba Đình; lửa trại sáng ở Đồng Biên (diễn hoạ).
  const DB = 28;
  const db = run("dong-bien", DB);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1101,
      groups: [
        { path: [[DONG_BIEN[0] - 120, DONG_BIEN[1] + 80], mid([DONG_BIEN[0] - 120, DONG_BIEN[1] + 80], DONG_BIEN), ring(DONG_BIEN, 16, 2.4)], count: 24, spread: [30, 44], color: SON, timing: [[0.03, 0], [0.4, 1]] },
        { path: [[DONG_BIEN[0] - 40, DONG_BIEN[1] - 190], [DONG_BIEN[0] - 20, DONG_BIEN[1] - 90], ring(DONG_BIEN, 18, 4.6)], count: 22, spread: [30, 44], color: SON, timing: [[0.06, 0], [0.45, 1]] },
        { path: [[DONG_BIEN[0] + 120, DONG_BIEN[1] - 40], mid([DONG_BIEN[0] + 120, DONG_BIEN[1] - 40], DONG_BIEN), ring(DONG_BIEN, 14, 0.5)], count: 20, spread: [30, 44], color: SON, timing: [[0.08, 0], [0.5, 1]] },
        { path: [DONG_BIEN, mid(DONG_BIEN, BA_DINH), ring(BA_DINH, 18, 3.3)], count: 44, spread: [30, 60], color: SON, timing: [[0.55, 0], [1, 1]], show: [0.5, 2] },
      ],
      progress: db,
      visible: () => clock.near("dong-bien"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 5,
      groups: [IVORY, GOLD, ENVOY].map((color, i) => ({ path: [ring(DONG_BIEN, 6 + i * 3, i * 2.1), mid(DONG_BIEN, BA_DINH), ring(BA_DINH, 12 + i * 5, 3.3 + i * 0.4)] as Pt[], count: 1, color, size: 1.4, timing: [[0.35 + i * 0.02, 0], [1, 1]] as [number, number][], show: [0.3, 2] as [number, number] })),
      progress: db,
      visible: () => clock.near("dong-bien"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 5 }, (_, i) => {
        const [x, z] = ring(DONG_BIEN, 26 + (i % 2) * 10, (i / 5) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.4 };
      }),
      lit: () => clock.near("dong-bien") * smoothstep(0.1, 0.6, db()),
      size: 3.4,
      glow: () => 0.85,
    }),
  );

  // 2. "chien-luy": người xem kéo thanh — người (son) dàn dần dọc vòng luỹ quanh ba làng, lửa sáng ở mỗi làng và dọc vòng; nhóm người (son) ở giữa (diễn hoạ — không vẽ luỹ, hào, chông).
  const build = (ctx: FrameCtx) => clamp((ctx.inputs["dung-luy"] ?? 0) / 0.9);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 1102,
      groups: [
        { path: LUY, count: 110, color: SON, drop: true },
        { path: [ring(BA_DINH, 16, 0.4), ring(BA_DINH, 18, 0.45)], count: 40, spread: [60, 40], color: SON },
      ],
      progress: (ctx) => 0.04 + 0.96 * build(ctx),
      visible: () => clock.near("chien-luy"),
    }),
  );
  world.add(
    createFires({
      sites: [...LANG_BA.map(([x, z], i) => ({ x, y: height(x, z) + 1, z, order: i * 0.1, size: 1.6 })), ...LUY.slice(0, 7).map(([x, z], i) => ({ x, y: height(x, z) + 1, z, order: 0.3 + (i / 7) * 0.65, size: 1.2 }))],
      lit: (ctx) => clock.near("chien-luy") * smoothstep(0.02, 0.95, build(ctx)),
      size: 3.2,
      glow: () => 0.8,
    }),
  );

  // 3. "vay-ham": nghĩa quân (son) ở trong vòng luỹ; các đoàn (navy) từ Thanh Hoá tiến lên rồi tản thành vòng vây khép dần quanh ba làng; lửa trong căn cứ bập bùng (diễn hoạ — không vẽ trận đánh).
  const VH = 34;
  const vh = run("vay-ham", VH);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 1103,
      groups: [
        { path: [ring(BA_DINH, 16, 0.4), ring(BA_DINH, 18, 0.45)], count: 60, spread: [70, 50], color: SON },
        { path: DUONG_PHAP, count: 60, spread: [30, 80], color: NAVY, timing: [[0.03, 0], [0.3, 1]] },
        ...[0.3, 1.5, 3.2, 4.6].map((a, i) => ({ path: [ring(BA_DINH, 260, a), ring(BA_DINH, 170, a), ring(BA_DINH, 125, a)] as Pt[], count: 20, spread: [26, 44] as [number, number], color: NAVY, timing: [[0.2 + i * 0.05, 0], [0.9, 1]] as [number, number][], show: [0.16, 2] as [number, number] })),
      ],
      progress: vh,
      visible: () => clock.near("vay-ham"),
    }),
  );
  world.add(
    createFires({
      sites: [...LANG_BA.map(([x, z], i) => ({ x, y: height(x, z) + 1, z, order: i * 0.1, size: 1.6 })), ...LUY.slice(0, 7).map(([x, z], i) => ({ x, y: height(x, z) + 1, z, order: 0.1 + (i / 7) * 0.4, size: 1.2 }))],
      lit: () => clock.near("vay-ham") * (0.65 + 0.35 * smoothstep(0.2, 0.9, vh())),
      size: 3.2,
      glow: () => 0.85,
    }),
  );

  // 4. "mat-ba-dinh": các đoàn (navy) tiến vào giữa ba làng; lửa lớn bừng lên; nhóm (son) phá vây, đi về phía tây nam theo đường rút tới Mã Cao; lửa sáng ở Mã Cao rồi bừng lên (diễn hoạ).
  const MB = 30;
  const mb = run("mat-ba-dinh", MB);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 1104,
      groups: [
        ...[0.3, 1.5, 3.2, 4.6].map((a) => ({ path: [ring(BA_DINH, 125, a), ring(BA_DINH, 60, a), ring(BA_DINH, 10, a)] as Pt[], count: 20, spread: [26, 44] as [number, number], color: NAVY, timing: [[0.08, 0], [0.5, 1]] as [number, number][] })),
        { path: [ring(BA_DINH, 16, 0.4), ...DUONG_RUT], count: 70, spread: [30, 70], color: SON, timing: [[0.3, 0], [0.95, 1]] },
      ],
      progress: mb,
      visible: () => clock.near("mat-ba-dinh"),
    }),
  );
  world.add(
    createFires({
      sites: [
        ...LANG_BA.map(([x, z], i) => ({ x, y: height(x, z) + 1, z, order: 0.15 + i * 0.1, size: 2 })),
        ...Array.from({ length: 4 }, (_, i) => {
          const [x, z] = ring(MA_CAO, 24, (i / 4) * Math.PI * 2 + 0.4);
          return { x, y: height(x, z) + 1, z, order: 0.7 + i * 0.07, size: 1.5 };
        }),
      ],
      lit: () => clock.near("mat-ba-dinh") * smoothstep(0.1, 0.9, mb()),
      size: 3.8,
      glow: () => 0.9,
    }),
  );

  // 5. "sau-do": ba đốm sáng (ngà, vàng, trắng xám — ba thủ lĩnh) lần lượt mờ đi ở những chỗ khác nhau (một ở Mã Cao, một ở căn cứ, một đi về phía nam tới mép bản đồ); lửa lụi dần; còn lại một quầng vàng
  //    nhẹ ở Ba Đình (diễn hoạ — không vẽ cảnh bắt giữ hay cái chết).
  const SD = 32;
  const sd = run("sau-do", SD);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 5,
      groups: [
        { path: [ring(MA_CAO, 10, 0.5), ring(MA_CAO, 14, 0.7)], count: 1, color: IVORY, size: 1.4, show: [-1, 0.45] },
        { path: [[-120, 40], [-60, 30], ring(BA_DINH, 20, 3.0)], count: 1, color: ENVOY, size: 1.4, timing: [[0.05, 0], [0.35, 1]], show: [-1, 0.6] },
        { path: [ring(MA_CAO, 20, 2.4), [-250, -250], [-190, -330], [-170, -430]], count: 1, color: GOLD, size: 1.4, timing: [[0.1, 0], [0.8, 1]], show: [-1, 0.9] },
      ],
      progress: sd,
      visible: () => clock.near("sau-do"),
    }),
  );
  world.add(
    createFires({
      sites: [
        ...LANG_BA.map(([x, z], i) => ({ x, y: height(x, z) + 1, z, order: i / 7, size: 1.6 })),
        ...Array.from({ length: 4 }, (_, i) => {
          const [x, z] = ring(MA_CAO, 24, (i / 4) * Math.PI * 2 + 0.4);
          return { x, y: height(x, z) + 1, z, order: (3 + i) / 7, size: 1.4 };
        }),
      ],
      lit: () => clock.near("sau-do") * (1 - 0.9 * smoothstep(0.15, 0.9, sd())),
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
        out.set(BA_DINH[0], ground(BA_DINH[0], BA_DINH[1]) + 8, BA_DINH[1]);
        return 0.55 * smoothstep(0.65, 1, sd()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7));
      },
      visible: () => clock.near("sau-do"),
    }),
  );
};

export default setup;
