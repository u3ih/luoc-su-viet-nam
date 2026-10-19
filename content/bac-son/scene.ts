import { clamp, mulberry32, smoothstep } from "@/core/engine/math";
import type { SceneSetup } from "@/core/engine/world";
import { createMist, createRanges, createSmoke } from "@/core/world/atmosphere";
import { createBeatClock } from "@/core/world/beat-clock";
import { createBirds } from "@/core/world/birds";
import { cameraClearance } from "@/core/world/clearance";
import { createCrowd, type CrowdGroup } from "@/core/world/crowd";
import { createDust } from "@/core/world/dust";
import { createFires, type FireSite } from "@/core/world/fire";
import { createFoliage } from "@/core/world/foliage";
import { createGlows } from "@/core/world/glows";
import { createGrass } from "@/core/world/grass";
import { createRocks } from "@/core/world/rocks";
import { createHeightTexture, createTerrain, fbm2 } from "@/core/world/terrain";
import { createWater } from "@/core/world/water";
import { createCave, type Mouth } from "./actors/cave";
import { createMotes } from "./actors/motes";
import { makeSites } from "./actors/sites";
import config from "./scene.config";
import { APRON, BOUNDS, colorize, faceZ, height, slopeAt, streamCenter, WATER } from "./terrain";

type Pt = [number, number];

// Văn hoá Bắc Sơn — cảnh CÁCH ĐIỆU, KHÔNG phục dựng cảnh quan, hiện vật hay đời sống người xưa:
// - mọi hoạt cảnh là hình ảnh trừu tượng: chấm sáng = địa điểm MINH HOẠ (không phải toạ độ thật), chấm tối dáng người = đoàn
//   người ước lệ, đốm sáng = ánh sáng minh hoạ lời kể;
// - không dựng công cụ đá (rìu, bàn mài), đồ gốm, trang phục, nhà ở hay di cốt vì không có hình ảnh hiện vật để dựa vào;
// - chi tiết diễn hoạ mà nguồn không nói rõ đều ghi trong TODO ở cuối story.md.
// Mỗi phân cảnh có đồng hồ riêng (createBeatClock) nên hoạt cảnh diễn trong lúc người xem dừng đọc.

const INK = "#2b2118";
const GOLD = "#ffb85c";
const PALE = "#fff0c0";
const TEAL = "#8fd8e8";
const SPROUT = "#c4e07a";

const rev = (pts: Pt[]): Pt[] => [...pts].reverse();
/** Đi tới rồi quay về cùng đường. */
const roundTrip = (pts: Pt[]): Pt[] => [...pts, ...rev(pts).slice(1)];

