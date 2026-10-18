import * as THREE from "three";
import { clamp, easeInOut, lerp, mulberry32, smoothstep } from "@/core/engine/math";
import type { SceneSetup } from "@/core/engine/world";
import { createMist, createRanges, createSmoke } from "@/core/world/atmosphere";
import { createBeatClock } from "@/core/world/beat-clock";
import { createBirds } from "@/core/world/birds";
import { createCrowd } from "@/core/world/crowd";
import { createDust } from "@/core/world/dust";
import { createFoliage } from "@/core/world/foliage";
import { createGrass } from "@/core/world/grass";
import { createProps, scatter, type Placement } from "@/core/world/props";
import { createRocks } from "@/core/world/rocks";
import { createHeightTexture, createTerrain, fbm2 } from "@/core/world/terrain";
import { createWater } from "@/core/world/water";
import { createFleet, FINAL_LEAD, WAKE_SLOTS } from "./actors/fleet";
import { createMoored } from "./actors/moored";
import { createStakes } from "./actors/stakes";
import config, { TIDE_HIGH, TIDE_LOW } from "./scene.config";
import { BOUNDS, colorize, height, paddyCell, riverCenter, riverHalfWidth } from "./terrain";

// Đảo đá vôi ngoài cửa biển: x, z, cao, bán kính
const KARST: [number, number, number, number][] = [
  [64, -128, 30, 9], [92, -160, 42, 12], [128, -118, 26, 8], [70, -205, 36, 11],
  [140, -190, 48, 14], [-98, -150, 34, 10], [-128, -205, 44, 13], [-160, -140, 28, 9],
  [-84, -248, 30, 9], [36, -262, 38, 11], [182, -240, 34, 10], [-200, -230, 40, 12],
];

