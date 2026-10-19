import { clamp, mulberry32, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createMist, createRanges, createSmoke } from "@/core/world/atmosphere";
import { createBeatClock } from "@/core/world/beat-clock";
import { createBirds } from "@/core/world/birds";
import { cameraClearance } from "@/core/world/clearance";
import { createCrowd } from "@/core/world/crowd";
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
import config from "./scene.config";
import { BOUNDS, colorize, faceZ, height, LEDGE, PATH_FOOT, slopeAt, streamCenter, WATER } from "./terrain";

type Pt = [number, number];

// Văn hoá Hoà Bình — cảnh CÁCH ĐIỆU. Mỗi phân cảnh một hoạt cảnh riêng, chạy theo đồng hồ phân cảnh (createBeatClock) trong
// lúc người xem dừng đọc. Nguyên tắc: chỉ minh hoạ phần lời kể có nguồn; người vẽ bằng chấm dáng đứng (không trang phục,
// công cụ đá, đồ gốm, nhà ở); di cốt không được vẽ — chỉ gợi bằng ánh sáng. Chi tiết diễn hoạ mà nguồn không nói được ghi TODO
// trong story.md.

const BEATS = ["thung-lung", "colani", "cuoi-ghe", "thoi-gian", "bua-an", "mo-tang", "dong-nam-a"];

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const { clearOfCam } = cameraClearance(config.keyframes);
  const clock = createBeatClock(world, BEATS);
  // phân cảnh cuối dài (kèm mục nguồn) nên keyframe cuối chỉ tới khi cuộn gần hết trang: đồng hồ riêng, vào sớm hơn để hoạt cảnh chạy lúc người xem đọc
  const last = createBeatClock(world, ["di-san"], { enter: 1.0, leave: 1.6 });

  // ---- đất, suối ----
  const heightTex = createHeightTexture(height, BOUNDS, q.lite ? 128 : 256);
  await world.yield();
  world.add(createTerrain({ bounds: BOUNDS, segments: q.terrainSeg, height, colorize, wetLevel: () => WATER, cheap: q.cheapShaders }));
  world.add(createWater({ heightTex, bounds: BOUNDS, segments: q.waterSeg, level: () => WATER, cheap: q.cheapShaders, sky: () => world.mood, colors: { deep: "#2c4a44", shallow: "#6f8c66" } }));
  await world.yield();
  world.add(createDust(q.dust, { x: 0, y: 10, z: 0 }, { x: 280, y: 60, z: 280 }));

  // ---- mái đá chính (rộng, thấp) và một hang nhỏ ở ngọn núi phía tây. Hình dáng, vị trí chỉ là gợi ý. ----
  const mouth = (x: number, y: number, width: number, h: number, fromZ: number): Mouth => {
    // áp vào vách đá: chân cửa ở chỗ vách chạm độ cao y, đỉnh cửa nghiêng theo độ ngả của vách
    const zb = faceZ(x, y + 0.2, fromZ);
    const zt = faceZ(x, y + h, fromZ);
    return { x, y, z: zb - 0.3, width, height: h, lean: Math.atan2(zt - zb, h) };
  };
  const main = mouth(LEDGE.x, LEDGE.y, 20, 8, LEDGE.z);
  const small = mouth(-175, 16, 9, 7, 6);
  const mainZ = main.z;
  /** Mức rọi sáng ấm từ trong mái đá theo từng phân cảnh (người ở thì sáng). */
  const occupied = () =>
    clamp(
      clock.near("thung-lung") * 0.15 +
        clock.near("colani") * 0.2 +
        clock.near("cuoi-ghe") * (0.3 + 0.2 * smoothstep(16, 20, clock.elapsed("cuoi-ghe"))) +
        clock.near("thoi-gian") * 0.25 +
        clock.near("bua-an") * (0.3 + 0.45 * smoothstep(26, 30, clock.elapsed("bua-an"))) +
        clock.near("mo-tang") * 0.22 +
        clock.near("dong-nam-a") * 0.2 +
        last.near("di-san") * 0.3,
    );
  world.add(createCave({ mouths: [main, small], glow: occupied }));

  // ---- phase: tiến độ qua ba giai đoạn niên đại (người xem kéo ở phân cảnh "thoi-gian") ----
  const PHASE_BEAT = world.beat("thoi-gian");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - PHASE_BEAT));
    target.phase += ((ctx.inputs.phase ?? 0) - target.phase) * w;
  });

  // ---- hoạt cảnh 1 · thung-lung: sương sớm tan dần, chim bay; hai cửa (mái đá, hang nhỏ) lần lượt sáng ấm ----
  world.add(
    createMist({
      center: { x: 0, y: 0, z: 0 },
      size: [700, 700],
      layers: 3,
      density: () => {
        const dawn = clock.near("thung-lung") * (1 - smoothstep(2, 18, clock.elapsed("thung-lung")));
        const stay = Math.max(clock.near("mo-tang") * 0.55, clock.near("cuoi-ghe") * 0.2, clock.near("colani") * 0.25);
        return q.cheapShaders ? 0 : Math.max(dawn * 1.1, stay);
      },
      base: () => 2,
      mood: world.mood,
    }),
  );
  const birds = createBirds({ flocks: 2, perFlock: 6, center: { x: 30, y: 0, z: 10 }, radius: 110, altitude: [55, 85], seed: 17 });
  world.add({
    object: birds.object,
    update(ctx) {
      const on = clock.near("thung-lung") * smoothstep(3, 6, clock.elapsed("thung-lung")) + clock.near("dong-nam-a") + last.near("di-san") * 0.8;
      birds.object!.visible = on > 0.15;
      if (birds.object!.visible) birds.update?.(ctx);
    },
  });
  const mouthGlow = [main, small];
  world.add(
    createGlows({
      count: 2,
      color: "#ffcf86",
      size: 7,
      minPx: 16,
      visible: () => clock.near("thung-lung"),
      place: (i, ctx, out) => {
        const m = mouthGlow[i];
        out.set(m.x, m.y + m.height * 0.35, m.z - 1.5);
        const on = smoothstep(6 + i * 3, 8.5 + i * 3, clock.elapsed("thung-lung"));
        return on * (0.7 + 0.3 * Math.sin(ctx.time * 1.4 + i));
      },
    }),
  );

  // ---- hoạt cảnh 2 · colani: đoàn khảo sát (chấm xanh nhạt) đi từ thung lũng lên thềm; chín điểm sáng đánh dấu "chín cuộc
  // khai quật" lần lượt hiện quanh thung lũng. Số điểm theo lời kể, VỊ TRÍ CHỈ MINH HOẠ. ----
  const SURVEY = 17;
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 74,
      groups: [{ path: [[26, -100], [14, -74], [3, PATH_FOOT], [1, -2], [0, LEDGE.z - 2]], count: 6, spread: [3, 6], color: "#d6e4ec" }],
      progress: () => clamp(clock.elapsed("colani") / SURVEY),
      visible: () => clock.near("colani"),
    }),
  );
  const dig: Pt[] = [[-85, 8], [-62, -8], [-38, 14], [-14, 26], [24, 28], [46, 12], [-22, -20], [12, -34], [-72, 30]];
  const digSites = dig.map(([x, z], i) => ({ x, y: height(x, z) + 1, z, delay: 3 + i * 1.5 }));
  world.add(createMotes({ sites: digSites, perSite: 5, rise: 12, size: 4.5, spread: 0.8, color: "#ffe2a0", seed: 12, visible: () => clock.near("colani"), elapsed: () => clock.elapsed("colani") }));

  // ---- hoạt cảnh 3 · cuoi-ghe: nhóm nhỏ đi xuống suối, dừng lại, rồi mang về mái đá; sau đó thềm đá có những nhịp sáng ngắn
  // (chỉ gợi việc làm công cụ — KHÔNG vẽ công cụ hay mảnh tước). ----
  const CYCLE = 32;
  const bank = (x: number): Pt => [x, streamCenter(x) + 11];
  const toStream: Pt[] = [[0, LEDGE.z - 2], [0.6, -4], [3, PATH_FOOT], [8, -76], bank(12)];
  const cyc = (id: string) => (clock.elapsed(id) % CYCLE) / CYCLE;
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 81,
      groups: [{ path: [...toStream, ...[...toStream].reverse().slice(1)], count: 5, spread: [3, 7], color: "#f0e0bc", timing: [[0, 0], [0.22, 0.5], [0.48, 0.5], [0.7, 1]], show: [0, 0.96] }],
      progress: (ctx) => cyc("cuoi-ghe"),
      visible: () => clock.near("cuoi-ghe"),
    }),
  );
  const knap = [-5, -1.5, 2, 5].map((dx, i) => ({ x: dx, y: LEDGE.y + 0.4, z: mainZ - 2 - (i % 2) * 1.2, delay: 18 + i * 1.1 }));
  world.add(createMotes({ sites: knap, perSite: 4, rise: 2.2, size: 1.1, spread: 0.5, color: "#fff0d0", seed: 14, visible: () => clock.near("cuoi-ghe"), elapsed: () => clock.elapsed("cuoi-ghe") }));

  // ---- hoạt cảnh 4 · thoi-gian: ba nhóm đốm sáng trên sườn các ngọn núi, sáng dần theo ba giai đoạn khi kéo thanh ----
  type Site3 = [number, number, number];
  const phaseSites: Site3[][] = [
    [[-35, 12, -5], [-22, 30, -5], [-95, 14, 100], [-70, 30, 100], [-110, 22, 100]],
    [[30, 16, -5], [40, 32, -5], [75, 18, 110], [100, 34, 110], [120, 20, 110]],
    [[-14, 46, -5], [16, 52, -5], [130, 40, 110], [-50, 56, 100], [55, 56, 110]],
  ];
  const phaseColor = ["#cfe4ff", "#ffd88e", "#ffab62"];
  const flat = phaseSites.flatMap((g, k) => g.map(([x, y, from]) => ({ k, x, y, z: faceZ(x, y, from) - 1.4 })));
  world.add(
    createGlows({
      count: flat.length,
      color: (i) => phaseColor[flat[i].k],
      size: 22,
      minPx: 30,
      visible: () => clock.near("thoi-gian"),
      place: (i, ctx, out) => {
        const s = flat[i];
        out.set(s.x, s.y + 1 + 0.6 * Math.sin(ctx.time * 0.8 + i), s.z);
        const p = ctx.params.phase;
        // nhóm đầu nhẹ nhàng hiện ra sẵn; hai nhóm sau chỉ hiện khi kéo qua ngưỡng của nó
        const base = s.k === 0 ? 0.35 + 0.65 * smoothstep(0, 0.12, p) : smoothstep(s.k * 0.33, s.k * 0.33 + 0.2, p);
        const active = 1 - smoothstep(0.3, 0.75, Math.abs(p * 3 - (s.k + 0.5)));
        const idle = s.k === 0 ? 0.12 * Math.sin(ctx.time * 1.2 + i) : 0;
        return clamp(base * (0.55 + 0.45 * active) + idle);
      },
    }),
  );

  // ---- hoạt cảnh 5 · bua-an: hai nhóm đi ra suối (ốc, trai) và vào rừng phía tây, rồi cùng về mái đá; lửa lên ở thềm đá, khói
  // bay; vỏ ốc vãi trước cửa. Số người, đường đi chỉ minh hoạ. ----
  const toForest: Pt[] = [[0, LEDGE.z - 2], [0.6, -4], [3, PATH_FOOT], [-50, -26], [-110, -8], [-150, 6]];
  const both = (a: Pt[]) => [...a, ...[...a].reverse().slice(1)];
  const meal: [number, number][] = [[0, 0], [0.3, 0.5], [0.46, 0.5], [0.76, 1]];
  world.add(
    createCrowd({
      size: 6,
      height,
      seed: 82,
      groups: [
        { path: both(toStream), count: 5, spread: [3, 6], color: "#f0e0bc", timing: meal, show: [0, 0.97] },
        { path: both(toForest), count: 5, spread: [3, 6], color: "#e6d4a8", timing: [[0.05, 0], [0.33, 0.5], [0.5, 0.5], [0.8, 1]], show: [0.03, 0.97] },
      ],
      progress: () => cyc("bua-an"),
      visible: () => clock.near("bua-an"),
    }),
  );
  world.add(
    createCrowd({
      size: 1.1,
      height,
      seed: 83,
      groups: [{ path: [[0.4, -4], [0.6, LEDGE.z - 6]], count: 26, spread: [11, 0], color: "#efe6d2", drop: true }],
      progress: () => clamp((clock.elapsed("bua-an") - 8) / 30),
      visible: () => clock.near("bua-an"),
    }),
  );
  const hearths: FireSite[] = [
    { x: -3.5, y: LEDGE.y + 0.3, z: mainZ - 3, order: 0, size: 0.7 },
    { x: 3, y: LEDGE.y + 0.3, z: mainZ - 3.6, order: 0.5, size: 0.6 },
  ];
  const lit = (ctx?: FrameCtx) => clock.near("bua-an") * smoothstep(26, 31, clock.elapsed("bua-an"));
  world.add(createFires({ sites: hearths, perSite: 8, size: 2.4, lit, glow: () => 0.6 }));
  const smoke = createSmoke({ sources: hearths.map((h) => ({ x: h.x, y: h.y, z: h.z })), perSource: 20, height: 14, wind: [0.6, 0.4] });
  world.add({
    object: smoke.object,
    update(ctx) {
      const on = lit() > 0.15;
      smoke.object!.visible = on;
      if (on) smoke.update?.(ctx);
    },
  });

  // ---- hoạt cảnh 6 · mo-tang: ánh sáng dịu bốc lên từ vài chỗ trong mái đá (không vẽ di cốt; số mộ, vị trí chỉ minh hoạ) ----
  const graves = [-6, -1.5, 3, 7].map((dx, i) => ({ x: dx, y: LEDGE.y + 0.3, z: mainZ - 1.8 + (i % 2) * 0.9, delay: 1.2 + i * 2.4 }));
  world.add(createMotes({ sites: graves, perSite: 8, rise: 8, size: 3, spread: 0.6, color: "#fff1cf", seed: 21, visible: () => clock.near("mo-tang"), elapsed: () => clock.elapsed("mo-tang") }));

  // ---- hoạt cảnh 7 · dong-nam-a: đốm sáng lần lượt hiện ở xa dần quanh thung lũng — "có ở nhiều nơi". KHÔNG phải đường di cư,
  // vị trí không phải thật. ----
  const farRand = mulberry32(58);
  const far = Array.from({ length: 16 }, (_, i) => {
    // một nửa gần trục nhìn (cho màn dọc điện thoại), một nửa rải rộng
    const wide = i % 2 === 1;
    const x = wide ? clamp(-330 + (i / 15) * 660 + (farRand() - 0.5) * 60, -360, 360) : (farRand() - 0.5) * 220;
    const z = wide ? 100 + farRand() * 300 : 130 + farRand() * 170;
    return { x, y: Math.max(height(x, z), 30) + 16, z, delay: 2 + ((i * 7) % 16) * 0.8 };
  });
  world.add(
    createGlows({
      count: far.length,
      color: "#ffe2a8",
      size: 30,
      minPx: 30,
      visible: () => clock.near("dong-nam-a"),
      place: (i, ctx, out) => {
        const s = far[i];
        out.set(s.x, s.y + 1.5 * Math.sin(ctx.time * 0.6 + i), s.z);
        return smoothstep(s.delay, s.delay + 2, clock.elapsed("dong-nam-a")) * (0.75 + 0.25 * Math.sin(ctx.time * 1.1 + i * 1.7));
      },
    }),
  );

  // ---- hoạt cảnh 8 · di-san: hai điểm sáng ấm bốc cao — hang Xóm Trại và mái đá Làng Vành (VỊ TRÍ CHỈ MINH HOẠ, không phải
  // toạ độ thật), trời ngả hoàng hôn ----
  const heritage: Pt[] = [[-48, 34], [-88, 146]];
  const heritageSites = heritage.map(([x, z], i) => ({ x, y: height(x, z) + 1.5, z, delay: 2 + i * 3 }));
  world.add(createMotes({ sites: heritageSites, perSite: 16, rise: 44, size: 13, spread: 1.6, color: "#ffd9a0", seed: 31, visible: () => last.near("di-san"), elapsed: () => last.elapsed("di-san") }));

  world.add(
    createGlows({
      count: heritageSites.length,
      color: "#ffb35c",
      size: 40,
      minPx: 46,
      visible: () => last.near("di-san"),
      place: (i, ctx, out) => {
        const h = heritageSites[i];
        out.set(h.x, h.y + 10 + 0.8 * Math.sin(ctx.time * 0.7 + i), h.z);
        return smoothstep(h.delay, h.delay + 2.5, last.elapsed("di-san")) * (0.8 + 0.2 * Math.sin(ctx.time * 1.3 + i));
      },
    }),
  );

  // ---- cây, cỏ, đá ----
  await world.yield();
  const wide = { x0: -400, x1: 400, z0: -320, z1: 440 };
  const dry = (x: number, z: number) => {
    const h = height(x, z);
    return h > 0.9 && clearOfCam(x, z, h, 8) ? h : null;
  };
  const ledgeZone = (x: number, z: number, w: number, extra = 14) => Math.abs(x - LEDGE.x) < w && z > PATH_FOOT - 10 && z < LEDGE.z + extra;
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
        if (ledgeZone(x, z, 13)) return null;
        return y > 6 || fbm2(x * 0.03 + 4, z * 0.03 - 2, 3) > 0.5 ? y - 0.3 : null;
      },
      scale: [1.0, 1.9],
      dark: "#17301a",
      light: "#5a8a3a",
      seed: 71,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "bush",
      maxDistance: 240,
      count: Math.round(900 * q.density),
      area: wide,
      accept: (x, z) => {
        const y = dry(x, z);
        if (y === null || slopeAt(x, z) > 0.7) return null;
        if (ledgeZone(x, z, 7)) return null;
        return fbm2(x * 0.05 - 7, z * 0.05 + 3, 3) > 0.5 ? y - 0.2 : null;
      },
      scale: [0.5, 1.1],
      dark: "#22391c",
      light: "#6f9244",
      seed: 72,
    }),
  );
  await world.yield();
  world.add(
    createRocks({
      quality: q,
      count: Math.round(260 * q.density),
      area: { x0: -300, x1: 300, z0: -200, z1: 320 },
      accept: (x, z) => {
        const h = height(x, z);
        const s = slopeAt(x, z);
        if (h < 0.6 || s < 0.25 || s > 1.4 || !clearOfCam(x, z, h, 4)) return null;
        if (ledgeZone(x, z, 14, 16)) return null;
        return h;
      },
      scale: [0.8, 3.2],
      stone: "#a79f8d",
      moss: "#667c3e",
      seed: 73,
    }),
  );
  world.add(
    createGrass({
      quality: q,
      count: Math.round(7000 * q.density),
      area: { x0: -300, x1: 300, z0: -250, z1: 120 },
      accept: (x, z) => {
        const h = height(x, z);
        if (h < 0.7 || h > 8 || slopeAt(x, z) > 0.3 || ledgeZone(x, z, 6, 8)) return null;
        return fbm2(x * 0.05 + 11, z * 0.05, 3) > 0.42 ? h - 0.05 : null;
      },
      height: [0.45, 0.9],
      base: "#4e7a2a",
      tip: "#b2c860",
      seed: 74,
    }),
  );
  world.add(
    createGrass({
      quality: q,
      count: Math.round(1800 * q.density),
      area: { x0: -300, x1: 300, z0: -200, z1: -50 },
      accept: (x, z) => {
        // lau sậy mép suối
        const h = height(x, z);
        return h > -0.6 && h < 0.8 && Math.abs(z - streamCenter(x)) < 20 ? h - 0.1 : null;
      },
      height: [1.1, 2.0],
      blades: 9,
      base: "#7a7a44",
      tip: "#eadba0",
      sway: 0.05,
      seed: 75,
    }),
  );

  await world.yield();
  world.add(
    createRanges({
      center: { x: 0, y: 0, z: 60 },
      radius: 520,
      spacing: 140,
      layers: 3,
      mood: world.mood,
      profile: (a, l) => Math.pow(fbm2(a * 6 + l * 9.7, l * 3.1, 4), 1.5) * (110 + l * 60),
    }),
  );
};

export default setup;
