import { clamp, mulberry32, smoothstep } from "@/core/engine/math";
import type { SceneSetup } from "@/core/engine/world";
import { createMist, createRanges } from "@/core/world/atmosphere";
import { createBeatClock } from "@/core/world/beat-clock";
import { createBirds } from "@/core/world/birds";
import { cameraClearance } from "@/core/world/clearance";
import { createCrowd, type CrowdGroup } from "@/core/world/crowd";
import { createDust } from "@/core/world/dust";
import { createFoliage } from "@/core/world/foliage";
import { createGrass } from "@/core/world/grass";
import { createRocks } from "@/core/world/rocks";
import { createHeightTexture, createTerrain, fbm2 } from "@/core/world/terrain";
import { createWater } from "@/core/world/water";
import { makeSpots } from "./actors/findspots";
import { createGlows, timedPath } from "@/core/world/glows";
import config from "./scene.config";
import { BOUNDS, chuZ, colorize, CONFLUENCE_X, height, maX, NUI_DO, NUONG, QUAN_YEN } from "./terrain";

// Chương "Người tối cổ ở núi Đọ". Cảnh cách điệu, KHÔNG phục dựng cảnh quan hay đời sống thời đồ đá cũ:
// - đất, nước, cây cỏ chỉ là bối cảnh chung (sông, đồi đá bazan thấp);
// - mọi hoạt cảnh là hình ảnh trừu tượng: chấm sáng = vị trí hiện vật MINH HOẠ (không phải toạ độ thật),
//   chấm tối dáng người = đoàn người ước lệ (không vẽ trang phục, công cụ, hình dáng người cổ);
// - không dựng công cụ đá, hang, lửa hay nhà vì các nguồn không mô tả.
// Mỗi phân cảnh có đồng hồ riêng (createBeatClock) nên hoạt cảnh diễn trong lúc người xem dừng đọc.

