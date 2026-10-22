import { clamp, mulberry32, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, CITY, LAKE, OATH, WATER, bankDist, colorize, height, lakeDist, riverX } from "./terrain";

type Pt = [number, number];

// Bình Ngô đại cáo — cảnh CÁCH ĐIỆU. Người = chấm dáng người, chủ tướng / bài cáo / truyền thuyết = đốm sáng; không vẽ thành Đông Quan,
// cung điện, thuyền rồng, rùa, gươm, trang phục, cờ. Vị trí hồ, sông, nơi hội thề, đường quân Minh rút là diễn hoạ.
// Son = quân Lam Sơn, mực = quân Minh, ngà = sứ giả / tướng / người đi thuyền, vàng = quầng sáng tượng trưng.

const INK = "#2a2320";
const SON = "#a83a24";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";

const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const [cx, cz] = CITY;
/** Dinh Bồ Đề bên bờ đông sông Hồng. */
const BO_DE: Pt = [riverX(110) + 80, 110];
/** Bến bờ tây và bờ đông, chỗ qua sông. */
const WEST_LANDING: Pt = [riverX(110) - 40, 110];
const EAST_LANDING: Pt = [riverX(110) + 40, 110];

/** Các làng khắp nơi — sáng lên khi bài cáo truyền tới (diễn hoạ). */
const rand = mulberry32(1428);
const VILLAGES: Pt[] = [];
while (VILLAGES.length < 34) {
  const x = -380 + rand() * 760;
  const z = -380 + rand() * 760;
  if (bankDist(x, z) > 20 && Math.hypot(x - cx, z - cz) > 150) VILLAGES.push([x, z]);
}
const vDist = VILLAGES.map(([x, z]) => Math.hypot(x - cx, z - cz));
const vMax = Math.max(...vDist);

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["dong-quan", "hoi-the", "ve-nuoc", "dai-cao", "len-ngoi", "tra-guom"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => Math.hypot(x - cx, z - cz) > 130 && lakeDist(x, z) > 1.4 && Math.hypot(x - OATH[0], z - OATH[1]) > 50,
    water: { deep: "#2f4a40", shallow: "#7d9478" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 40, z: 320 } },
    counts: { trees: 420, bushes: 600, grass: 4200, reeds: 1600 },
    birds: { center: { x: LAKE.x, y: 0, z: LAKE.z }, radius: 180 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1428,
  });

  // 1. "dong-quan": quân Minh (mực) dồn trong thành; nghĩa quân (son) vây quanh; bên kia sông, đại doanh Bồ Đề có quầng sáng — Lê Lợi.
  //    Một sứ giả (ngà) từ trong thành qua sông sang Bồ Đề — xin giảng hoà (diễn hoạ).
  const DQ = 22;
  const dq = run("dong-quan", DQ);
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 111,
      groups: [
        { path: [[cx + 4, cz], CITY], count: 80, spread: [120, 100], color: INK },
        ...Array.from({ length: 8 }, (_, k) => {
          const a = (k / 8) * Math.PI * 2 + 0.2;
          return { path: [ring(CITY, 200, a), ring(CITY, 130, a)] as Pt[], count: 16, spread: [60, 12] as [number, number], color: SON, timing: [[0, 0.6], [0.3, 1]] as [number, number][] };
        }),
        { path: [[BO_DE[0] + 40, BO_DE[1] + 30], BO_DE], count: 40, spread: [50, 40], color: SON },
        { path: [[cx + 40, cz + 10], WEST_LANDING, EAST_LANDING, [BO_DE[0] - 14, BO_DE[1]]], count: 2, spread: [4, 4], color: IVORY, timing: [[0.3, 0], [0.85, 1]], show: [0.28, 2] },
      ],
      progress: dq,
      visible: () => clock.near("dong-quan"),
    }),
  );
  const camp = (vis: (ctx: FrameCtx) => number) =>
    createGlows({
      count: 1,
      color: GOLD,
      size: 22,
      minPx: 22,
      place: (_, ctx, out) => {
        out.set(BO_DE[0], ground(BO_DE[0], BO_DE[1]) + 8, BO_DE[1]);
        return 0.85 + 0.15 * Math.sin(ctx.time * 1.5);
      },
      visible: vis,
    });
  world.add(camp(() => clock.near("dong-quan")));

  // 2. "hoi-the": từ trong thành, các tướng Minh (ngà) cùng quân hộ tống (mực) ra bãi phía nam; từ phía đông, Lê Lợi (vàng) cùng quân (son) tới.
  //    Hai bên đứng đối diện; một quầng sáng hiện giữa bãi — lời thề (diễn hoạ).
  const HT = 22;
  const ht = run("hoi-the", HT);
  const [ox, oz] = OATH;
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 112,
      groups: [
        { path: [[cx - 10, cz - 40], [ox - 10, oz + 60], [ox - 14, oz + 16]], count: 40, spread: [50, 30], color: INK, timing: [[0.03, 0], [0.6, 1]] },
        { path: [[cx - 10, cz - 30], [ox - 6, oz + 50], [ox - 6, oz + 8]], count: 4, spread: [12, 2], color: IVORY, timing: [[0.03, 0], [0.62, 1]] },
        { path: [[ox + 260, oz + 60], [ox + 80, oz + 10], [ox + 16, oz - 4]], count: 50, spread: [50, 30], color: SON, timing: [[0.06, 0], [0.62, 1]] },
      ],
      progress: ht,
      visible: () => clock.near("hoi-the"),
    }),
  );
  world.add(
    createGlows({
      count: 2,
      color: GOLD,
      size: (i) => (i === 0 ? 14 : 26),
      minPx: 18,
      place: (i, ctx, out) => {
        const t = clamp(clock.elapsed("hoi-the") / HT);
        if (i === 0) {
          // Lê Lợi đi cùng quân son tới bãi
          const f = smoothstep(0.06, 0.62, t);
          out.set(ox + 260 + (ox + 8 - (ox + 260)) * f, ground(ox, oz) + 6, oz + 60 * (1 - f));
          return 0.9;
        }
        out.set(ox, ground(ox, oz) + 10, oz);
        return smoothstep(0.66, 0.85, t) * (0.85 + 0.15 * Math.sin(ctx.time * 1.4));
      },
      visible: () => clock.near("hoi-the"),
    }),
  );

  // 3. "ve-nuoc": quân Minh (mực) rời thành theo hai ngả: xuống bến, đi theo mặt sông ngược lên phía bắc (thuyền), và theo đường bộ về phía bắc.
  //    Dọc đường, người dân, quân Lam Sơn (son) đứng nhìn (diễn hoạ).
  const VN = 28;
  const vn = run("ve-nuoc", VN);
  const upriver: Pt[] = [WEST_LANDING, [riverX(200), 200], [riverX(320), 320], [riverX(430), 440]];
  world.add(
    createCrowd({
      size: 7,
      height: ground,
      seed: 113,
      groups: [
        { path: [[cx + 20, cz], WEST_LANDING, ...upriver.slice(1)], count: 70, spread: [26, 160], color: INK, timing: [[0.03, 0], [0.95, 1]] },
        { path: [[cx - 20, cz + 30], [-40, 260], [-90, 440]], count: 70, spread: [30, 160], color: INK, timing: [[0.08, 0], [1, 1]] },
        { path: [[-80, 200], [-60, 200]], count: 16, spread: [10, 80], color: SON },
        { path: [[-10, 330], [10, 330]], count: 16, spread: [10, 80], color: SON },
      ],
      progress: vn,
      visible: () => clock.near("ve-nuoc"),
    }),
  );

  // 4. "dai-cao": người xem kéo thanh — sứ giả (ngà) toả từ kinh thành ra bốn phía; làng gần sáng trước, làng xa sáng sau (diễn hoạ).
  const spread = (ctx: FrameCtx) => clamp((ctx.inputs["ban-cao"] ?? 0) / 0.9);
  world.add(
    createGlows({
      count: VILLAGES.length + 1,
      color: GOLD,
      size: (i) => (i === VILLAGES.length ? 34 : 16),
      minPx: 14,
      place: (i, ctx, out) => {
        if (i === VILLAGES.length) {
          out.set(cx, ground(cx, cz) + 10, cz);
          return 0.9 + 0.1 * Math.sin(ctx.time * 1.4);
        }
        const [x, z] = VILLAGES[i];
        out.set(x, ground(x, z) + 5, z);
        const at = vDist[i] / vMax;
        return smoothstep(at - 0.08, at + 0.02, spread(ctx) * 1.05) * (0.75 + 0.2 * Math.sin(ctx.time * 1.8 + i));
      },
      visible: () => clock.near("dai-cao"),
    }),
  );
  world.add(
    createCrowd({
      size: 6,
      height: ground,
      seed: 114,
      groups: Array.from({ length: 10 }, (_, k) => {
        const a = (k / 10) * Math.PI * 2 + 0.15;
        return { path: [CITY, ring(CITY, 360, a)] as Pt[], count: 2, spread: [4, 6] as [number, number], color: IVORY };
      }),
      progress: (ctx) => spread(ctx),
      visible: (ctx) => clock.near("dai-cao") * smoothstep(0.01, 0.06, spread(ctx)),
    }),
  );

  // 5. "len-ngoi": người từ bốn phía tụ về kinh thành; đèn đuốc thắp quanh; quầng sáng lớn giữa kinh thành — Lê Thái Tổ lên ngôi (diễn hoạ).
  const LN = 22;
  const ln = run("len-ngoi", LN);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 115,
      groups: Array.from({ length: 6 }, (_, k) => {
        const a = (k / 6) * Math.PI * 2 + 0.5;
        return { path: [ring(CITY, 330, a), ring(CITY, 120, a), ring(CITY, 40, a)] as Pt[], count: 26, spread: [40, 60] as [number, number], color: SON, timing: [[0.02 + k * 0.03, 0], [0.7 + k * 0.02, 1]] as [number, number][] };
      }),
      progress: ln,
      visible: () => clock.near("len-ngoi"),
    }),
  );
  world.add(
    createFires({
      sites: Array.from({ length: 10 }, (_, i) => {
        const [x, z] = ring(CITY, 60, (i / 10) * Math.PI * 2);
        return { x, y: ground(x, z) + 1.2, z, order: i / 10, size: 1.3 };
      }),
      lit: () => clock.near("len-ngoi") * smoothstep(0.4, 0.8, ln()),
      size: 3.5,
      glow: () => 0.9,
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 36,
      minPx: 28,
      place: (_, ctx, out) => {
        out.set(cx, ground(cx, cz) + 12, cz);
        return smoothstep(0.7, 0.9, ln()) * (0.9 + 0.1 * Math.sin(ctx.time * 1.2));
      },
      visible: () => clock.near("len-ngoi"),
    }),
  );

  // 6. "tra-guom" (truyền thuyết): một chiếc thuyền (vài chấm ngà trên mặt hồ) lướt chậm; giữa hồ một đốm sáng vàng nổi lên, đến gần thuyền,
  //    rồi chìm xuống (diễn hoạ; không vẽ rùa, gươm).
  const TG = 22;
  const tg = run("tra-guom", TG);
  const boat: Pt[] = Array.from({ length: 9 }, (_, i) => {
    const a = -1.2 + (i / 8) * 2.2;
    return [LAKE.x + Math.cos(a) * LAKE.rx * 0.45, LAKE.z + Math.sin(a) * LAKE.rz * 0.5];
  });
  world.add(
    createCrowd({
      size: 2.4,
      height: () => WATER + 0.3,
      seed: 116,
      groups: [{ path: boat, count: 4, spread: [2, 5], color: IVORY, timing: [[0.02, 0], [0.5, 0.75], [1, 0.8]] }],
      progress: tg,
      visible: () => clock.near("tra-guom"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 12,
      minPx: 18,
      place: (_, ctx, out) => {
        const t = tg();
        const up = smoothstep(0.35, 0.5, t) * (1 - smoothstep(0.75, 0.92, t));
        out.set(LAKE.x - 4, WATER + 0.5 + up * 2.5, LAKE.z + 2);
        return up * (0.85 + 0.15 * Math.sin(ctx.time * 2));
      },
      visible: () => clock.near("tra-guom"),
    }),
  );
};

export default setup;
