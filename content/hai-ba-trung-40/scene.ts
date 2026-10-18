import { clamp, mulberry32, smoothstep } from "@/core/engine/math";
import type { SceneSetup } from "@/core/engine/world";
import { createMist, createRanges, createSmoke } from "@/core/world/atmosphere";
import { createBeatClock } from "@/core/world/beat-clock";
import { createBirds } from "@/core/world/birds";
import { cameraClearance } from "@/core/world/clearance";
import { createCrowd } from "@/core/world/crowd";
import { createDust } from "@/core/world/dust";
import { createFires, type FireSite } from "@/core/world/fire";
import { createFoliage } from "@/core/world/foliage";
import { createGrass } from "@/core/world/grass";
import { createProps, scatter } from "@/core/world/props";
import { createRocks } from "@/core/world/rocks";
import { createHeightTexture, createTerrain, fbm2 } from "@/core/world/terrain";
import { createWater } from "@/core/world/water";
import { CAM_KHE, CHU_DIEN_ROAD, FLEE_ROAD, HAMLETS, HAT_BANK, HAT_WATER, LAC_VILLAGE, LANG_BAC, MELINH, NORTH_ROAD, TEMPLES, type XZ } from "./places";
import config from "./scene.config";
import { BOUNDS, colorize, height, ME_LINH, paddyCell, riverZ, WATER } from "./terrain";