const lerpY = (a: number, b: number, t: number) => a + (b - a) * t;
const INK = "#2a2320";
const GOLD = "#ffb85c";
const PALE = "#fff0c0";
const TEAL = "#8fd8e8";

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const rand = mulberry32(1960);
  const { nearCam, clearOfCam } = cameraClearance(config.keyframes);
  const ground = (x: number, z: number) => Math.max(height(x, z), 0);
  const slopeAt = (x: number, z: number) => Math.hypot(height(x + 1, z) - height(x - 1, z), height(x, z + 1) - height(x, z - 1)) / 2;

  // ---- đất & nước ----
  const heightTex = createHeightTexture(height, BOUNDS, q.lite ? 128 : 256);
  await world.yield();
  world.add(createTerrain({ bounds: BOUNDS, segments: q.terrainSeg, height, colorize, wetLevel: () => 0, cheap: q.cheapShaders }));
  world.add(createWater({ heightTex, bounds: BOUNDS, segments: q.waterSeg, level: () => 0, cheap: q.cheapShaders, sky: () => world.mood, colors: { deep: "#244244", shallow: "#7d8a62" } }));
  await world.yield();
  world.add(createDust(q.dust, { x: 0, y: 0, z: 60 }, { x: 200, y: 40, z: 200 }));

  const clock = createBeatClock(world, ["mo-dau", "nui-ben-song", "phat-hien", "da-bazan", "cong-cu", "nguoi-toi-co", "bao-nhieu-tuoi", "quan-yen-nuong", "di-san"]);
  const E = clock.elapsed;
  const N = clock.near;
  const sum = (...ids: string[]) => ids.reduce((s, id) => s + N(id), 0);

  // ---------------------------------------------------------------------------------------------
  // Chấm sáng minh hoạ hiện vật trên sườn đông và tây nam núi Đọ. Mảnh tước (nhiều) + tám rìu tay (to hơn, sáng hơn).
  // Cùng một bộ vị trí dùng cho nhiều phân cảnh; mỗi phân cảnh quyết định độ sáng theo đồng hồ riêng.
  // ---------------------------------------------------------------------------------------------
  const AXES = 8;
  const spots = makeSpots(Math.round(40 + 30 * Math.min(1, q.density + 0.3)));
  const axes = spots.slice(0, AXES);
  const flakes = spots.slice(AXES);
  const nF = flakes.length;
  const all = [...flakes, ...axes];
  // thứ tự bật sáng của từng mảnh (xáo trộn cố định)
  const order = flakes.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const rank = flakes.map((_, i) => order.indexOf(i) / Math.max(1, nF - 1)); // 0..1

  /** Độ sáng của chấm i (0..1) ở thời điểm hiện tại, gộp theo từng phân cảnh; `tone` đổi pha cho bộ màu thứ hai. */
  const findAlpha = (i: number, time: number, tone: 0 | 1) => {
    const isAxe = i >= nF;
    const k = isAxe ? i - nF : 0;
    const r = isAxe ? 1 : rank[i];
    const sw = (isAxe ? k : i) % 2 === 1; // sườn tây nam
    let a = 0;
    // mở đầu: vài chấm sáng le lói báo hiệu điều sắp kể
    const n0 = N("mo-dau");
    if (n0 > 0.002 && !isAxe && i % 9 === 0 && tone === 0) a = Math.max(a, smoothstep(2, 5, E("mo-dau")) * 0.5 * n0);
    // cuộc khảo sát: đoàn tới sườn tây nam thì các chấm bên đó lần lượt sáng
    const n2 = N("phat-hien");
    if (n2 > 0.002 && !isAxe && sw && tone === 0) a = Math.max(a, smoothstep(0, 0.7, E("phat-hien") - (9 + r * 8)) * 0.8 * n2);
    // hiện vật: mảnh tước sáng dần trước, tám rìu tay sau
    const n4 = N("cong-cu");
    if (n4 > 0.002 && tone === 0) {
      const t0 = isAxe ? 11 + k * 0.9 : 1 + r * 8;
      a = Math.max(a, smoothstep(0, 0.8, E("cong-cu") - t0) * (isAxe ? 1 : 0.95) * n4);
    }
    // người xưa: chấm hiện vật nằm yên, mờ
    const n5 = N("nguoi-toi-co");
    if (n5 > 0.002 && tone === 0) a = Math.max(a, (isAxe ? 0.5 : 0.3) * n5);
    // niên đại: hai bộ màu đổi chỗ chậm — vàng (ước khoảng 300–400 nghìn năm) và xanh lạnh (ý kiến khác)
    const n6 = N("bao-nhieu-tuoi");
    if (n6 > 0.002) {
      const w = 0.5 + 0.5 * Math.cos(E("bao-nhieu-tuoi") * 0.45 + (isAxe ? 0.4 : 0));
      a = Math.max(a, (0.25 + 0.6 * (tone === 0 ? w : 1 - w)) * n6);
    }
    const n7 = N("quan-yen-nuong");
    if (n7 > 0.002 && tone === 0) a = Math.max(a, (isAxe ? 0.55 : 0.3) * n7);
    const n8 = N("di-san");
    if (n8 > 0.002 && tone === 0) a = Math.max(a, (0.4 + 0.15 * Math.sin(time * 0.8 + i)) * n8);
    return a;
  };
  const findsVisible = () => (sum("mo-dau", "phat-hien", "cong-cu", "nguoi-toi-co", "bao-nhieu-tuoi", "quan-yen-nuong", "di-san") > 0.002 ? 1 : 0);
  world.add(
    createGlows({
      count: all.length,
      color: (i) => (i >= nF ? PALE : GOLD),
      size: (i) => (i >= nF ? 9 : 4.6),
      minPx: 17,
      place: (i, ctx, out) => {
        const s = all[i];
        out.set(s.x, s.y, s.z);
        return findAlpha(i, ctx.time, 0);
      },
      visible: findsVisible,
    }),
  );
  // bộ màu xanh lạnh chỉ hiện ở phân cảnh "bao-nhieu-tuoi"
  world.add(
    createGlows({
      count: all.length,
      color: TEAL,
      size: (i) => (i >= nF ? 9 : 4.6),
      minPx: 17,
      place: (i, ctx, out) => {
        const s = all[i];
        out.set(s.x, s.y + 0.1, s.z);
        return findAlpha(i, ctx.time, 1);
      },
      visible: () => (N("bao-nhieu-tuoi") > 0.002 ? 1 : 0),
    }),
  );

  // ---------------------------------------------------------------------------------------------
  // "nui-ben-song": ánh sáng chảy theo sông Chu (từ tây) và sông Mã (từ nam), gặp nhau ở chỗ hợp lưu rồi cùng xuôi về đông;
  // sau đó đỉnh núi Đọ sáng lên. Một lượt ~14 s.
  // "quan-yen-nuong": núi Đọ sáng, ánh sáng đi sang Quan Yên rồi sang Nuông (mỗi nơi sáng lên khi tới).
  // "di-san": bốn chấm hiện lần lượt trên sườn núi — bốn lần khảo sát, khai quật; rồi tất cả thở chậm.
  // ---------------------------------------------------------------------------------------------
  const topY = (p: { x: number; z: number }) => ground(p.x, p.z) + 8;
  const chuPts: [number, number, number][] = [-330, -250, -170, -90, -10, 70, 150, CONFLUENCE_X].map((x) => [x, 5, chuZ(x)]);
  const chuT = chuPts.map((_, i) => 0.5 + (i * 6.5) / (chuPts.length - 1));
  const maPts: [number, number, number][] = [340, 280, 220, 160, 100, 40, chuZ(CONFLUENCE_X)].map((z) => [maX(z), 5, z]);
  const eastPts: [number, number, number][] = [CONFLUENCE_X, 300, 345].map((x) => [x, 5, chuZ(x)]);
  const chuPath = timedPath(chuPts, chuT);
  const maPath = timedPath(maPts, chuT.slice(0, maPts.length).map((t, i, a) => 0.5 + (i * 6.5) / (a.length - 1)));
  const eastPath = timedPath(eastPts, [7, 10, 13.5]);
  const toQY = timedPath([[NUI_DO.x, topY(NUI_DO), NUI_DO.z], [(NUI_DO.x + QUAN_YEN.x) / 2, topY(NUI_DO) + 14, (NUI_DO.z + QUAN_YEN.z) / 2], [QUAN_YEN.x, topY(QUAN_YEN), QUAN_YEN.z]], [2, 3.5, 5]);
  const toNU = timedPath([[NUI_DO.x, topY(NUI_DO), NUI_DO.z], [(NUI_DO.x + NUONG.x) / 2, topY(NUI_DO) + 14, (NUI_DO.z + NUONG.z) / 2], [NUONG.x, topY(NUONG), NUONG.z]], [6, 7.5, 9]);
  const survey = [8, 10, 12, 14].map((k) => spots[Math.min(k, spots.length - 1)]); // bốn chấm trên sườn đông
  const TRAVEL = 8; // số chấm "đi đường": hai nhánh sông, nhánh sau hợp lưu, hai đường sang núi lân cận
  world.add(
    createGlows({
      count: 8 + survey.length,
      color: (i) => (i < 3 ? PALE : i < 6 ? "#9fe0d0" : i < 8 ? PALE : GOLD),
      size: (i) => (i < 3 ? 22 : i < 8 ? 12 : 11),
      minPx: 34,
      place: (i, ctx, out) => {
        const bob = Math.sin(ctx.time * 0.9 + i) * 0.4;
        const nR = N("nui-ben-song");
        const nQ = N("quan-yen-nuong");
        const nD = N("di-san");
        if (i === 0) {
          // đỉnh núi Đọ
          out.set(NUI_DO.x, topY(NUI_DO) + bob, NUI_DO.z);
          const a1 = smoothstep(8, 10.5, E("nui-ben-song")) * nR;
          const a2 = smoothstep(0, 2, E("quan-yen-nuong")) * nQ;
          return Math.max(a1, a2) * (0.8 + 0.15 * Math.sin(ctx.time * 1.2));
        }
        if (i === 1 || i === 2) {
          // Quan Yên, Nuông
          const p = i === 1 ? QUAN_YEN : NUONG;
          out.set(p.x, topY(p) + bob, p.z);
          return smoothstep(0, 1.2, E("quan-yen-nuong") - (i === 1 ? 5 : 9)) * nQ * (0.75 + 0.15 * Math.sin(ctx.time * 1.2 + i));
        }
        const e = E("nui-ben-song");
        if (i === 3) {
          chuPath(e, out).y += bob;
          return smoothstep(0.2, 1.2, e) * (1 - smoothstep(7, 7.6, e)) * nR;
        }
        if (i === 4) {
          maPath(e, out).y += bob;
          return smoothstep(0.2, 1.2, e) * (1 - smoothstep(7, 7.6, e)) * nR;
        }
        if (i === 5) {
          eastPath(e, out).y += bob;
          return smoothstep(6.8, 7.8, e) * (1 - smoothstep(12.5, 14, e)) * nR;
        }
        const eq = E("quan-yen-nuong");
        if (i === 6) {
          toQY(eq, out).y += bob;
          return smoothstep(1.4, 2.4, eq) * (1 - smoothstep(4.8, 5.6, eq)) * nQ;
        }
        if (i === 7) {
          toNU(eq, out).y += bob;
          return smoothstep(5.4, 6.4, eq) * (1 - smoothstep(8.8, 9.6, eq)) * nQ;
        }
        // bốn lần khảo sát, khai quật
        const s = survey[i - TRAVEL];
        out.set(s.x, s.y + 5, s.z);
        const ed = E("di-san");
        const t = ed - (1.5 + (i - TRAVEL) * 3);
        return (smoothstep(0, 0.8, t) * (0.85 + 0.15 * Math.sin(ctx.time * 1.4 + i)) + Math.exp(-Math.max(t, 0) * 1.5) * smoothstep(-0.01, 0.05, t) * 0.6) * nD;
      },
      visible: () => (sum("nui-ben-song", "quan-yen-nuong", "di-san") > 0.002 ? 1 : 0),
    }),
  );

  // ---------------------------------------------------------------------------------------------
  // "da-bazan": một hòn đá (quầng sáng to) trên sườn đông; người xem kéo thanh để ghè — hòn đá vỡ thành nhiều mảnh nhỏ
  // văng ra xung quanh (mảnh tước), lúc đang vỡ có tia lấp lánh. Hình trừu tượng, không vẽ hình công cụ.
  // ---------------------------------------------------------------------------------------------
  const BLOCK = { x: 88, z: 98 };
  const blockY = ground(BLOCK.x, BLOCK.z);
  const SHARDS = 36;
  const shard = Array.from({ length: SHARDS }, () => ({ a: rand() * Math.PI * 2, r: 2.5 + Math.sqrt(rand()) * 13, lift: 2 + rand() * 5 }));
  const shardY = shard.map((s) => ground(BLOCK.x + Math.cos(s.a) * s.r, BLOCK.z + Math.sin(s.a) * s.r) + 0.4);
  world.add(
    createGlows({
      count: 1 + SHARDS,
      color: (i) => (i === 0 ? PALE : GOLD),
      size: (i) => (i === 0 ? 16 : 2.8),
      minPx: 14,
      place: (i, ctx, out) => {
        const g = clamp(ctx.inputs.ghe ?? 0);
        const sp = smoothstep(0.03, 0.85, g);
        if (i === 0) {
          // hòn đá nguyên: thở nhẹ, nhỏ dần và mờ đi khi vỡ
          out.set(BLOCK.x, blockY + 1.6, BLOCK.z);
          return (0.7 + 0.15 * Math.sin(ctx.time * 1.6)) * (1 - sp * 0.85);
        }
        const s = shard[i - 1];
        const x = BLOCK.x + Math.cos(s.a) * s.r * sp;
        const z = BLOCK.z + Math.sin(s.a) * s.r * sp;
        // văng lên rồi rơi xuống đất (parabol), mảnh nằm yên khi sp = 1
        out.set(x, lerpY(blockY + 1.6, shardY[i - 1], sp) + Math.sin(sp * Math.PI) * s.lift, z);
        const flicker = g > 0.02 && g < 0.9 ? 0.65 + 0.35 * Math.sin(ctx.time * 38 + i * 5.1) : 1;
        return smoothstep(0, 0.1, sp) * 0.9 * flicker;
      },
      visible: () => (N("da-bazan") > 0.002 ? N("da-bazan") : 0),
    }),
  );

  // ---------------------------------------------------------------------------------------------
  // "phat-hien": đoàn khảo sát (chấm người ước lệ) đi từ bờ sông sườn tây nam rồi tản ra trên sườn núi (~18 s).
  // "nguoi-toi-co": hai tốp người từ bờ sông lên sườn đông, tới nơi thì vài tia sáng nhỏ loé lên (đá được ghè) (~16 s).
  // Số người, đường đi là minh hoạ ước lệ — các nguồn không mô tả họ.
  // ---------------------------------------------------------------------------------------------
  const SURVEY = 18;
  const party = (end: [number, number], count: number): CrowdGroup => ({
    path: [[-112, -14], [-95, 55], [-74, 135], end],
    count,
    spread: [5, 7],
    color: INK,
    timing: [[0, 0], [1, 1]],
  });
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 21,
      groups: [party([-70, 150], 5), party([-52, 140], 4), party([-88, 128], 4)],
      progress: () => clamp(E("phat-hien") / SURVEY),
      visible: () => N("phat-hien"),
    }),
  );
  const GATHER = 16;
  const band = (mx: number, end: [number, number], count: number, fromX: number): CrowdGroup => ({
    path: [[fromX, -12], [mx, 45], end],
    count,
    spread: [7, 7],
    color: INK,
    timing: [[0, 0], [0.75, 1]],
  });
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 22,
      groups: [band(88, [92, 98], 7, 74), band(108, [100, 110], 5, 104)],
      progress: () => clamp(E("nguoi-toi-co") / GATHER),
      visible: () => N("nguoi-toi-co"),
    }),
  );
  const SPARKS: [number, number][] = [[91, 96], [98, 108], [94, 103]];
  world.add(
    createGlows({
      count: SPARKS.length,
      color: PALE,
      size: 4.5,
      minPx: 18,
      place: (i, ctx, out) => {
        const [x, z] = SPARKS[i];
        out.set(x, ground(x, z) + 1.4, z);
        const e = E("nguoi-toi-co");
        // tới nơi (khoảng giây thứ 12) mới loé; mỗi tia loé ngắn, lệch pha
        const arrived = smoothstep(11.5, 12.5, e);
        const burst = Math.pow(Math.max(0, Math.sin(e * 4.3 + i * 2.1)), 12);
        return arrived * burst;
      },
      visible: () => N("nguoi-toi-co"),
    }),
  );

  // ---------------------------------------------------------------------------------------------
  // "quan-yen-nuong": vài chấm hiện vật minh hoạ trên sườn hai núi lân cận, sáng lên khi ánh sáng tới.
  // ---------------------------------------------------------------------------------------------
  const nb = [QUAN_YEN, NUONG].flatMap((p, k) =>
    Array.from({ length: 10 }, () => {
      const a = rand() * Math.PI * 2;
      const r = p.s * (0.55 + rand() * 0.4);
      const x = p.x + Math.cos(a) * r;
      const z = p.z + Math.sin(a) * r;
      return { x, z, y: ground(x, z) + 0.4, k };
    }),
  );
  world.add(
    createGlows({
      count: nb.length,
      color: GOLD,
      size: 3.2,
      minPx: 14,
      place: (i, ctx, out) => {
        const s = nb[i];
        out.set(s.x, s.y, s.z);
        const t = E("quan-yen-nuong") - (s.k === 0 ? 5.3 : 9.3) - (i % 10) * 0.2;
        return smoothstep(0, 0.8, t) * 0.7 * N("quan-yen-nuong");
      },
      visible: () => N("quan-yen-nuong"),
    }),
  );

  // ---- bối cảnh: cây cỏ, đá ----
  await world.yield();
  const wide = { x0: -330, x1: 330, z0: -120, z1: 380 };
  const farFromDo = (x: number, z: number) => Math.hypot(x - NUI_DO.x, z - NUI_DO.z) > 135;
  world.add(
    createFoliage({
      quality: q,
      kind: "tree",
      count: Math.round(520 * q.density),
      area: wide,
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 2.4 || h > 40 || !clearOfCam(x, z, h) || slopeAt(x, z) > 0.8) return null;
        // quanh núi Đọ để đá lộ thiên: cây chỉ mọc xa chân núi, dày lên theo nhiễu
        if (!farFromDo(x, z)) return null;
        return fbm2(x * 0.03 + 4, z * 0.03 - 2, 3) > 0.52 ? h - 0.3 : null;
      },
      scale: [0.9, 1.6],
      dark: "#2a3a1a",
      light: "#7d9140",
      seed: 61,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "bush",
      maxDistance: 300,
      count: Math.round(900 * q.density),
      area: wide,
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 2 || h > 45 || !clearOfCam(x, z, h)) return null;
        // bụi thấp mọc thưa cả trên sườn núi Đọ, nhưng chừa dải có chấm sáng
        if (Math.hypot(x - NUI_DO.x, z - NUI_DO.z) < 130 && Math.hypot(x - NUI_DO.x, z - NUI_DO.z) > 60 && (x > 40 || (x < 0 && z > 110))) return null;
        return fbm2(x * 0.05 - 7, z * 0.05 + 3, 3) > 0.5 ? h - 0.2 : null;
      },
      scale: [0.5, 1.1],
      dark: "#3a4422",
      light: "#8a9a4a",
      seed: 62,
    }),
  );
  world.add(
    createGrass({
      quality: q,
      count: Math.round(5000 * q.density),
      area: { x0: -300, x1: 300, z0: -90, z1: 330 },
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 2.2 || h > 26 || nearCam(x, z, 14)) return null;
        return fbm2(x * 0.06, z * 0.06, 3) > 0.45 ? h - 0.05 : null;
      },
      height: [0.4, 0.9],
      base: "#6a7a34",
      tip: "#c2b46a",
      seed: 73,
    }),
  );
  // đá bazan lộ ra trên sườn ba quả núi và ven sông
  world.add(
    createRocks({
      quality: q,
      count: Math.round(340 * q.density),
      area: { x0: -320, x1: 320, z0: -90, z1: 300 },
      accept: (x, z) => {
        const h = height(x, z);
        if (nearCam(x, z)) return null;
        return (slopeAt(x, z) > 0.3 && h > 5) || (h > -1.5 && h < 1.2 && fbm2(x * 0.1, z * 0.1, 2) > 0.55) ? h : null;
      },
      scale: [0.5, 2.8],
      stone: "#5d6468",
      moss: "#6a7a44",
      seed: 74,
    }),
  );
  world.add(createBirds({ flocks: 2, perFlock: 6, center: { x: 0, y: 0, z: 40 }, radius: 130, altitude: [60, 90], seed: 9 }));

  await world.yield();
  if (!q.cheapShaders)
    world.add(
      createMist({
        center: { x: 0, y: 0, z: 20 },
        size: [640, 640],
        density: (ctx) => 1 - smoothstep(0.3, 1.5, ctx.params.mood) * 0.6,
        base: () => 0.4,
        mood: world.mood,
      }),
    );
  world.add(
    createRanges({
      center: { x: 0, y: 0, z: 60 },
      radius: 480,
      spacing: 130,
      layers: 3,
      mood: world.mood,
      profile: (a, l) => Math.pow(fbm2(a * 5 + l * 11.3, l * 3.1, 4), 1.6) * (60 + l * 45),
    }),
  );
};

export default setup;
