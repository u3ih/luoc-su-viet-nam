import * as THREE from "three";
import { clamp, mulberry32, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createMist, createRanges, createSmoke } from "@/core/world/atmosphere";
import { createBeatClock } from "@/core/world/beat-clock";
import { createBirds } from "@/core/world/birds";
import { cameraClearance } from "@/core/world/clearance";
import { createCrowd, type CrowdGroup } from "@/core/world/crowd";
import { createDust } from "@/core/world/dust";
import { createFires } from "@/core/world/fire";
import { createFoliage } from "@/core/world/foliage";
import { createGrass } from "@/core/world/grass";
import { createProps, scatter, type Placement } from "@/core/world/props";
import { createRocks } from "@/core/world/rocks";
import { createHeightTexture, createTerrain, fbm2 } from "@/core/world/terrain";
import { createWater } from "@/core/world/water";
import { createChildren } from "./actors/children";
import { createDrum } from "./actors/drum";
import { createGlows, timedPath } from "@/core/world/glows";
import config from "./scene.config";
import { BOUNDS, colorize, height, HILL, KNOLL, mountainness, paddyCell, riverCenter } from "./terrain";

// Đảo đá vôi ngoài khơi: x, z, cao, bán kính
const KARST: [number, number, number, number][] = [
  [-140, -150, 34, 10], [-110, -210, 46, 13], [70, -265, 30, 9], [40, -190, 40, 12], [96, -230, 36, 11],
  [-170, -175, 30, 9], [150, -180, 28, 8], [-70, -275, 42, 12], [20, -290, 34, 10],
];
/** Mặt trống đồng hiện lên ở phân cảnh "Truyền thuyết và khảo cổ": tâm x, z và bán kính (m) — chỗ đồng bằng phẳng. */
const DRUM = { x: -80, z: 10, r: 36 };

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const rand = mulberry32(2879);
  const { nearCam, clearOfCam } = cameraClearance(config.keyframes);
  // gò bọc trăm trứng để trống: không cây, không bụi che quầng sáng
  const offKnoll = (x: number, z: number) => (x - KNOLL.x) ** 2 + (z - KNOLL.z) ** 2 > 30 ** 2;
  // chỗ mặt trống đồng nằm cũng để trống: cây, tre, cỏ cao không đâm xuyên mặt trống
  const offDrum = (x: number, z: number) => (x - DRUM.x) ** 2 + (z - DRUM.z) ** 2 > (DRUM.r + 6) ** 2;

  // ---- đất & nước ----
  const heightTex = createHeightTexture(height, BOUNDS, q.lite ? 128 : 256);
  await world.yield();
  world.add(createTerrain({ bounds: BOUNDS, segments: q.terrainSeg, height, colorize, wetLevel: () => 0, cheap: q.cheapShaders }));
  world.add(createWater({ heightTex, bounds: BOUNDS, segments: q.waterSeg, level: () => 0, cheap: q.cheapShaders, sky: () => world.mood, colors: { deep: "#123b44", shallow: "#5f8c74" } }));
  await world.yield();
  world.add(createDust(q.dust, { x: 0, y: 0, z: 20 }, { x: 200, y: 40, z: 220 }));

  // ---- bọc trăm trứng: người xem kéo để chia con ----
  const BEAT = world.beat("chia-con");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - BEAT));
    target.spread += ((ctx.inputs.chia ?? 0) - target.spread) * w;
  });
  // ---- hoạt cảnh: mỗi phân cảnh có đồng hồ riêng, diễn trong lúc người xem dừng đọc ----
  const clock = createBeatClock(world, ["coi-nguon", "lac-long-quan", "au-co", "boc-tram-trung", "chia-con", "van-lang", "khao-co", "gio-to"]);
  // Trăm trứng nở: lúc tới phân cảnh "boc-tram-trung" trứng còn nằm im trong bọc, ~2,5 s sau nở dần trong ~6,5 s.
  // Đã cuộn qua phân cảnh thì coi như nở hết (để phân cảnh chia con luôn có đủ trăm người con).
  const BOC = world.beat("boc-tram-trung");
  const hatch = (ctx: FrameCtx) => Math.max(clamp((clock.elapsed("boc-tram-trung") - 2.5) / 6.5), smoothstep(BOC + 0.15, BOC + 0.7, ctx.t));
  const knollY = height(KNOLL.x, KNOLL.z);
  const mountain: THREE.Vector3[] = [];
  const sea: THREE.Vector3[] = [];
  for (let i = 0; mountain.length < 50 && i < 4000; i++) {
    // vùng đến lệch về phía tây để cả đoàn nằm ở nửa phải khung hình phân cảnh "chia-con" (chữ bên trái)
    const x = -200 + rand() * 320;
    const z = 140 + rand() * 130;
    const h = height(x, z);
    if (h > 28) mountain.push(new THREE.Vector3(x, h + 3 + rand() * 4, z));
  }
  for (let i = 0; sea.length < 50 && i < 4000; i++) {
    const x = -110 + rand() * 210;
    const z = -95 - rand() * 55;
    if (height(x, z) < -3) sea.push(new THREE.Vector3(x, 2 + rand() * 4, z));
  }
  world.add(
    createChildren({
      center: new THREE.Vector3(KNOLL.x, knollY + 6.5, KNOLL.z),
      mountain,
      sea,
      orb: (ctx) => ctx.params.orb,
      spread: (ctx) => ctx.params.spread,
      glow: (ctx) => ctx.params.glow,
      hatch,
    }),
  );

  const ground = (x: number, z: number) => Math.max(height(x, z), 0);
  const P = (x: number, lift: number, z: number): [number, number, number] => [x, ground(x, z) + lift, z];

  // Một câu chuyện về cội nguồn: người Việt "kể cho nhau nghe" qua bao đời — mỗi nhóm người ngồi quanh một bếp lửa
  // là một thế hệ; ánh sáng nhỏ từ gò cội nguồn (nơi về sau bọc trăm trứng hiện lên) truyền lần lượt qua từng nhóm,
  // tới đâu bếp lửa nhóm ấy bừng lên. (Diễn hoạ của hoạt cảnh: lời kể không tả cảnh ngồi quanh bếp lửa.)
  const COI_SITES: [number, number][] = [[-45, -8], [-85, 25], [-125, 55], [-160, 90]];
  const COI_HOP = 2.4;
  const coiLit = () => clamp((clock.elapsed("coi-nguon") - 2) / (COI_SITES.length * COI_HOP));
  world.add(
    createFires({
      sites: COI_SITES.map(([x, z], k) => ({ x, y: height(x, z), z, order: (k + 0.75) / COI_SITES.length / 0.94 })),
      size: 2.5,
      lit: () => coiLit() * clock.near("coi-nguon"),
    }),
  );
  const listeners: CrowdGroup[] = COI_SITES.flatMap(([x, z]) =>
    Array.from({ length: 7 }, (_, i) => {
      const a = (i / 7) * Math.PI * 2 + 0.4;
      const px = x + Math.cos(a) * 5;
      const pz = z + Math.sin(a) * 5;
      return { path: [[px, pz], [px + 0.1, pz]] as [number, number][], count: 1, color: "#2a2320" };
    }),
  );
  world.add(createCrowd({ size: 4.5, height, seed: 11, groups: listeners, progress: () => 0, visible: () => clock.near("coi-nguon") }));
  const coiPts: [number, number, number][] = [[KNOLL.x, knollY + 9, KNOLL.z], ...COI_SITES.map(([x, z]) => P(x, 7, z))];
  world.add(
    createGlows({
      count: 2,
      color: "#ffd98a",
      size: (i) => (i ? 8 : 5),
      place: (i, ctx, out) => {
        const e = clock.elapsed("coi-nguon");
        if (i === 1) {
          // ánh le lói ở gò cội nguồn
          out.set(KNOLL.x, knollY + 9, KNOLL.z);
          return smoothstep(0, 2, e) * (0.55 + 0.1 * Math.sin(ctx.time * 1.3));
        }
        // ánh sáng truyền: mỗi chặng đi 3/4 thời gian rồi dừng ở nhóm người
        const hop = clamp((e - 2) / COI_HOP, 0, COI_SITES.length - 1e-4);
        const k = Math.floor(hop);
        const f = smoothstep(0, 0.75, hop - k);
        const a = coiPts[k];
        const b = coiPts[k + 1];
        out.set(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f + Math.sin(f * Math.PI) * 10, a[2] + (b[2] - a[2]) * f);
        return smoothstep(1.5, 2.2, e) * (1 - 0.6 * smoothstep(2 + COI_SITES.length * COI_HOP - 0.6, 2 + COI_SITES.length * COI_HOP + 1, e));
      },
      visible: () => clock.near("coi-nguon"),
    }),
  );

  // Lạc Long Quân, Âu Cơ: hai đốm sáng — xanh ngọc (nòi rồng, từ biển), vàng (nòi tiên, từ núi), cùng màu với hai nhóm con
  // về sau. Mỗi phân cảnh một cặp đốm riêng, vị trí cuối phân cảnh trước trùng vị trí đầu phân cảnh sau nên chuyển cảnh liền mạch.
  const SEA_COL = "#9fe0d0";
  const MOUNTAIN_COL = "#ffd98a";
  const villageY = ground(5, -38);
  // Phân cảnh "lac-long-quan": đốm sáng trồi lên từ biển (0–2,5 s), lướt vào bờ, tới làng ven biển (8 s), rồi theo dân
  // ra đồng (8,5–14 s) — "dạy dân cày cấy". Việc "ăn mặc" và "trừ yêu quái" không diễn hoạ (không có hình để dựa vào).
  const llqPath = timedPath(
    [[45, -5, -105], [45, 8, -105], [15, 9, -66], [5, villageY + 10, -38], [5, villageY + 10, -38], P(8, 12, -2)],
    [0, 2.5, 6, 8, 8.5, 14],
  );
  // Phân cảnh "au-co": hai đốm từ biển và từ đỉnh núi cùng đi tới gò giữa đồng bằng (1–9 s), gặp nhau rồi lượn vòng bên nhau.
  // (Chỗ gặp đặt ở gò bọc trăm trứng cho liền mạch với phân cảnh sau — diễn hoạ, lời kể không nói nơi gặp.)
  const MEET = new THREE.Vector3(KNOLL.x, knollY + 10, KNOLL.z);
  const MEET_R = 5;
  const llqToMeet = timedPath([[40, 8, -110], P(20, 12, -50), [MEET.x + MEET_R, MEET.y, MEET.z]], [1, 5, 9]);
  const auToMeet = timedPath([P(-60, 14, 230), P(-40, 14, 150), [MEET.x - MEET_R, MEET.y, MEET.z]], [1, 5, 9]);
  // Phân cảnh "boc-tram-trung": hai đốm đứng hai bên bọc (theo hướng ngang khung hình của máy quay phân cảnh này).
  const orbY = knollY + 6.5;
  const bocSide = new THREE.Vector3(-0.443, 0, -0.897).multiplyScalar(7); // vector phải màn hình × 7 m
  const llqBoc = new THREE.Vector3(KNOLL.x, orbY + 3, KNOLL.z).sub(bocSide);
  const auBoc = new THREE.Vector3(KNOLL.x, orbY + 3, KNOLL.z).add(bocSide);
  // Phân cảnh "chia-con": cha dẫn năm mươi con xuống biển, mẹ dẫn năm mươi con lên núi, đi trước đàn con một chút theo thanh kéo.
  const centroid = (list: THREE.Vector3[]) => list.reduce((s, p) => s.add(p), new THREE.Vector3()).divideScalar(list.length);
  const seaHome = centroid(sea).add(new THREE.Vector3(0, 8, 0));
  const mountainHome = centroid(mountain).add(new THREE.Vector3(0, 10, 0));
  const PARENT_BEATS = ["lac-long-quan", "au-co", "au-co", "boc-tram-trung", "boc-tram-trung", "chia-con", "chia-con"];
  world.add(
    createGlows({
      count: PARENT_BEATS.length,
      color: (i) => ([0, 1, 3, 5].includes(i) ? SEA_COL : MOUNTAIN_COL),
      size: 5,
      minPx: 20,
      place: (i, ctx, out) => {
        const near = clock.near(PARENT_BEATS[i]);
        if (near < 0.002) return 0;
        const bob = Math.sin(ctx.time * 0.9 + i) * 0.5;
        if (i === 0) {
          const e = clock.elapsed("lac-long-quan");
          llqPath(e, out).y += bob * smoothstep(2.5, 4, e);
          return near * smoothstep(0, 1.6, e);
        }
        if (i <= 2) {
          const e = clock.elapsed("au-co");
          (i === 1 ? llqToMeet : auToMeet)(e, out);
          if (e > 9) {
            const a = (e - 9) * 0.45;
            const s = i === 1 ? 1 : -1;
            out.set(MEET.x + s * MEET_R * Math.cos(a), MEET.y + bob, MEET.z + s * MEET_R * Math.sin(a));
          }
          return near * smoothstep(0.4, 1.4, e);
        }
        if (i <= 4) {
          out.copy(i === 3 ? llqBoc : auBoc).y += bob;
          return near * 0.85;
        }
        const e = smoothstep(0.05, 0.8, ctx.params.spread);
        out.copy(i === 5 ? llqBoc : auBoc).lerp(i === 5 ? seaHome : mountainHome, e);
        out.y += Math.sin(e * Math.PI) * 40 + bob;
        return near;
      },
      visible: () => Math.max(clock.near("lac-long-quan"), clock.near("au-co"), clock.near("boc-tram-trung"), clock.near("chia-con")),
    }),
  );
  // Dân làng ven biển: lúc đầu đứng quanh làng, 8,5–14 s chia bốn tốp ra bốn khoảnh ruộng.
  const LLQ_T = 14;
  const toField = (x: number, z: number, mx: number, mz: number): CrowdGroup => ({
    path: [[5, -38], [mx, mz], [x, z]],
    count: 10,
    spread: [10, 6],
    color: "#2a2320",
    timing: [[8.5 / LLQ_T, 0], [1, 1]],
  });
  world.add(
    createCrowd({
      size: 3.5,
      height,
      seed: 12,
      groups: [toField(-12, -5, -5, -15), toField(18, -5, 10, -15), toField(-2, 10, 0, -10), toField(22, 12, 15, -10)],
      progress: () => clamp(clock.elapsed("lac-long-quan") / LLQ_T),
      visible: () => clock.near("lac-long-quan"),
    }),
  );

  // Nước Văn Lang (một lượt ~22 s): người con trưởng (đốm vàng) từ núi xuống Phong Châu (0,5–5,5 s); dân ba ngả kéo về
  // (3–9 s); mười lăm bộ lần lượt sáng lên (7–14 s); rồi mười tám đốm xếp chồng thành cột trên kinh đô — mười tám đời
  // Hùng Vương (đốm dưới cùng là người con trưởng, 14–21 s). Vị trí Phong Châu, mười lăm bộ và cột đốm là diễn hoạ trên
  // địa hình cách điệu, không phải bản đồ.
  const CAPITAL = { x: -50, z: 48 };
  const capY = ground(CAPITAL.x, CAPITAL.z);
  const BO: [number, number][] = [
    [-26, 118], [-56, -5], [-146, 33], [-117, 71], [-69, 167], [-20, -39], [-101, -64], [-154, -33],
    [-105, -9], [-170, 75], [-204, -2], [-134, 122], [-80, 108], [-207, -57], [-3, 174],
  ];
  // sáng dần từ gần kinh đô ra xa
  BO.sort((a, b) => Math.hypot(a[0] - CAPITAL.x, a[1] - CAPITAL.z) - Math.hypot(b[0] - CAPITAL.x, b[1] - CAPITAL.z));
  const boPts = BO.map(([x, z]) => P(x, 6, z));
  const hvPath = timedPath([P(-90, 16, 160), P(-70, 14, 100), [CAPITAL.x, capY + 12, CAPITAL.z]], [0.5, 3, 5.5]);
  const GENS = 18;
  world.add(
    createGlows({
      count: GENS + BO.length,
      color: (i) => (i === 0 ? MOUNTAIN_COL : i < GENS ? "#ffe2a0" : "#ffc977"),
      size: (i) => (i === 0 ? 8 : i < GENS ? 3 : 5),
      minPx: 12,
      place: (i, ctx, out) => {
        const e = clock.elapsed("van-lang");
        if (i === 0) {
          hvPath(e, out);
          return smoothstep(0.2, 1, e);
        }
        if (i < GENS) {
          out.set(CAPITAL.x, capY + 12 + i * 3.2, CAPITAL.z);
          return smoothstep(0, 0.4, e - (14 + (i - 1) * 0.42)) * 0.9;
        }
        const k = i - GENS;
        const [x, y, z] = boPts[k];
        out.set(x, y, z);
        return smoothstep(0, 0.5, e - (7 + k * 0.45)) * (0.75 + 0.15 * Math.sin(ctx.time * 1.7 + k));
      },
      visible: () => clock.near("van-lang"),
    }),
  );
  const VAN_LANG = 22;
  const toCapital = (path: [number, number][]): CrowdGroup => ({
    path: [...path, [CAPITAL.x, CAPITAL.z]],
    count: 18,
    spread: [12, 14],
    color: "#2a2320",
    timing: [[3 / VAN_LANG, 0], [9 / VAN_LANG, 1]],
  });
  world.add(
    createCrowd({
      size: 4.5,
      height,
      seed: 13,
      groups: [toCapital([[-120, 20], [-80, 38]]), toCapital([[0, 20], [-25, 40]]), toCapital([[-50, -20], [-52, 20]])],
      progress: () => clamp(clock.elapsed("van-lang") / VAN_LANG),
      visible: () => clock.near("van-lang"),
    }),
  );

  // Truyền thuyết và khảo cổ: truyền thuyết (các đốm sáng) mờ đi, mặt trống đồng Ngọc Lũ — hiện vật văn hoá Đông Sơn —
  // trồi lên từ lòng đất và lộ dần từ ngôi sao giữa ra mép (0,8–6,8 s), rồi nằm yên. (Đặt mặt trống giữa đồng bằng là
  // cách trình bày, không phải nơi tìm thấy trống — trống Ngọc Lũ được tìm thấy ở Hà Nam.)
  let drumY = 0;
  for (let a = 0; a < 48; a++)
    for (let r = 0; r <= DRUM.r; r += 4) drumY = Math.max(drumY, height(DRUM.x + Math.cos((a / 48) * Math.PI * 2) * r, DRUM.z + Math.sin((a / 48) * Math.PI * 2) * r));
  const VAN_LANG_BEAT = world.beat("van-lang");
  world.add(
    createDrum({
      center: new THREE.Vector3(DRUM.x, drumY + 0.8, DRUM.z),
      radius: DRUM.r,
      resolution: q.lite ? 512 : 1024,
      load: (ctx) => ctx.t > VAN_LANG_BEAT - 0.3,
      reveal: () => clamp((clock.elapsed("khao-co") - 0.8) / 6),
      visible: () => clock.near("khao-co"),
    }),
  );

  // Giỗ Tổ: "dù ai đi ngược về xuôi" — người từ miền ngược (núi phía bắc) và từ miền xuôi (đồng bằng) cùng kéo về,
  // leo lên núi Nghĩa Lĩnh (một lượt ~18 s). Khi người đã tới, một quầng sáng ấm hiện trên đỉnh — tưởng nhớ các vua Hùng
  // (diễn hoạ; không dựng đền vì chưa đối chiếu được kiến trúc).
  const GIO = 18;
  const top = [HILL.x, ground(HILL.x, HILL.z), HILL.z] as const;
  const pilgrims = (path: [number, number][], count: number, timing: [number, number][]): CrowdGroup => ({
    path,
    count,
    spread: [8, 26],
    color: "#2a2320",
    timing,
  });
  world.add(
    createCrowd({
      size: 4.5,
      height,
      seed: 14,
      groups: [
        pilgrims([[40, 110], [0, 100], [-35, 95], [-56, 96], [-62, 96]], 55, [[0.02, 0], [0.8, 1]]),
        pilgrims([[-10, 30], [-30, 62], [-50, 84], [-60, 92]], 50, [[0.08, 0], [0.85, 1]]),
        pilgrims([[-40, 210], [-45, 160], [-55, 125], [-62, 104], [-64, 99]], 55, [[0, 0], [0.78, 1]]),
      ],
      progress: () => clamp(clock.elapsed("gio-to") / GIO),
      visible: () => clock.near("gio-to"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: "#ffc46a",
      size: 10,
      minPx: 22,
      place: (_, ctx, out) => {
        out.set(top[0], top[1] + 8, top[2]);
        return smoothstep(0.72, 0.95, clock.elapsed("gio-to") / GIO) * (0.85 + 0.15 * Math.sin(ctx.time * 1.1));
      },
      visible: () => clock.near("gio-to"),
    }),
  );

  // ---- đạo cụ ----
  const plain = (minH: number, maxH: number) => (x: number, z: number) => {
    const h = height(x, z);
    if (h < minH || h > maxH || !clearOfCam(x, z, h)) return null;
    if ((x - KNOLL.x) ** 2 + (z - KNOLL.z) ** 2 < 22 ** 2 || !offDrum(x, z)) return null;
    return h - 0.2;
  };
  // làng thời Văn Lang: chỉ gợi bằng khói bếp và vườn cau, tre — không dựng nhà (chưa có tư liệu hình dáng nhà
  // đủ chắc để vẽ lại; nhà sàn trên trống đồng chỉ là hình khắc cách điệu)
  const hamlets: Placement[] = scatter(9, rand, { x0: -150, x1: 150, z0: -10, z1: 120 }, (x, z) => {
    const h = height(x, z);
    if (h < 2.2 || h > 7 || mountainness(x, z) > 0.2 || Math.abs(x - riverCenter(z)) < 26) return null;
    return clearOfCam(x, z, h) && (x - KNOLL.x) ** 2 + (z - KNOLL.z) ** 2 > 40 ** 2 && (x - DRUM.x) ** 2 + (z - DRUM.z) ** 2 > (DRUM.r + 20) ** 2 ? h : null;
  }, 40);
  const around = (r0: number, r1: number, n: number) =>
    hamlets.flatMap((v) =>
      Array.from({ length: n }, () => {
        const a = rand() * Math.PI * 2;
        const r = r0 + rand() * (r1 - r0);
        const x = v.x + Math.cos(a) * r;
        const z = v.z + Math.sin(a) * r;
        return { x, y: height(x, z) - 0.15, z, rotY: rand() * 6.28, scale: 0.85 + rand() * 0.3 };
      }),
    );
  const karst: Placement[][] = [[], [], []];
  KARST.forEach(([x, z, h, r], i) => karst[i % 3].push({ x, y: -9, z, rotY: rand() * 6.28, scale: [r * 2.4, h + 9, r * 2.4] }));

  await world.yield();
  const actors = await Promise.all([
    createProps("bui_tre", [...around(4, 12, 4), ...scatter(Math.round(110 * q.density), rand, { x0: -200, x1: 200, z0: -40, z1: 140 }, plain(2, 9), 6)], {
      quality: q,
      recenter: true,
      shadow: q.shadows,
      sway: 0.0035,
      tint: 0.25,
      maxDistance: 320,
    }),
    createProps("cay_cau", around(5, 11, 3), { quality: q, recenter: true, shadow: q.shadows, sway: 0.003, tint: 0.2 }),
    createProps("bui_chuoi", around(4, 9, 2), { quality: q, recenter: true, shadow: q.shadows, sway: 0.02, tint: 0.2 }),
    ...karst.map((list, i) => createProps("nui_da_voi", list, { quality: q, filter: (n) => n === `da_voi_${i}` || n === `da_voi_${i}_cay`, filterId: `da_voi_${i}`, recenter: true, tint: 0.2 })),
  ]);
  for (const a of actors) world.add(a);

  // khói bếp các làng: hiện khi kể tới nước Văn Lang
  const smoke = createSmoke({ sources: hamlets.map((v) => ({ x: v.x + 2, y: v.y + 3, z: v.z })), height: 16, wind: [0.8, 0.4] });
  world.add({
    object: smoke.object,
    update(ctx) {
      smoke.object!.visible = ctx.params.village > 0.3;
      if (smoke.object!.visible) smoke.update?.(ctx);
    },
  });

  await world.yield();
  // ---- rừng núi, cỏ, lúa, đá ----
  const wide = { x0: -310, x1: 310, z0: -80, z1: 300 };
  const slopeAt = (x: number, z: number) => Math.hypot(height(x + 1, z) - height(x - 1, z), height(x, z + 1) - height(x, z - 1)) / 2;
  world.add(
    createFoliage({
      quality: q,
      kind: "tree",
      count: Math.round(1500 * q.density),
      area: wide,
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 6 || h > 80 || !offKnoll(x, z) || !offDrum(x, z) || !clearOfCam(x, z, h) || slopeAt(x, z) > 1.1) return null;
        const hill = (x - HILL.x) ** 2 + (z - HILL.z) ** 2 < (HILL.r * 1.2) ** 2;
        return hill || mountainness(x, z) > 0.25 || fbm2(x * 0.03 + 4, z * 0.03 - 2, 3) > 0.5 ? h - 0.3 : null;
      },
      scale: [1.0, 2.0],
      dark: "#16301a",
      light: "#56843a",
      seed: 61,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "bush",
      maxDistance: 300,
      count: Math.round(1200 * q.density),
      area: wide,
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 1.2 || h > 40 || !offKnoll(x, z) || !offDrum(x, z) || !clearOfCam(x, z, h)) return null;
        return fbm2(x * 0.05 - 7, z * 0.05 + 3, 3) > 0.47 ? h - 0.2 : null;
      },
      scale: [0.5, 1.2],
      dark: "#22391c",
      light: "#6b8f40",
      seed: 62,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "palm",
      count: Math.round(60 * q.density),
      area: { x0: -260, x1: 260, z0: -90, z1: -30 },
      accept: (x, z) => {
        const h = height(x, z);
        return h > 0.6 && h < 3 && !nearCam(x, z) ? h - 0.2 : null;
      },
      scale: [0.8, 1.2],
      dark: "#3d5a24",
      light: "#a4b85a",
      shadow: q.shadows,
      seed: 63,
    }),
  );
  await world.yield();
  const paddy = (ripe: boolean) => (x: number, z: number) => {
    const h = height(x, z);
    if (h < 1.6 || h > 5.4 || nearCam(x, z, 16) || mountainness(x, z) > 0.1 || Math.abs(x - riverCenter(z)) < 24) return null;
    if ((x - KNOLL.x) ** 2 + (z - KNOLL.z) ** 2 < 18 ** 2 || !offDrum(x, z)) return null;
    const c = paddyCell(x, z);
    if (c < 0.4 || (ripe ? c < 0.72 : c >= 0.72)) return null;
    const fx = Math.abs((x / 10) % 1);
    const fz = Math.abs((z / 8) % 1);
    return fx < 0.08 || fz < 0.1 ? null : h - 0.02;
  };
  const fields = { x0: -240, x1: 240, z0: -30, z1: 160 };
  world.add(createGrass({ quality: q, count: Math.round(7000 * q.density), area: fields, accept: paddy(false), height: [0.35, 0.6], blades: 6, base: "#4e7a2a", tip: "#a8c85a", sway: 0.2, seed: 71 }));
  world.add(createGrass({ quality: q, count: Math.round(2500 * q.density), area: fields, accept: paddy(true), height: [0.45, 0.7], blades: 6, base: "#8a8a3a", tip: "#e6c860", sway: 0.22, seed: 72 }));
  world.add(
    createGrass({
      quality: q,
      count: Math.round(6000 * q.density),
      area: { x0: -200, x1: 200, z0: -70, z1: 160 },
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 1 || h > 12 || nearCam(x, z, 14) || !offDrum(x, z)) return null;
        // trên gò chỉ cỏ thấp lưa thưa
        return fbm2(x * 0.06, z * 0.06, 3) > (offKnoll(x, z) ? 0.42 : 0.6) ? h - 0.05 : null;
      },
      height: [0.5, 1.0],
      base: "#5a8436",
      tip: "#b4c46a",
      seed: 73,
    }),
  );
  world.add(
    createRocks({
      quality: q,
      count: Math.round(420 * q.density),
      area: { x0: -300, x1: 300, z0: -110, z1: 300 },
      accept: (x, z) => {
        const h = height(x, z);
        if (nearCam(x, z) || !offDrum(x, z)) return null;
        return (h > -1.5 && h < 1.2 && z < -30) || (slopeAt(x, z) > 0.55 && h > 8) ? h : null;
      },
      scale: [0.4, 2.6],
      seed: 74,
    }),
  );
  world.add(createBirds({ flocks: 3, perFlock: 7, center: { x: -20, y: 0, z: 150 }, radius: 110, altitude: [70, 100], seed: 9 }));

  await world.yield();
  // ---- sương, núi xa ----
  if (!q.cheapShaders)
    world.add(
      createMist({
        center: { x: 0, y: 0, z: 60 },
        size: [520, 560],
        density: (ctx) => 1 - smoothstep(0.3, 2.0, ctx.params.mood) * 0.7,
        base: () => 0.5,
        mood: world.mood,
      }),
    );
  world.add(
    createRanges({
      center: { x: 0, y: 0, z: 40 },
      radius: 460,
      spacing: 140,
      layers: 3,
      mood: world.mood,
      profile: (a, l) => {
        // phía bắc (z dương) núi trùng điệp; phía nam để trống thành chân trời biển
        const land = smoothstep(-0.25, 0.25, Math.sin(a));
        return land * Math.pow(fbm2(a * 6 + l * 13.1, l * 3.7, 4), 1.5) * (110 + l * 60);
      },
    }),
  );
};

export default setup;