/** Số đốm lửa = số thành theo Hậu Hán thư. */
const CITIES = 65;

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const rand = mulberry32(40);
  const { nearCam, clearOfCam } = cameraClearance(config.keyframes);

  // ---- đất & sông ----
  const heightTex = createHeightTexture(height, BOUNDS, q.lite ? 128 : 256);
  await world.yield();
  world.add(createTerrain({ bounds: BOUNDS, segments: q.terrainSeg, height, colorize, wetLevel: () => WATER, cheap: q.cheapShaders }));
  // sông Hồng: nước đỏ phù sa
  world.add(createWater({ heightTex, bounds: BOUNDS, segments: q.waterSeg, level: () => WATER, cheap: q.cheapShaders, sky: () => world.mood, colors: { deep: "#5a3a26", shallow: "#9a7650" } }));
  await world.yield();
  world.add(createDust(q.dust, { x: 0, y: 0, z: 0 }, { x: 260, y: 40, z: 260 }));

  // ---- lửa khởi nghĩa: bùng ở Mê Linh rồi lan ra theo khoảng cách ----
  const BEAT = world.beat("huong-ung");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - BEAT));
    target.lit += (Math.max(0.06, ctx.inputs.rise ?? 0) - target.lit) * w;
  });
  const sites: FireSite[] = [{ x: ME_LINH.x, y: height(ME_LINH.x, ME_LINH.z) + 0.3, z: ME_LINH.z, order: 0, size: 1.6 }];
  for (let i = 0; sites.length < CITIES && i < 6000; i++) {
    const a = rand() * Math.PI * 2;
    const r = 40 + Math.pow(rand(), 0.7) * 300;
    const x = ME_LINH.x + Math.cos(a) * r;
    const z = ME_LINH.z + Math.sin(a) * r;
    const h = height(x, z);
    if (h < 1.5 || h > 60 || nearCam(x, z, 20) || sites.some((s) => (s.x - x) ** 2 + (s.z - z) ** 2 < 30 * 30)) continue;
    sites.push({ x, y: h + 0.3, z, order: (r / 340) * 0.9 + rand() * 0.08, size: 1.4 + r / 200 });
  }
  world.add(
    createFires({
      sites,
      lit: (ctx) => ctx.params.lit,
      size: 1.8,
      // quầng sáng rõ về đêm, nhạt đi khi trời sáng
      glow: (ctx) => 0.35 + smoothstep(1.5, 3, ctx.params.mood) * 0.65,
    }),
  );
  // khói từ những đám lửa lớn gần Mê Linh
  const smoke = createSmoke({ sources: sites.slice(0, 8).map((s) => ({ x: s.x, y: s.y + 2, z: s.z })), height: 26, wind: [1, 0.4], color: "#b8aca0" });
  world.add({
    object: smoke.object,
    update(ctx) {
      smoke.object!.visible = ctx.params.lit > 0.25;
      if (smoke.object!.visible) smoke.update?.(ctx);
    },
  });

  // ---- hoạt cảnh: mỗi phân cảnh có đồng hồ riêng, diễn trong lúc người xem dừng đọc ----
  // Người = chấm dáng người (createCrowd), không vẽ trang phục, cờ hiệu, vũ khí. Hai Bà = hai đốm sáng vàng.
  // Vị trí các nơi là diễn hoạ, xem places.ts.
  const clock = createBeatClock(world, ["nha-han", "me-linh", "khoi-nghia", "trung-vuong", "ma-vien", "hy-sinh", "den-tho"]);
  const INK = "#2a2320"; // quân, quan nhà Hán
  const VIET = "#7a4a22"; // người Việt
  const HAI_BA = "#ffcf6a";
  const ground = (x: number, z: number) => Math.max(height(x, z), WATER);
  const lifted = (dy: number) => (x: number, z: number) => ground(x, z) + dy;
  /** Đường đi của các đoàn người — giữ trống, không rải tre, cây chắn lên. */
  const routes: XZ[][] = [];
  const route = (p: XZ[]) => (routes.push(p), p);
  const pathLen = (p: XZ[]) => p.slice(1).reduce((s, b, i) => s + Math.hypot(b[0] - p[i][0], b[1] - p[i][1]), 0);
  /** Tỉ lệ quãng đường từ đầu tới đỉnh thứ k của đường gấp khúc (để dừng đoàn người ở đó). */
  const frac = (p: XZ[], k: number) => pathLen(p.slice(0, k + 1)) / pathLen(p);
  /** Đứng yên tại chỗ (đường dài nửa mét); đội hình xếp lùi về phía ngược `dir`. */
  const still = ([x, z]: XZ, dir: XZ = [1, 0]): XZ[] => [[x, z], [x + dir[0] * 0.5, z + dir[1] * 0.5]];
  const loop = (e: number, start: number, period: number) => (e < start ? 0 : ((e - start) % period) / period);

  // Dưới ách nhà Hán: quan lại Hán từ phương bắc xuống làng Lạc tướng (một lượt, 6 s); rồi lặp mỗi 10 s,
  // người các xóm mang của cải (đốm vàng nhỏ) tới nộp, quay về; của cải theo vài người Hán đi lên phương bắc.
  const NH_ARRIVE = 6;
  const NH_LOOP = 10;
  const nhLoop = () => loop(clock.elapsed("nha-han"), NH_ARRIVE, NH_LOOP);
  const northAway: XZ[] = [...NORTH_ROAD].reverse();
  world.add(
    createCrowd({
      size: 8,
      height,
      seed: 11,
      groups: [{ path: route(NORTH_ROAD), count: 24, spread: [16, 26], color: INK }],
      progress: () => clamp(clock.elapsed("nha-han") / NH_ARRIVE),
      visible: () => clock.near("nha-han"),
    }),
  );
  world.add(
    createCrowd({
      size: 8,
      height,
      seed: 12,
      groups: [
        { path: still(LAC_VILLAGE, [0, -1]), count: 12, spread: [16, 10], color: VIET },
        ...HAMLETS.map((h) => ({ path: still(h), count: 10, spread: [16, 10] as [number, number], color: VIET })),
        ...HAMLETS.map((h) => ({
          path: route([h, LAC_VILLAGE, h]),
          count: 4,
          spread: [4, 6] as [number, number],
          color: VIET,
          timing: [[0, 0], [0.4, 0.5], [0.55, 0.5], [0.95, 1]] as [number, number][],
        })),
        { path: northAway, count: 5, spread: [4, 10], color: INK, timing: [[0.45, 0], [1, 1]], show: [0.45, 0.97] },
      ],
      progress: nhLoop,
      visible: () => clock.near("nha-han"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 2.5,
      height: lifted(1.6),
      seed: 13,
      groups: HAMLETS.map((h) => {
        const p: XZ[] = [h, ...northAway];
        const a = frac(p, 1);
        return { path: p, count: 1, color: "#ffd27a", timing: [[0, 0], [0.4, a], [0.45, a], [1, 1]] as [number, number][], show: [0.02, 0.97] as [number, number] };
      }),
      progress: nhLoop,
      visible: () => clock.near("nha-han") * clamp((clock.elapsed("nha-han") - NH_ARRIVE) / 0.5),
    }),
  );

  // Con gái Lạc tướng Mê Linh: Hai Bà (hai đốm sáng) hiện lên giữa người Mê Linh; nhà trai từ Chu Diên
  // (Thi Sách đi đầu, chấm son) dọc bờ sông tới Mê Linh. Một lượt, ~12 s.
  const ML_TRIP = 10;
  world.add(
    createCrowd({
      size: 7,
      height,
      seed: 21,
      groups: [
        { path: still([MELINH[0] - 6, MELINH[1] + 4]), count: 22, spread: [26, 18], color: VIET },
        { path: route(CHU_DIEN_ROAD), count: 9, spread: [6, 14], color: VIET, timing: [[0, -0.03], [1, 0.96]] },
        { path: CHU_DIEN_ROAD, count: 1, color: "#b8322a", size: 1.4 },
      ],
      progress: () => clamp((clock.elapsed("me-linh") - 2) / ML_TRIP),
      visible: () => clock.near("me-linh"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 3,
      height: lifted(1.4),
      groups: [{ path: still([MELINH[0] - 3, MELINH[1] + 2]), count: 2, spread: [5, 0], color: HAI_BA }],
      progress: () => 0,
      visible: () => clock.near("me-linh") * smoothstep(0.5, 2.5, clock.elapsed("me-linh")),
    }),
  );

  // Dựng cờ khởi nghĩa: người bốn phía kéo về Mê Linh quanh Hai Bà, rồi cả đoàn tiến về thành Tô Định;
  // Tô Định cùng quân Hán bỏ thành chạy lên phương bắc. Một lượt, 16 s, giữ trạng thái cuối.
  const KN = 16;
  const knProgress = () => clamp(clock.elapsed("khoi-nghia") / KN);
  // Hướng các nhóm kéo về là diễn hoạ (lời kể không nói).
  const rally: { from: XZ; via: XZ; to: XZ }[] = [
    { from: [-40, 100], via: [-6, 30], to: [168, 34] },
    { from: [80, 110], via: [8, 30], to: [168, 8] },
    { from: [-60, -10], via: [-10, 12], to: [152, 42] },
    { from: [50, -40], via: [8, 10], to: [152, 0] },
  ];
  world.add(
    createCrowd({
      size: 7,
      height,
      seed: 31,
      groups: [
        { path: route(FLEE_ROAD), count: 28, spread: [18, 14], color: INK, timing: [[0.55, 0], [1, 1]], show: [0, 0.97] },
        ...rally.map(({ from, via, to }) => {
          const p = route([from, via, to]);
          const a = frac(p, 1);
          return { path: p, count: 18, spread: [12, 12] as [number, number], color: VIET, timing: [[0, 0], [0.3, a], [0.42, a], [0.85, 1]] as [number, number][] };
        }),
      ],
      progress: knProgress,
      visible: () => clock.near("khoi-nghia"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 3,
      height: lifted(1.4),
      groups: [{ path: [[MELINH[0] + 2, MELINH[1] + 2], [180, 20]], count: 2, spread: [5, 0], color: HAI_BA, timing: [[0.42, 0], [0.85, 1]] }],
      progress: knProgress,
      visible: () => clock.near("khoi-nghia") * smoothstep(0, 1.5, clock.elapsed("khoi-nghia")),
    }),
  );

  // Trưng Vương: từ các nơi đã nổi lửa (đốm lửa xa), từng đoàn người kéo về Mê Linh — kinh đô; khi đã tụ đủ,
  // một quầng sáng lớn toả lên quanh Hai Bà. Một lượt, 13 s. (Đoàn người về kinh đô là diễn hoạ.)
  const TV = 13;
  const envoys: XZ[][] = [];
  for (let k = 0; k < 9; k++) {
    const want = (k / 9) * Math.PI * 2;
    let best: FireSite | null = null;
    let bestD = 0.5;
    for (const s of sites.slice(1)) {
      const r = Math.hypot(s.x - ME_LINH.x, s.z - ME_LINH.z);
      if (r < 140 || s.z < riverZ(s.x) + 40) continue;
      const d = Math.abs(((Math.atan2(s.z - ME_LINH.z, s.x - ME_LINH.x) - want + Math.PI * 3) % (Math.PI * 2)) - Math.PI);
      if (d < bestD) [best, bestD] = [s, d];
    }
    if (!best) continue;
    const a = Math.atan2(best.z - ME_LINH.z, best.x - ME_LINH.x);
    envoys.push(route([[best.x, best.z], [ME_LINH.x + Math.cos(a) * 24, ME_LINH.z + Math.sin(a) * 24]]));
  }
  world.add(
    createCrowd({
      size: 7,
      height,
      seed: 41,
      groups: [
        { path: still([MELINH[0] - 4, MELINH[1] + 6]), count: 16, spread: [14, 10], color: VIET },
        ...envoys.map((p, i) => ({ path: p, count: 12, spread: [8, 14] as [number, number], color: VIET, timing: [[i * 0.035, 0], [i * 0.035 + 0.62, 1]] as [number, number][] })),
      ],
      progress: () => clamp(clock.elapsed("trung-vuong") / TV),
      visible: () => clock.near("trung-vuong"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 3,
      height: lifted(1.4),
      groups: [
        { path: still(MELINH), count: 2, spread: [5, 0], color: HAI_BA },
        { path: still(MELINH), count: 1, color: HAI_BA, size: 5, show: [0.72, 2] },
      ],
      progress: () => clamp(clock.elapsed("trung-vuong") / TV),
      visible: () => clock.near("trung-vuong"),
    }),
  );

  // Mã Viện sang: quân Hán từ phía đông bắc kéo tới Lãng Bạc; quân Hai Bà từ Mê Linh ra đón đánh, hai bên
  // cùng ngã nhiều; rồi quân Hai Bà lui về Cấm Khê (chân Ba Vì). Một lượt, 20 s, giữ trạng thái cuối.
  // Hướng quân Hán tới là diễn hoạ (Hậu Hán thư chép Mã Viện theo ven biển mà tiến).
  const MV = 20;
  const mvProgress = () => clamp(clock.elapsed("ma-vien") / MV);
  const clash = () => smoothstep(0.33, 0.6, mvProgress());
  const HAN_ROAD = route([[370, 150], [280, 60], [200, -10], [LANG_BAC[0] + 18, LANG_BAC[1] + 2]]);
  const retreat = route([[MELINH[0] + 10, MELINH[1] - 4], [LANG_BAC[0] - 18, LANG_BAC[1]], [40, 10], [-100, 22], CAM_KHE]);
  const retreatTiming: [number, number][] = [[0.02, 0], [0.33, frac(retreat, 1)], [0.6, frac(retreat, 1)], [1, 1]];
  world.add(
    createCrowd({
      size: 7,
      height,
      seed: 51,
      groups: [{ path: HAN_ROAD, count: 160, spread: [44, 40], color: INK, mortal: true, timing: [[0, 0], [0.33, 1]] }],
      progress: mvProgress,
      fall: () => 0.22 * clash(),
      visible: () => clock.near("ma-vien"),
    }),
  );
  world.add(
    createCrowd({
      size: 7,
      height,
      seed: 52,
      groups: [{ path: retreat, count: 130, spread: [40, 34], color: VIET, mortal: true, timing: retreatTiming }],
      progress: mvProgress,
      fall: () => 0.3 * clash(),
      visible: () => clock.near("ma-vien"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 3,
      height: lifted(1.4),
      groups: [{ path: retreat, count: 2, spread: [5, 0], color: HAI_BA, timing: retreatTiming }],
      progress: mvProgress,
      visible: () => clock.near("ma-vien"),
    }),
  );

  // Năm 43: lửa khởi nghĩa tắt dần từ xa về Mê Linh; quân Hán kéo tới Cấm Khê, quân Hai Bà ngã xuống;
  // theo truyền thuyết, Hai Bà ra sông Hát (hai đốm sáng tắt giữa dòng); rồi hai đốm sáng từ mặt sông
  // từ từ bay lên, ở lại trên trời — "tên tuổi sống mãi" (biểu tượng, diễn hoạ). Một lượt, 18 s.
  const HS = 18;
  const hsProgress = () => clamp(clock.elapsed("hy-sinh") / HS);
  world.resolve((target) => {
    const fading = 0.55 * (1 - smoothstep(1, 9, clock.elapsed("hy-sinh")));
    target.lit += (fading - target.lit) * clock.near("hy-sinh");
  });
  world.add(
    createCrowd({
      size: 7,
      height,
      seed: 61,
      groups: [{ path: route([[-50, -12], [-110, 10], [CAM_KHE[0] + 40, CAM_KHE[1] - 2]]), count: 110, spread: [36, 30], color: INK, timing: [[0, 0], [0.35, 1]] }],
      progress: hsProgress,
      visible: () => clock.near("hy-sinh"),
    }),
  );
  world.add(
    createCrowd({
      size: 7,
      height,
      seed: 62,
      // đội hình xếp lùi về phía tây, lưng tựa núi
      groups: [{ path: still(CAM_KHE), count: 36, spread: [22, 16], color: VIET, mortal: true }],
      progress: hsProgress,
      fall: () => 0.65 * smoothstep(0.3, 0.5, hsProgress()),
      visible: () => clock.near("hy-sinh"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 3,
      height: lifted(1.4),
      groups: [{ path: route([[CAM_KHE[0] + 2, CAM_KHE[1]], [-205, -60], HAT_BANK, HAT_WATER]), count: 2, spread: [5, 0], color: HAI_BA, timing: [[0.3, 0], [0.62, 1]], show: [0, 0.64] }],
      progress: hsProgress,
      visible: () => clock.near("hy-sinh"),
    }),
  );
  // Bay lên: crowd lấy độ cao theo đường đi, nên dùng một đoạn dài 1 m theo z mà độ cao tăng 46 m trên đoạn ấy.
  const RISE = 46;
  world.add(
    createCrowd({
      glow: true,
      size: 3.5,
      height: (_, z) => WATER + 2 + clamp(z - HAT_WATER[1]) * RISE,
      groups: [{ path: [HAT_WATER, [HAT_WATER[0], HAT_WATER[1] + 1]], count: 2, spread: [6, 0], color: HAI_BA, timing: [[0.68, 0], [0.95, 1]], show: [0.66, 2] }],
      progress: hsProgress,
      visible: () => clock.near("hy-sinh"),
    }),
  );

  // ---- làng: tre, cau, chuối (không dựng nhà) ----
  const fromRiver = (x: number, z: number) => Math.abs(z - riverZ(x));
  const segDist = (x: number, z: number, [ax, az]: XZ, [bx, bz]: XZ) => {
    const dx = bx - ax;
    const dz = bz - az;
    const t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1));
    return Math.hypot(ax + dx * t - x, az + dz * t - z);
  };
  // các đường đền (phân cảnh "den-tho") dựng sau, cần giữ trống ngay từ đây
  for (const t of TEMPLES) route([t.from, t.at]);
  const clearOfRoutes = (x: number, z: number, r = 10) => routes.every((p) => p.every((a, i) => i === 0 || segDist(x, z, p[i - 1], a) > r));
  const dry = (x: number, z: number) => {
    const h = height(x, z);
    return h > 1.8 && h < 10 && clearOfCam(x, z, h) && fromRiver(x, z) > 45 && clearOfRoutes(x, z) ? h : null;
  };
  const hamlets = scatter(16, rand, { x0: -220, x1: 330, z0: -80, z1: 260 }, dry, 45);
  const around = (r0: number, r1: number, n: number) =>
    hamlets.flatMap((v) =>
      Array.from({ length: n }, () => {
        const a = rand() * Math.PI * 2;
        const r = r0 + rand() * (r1 - r0);
        const x = v.x + Math.cos(a) * r;
        const z = v.z + Math.sin(a) * r;
        return { x, y: height(x, z) - 0.15, z, rotY: rand() * 6.28, scale: 0.85 + rand() * 0.3 };
      }),
    ).filter((p) => clearOfRoutes(p.x, p.z, 6));
  await world.yield();
  const actors = await Promise.all([
    createProps("bui_tre", [...around(5, 14, 5), ...scatter(Math.round(80 * q.density), rand, { x0: -350, x1: 350, z0: -100, z1: 340 }, dry, 8)], {
      quality: q,
      recenter: true,
      shadow: q.shadows,
      sway: 0.0035,
      tint: 0.25,
      maxDistance: 340,
    }),
    createProps("cay_cau", around(6, 12, 3), { quality: q, recenter: true, shadow: q.shadows, sway: 0.003, tint: 0.2 }),
    createProps("bui_chuoi", around(4, 10, 2), { quality: q, recenter: true, shadow: q.shadows, sway: 0.02, tint: 0.2 }),
  ]);
  for (const a of actors) world.add(a);

  // Đền thờ Hai Bà: ba ngọn đèn sáng lần lượt ở Hát Môn, Hạ Lôi, Đồng Nhân (một lượt); người dân các xóm
  // đi về đền, lặp mỗi 12 s; rồi nhiều đốm sáng nhỏ lan dần ra khắp các làng từ Mê Linh — tượng trưng
  // cho "khắp cả nước" có nơi thờ, đường, trường mang tên Hai Bà (biểu tượng, không ứng với địa điểm thật).
  const DT = 16;
  const DT_WALK = 12;
  const dtProgress = () => clamp(clock.elapsed("den-tho") / DT);
  const lampRand = mulberry32(43);
  const lamps = [...hamlets, ...scatter(20, lampRand, { x0: -340, x1: 340, z0: -320, z1: 320 }, (x, z) => (height(x, z) > 1.5 && height(x, z) < 30 ? height(x, z) : null), 50)]
    .map((v) => ({ v, r: Math.hypot(v.x - ME_LINH.x, v.z - ME_LINH.z) }))
    .sort((a, b) => a.r - b.r);
  const farthest = lamps.length ? lamps[lamps.length - 1].r : 1;
  world.add(
    createCrowd({
      glow: true,
      size: 3,
      height: lifted(3),
      seed: 71,
      groups: [
        ...TEMPLES.map((t, i) => ({ path: still(t.at), count: 1, color: HAI_BA, size: 3, show: [0.03 + i * 0.09, 2] as [number, number] })),
        ...lamps.map(({ v, r }) => ({ path: still([v.x, v.z]), count: 1, color: "#ffd27a", size: 0.7, show: [0.32 + (r / farthest) * 0.55, 2] as [number, number] })),
      ],
      progress: dtProgress,
      visible: () => clock.near("den-tho"),
    }),
  );
  world.add(
    createCrowd({
      size: 7,
      height,
      seed: 72,
      groups: TEMPLES.map((t) => ({ path: [t.from, t.at], count: 8, spread: [5, 12] as [number, number], color: VIET, timing: [[0, 0], [0.75, 1]] as [number, number][], show: [0.02, 0.92] as [number, number] })),
      progress: () => loop(clock.elapsed("den-tho"), 4, DT_WALK),
      visible: () => clock.near("den-tho") * clamp((clock.elapsed("den-tho") - 4) / 0.5),
    }),
  );

  await world.yield();
  // ---- rừng núi Ba Vì, đồi, lúa, lau sậy ----
  const wide = { x0: -370, x1: 370, z0: -350, z1: 350 };
  const slopeAt = (x: number, z: number) => Math.hypot(height(x + 1, z) - height(x - 1, z), height(x, z + 1) - height(x, z - 1)) / 2;
  world.add(
    createFoliage({
      quality: q,
      kind: "tree",
      count: Math.round(1200 * q.density),
      area: wide,
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 2 || h > 100 || !clearOfCam(x, z, h) || slopeAt(x, z) > 1.2 || fromRiver(x, z) < 40 || !clearOfRoutes(x, z)) return null;
        return h > 9 || fbm2(x * 0.03 + 4, z * 0.03 - 2, 3) > 0.55 ? h - 0.3 : null;
      },
      scale: [1.0, 2.0],
      dark: "#16301a",
      light: "#56843a",
      seed: 91,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "bush",
      maxDistance: 300,
      count: Math.round(1000 * q.density),
      area: wide,
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 1.2 || h > 40 || !clearOfCam(x, z, h) || !clearOfRoutes(x, z, 6)) return null;
        return fbm2(x * 0.05 - 7, z * 0.05 + 3, 3) > 0.48 ? h - 0.2 : null;
      },
      scale: [0.5, 1.2],
      dark: "#22391c",
      light: "#6b8f40",
      seed: 92,
    }),
  );
  await world.yield();
  const paddy = (ripe: boolean) => (x: number, z: number) => {
    const h = height(x, z);
    if (h < 1.7 || h > 5.5 || nearCam(x, z, 16) || fromRiver(x, z) < 50) return null;
    const c = paddyCell(x, z);
    if (c < 0.4 || (ripe ? c < 0.72 : c >= 0.72)) return null;
    const fx = Math.abs((x / 10) % 1);
    const fz = Math.abs((z / 8) % 1);
    return fx < 0.08 || fz < 0.1 ? null : h - 0.02;
  };
  const fields = { x0: -240, x1: 340, z0: -110, z1: 260 };
  world.add(createGrass({ quality: q, count: Math.round(8000 * q.density), area: fields, accept: paddy(false), height: [0.35, 0.6], blades: 6, base: "#4e7a2a", tip: "#a8c85a", sway: 0.2, seed: 93 }));
  world.add(createGrass({ quality: q, count: Math.round(3000 * q.density), area: fields, accept: paddy(true), height: [0.45, 0.7], blades: 6, base: "#8a8a3a", tip: "#e6c860", sway: 0.22, seed: 94 }));
  world.add(
    createGrass({
      quality: q,
      count: Math.round(3000 * q.density),
      area: { x0: -370, x1: 370, z0: -230, z1: -40 },
      accept: (x, z) => {
        const h = height(x, z);
        return h > -0.8 && h < 1.6 && !nearCam(x, z, 14) && clearOfRoutes(x, z, 5) ? h - 0.1 : null;
      },
      height: [1.3, 2.4],
      blades: 9,
      base: "#7a7a44",
      tip: "#eadba0",
      sway: 0.05,
      seed: 95,
    }),
  );
  world.add(
    createRocks({
      quality: q,
      count: Math.round(300 * q.density),
      area: wide,
      accept: (x, z) => (slopeAt(x, z) > 0.55 && height(x, z) > 10 && !nearCam(x, z) ? height(x, z) : null),
      scale: [0.5, 2.6],
      seed: 96,
    }),
  );
  world.add(createBirds({ flocks: 3, perFlock: 7, center: { x: -60, y: 0, z: 40 }, radius: 140, altitude: [45, 80], seed: 17 }));

  await world.yield();
  if (!q.cheapShaders)
    world.add(
      createMist({
        center: { x: 0, y: 0, z: 0 },
        size: [600, 600],
        density: (ctx) => 1 - smoothstep(0.3, 2.0, ctx.params.mood) * 0.7,
        base: () => WATER,
        mood: world.mood,
      }),
    );
  world.add(
    createRanges({
      center: { x: 0, y: 0, z: 0 },
      radius: 500,
      spacing: 150,
      layers: 3,
      mood: world.mood,
      // trung du, núi phía bắc và tây; đồng bằng mở về phía đông nam
      profile: (a, l) => smoothstep(-0.3, 0.4, Math.sin(a) - Math.cos(a) * 0.4) * Math.pow(fbm2(a * 5 + l * 7.7, l * 3.1, 4), 1.6) * (90 + l * 70),
    }),
  );
};

export default setup;
