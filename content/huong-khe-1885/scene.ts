import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, DON_NU, HA_TINH, LUA, NGHE_AN, TAN_SO, VU_QUANG, WATER, bankDist, colorize, height } from "./terrain";

type Pt = [number, number];

// Khởi nghĩa Hương Khê — cảnh CÁCH ĐIỆU. Người = chấm dáng người, nhân vật = đốm sáng; không vẽ đồn, súng, kè gỗ, trang phục, cờ, vũ khí. Vị trí Vụ Quang, tỉnh lỵ, Nghệ An, đồn Nu,
// Tân Sở và hướng đi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = nghĩa quân; xanh navy = quân Pháp; ngà = Phan Đình Phùng; vàng = Cao Thắng và ánh sáng tượng trưng; trắng xám = lệnh từ triều đình.

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
  const clock = createBeatClock(world, ["giao-viec", "chuan-bi", "mo-rong", "cao-thang", "vay-ep"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[VU_QUANG, 60], [HA_TINH, 45], [NGHE_AN, 40], [DON_NU, 35], [TAN_SO, 50]];

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
    counts: { trees: 700, bushes: 600, grass: 3200, reeds: 800 },
    forestAt: 0.5,
    birds: { center: { x: 0, y: 0, z: 60 }, radius: 230 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1.4 },
    seed: 1885,
  });

  // 1. "giao-viec": một đốm trắng xám (lệnh) từ phía nam xa đi dọc bờ về căn cứ rồi mờ đi; người (son) tụ về căn cứ, lửa trại sáng dần; một đốm ngà (Phan Đình Phùng) hiện lên giữa
  //    nhóm người (diễn hoạ — không vẽ văn bản, lễ nghi).
  const GV = 26;
  const gv = run("giao-viec", GV);
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 5,
      groups: [{ path: [TAN_SO, [-250, -200], [-230, -80], [VU_QUANG[0] - 4, VU_QUANG[1] - 20]], count: 1, color: ENVOY, size: 1.4, timing: [[0.03, 0], [0.5, 1]], show: [0, 0.75] }],
      progress: gv,
      visible: () => clock.near("giao-viec"),
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 901,
      groups: [
        { path: [[-120, -120], [-180, -60], ring(VU_QUANG, 18, 0.5)], count: 26, spread: [30, 40], color: SON, timing: [[0.3, 0], [0.85, 1]] },
        { path: [[-120, 80], [-170, 40], ring(VU_QUANG, 22, 2.8)], count: 26, spread: [30, 40], color: SON, timing: [[0.35, 0], [0.9, 1]] },
      ],
      progress: gv,
      visible: () => clock.near("giao-viec"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 16,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(VU_QUANG[0], ground(VU_QUANG[0], VU_QUANG[1]) + 7, VU_QUANG[1]);
        return smoothstep(0.55, 0.8, gv()) * (0.85 + 0.15 * Math.sin(ctx.time * 2));
      },
      visible: () => clock.near("giao-viec"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 5 }, (_, i) => {
        const [x, z] = ring(VU_QUANG, 28 + (i % 2) * 10, (i / 5) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 5, size: 1.4 };
      }),
      lit: () => clock.near("giao-viec") * smoothstep(0.35, 0.9, gv()),
      size: 3.4,
      glow: () => 0.85,
    }),
  );

  // 2. "chuan-bi": người (son) từ đồng bằng rút dần lên núi về căn cứ; một đốm ngà (Phan Đình Phùng) đi từ căn cứ lên phía bắc xa rồi trở về; một đốm vàng (Cao Thắng) ở lại căn cứ;
  //    lửa trại ở căn cứ sáng hơn khi ông trở về (diễn hoạ).
  const CB = 32;
  const cb = run("chuan-bi", CB);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 902,
      groups: [
        { path: [HA_TINH, [40, 60], [-90, 20], ring(VU_QUANG, 26, 0.7)], count: 40, spread: [30, 60], color: SON, timing: [[0.05, 0], [0.5, 1]] },
        { path: [NGHE_AN, [-20, 200], [-140, 80], ring(VU_QUANG, 30, 2.4)], count: 30, spread: [30, 60], color: SON, timing: [[0.1, 0], [0.55, 1]] },
      ],
      progress: cb,
      visible: () => clock.near("chuan-bi"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 5,
      groups: [{ path: [VU_QUANG, [-150, 90], [-60, 230], [20, 380], [-60, 230], [-150, 90], VU_QUANG], count: 1, color: IVORY, size: 1.4, timing: [[0.15, 0], [0.9, 1]] }],
      progress: cb,
      visible: () => clock.near("chuan-bi"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 13,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(VU_QUANG[0] + 18, ground(VU_QUANG[0] + 18, VU_QUANG[1]) + 6, VU_QUANG[1]);
        return 0.8 + 0.2 * Math.sin(ctx.time * 2.1);
      },
      visible: () => clock.near("chuan-bi"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(VU_QUANG, 28 + (i % 2) * 10, (i / 6) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.4 };
      }),
      lit: () => clock.near("chuan-bi") * (0.4 + 0.6 * smoothstep(0.7, 1, cb())),
      size: 3.4,
      glow: () => 0.85,
    }),
  );

  // 3. "mo-rong": người xem kéo thanh — ánh lửa lan từ căn cứ ra các điểm (tỉnh lỵ, Nghệ An, hướng nam, hướng bắc xa, đồn Nu); nhóm nhỏ (son) hiện quanh mỗi điểm (diễn hoạ — không vẽ từng trận).
  const spread = (ctx: FrameCtx) => clamp((ctx.inputs["mo-rong"] ?? 0) / 0.9);
  world.add(
    createFires({
      sites: [
        ...Array.from({ length: 4 }, (_, i) => {
          const [x, z] = ring(VU_QUANG, 28, (i / 4) * Math.PI * 2 + 0.3);
          return { x, y: height(x, z) + 1, z, order: 0, size: 1.5 };
        }),
        ...LUA.map(([x, z], i) => ({ x, y: height(x, z) + 1, z, order: 0.1 + (i / LUA.length) * 0.84, size: 1.6 })),
      ],
      lit: (ctx) => clock.near("mo-rong") * smoothstep(0, 0.95, spread(ctx)),
      size: 3.8,
      glow: () => 0.9,
    }),
  );
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 903,
      groups: LUA.map((l, i) => ({ path: [ring(l, 36, i), ring(l, 10, i + 1)] as Pt[], count: 9, spread: [26, 26] as [number, number], color: SON, show: [0.1 + (i / LUA.length) * 0.8, 2] as [number, number] })),
      progress: spread,
      visible: () => clock.near("mo-rong"),
    }),
  );

  // 4. "cao-thang": đoàn người (son) từ căn cứ đi lên phía bắc tới đồn Nu; một đốm vàng (Cao Thắng) đi đầu rồi mờ đi ở cuối; một nhóm (navy) ở đồn; lửa sáng lên ở đồn (diễn hoạ — không vẽ cảnh đánh,
  //    không vẽ vết thương).
  const CT = 30;
  const ct = run("cao-thang", CT);
  const road: Pt[] = [ring(VU_QUANG, 20, 1.2), [-170, 80], [-150, 170], [DON_NU[0] - 10, DON_NU[1] - 50]];
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 904,
      groups: [
        { path: road, count: 90, spread: [26, 90], color: SON, timing: [[0.05, 0], [0.7, 1]] },
        { path: [ring(DON_NU, 12, 0.5), ring(DON_NU, 14, 0.55)], count: 28, spread: [32, 32], color: NAVY },
      ],
      progress: ct,
      visible: () => clock.near("cao-thang"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 5,
      height: (x, z) => ground(x, z) + 5,
      groups: [{ path: road, count: 1, color: GOLD, size: 1.5, timing: [[0.05, 0.04], [0.7, 1.04]], show: [0, 0.9] }],
      progress: ct,
      visible: () => clock.near("cao-thang"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 4 }, (_, i) => {
        const [x, z] = ring(DON_NU, 26, (i / 4) * Math.PI * 2 + 0.4);
        return { x, y: height(x, z) + 1, z, order: i / 4, size: 1.5 };
      }),
      lit: () => clock.near("cao-thang") * smoothstep(0.55, 0.9, ct()),
      size: 3.6,
      glow: () => 0.9,
    }),
  );

  // 5. "vay-ep": các đoàn người (navy) từ nhiều hướng kéo về, vòng vây khép dần quanh căn cứ; nhóm (son) ở căn cứ nhỏ dần; lửa lụi dần và đốm ngà mờ đi; cuối cùng chỉ còn một đốm ngà rất
  //    nhạt (diễn hoạ — không vẽ cảnh đánh, không vẽ cái chết cụ thể).
  const VE = 34;
  const ve = run("vay-ep", VE);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 905,
      groups: [
        ...[0.2, 1.8, 3.4, 5.0].map((a, i) => ({ path: [ring(VU_QUANG, 320, a), ring(VU_QUANG, 180, a), ring(VU_QUANG, 90, a)] as Pt[], count: 28, spread: [26, 50] as [number, number], color: NAVY, timing: [[0.05 + i * 0.03, 0], [0.85, 1]] as [number, number][] })),
        { path: [ring(VU_QUANG, 16, 0.4), ring(VU_QUANG, 18, 0.45)], count: 50, spread: [40, 40], color: SON, show: [-1, 0.9] },
      ],
      progress: ve,
      visible: () => clock.near("vay-ep"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 6 }, (_, i) => {
        const [x, z] = ring(VU_QUANG, 28 + (i % 2) * 10, (i / 6) * Math.PI * 2 + 0.3);
        return { x, y: height(x, z) + 1, z, order: i / 6, size: 1.4 };
      }),
      lit: () => clock.near("vay-ep") * (1 - 0.9 * smoothstep(0.3, 0.9, ve())),
      size: 3.4,
      glow: () => 0.85,
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: IVORY,
      size: 15,
      minPx: 18,
      place: (_, ctx, out) => {
        out.set(VU_QUANG[0], ground(VU_QUANG[0], VU_QUANG[1]) + 7, VU_QUANG[1]);
        return (0.12 + 0.88 * (1 - smoothstep(0.55, 0.9, ve()))) * (0.85 + 0.15 * Math.sin(ctx.time * 1.8));
      },
      visible: () => clock.near("vay-ep"),
    }),
  );
};

export default setup;