// Màu chấm người trong hoạt cảnh: quân Ngô Quyền (son), quân Nam Hán và phe Kiều Công Tiễn (mực), Dương Đình Nghệ (sáng)
const SON = "#8e2f22";
const INK = "#2a2320";
const PALE = "#e8e2d4";

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const rand = mulberry32(938);

  // ---- đất & nước ----
  // bản đồ độ sâu cho shader nước: máy yếu dùng lưới thưa hơn (¼ số lần tính độ cao)
  const heightTex = createHeightTexture(height, BOUNDS, q.lite ? 128 : 256);
  await world.yield();
  const wakes = new Float32Array(Math.min(WAKE_SLOTS, q.wakes) * 4);
  world.add(createTerrain({ bounds: BOUNDS, segments: q.terrainSeg, height, colorize, wetLevel: (ctx) => ctx.params.tide, cheap: q.cheapShaders }));
  world.add(
    createWater({
      heightTex,
      bounds: BOUNDS,
      segments: q.waterSeg,
      level: (ctx) => ctx.params.tide,
      wakes,
      cheap: q.cheapShaders,
      sky: () => world.mood,
    }),
  );
  await world.yield();
  world.add(createDust(q.dust, { x: 0, y: -2, z: -24 }, { x: 160, y: 30, z: 180 }));

  // ---- logic tương tác: người xem điều khiển con nước ----
  const BEAT = world.beat("nuoc-rut");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - BEAT));
    const userTide = TIDE_HIGH + (TIDE_LOW - TIDE_HIGH) * (ctx.inputs.drain ?? 0);
    target.tide += (userTide - target.tide) * w;
    const done = ctx.completedAt.drain;
    if (done) {
      const since = ctx.now - done;
      const after = smoothstep(BEAT - 0.6, BEAT - 0.1, ctx.t);
      target.attack = Math.max(target.attack, easeInOut(clamp((since - 1200) / 6000)) * after);
      target.sink = Math.max(target.sink, clamp((since - 3500) / 9000) * 0.75 * after);
    }
  });

  // ---- hoạt cảnh: mỗi phân cảnh có đồng hồ riêng, diễn trong lúc người xem dừng đọc ----
  const clock = createBeatClock(world, ["nghin-nam", "nam-937", "nam-han", "bai-coc", "trieu-len", "nuoc-rut", "ket-cuc", "xung-vuong", "dau-vet"]);
  const sec = (id: string, d: number) => clamp(clock.elapsed(id) / d);
  // tham số keyframe (đoàn thuyền, bãi cọc, con nước) được đồng hồ phân cảnh dẫn khi người xem đang ở đó,
  // ngoài phân cảnh thì trả về giá trị keyframe như cũ
  const drive = (target: Record<string, number>, key: string, id: string, value: number) => {
    target[key] += (value - target[key]) * clock.near(id);
  };
  world.resolve((target) => {
    // Thuyền giặc vượt biển: đoàn thuyền từ ngoài khơi tiến dần vào cửa sông (12 s).
    drive(target, "fleet", "nam-han", lerp(0.15, 0.4, easeInOut(sec("nam-han", 12))));
    // Bãi cọc: cọc trồi lên từng hàng (từ phía biển vào), xong thì triều lên phủ kín (12 → 19 s).
    const b = clock.elapsed("bai-coc");
    drive(target, "built", "bai-coc", smoothstep(0.5, 10, b));
    drive(target, "tide", "bai-coc", lerp(TIDE_LOW, TIDE_HIGH, smoothstep(12, 19, b)));
    // Dụ địch: thuyền nhẹ xuôi dòng ra khiêu chiến (0–5,5 s), dừng trước mũi đoàn thuyền giặc (đến 7 s),
    // rồi quay đầu chạy ngược dòng; đoàn thuyền lớn đuổi theo vượt qua bãi cọc (7–16 s).
    // lure < 0,5: thuyền nhẹ còn hướng mũi ra biển; ≥ 0,5: đã quay đầu (xem actors/fleet.ts).
    const tr = clock.elapsed("trieu-len");
    drive(target, "lure", "trieu-len", tr < 7 ? 0.49 * smoothstep(0.3, 5.5, tr) : lerp(0.5, 1, smoothstep(7, 8, tr)));
    drive(target, "fleet", "trieu-len", lerp(0.45, 1, easeInOut(clamp((tr - 7) / 9))));
  });

  // Hơn một nghìn năm: những đốm lửa khởi nghĩa lần lượt bùng lên rồi tắt ở khắp nơi (năm cuộc khởi nghĩa được
  // kể tên), sau cùng hai đốm của họ Khúc và Dương Đình Nghệ sáng lên và giữ lại. Vị trí các đốm chỉ là
  // tượng trưng, không ứng với địa danh thật (cảnh là cửa sông, không phải bản đồ Giao Châu).
  const NGHIN_NAM = 14;
  const UPRISINGS: [number, number][] = [[100, -50], [60, 0], [120, 0], [62, -40], [90, 22], [80, -20], [110, -88]];
  world.add(
    createCrowd({
      glow: true,
      size: 8,
      height: (x, z) => height(x, z) + 6,
      seed: 71,
      groups: UPRISINGS.map(([x, z], i) => {
        const at = 0.04 + i * 0.12;
        const kept = i >= 5;
        return {
          path: [[x, z], [x + 8, z + 5]] as [number, number][],
          count: 5,
          spread: [16, 12] as [number, number],
          color: kept ? "#ffc65a" : "#ff9a3c",
          timing: [[at, 0], [at + 0.14, 1]] as [number, number][],
          show: [at, kept ? 1.1 : at + 0.15] as [number, number],
        };
      }),
      progress: () => sec("nghin-nam", NGHIN_NAM),
      visible: () => clock.near("nghin-nam"),
    }),
  );

  // Giao Châu dậy sóng (năm 937): Dương Đình Nghệ (chấm sáng) ngã xuống giữa nhóm Kiều Công Tiễn (chấm mực);
  // quân Ngô Quyền (chấm son) từ xa kéo tới; thế cùng, vài người của Kiều Công Tiễn rời đi về phía biển cầu cứu.
  // Diễn hoạ: vị trí nơi Kiều Công Tiễn đóng, hướng quân Ngô Quyền kéo tới và đường sứ giả đi chỉ là tượng trưng.
  const NAM_937 = 15;
  const seat: [number, number] = [-55, 72];
  const march: [number, number][] = [[-215, 152], [-150, 125], [-86, 88]];
  const envoy: [number, number][] = [[-58, 62], [-60, 20], [-62, -30], [-66, -80]];
  world.add(
    createCrowd({
      size: 8,
      height,
      seed: 72,
      groups: [
        { path: [[seat[0], seat[1] + 2], seat], count: 28, spread: [16, 12], color: INK },
        { path: [[-50, 67], [-50, 66]], count: 1, color: PALE, size: 1.3, mortal: true },
        { path: march, count: 90, spread: [22, 34], color: SON, timing: [[0.15, 0], [0.72, 1]] },
        { path: envoy, count: 3, spread: [3, 4], color: INK, timing: [[0.6, 0], [0.96, 1]], show: [0.6, 0.97] },
      ],
      progress: () => sec("nam-937", NAM_937),
      fall: () => smoothstep(0.1, 0.2, sec("nam-937", NAM_937)),
      visible: () => clock.near("nam-937"),
    }),
  );

  // Thuyền giặc vượt biển (đoàn thuyền do `fleet` dẫn ở trên); quân Ngô Quyền từ trong đồi kéo ra, dàn ở bờ
  // cửa sông chờ sẵn. Diễn hoạ: lời kể không nói quân ta đứng ở bờ nào.
  const BANK_TROOPS: [number, number][] = [[-75, 30], [-68, -20], [-62, -50], [-60, -68]];
  world.add(
    createCrowd({
      size: 3,
      height,
      seed: 73,
      groups: [{ path: BANK_TROOPS, count: 80, spread: [12, 30], color: SON, timing: [[0.05, 0], [0.8, 1]] }],
      progress: () => sec("nam-han", 13),
      visible: () => clock.near("nam-han"),
    }),
  );

  // Bãi cọc: quân từ đồi bờ đông xuống mép nước rồi trở lên, từng lượt (gỗ đẵn trên đồi đem xuống bãi) trong lúc
  // cọc trồi lên từng hàng; khi triều bắt đầu lên thì tản đi. Diễn hoạ: lời kể không nói gỗ lấy ở đâu, đóng từ bờ nào.
  const CARRY = 6;
  const haul: [number, number][] = [[60, 45], [48, 10], [36, -12], [29, -20]];
  world.add(
    createCrowd({
      size: 3.5,
      height,
      seed: 74,
      groups: [
        {
          path: [...haul, ...haul.slice(0, -1).reverse()],
          count: 26,
          spread: [5, 16],
          color: SON,
          timing: [[0, 0], [0.45, 0.5], [0.55, 0.5], [1, 1]],
          show: [0.01, 0.99],
        },
      ],
      progress: () => (clock.elapsed("bai-coc") % CARRY) / CARRY,
      visible: () => clock.near("bai-coc") * (1 - smoothstep(10.5, 12, clock.elapsed("bai-coc"))),
    }),
  );

  // Chờ nước rút: quân ta dàn trên bờ tây, lặng im chờ (tương tác con nước giữ nguyên như cũ).
  const waiting: [number, number][] = [[-32, 14], [-32, -28]];
  world.add(
    createCrowd({
      size: 3,
      height,
      seed: 75,
      groups: [{ path: waiting, count: 60, spread: [6, 40], color: SON }],
      progress: () => 1,
      visible: () => clock.near("nuoc-rut"),
    }),
  );

  // Kết cục: quân Nam Hán dưới nước quanh xác thuyền, quá nửa chìm dần (chết đuối); số còn lại dạt ra phía biển
  // rồi khuất (tàn quân rút về). Diễn hoạ: người dưới nước thể hiện bằng chấm đứng trên mặt nước.
  const KET_CUC = 16;
  const wreckZ = FINAL_LEAD - 30;
  world.add(
    createCrowd({
      size: 3,
      height: (x, z) => Math.max(height(x, z), TIDE_LOW),
      seed: 76,
      groups: [
        {
          path: [[riverCenter(wreckZ), wreckZ], [riverCenter(-70), -70], [-6, -100]],
          count: 140,
          spread: [30, 30],
          color: INK,
          mortal: true,
          timing: [[0.45, 0], [0.95, 1]],
          show: [0, 0.97],
        },
      ],
      progress: () => sec("ket-cuc", KET_CUC),
      fall: () => 0.6 * smoothstep(1, 7, clock.elapsed("ket-cuc")),
      visible: () => clock.near("ket-cuc"),
    }),
  );

  // Mở nước xưng vương: đoàn quân Ngô Quyền theo bờ sông kéo ngược lên phía đất liền (hướng về Cổ Loa), đi một
  // lượt rồi dừng ở xa. Diễn hoạ: lời kể không nói đường quân đi — chỉ để gợi việc rời cửa sông về đóng đô.
  const XUNG_VUONG = 18;
  const upstream: [number, number][] = [-34, 0, 40, 90, 140, 180, 212].map((z) => [riverCenter(z) + riverHalfWidth(z) + 10, z]);
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 77,
      groups: [{ path: upstream, count: 140, spread: [4, 70], color: SON }],
      progress: () => easeInOut(sec("xung-vuong", XUNG_VUONG)),
      visible: () => clock.near("xung-vuong"),
    }),
  );

  // Dấu vết còn lại: một đốm sáng lần lượt hiện ở vài khúc cửa sông rồi tắt, không dừng hẳn ở đâu —
  // gợi việc vị trí trận năm 938 còn bàn luận. Ba vị trí chỉ là tượng trưng.
  const GUESS = 9;
  const guesses: [number, number][] = [[2, -22], [6, -72], [-2, 46]];
  world.add(
    createCrowd({
      glow: true,
      size: 7,
      height: () => TIDE_LOW + 4,
      seed: 78,
      groups: guesses.map(([x, z], i) => ({
        path: [[x, z], [x, z + 0.1]] as [number, number][],
        count: 1,
        color: "#ffd27a",
        show: [i / 3 + 0.02, (i + 1) / 3 - 0.02] as [number, number],
      })),
      progress: () => (clock.elapsed("dau-vet") % GUESS) / GUESS,
      visible: () => clock.near("dau-vet"),
    }),
  );

  // khoảng trống quanh đường đi của các đoàn người: không rải cây, tre, bụi lên đó để khỏi che hoạt cảnh
  const STAGE: [[number, number][], number][] = [
    [[seat, [-50, 66]], 26],
    [march, 28],
    [envoy, 8],
    [BANK_TROOPS, 14],
    [haul, 8],
    [waiting, 7],
    [upstream, 7],
  ];
  const offStage = (x: number, z: number) =>
    STAGE.every(([path, r]) =>
      path.every(([ax, az], i) => {
        if (i === 0) return true;
        const [bx, bz] = path[i - 1];
        const dx = bx - ax;
        const dz = bz - az;
        const t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1));
        return (ax + dx * t - x) ** 2 + (az + dz * t - z) ** 2 > r * r;
      }),
    );

  // ---- thuyền & cọc (tải song song model Blender) ----
  // không rải cây sát vị trí máy quay để khỏi che khung hình
  const cams = Object.values(config.keyframes).map((k) => k.cam);
  const nearCam = (x: number, z: number, r = 30) => cams.some(([cx, , cz]) => (cx - x) ** 2 + (cz - z) ** 2 < r * r);
  // cây không mọc chắn đường nhìn từ máy quay tới điểm nhìn: bỏ những cây nằm gần đoạn thẳng đó
  // (theo mặt bằng) mà ngọn cây (~10 m) cao hơn tia nhìn tại chỗ ấy
  const looks = Object.values(config.keyframes).map((k) => k.look);
  const blocks = (x: number, z: number, h: number, [ax, ay, az]: number[], [bx, by, bz]: number[]) => {
    const dx = bx - ax;
    const dz = bz - az;
    const t = clamp(((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz || 1));
    const d2 = (ax + dx * t - x) ** 2 + (az + dz * t - z) ** 2;
    return d2 < 24 ** 2 && h + 10 > ay + (by - ay) * t;
  };
  const clearOfCam = (x: number, z: number, h: number) => !nearCam(x, z) && cams.every((c, i) => !blocks(x, z, h, c, looks[i]));
  const onBank = (minH: number, maxH: number, maxFromRiver: number) => (x: number, z: number) => {
    const h = height(x, z);
    if (!clearOfCam(x, z, h) || !offStage(x, z)) return null;
    const d = Math.abs(x - riverCenter(z)) - riverHalfWidth(z);
    return h > minH && h < maxH && d < maxFromRiver ? h - 0.2 : null;
  };
  const area = { x0: -150, x1: 150, z0: -70, z1: 150 };
  const village: Placement[] = [];
  for (let i = 0; i < 7; i++) {
    const z = 36 + i * 8 + (rand() - 0.5) * 4;
    const x = riverCenter(z) + riverHalfWidth(z) + 18 + (i % 2) * 10 + rand() * 4;
    village.push({ x, y: height(x, z) - 0.1, z, rotY: -Math.PI / 2 + (rand() - 0.5) * 0.3, scale: 0.9 + rand() * 0.2 });
  }
  const notInVillage = (fn: (x: number, z: number) => number | null) => (x: number, z: number) =>
    village.some((v) => (v.x - x) ** 2 + (v.z - z) ** 2 < 64) ? null : fn(x, z);

  // quanh mỗi nhà: vài cây cau, bụi chuối, đống rơm, đoạn rào tre
  const around = (r0: number, r1: number, n: number) =>
    village.flatMap((v) =>
      Array.from({ length: n }, () => {
        const a = rand() * Math.PI * 2;
        const r = r0 + rand() * (r1 - r0);
        const x = v.x + Math.cos(a) * r;
        const z = v.z + Math.sin(a) * r;
        return { x, y: height(x, z) - 0.15, z, rotY: rand() * 6.28, scale: 0.85 + rand() * 0.3 };
      }),
    );
  const fences = village.map((v) => {
    const x = v.x - 7;
    return { x, y: height(x, v.z) - 0.1, z: v.z, rotY: Math.PI / 2 + (rand() - 0.5) * 0.2 };
  });

  const karst: Placement[][] = [[], [], []];
  KARST.forEach(([x, z, h, r], i) => karst[i % 3].push({ x, y: -8, z, rotY: rand() * 6.28, scale: [r * 2.4, h + 8, r * 2.4] }));

  await world.yield();
  const actors = await Promise.all([
    createStakes(),
    createFleet(q, world.signal, wakes),
    createMoored(q, [30, 37, 41, 52, 58, 71]),
    createProps("nha_tranh", village, { quality: q, recenter: true, shadow: q.shadows, tint: 0.15 }),
    createProps("cay_cau", around(6, 10, 2), { quality: q, recenter: true, shadow: q.shadows, sway: 0.003, tint: 0.2 }),
    createProps("bui_chuoi", around(5, 9, 1), { quality: q, recenter: true, shadow: q.shadows, sway: 0.02, tint: 0.2 }),
    createProps("dong_rom", around(6, 9, 1).filter((_, i) => i % 2 === 0), { quality: q, recenter: true, shadow: q.shadows, tint: 0.15 }),
    createProps("rao_tre", fences, { quality: q, recenter: true }),
    createProps("bui_tre", scatter(Math.round(140 * q.density), rand, area, notInVillage(onBank(1.5, 12, 45)), 5), { quality: q, recenter: true, shadow: q.shadows, sway: 0.0035, tint: 0.25, maxDistance: 320 }),
    createProps("cay_bang", scatter(Math.round(50 * q.density), rand, area, notInVillage(onBank(3, 16, 80)), 9), { quality: q, recenter: true, smooth: true, shadow: q.shadows, sway: 0.002, tint: 0.25 }),
    ...karst.map((list, i) => createProps("nui_da_voi", list, { quality: q, filter: (n) => n === `da_voi_${i}` || n === `da_voi_${i}_cay`, filterId: `da_voi_${i}`, recenter: true, tint: 0.2 })),
  ]);
  for (const a of actors) world.add(a);

  await world.yield();
  // ---- cỏ ven bờ, lau sậy mép nước, chim trời ----
  const bank = { x0: -160, x1: 160, z0: -90, z1: 160 };
  world.add(
    createGrass({
      quality: q,
      count: Math.round(9000 * q.density),
      area: bank,
      // cỏ thấp nên được mọc gần máy quay hơn cây, chỉ chừa một khoảng nhỏ để lá không phóng to choán khung
      accept: notInVillage((x, z) => {
        if (nearCam(x, z, 14)) return null;
        const h = height(x, z);
        const d = Math.abs(x - riverCenter(z)) - riverHalfWidth(z);
        return h > 1.2 && h < 14 && d < 70 ? h - 0.05 : null;
      }),
      height: [0.5, 1.1],
      base: "#5a8436",
      tip: "#adc068",
      seed: 41,
    }),
  );
  await world.yield();
  world.add(
    createGrass({
      quality: q,
      count: Math.round(3500 * q.density),
      area: bank,
      accept: (x, z) => {
        if (nearCam(x, z, 16)) return null;
        const h = height(x, z);
        const d = Math.abs(x - riverCenter(z)) - riverHalfWidth(z);
        // dải bùn sát mép nước, ngoài bãi cọc để không che cảnh chính
        return h > -1.2 && h < 1.6 && d > -6 && (z > -2 || z < -50) ? h - 0.1 : null;
      },
      height: [1.4, 2.6],
      blades: 9,
      base: "#7a7a44",
      tip: "#eadba0",
      sway: 0.05,
      seed: 42,
    }),
  );
  world.add(createBirds({ flocks: 3, perFlock: 7, center: { x: 0, y: 0, z: -40 }, radius: 90, altitude: [34, 60] }));

  await world.yield();
  // ---- rừng đồi, bụi ven bờ, dừa nước, đá tảng ----
  const fromRiver = (x: number, z: number) => Math.abs(x - riverCenter(z)) - riverHalfWidth(z);
  const slopeAt = (x: number, z: number) => Math.hypot(height(x + 1, z) - height(x - 1, z), height(x, z + 1) - height(x, z - 1)) / 2;
  const wide = { x0: -310, x1: 310, z0: -100, z1: 215 };
  world.add(
    createFoliage({
      quality: q,
      kind: "tree",
      count: Math.round(1100 * q.density),
      area: wide,
      accept: notInVillage((x, z) => {
        const h = height(x, z);
        if (h < 5 || !clearOfCam(x, z, h) || !offStage(x, z) || fromRiver(x, z) < 22 || slopeAt(x, z) > 0.9) return null;
        // rừng mọc thành mảng, không rải đều như rắc tiêu
        return fbm2(x * 0.03 + 4, z * 0.03 - 2, 3) > 0.42 ? h - 0.3 : null;
      }),
      scale: [1.0, 1.9],
      dark: "#18301a",
      light: "#58833a",
      seed: 51,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "bush",
      maxDistance: 300,
      count: Math.round(1600 * q.density),
      area: wide,
      accept: notInVillage((x, z) => {
        const h = height(x, z);
        if (h < 1.4 || h > 26 || !clearOfCam(x, z, h) || !offStage(x, z)) return null;
        return fbm2(x * 0.05 - 7, z * 0.05 + 3, 3) > 0.45 || fromRiver(x, z) < 14 ? h - 0.2 : null;
      }),
      scale: [0.5, 1.2],
      dark: "#22391c",
      light: "#6b8f40",
      seed: 52,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "palm",
      count: Math.round(70 * q.density),
      area: bank,
      accept: (x, z) => {
        const h = height(x, z);
        const d = fromRiver(x, z);
        return h > 0.8 && h < 4 && d > 1 && d < 16 && !nearCam(x, z) && offStage(x, z) && (z > 0 || z < -50) ? h - 0.2 : null;
      },
      scale: [0.8, 1.2],
      dark: "#3d5a24",
      light: "#a4b85a",
      shadow: q.shadows,
      seed: 53,
    }),
  );
  await world.yield();
  world.add(
    createRocks({
      quality: q,
      count: Math.round(520 * q.density),
      area: wide,
      accept: (x, z) => {
        const h = height(x, z);
        const d = fromRiver(x, z);
        if (nearCam(x, z) || (z > -45 && z < -5 && d < 2)) return null;
        // đá ven mép nước + đá lộ trên sườn dốc
        return (h > -2 && h < 1.5 && d > -4 && d < 6) || (slopeAt(x, z) > 0.45 && h > 4) ? h : null;
      },
      scale: [0.3, 2.2],
      seed: 54,
    }),
  );

  await world.yield();
  // ---- ruộng lúa: lúa xanh trên ô cạn, lúa chín vàng ở vài ô ----
  const paddy = (ripe: boolean) => (x: number, z: number) => {
    const h = height(x, z);
    if (h < 1.6 || h > 4.2 || nearCam(x, z) || fromRiver(x, z) < 8) return null;
    const c = paddyCell(x, z);
    if (c < 0.35 || (ripe ? c < 0.7 : c >= 0.7)) return null;
    // chừa bờ ruộng
    const fx = Math.abs((x / 9) % 1);
    const fz = Math.abs((z / 7) % 1);
    return fx < 0.1 || fz < 0.12 ? null : h - 0.02;
  };
  world.add(createGrass({ quality: q, count: Math.round(7000 * q.density), area: wide, accept: notInVillage(paddy(false)), height: [0.35, 0.6], blades: 6, base: "#4e7a2a", tip: "#a8c85a", sway: 0.2, seed: 61 }));
  world.add(createGrass({ quality: q, count: Math.round(2500 * q.density), area: wide, accept: notInVillage(paddy(true)), height: [0.45, 0.7], blades: 6, base: "#8a8a3a", tip: "#e6c860", sway: 0.22, seed: 62 }));

  await world.yield();
  // ---- khói bếp, sương sông, núi xa ----
  world.add(createSmoke({ sources: village.filter((_, i) => i % 2 === 0).map((v) => ({ x: v.x + 1, y: v.y + 4.5, z: v.z })), height: 18, wind: [-1, 0.5] }));
  // sương = 3 lớp trong suốt phủ gần kín màn hình: tốn tỉ lệ điểm ảnh, máy yếu bỏ
  if (!q.cheapShaders)
    world.add(
      createMist({
        center: { x: 0, y: 0, z: -20 },
        size: [420, 520],
        // dày lúc bình minh, mỏng khi u ám, gần tan lúc hoàng hôn
        density: (ctx) => 1 - smoothstep(0.2, 2.0, ctx.params.mood) * 0.75,
        base: (ctx) => ctx.params.tide,
        mood: world.mood,
      }),
    );
  world.add(
    createRanges({
      center: { x: 0, y: 0, z: -60 },
      radius: 470,
      spacing: 140,
      layers: 3,
      mood: world.mood,
      profile: (a, l) => {
        // phía biển (z âm) để trống thành chân trời nước; phía đất liền: núi trùng điệp cao dần
        const land = smoothstep(-0.35, 0.15, Math.sin(a));
        return land * Math.pow(fbm2(a * 6 + l * 13.1, l * 3.7, 4), 1.6) * (70 + l * 45);
      },
    }),
  );
};

export default setup;