const BEATS = ["mo-dau", "thung-lung", "phat-hien", "riu-mai-luoi", "tuoi-tac", "bep-gom", "lam-ray", "mo-tang", "noi-tiep"];
/** Cuộn rồi dừng lại: hạt cuội ở phân cảnh "riu-mai-luoi" nằm ven suối (x, z). */
const STAGE = { x: 55, z: 138 };
/** Khoảnh đất trống giữa rừng ở phân cảnh "lam-ray". */
const CLEAR = { x: -95, z: 128 };

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const rand = mulberry32(1924);
  const { nearCam, clearOfCam } = cameraClearance(config.keyframes);
  const clock = createBeatClock(world, BEATS);
  const E = clock.elapsed;
  const N = clock.near;
  const sum = (...ids: string[]) => ids.reduce((s, id) => s + N(id), 0);

  // ---- đất, suối ----
  const heightTex = createHeightTexture(height, BOUNDS, q.lite ? 128 : 256);
  await world.yield();
  world.add(createTerrain({ bounds: BOUNDS, segments: q.terrainSeg, height, colorize, wetLevel: () => WATER, cheap: q.cheapShaders }));
  world.add(createWater({ heightTex, bounds: BOUNDS, segments: q.waterSeg, level: () => WATER, cheap: q.cheapShaders, sky: () => world.mood, colors: { deep: "#2c4a44", shallow: "#6f8c66" } }));
  await world.yield();
  world.add(createDust(q.dust, { x: 0, y: 10, z: 120 }, { x: 300, y: 60, z: 260 }));

  // ---- cửa hang (ngọn núi giữa vòng cung): hai cửa; hình dáng và vị trí chỉ là gợi ý ----
  const mouth = (x: number, y: number, width: number, h: number, fromZ: number): Mouth => {
    const zb = faceZ(x, y + 0.2, fromZ);
    const zt = faceZ(x, y + h, fromZ);
    return { x, y, z: zb - 0.3, width, height: h, lean: Math.atan2(zt - zb, h) };
  };
  const main = mouth(0, APRON.y, 14, 11, 186);
  const side0 = mouth(-20, APRON.y + 14, 8, 6, 186);
  const side = { ...side0, z: side0.z - 0.6 };
  /** Mức rọi sáng ấm từ trong hang (người ở thì sáng). */
  const caveGlow = () => clamp(N("bep-gom") * 0.75 + N("lam-ray") * 0.3 + N("mo-tang") * 0.5 + N("thung-lung") * 0.12 + N("phat-hien") * 0.12 + N("noi-tiep") * 0.1);
  world.add(createCave({ mouths: [main, side], glow: caveGlow }));
  const mouthZ = main.z;

  // ---------------------------------------------------------------------------------------------
  // Chấm sáng "địa điểm" — dùng chung cho nhiều phân cảnh; mỗi phân cảnh quyết định độ sáng theo đồng hồ riêng.
  //   mo-dau: vài chấm le lói.  thung-lung: năm cụm lần lượt sáng.  phat-hien: đoàn khảo sát tới một hang, rồi 43 chấm lần lượt sáng.
  //   tuoi-tac: vàng ở vùng lõi sáng trước, xanh lạnh ở ngoại vi sáng sau (càng xa càng muộn).  noi-tiep: tất cả thở chậm.
  // ---------------------------------------------------------------------------------------------
  const sites = makeSites();
  const FIRST = sites.findIndex((s) => s.cluster === 3);
  const siteAlpha = (i: number, time: number) => {
    const s = sites[i];
    const core = s.kind < 2;
    let a = 0;
    const n0 = N("mo-dau");
    if (n0 > 0.002 && core && i % 6 === 0) a = Math.max(a, smoothstep(2, 5, E("mo-dau")) * 0.5 * n0);
    const n1 = N("thung-lung");
    if (n1 > 0.002 && s.kind === 0) a = Math.max(a, smoothstep(0, 0.9, E("thung-lung") - (1.5 + s.cluster * 2.6 + s.rank * 2)) * 0.85 * n1);
    const n2 = N("phat-hien");
    if (n2 > 0.002 && core) {
      const e = E("phat-hien");
      a = Math.max(a, (i === FIRST ? smoothstep(13.5, 15, e) : smoothstep(0, 0.8, e - (16.5 + s.rank * 11)) * 0.8) * n2);
    }
    const n4 = N("tuoi-tac");
    if (n4 > 0.002) {
      const e = E("tuoi-tac");
      if (core) a = Math.max(a, smoothstep(0, 0.8, e - (0.5 + s.rank * 3.5)) * 0.8 * n4);
      else a = Math.max(a, smoothstep(0, 1.2, e - (9 + (Math.hypot(s.x, s.z - 120) / 420) * 9)) * 0.85 * n4);
    }
    const n8 = N("noi-tiep");
    if (n8 > 0.002) a = Math.max(a, smoothstep(1, 3, E("noi-tiep")) * (0.35 + 0.15 * Math.sin(time * 0.8 + i)) * n8);
    return a;
  };
  world.add(
    createGlows({
      count: sites.length,
      color: (i) => (sites[i].kind === 2 ? TEAL : i === FIRST ? PALE : GOLD),
      size: (i) => (i === FIRST ? 11 : sites[i].kind === 2 ? 10 : 5.5),
      minPx: 17,
      place: (i, ctx, out) => {
        const s = sites[i];
        out.set(s.x, s.y, s.z);
        return siteAlpha(i, ctx.time);
      },
      visible: () => (sum("mo-dau", "thung-lung", "phat-hien", "tuoi-tac", "noi-tiep") > 0.002 ? 1 : 0),
    }),
  );

  // ---------------------------------------------------------------------------------------------
  // 3 · phat-hien: đoàn khảo sát (chấm người ước lệ) đi từ bờ suối vào một cụm hang phía tây (~14 s), rồi chấm sáng tới nơi.
  // ---------------------------------------------------------------------------------------------
  const first = sites[FIRST];
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 31,
      groups: [{ path: [[-8, 106], [-28, 140], [first.x + 12, first.z - 28], [first.x + 2, first.z - 9]], count: 6, spread: [5, 7], color: INK, timing: [[0, 0], [0.9, 1]] }],
      progress: () => clamp(E("phat-hien") / 15),
      visible: () => N("phat-hien"),
    }),
  );

  // ---------------------------------------------------------------------------------------------
  // 4 · riu-mai-luoi: một hòn cuội (quầng sáng) ven suối; người xem kéo thanh: 0 → 0,45 hòn cuội được ghè — vài mảnh nhỏ văng ra,
  // tia lấp lánh; 0,45 → 1 một cạnh sáng dần lên thành vành lưỡi sắc, tia sáng chạy qua lại (mài). Hình trừu tượng, không vẽ rìu.
  // ---------------------------------------------------------------------------------------------
  const stageY = height(STAGE.x, STAGE.z);
  const FLAKES = 10;
  const EDGE = 8;
  const SPARKS = 6;
  const flake = Array.from({ length: FLAKES }, () => ({ a: rand() * Math.PI * 2, r: 4 + Math.sqrt(rand()) * 11, lift: 1.5 + rand() * 3 }));
  const flakeY = flake.map((f) => height(STAGE.x + Math.cos(f.a) * f.r, STAGE.z + Math.sin(f.a) * f.r) + 0.5);
  const edgeAt = (u: number, out: { x: number; y: number; z: number }) => {
    // cạnh sắc: một cung ngắn ở phía nam (quay về phía máy quay) của hòn cuội
    const th = (u - 0.5) * 1.7;
    out.x = STAGE.x + Math.sin(th) * 6;
    out.z = STAGE.z - Math.cos(th) * 6;
    out.y = stageY + 1.4;
    return out;
  };
  const tmpEdge = { x: 0, y: 0, z: 0 };
  world.add(
    createGlows({
      count: 1 + FLAKES + EDGE + SPARKS,
      color: (i) => (i === 0 ? PALE : i <= FLAKES ? GOLD : i <= FLAKES + EDGE ? "#fff6d8" : "#ffe29a"),
      size: (i) => (i === 0 ? 20 : i <= FLAKES ? 4.6 : i <= FLAKES + EDGE ? 5 : 3.4),
      minPx: 24,
      place: (i, ctx, out) => {
        const g = clamp(ctx.inputs.mai ?? 0);
        const hit = smoothstep(0.02, 0.45, g);
        const grind = smoothstep(0.45, 0.95, g);
        if (i === 0) {
          out.set(STAGE.x, stageY + 1.4, STAGE.z);
          return (0.7 + 0.12 * Math.sin(ctx.time * 1.6)) * (1 - 0.3 * grind);
        }
        if (i <= FLAKES) {
          const f = flake[i - 1];
          out.set(STAGE.x + Math.cos(f.a) * f.r * hit, stageY + 1.4 + (flakeY[i - 1] - stageY - 1.4) * hit + Math.sin(hit * Math.PI) * f.lift, STAGE.z + Math.sin(f.a) * f.r * hit);
          const flicker = g > 0.03 && g < 0.45 ? 0.65 + 0.35 * Math.sin(ctx.time * 38 + i * 5.1) : 1;
          return smoothstep(0.02, 0.1, g) * 0.85 * flicker * (1 - 0.5 * grind);
        }
        if (i <= FLAKES + EDGE) {
          const k = i - FLAKES - 1;
          edgeAt(k / (EDGE - 1), tmpEdge);
          out.set(tmpEdge.x, tmpEdge.y, tmpEdge.z);
          return smoothstep(0.45 + k * 0.04, 0.55 + k * 0.04, g) * 0.95;
        }
        const k = i - FLAKES - EDGE - 1;
        edgeAt(0.5 + 0.5 * Math.sin(ctx.time * 5.5 + k * 1.3), tmpEdge);
        out.set(tmpEdge.x, tmpEdge.y + 0.3, tmpEdge.z);
        return smoothstep(0.45, 0.55, g) * Math.pow(0.5 + 0.5 * Math.sin(ctx.time * 13 + k * 2.1), 2) * (g < 0.95 ? 1 : 0.35);
      },
      visible: () => N("riu-mai-luoi"),
    }),
  );

  // ---------------------------------------------------------------------------------------------
  // 5 · tuoi-tac: từ vùng lõi, vài nhóm chấm sáng đi ra các hang xa hai bên và phía nam thung lũng (diễn hoạ ý "cư dân mở rộng
  // nơi ở"; số nhóm, hướng đi chỉ là minh hoạ).
  // ---------------------------------------------------------------------------------------------
  const peri = sites.filter((s) => s.kind === 2);
  // đường đi vòng phía nam để không leo lên vách đá vôi hai bên thung lũng
  const via = (s: { x: number; z: number }): Pt[] =>
    Math.abs(s.x) > 250 ? [[0, 112], [Math.sign(s.x) * 60, 20], [Math.sign(s.x) * 250, -30], [s.x, s.z]] : [[0, 112], [s.x * 0.5, 20], [s.x, s.z]];
  const spread: CrowdGroup[] = peri.map((s) => ({ path: via(s), count: 3, spread: [8, 6], color: TEAL, drop: true, size: 0.8, timing: [[0, 0], [1, 1]] }));
  world.add(
    createCrowd({
      glow: true,
      size: 9,
      height: (x, z) => height(x, z) + 5,
      seed: 41,
      groups: spread,
      progress: () => clamp((E("tuoi-tac") - 6.5) / 13),
      visible: () => N("tuoi-tac"),
    }),
  );

  // ---------------------------------------------------------------------------------------------
  // 6 · bep-gom: bếp lửa bừng lên trước cửa hang; vài người đi ra suối nhặt ốc, trai rồi về, vài người vào rừng; xa xa một bầy thú
  // và vài người đi theo ("săn bắt" — không tả cảnh săn); cuối cùng vài đốm mờ cạnh bếp (mảnh gốm).
  // 8 · mo-tang: lửa chỉ còn than hồng; ánh sáng dịu bốc lên (không vẽ di cốt).
  // ---------------------------------------------------------------------------------------------
  const hearthAt = (x: number, z: number, order: number, size: number): FireSite => ({ x, y: height(x, z) + 0.3, z, order, size });
  const hearths: FireSite[] = [hearthAt(-5, mouthZ - 9, 0.05, 1.5), hearthAt(6, mouthZ - 12, 0.5, 0.9), hearthAt(-11, mouthZ - 14, 0.8, 0.8)];
  const lit = () => Math.max(N("bep-gom") * clamp(E("bep-gom") / 6), N("mo-tang") * 0.3, N("lam-ray") * 0.12);
  world.add(createFires({ sites: hearths, perSite: 9, size: 6, lit, glow: (ctx) => 0.35 + 0.65 * smoothstep(1.2, 2.4, ctx.params.mood) }));
  const smoke = createSmoke({ sources: hearths.map((h) => ({ x: h.x, y: h.y, z: h.z })), perSource: 28, height: 20, wind: [0.8, 0.5] });
  world.add({
    object: smoke.object,
    update(ctx) {
      const on = lit() > 0.15;
      smoke.object!.visible = on;
      if (on) smoke.update?.(ctx);
    },
  });
  const stay: [number, number][] = [[0, 0], [0.36, 0.5], [0.62, 0.5], [0.96, 1]];
  const walkToStream: Pt[] = [[-8, mouthZ - 22], [-30, 160], [-46, 122], [-50, 100]];
  const walkToWood: Pt[] = [[8, mouthZ - 22], [52, 172], [100, 152], [130, 150]];
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 51,
      groups: [
        { path: roundTrip(walkToStream), count: 7, spread: [12, 14], color: INK, timing: stay, show: [0, 0.98] },
        { path: roundTrip(walkToWood), count: 4, spread: [7, 6], color: "#3a2b20", timing: [[0, 0], [0.5, 0.5], [1, 1]] },
        { path: [[95, 178], [70, 160], [40, 150], [18, 142]], count: 6, spread: [14, 8], color: "#6a4a30", timing: [[0, 0], [1, 0.8]], size: 0.55 },
        { path: [[115, 186], [92, 166], [66, 154]], count: 3, spread: [6, 5], color: INK, timing: [[0.05, 0], [1, 0.85]], show: [0, 1.1] },
      ],
      progress: () => clamp(E("bep-gom") / 30),
      visible: () => N("bep-gom"),
    }),
  );
  world.add(
    createGlows({
      count: 3,
      color: "#e6b98a",
      size: 1.4,
      minPx: 13,
      place: (i, ctx, out) => {
        out.set(-5 + (i - 1) * 3.2, height(-5, mouthZ - 9) + 0.6, mouthZ - 6 - i * 1.5);
        return smoothstep(11 + i * 1.5, 13 + i * 1.5, E("bep-gom")) * 0.8;
      },
      visible: () => N("bep-gom"),
    }),
  );

  // ---------------------------------------------------------------------------------------------
  // 7 · lam-ray: vài người từ hang tới một khoảnh đất trống giữa rừng, rồi những mầm xanh nhỏ (minh hoạ GIẢ THUYẾT "làm rẫy")
  // lần lượt hiện thành lưới — suy đoán của nhà nghiên cứu, không phải bằng chứng đã tìm thấy.
  // ---------------------------------------------------------------------------------------------
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 61,
      groups: [{ path: [[-8, mouthZ - 22], [-36, 166], [-76, 142], [CLEAR.x + 9, CLEAR.z + 5]], count: 6, spread: [6, 8], color: INK, timing: [[0, 0], [0.9, 1]] }],
      progress: () => clamp(E("lam-ray") / 13),
      visible: () => N("lam-ray"),
    }),
  );
  const SPR = 5;
  const sprout = Array.from({ length: SPR * SPR }, (_, i) => {
    const x = CLEAR.x + ((i % SPR) - 2) * 5 + (rand() - 0.5) * 1.6;
    const z = CLEAR.z + (Math.floor(i / SPR) - 2) * 5 + (rand() - 0.5) * 1.6;
    return { x, z, y: height(x, z) + 0.8 };
  });
  world.add(
    createGlows({
      count: sprout.length,
      color: SPROUT,
      size: 2.8,
      minPx: 16,
      place: (i, ctx, out) => {
        const s = sprout[i];
        out.set(s.x, s.y + Math.sin(ctx.time * 1.1 + i) * 0.12, s.z);
        return smoothstep(0, 1.6, E("lam-ray") - (9 + (i % SPR) * 0.5 + Math.floor(i / SPR) * 1.4)) * 0.8;
      },
      visible: () => N("lam-ray"),
    }),
  );

  // 8 · mo-tang (tiếp): vài chỗ trên thềm trước cửa hang có ánh sáng dịu bốc lên — số chỗ, vị trí chỉ là minh hoạ.
  const restSites = [-4.2, -1.4, 1.5, 4.4].map((dx, i) => ({ x: dx, y: APRON.y + 0.3, z: mouthZ - 8 + (i % 2) * 2.4, delay: 1.2 + i * 2.2 }));
  world.add(createMotes({ sites: restSites, perSite: 14, rise: 11, size: 3.4, spread: 1.2, color: "#f6b98a", seed: 21, visible: () => N("mo-tang"), elapsed: () => E("mo-tang") }));

  // ---------------------------------------------------------------------------------------------
  // 9 · noi-tiep: hai dòng ánh sáng (vàng, xanh lạnh) từ hai phía nam đi vào thung lũng và gặp nhau — hai văn hoá cùng tồn tại một
  // thời gian; rồi một dòng nhạt đi tiếp ra phía đồng bằng — "về sau" (Mai Pha). Hướng, số lượng chỉ là minh hoạ.
  // ---------------------------------------------------------------------------------------------
  const MEET: Pt = [20, 128];
  world.add(
    createCrowd({
      glow: true,
      size: 9,
      height: (x, z) => height(x, z) + 5,
      seed: 71,
      groups: [
        { path: [[420, -40], [260, -60], [120, 5], [60, 100], MEET], count: 9, spread: [10, 12], color: GOLD, arrive: PALE, timing: [[0, 0], [1, 1]] },
        { path: [[60, -190], [40, -80], [28, 40], [26, 100], MEET], count: 9, spread: [10, 12], color: TEAL, arrive: PALE, timing: [[0.05, 0], [1, 1]] },
      ],
      progress: () => clamp(E("noi-tiep") / 18),
      visible: () => N("noi-tiep"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 9,
      height: (x, z) => height(x, z) + 5,
      seed: 72,
      groups: [{ path: [MEET, [100, 40], [200, -40], [310, -120]], count: 8, spread: [8, 8], color: "#fff0c0", drop: true, size: 0.8, timing: [[0, 0], [1, 1]] }],
      progress: () => clamp((E("noi-tiep") - 14) / 14),
      visible: () => N("noi-tiep"),
    }),
  );

  // ---- cây, cỏ, đá ----
  await world.yield();
  const wide = { x0: -420, x1: 420, z0: -300, z1: 440 };
  const clearZone = (x: number, z: number) => Math.hypot(x - CLEAR.x, z - CLEAR.z) < 26 || Math.hypot(x - STAGE.x, z - STAGE.z) < 14 || Math.hypot(x - APRON.x, (z - APRON.z) * 0.9) < 26;
  const dry = (x: number, z: number) => {
    const h = height(x, z);
    return h > 0.9 && !clearZone(x, z) && clearOfCam(x, z, h, 8) ? h : null;
  };
  // rừng phủ chân núi và đỉnh núi đá vôi; sườn dốc thì để trơ đá
  world.add(
    createFoliage({
      quality: q,
      kind: "tree",
      count: Math.round(900 * q.density),
      area: wide,
      accept: (x, z) => {
        const y = dry(x, z);
        if (y === null || slopeAt(x, z) > 0.55) return null;
        return y > 6 || fbm2(x * 0.03 + 4, z * 0.03 - 2, 3) > 0.5 ? y - 0.3 : null;
      },
      scale: [1.0, 1.9],
      dark: "#17301a",
      light: "#5a8a3a",
      seed: 91,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "bush",
      maxDistance: 240,
      count: Math.round(800 * q.density),
      area: wide,
      accept: (x, z) => {
        const y = dry(x, z);
        if (y === null || slopeAt(x, z) > 0.7) return null;
        return fbm2(x * 0.05 - 7, z * 0.05 + 3, 3) > 0.5 ? y - 0.2 : null;
      },
      scale: [0.5, 1.1],
      dark: "#22391c",
      light: "#6f9244",
      seed: 92,
    }),
  );
  await world.yield();
  world.add(
    createRocks({
      quality: q,
      count: Math.round(260 * q.density),
      area: { x0: -320, x1: 320, z0: -100, z1: 340 },
      accept: (x, z) => {
        const h = height(x, z);
        const s = slopeAt(x, z);
        if (h < 0.6 || s < 0.25 || s > 1.4 || clearZone(x, z) || !clearOfCam(x, z, h, 4)) return null;
        return h;
      },
      scale: [0.8, 3.2],
      stone: "#a79f8d",
      moss: "#667c3e",
      seed: 93,
    }),
  );
  world.add(
    createGrass({
      quality: q,
      count: Math.round(7000 * q.density),
      area: { x0: -300, x1: 300, z0: -220, z1: 220 },
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 0.7 || h > 8 || slopeAt(x, z) > 0.3 || Math.hypot(x - CLEAR.x, z - CLEAR.z) < 24 || Math.hypot(x - STAGE.x, z - STAGE.z) < 12 || nearCam(x, z, 14)) return null;
        return fbm2(x * 0.05 + 11, z * 0.05, 3) > 0.42 ? h - 0.05 : null;
      },
      height: [0.45, 0.9],
      base: "#4e7a2a",
      tip: "#b2c860",
      seed: 94,
    }),
  );
  world.add(
    createGrass({
      quality: q,
      count: Math.round(1800 * q.density),
      area: { x0: -200, x1: 200, z0: 40, z1: 130 },
      accept: (x, z) => {
        // lau sậy mép suối
        const h = height(x, z);
        return h > -0.6 && h < 0.8 && Math.abs(z - streamCenter(x)) < 22 && !nearCam(x, z, 14) ? h - 0.1 : null;
      },
      height: [1.1, 2.0],
      blades: 9,
      base: "#7a7a44",
      tip: "#eadba0",
      sway: 0.05,
      seed: 95,
    }),
  );
  world.add(createBirds({ flocks: 2, perFlock: 6, center: { x: 0, y: 0, z: 120 }, radius: 150, altitude: [55, 90], seed: 17 }));

  await world.yield();
  if (!q.cheapShaders)
    world.add(
      createMist({
        center: { x: 0, y: 0, z: 120 },
        size: [800, 800],
        density: (ctx) => 0.25 + 0.6 * (1 - smoothstep(0.3, 1.2, ctx.params.mood)),
        base: () => 2,
        mood: world.mood,
      }),
    );
  world.add(
    createRanges({
      center: { x: 0, y: 0, z: 140 },
      radius: 560,
      spacing: 150,
      layers: 3,
      mood: world.mood,
      profile: (a, l) => Math.pow(fbm2(a * 6 + l * 9.7, l * 3.1, 4), 1.5) * (110 + l * 60),
    }),
  );
};

export default setup;
