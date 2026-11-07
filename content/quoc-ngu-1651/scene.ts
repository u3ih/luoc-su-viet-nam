import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, CANG, DINH, LANG, XOM, LANG2, XA } from "./terrain";

type Pt = [number, number];

// Chữ Quốc ngữ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["hoc-tieng","nhieu-nguoi","in-roma","chinh-ly","pho-bien"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[CANG, 40], [DINH, 44], [LANG, 40], [XOM, 36], [LANG2, 36]];

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => !spots.some(([c, r]) => near(c, r)(x, z)),
    water: { deep: "#2f4a48", shallow: "#86997a" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 320, y: 30, z: 320 } },
    counts: { trees: 450, bushes: 600, grass: 2400, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1651,
  });

  // 1. "hoc-tieng": vài chấm xanh nhạt (giáo sĩ) theo đường biển vào cảng rồi lên dinh; người (son) ở dinh tụ lại, đốm ngà sáng dần (diễn hoạ).
  const p0 = run("hoc-tieng", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1661, groups: [{ path: [[390, 120], [260, 60], CANG, DINH], count: 3, spread: [6,10], color: DICH, timing: [[0.03,0],[0.85,1]] }], progress: p0, visible: () => clock.near("hoc-tieng") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1671, groups: [{ path: [[-40, 140], DINH], count: 14, spread: [30,40], color: SON, timing: [[0.1,0],[0.8,1]] }], progress: p0, visible: () => clock.near("hoc-tieng") }));
  { const S: Pt[] = [DINH]; world.add(createGlows({ count: S.length, color: NGHIA, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.7 + i * 0.12, 0.85 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hoc-tieng") })); }
  // 2. "nhieu-nguoi": các chấm xanh nhạt tỏa về nhiều làng, người (son) ở mỗi làng đến gặp; đốm ngà (ghi chép) sáng dần ở từng nơi (diễn hoạ).
  const p1 = run("nhieu-nguoi", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1691, groups: [{ path: [DINH, [-40, 0], LANG], count: 2, spread: [5,8], color: DICH, timing: [[0.03,0],[0.7,1]] }, { path: [DINH, [-80, 110], XOM], count: 2, spread: [5,8], color: DICH, timing: [[0.08,0],[0.75,1]] }, { path: [CANG, LANG2], count: 2, spread: [5,8], color: DICH, timing: [[0.12,0],[0.8,1]] }], progress: p1, visible: () => clock.near("nhieu-nguoi") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1701, groups: [{ path: [[-160, -130], LANG], count: 10, spread: [26,30], color: SON, timing: [[0.2,0],[0.85,1]] }, { path: [[-260, 170], XOM], count: 10, spread: [26,30], color: SON, timing: [[0.25,0],[0.85,1]] }, { path: [[100, -170], LANG2], count: 10, spread: [26,30], color: SON, timing: [[0.3,0],[0.9,1]] }], progress: p1, visible: () => clock.near("nhieu-nguoi") }));
  { const S: Pt[] = [DINH, LANG, XOM, LANG2]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("nhieu-nguoi") })); }
  // 3. "in-roma": một chấm ngà (những trang ghi chép) rời cảng theo đường biển ra xa phía đông nam theo thanh kéo, các đốm vàng sáng dần dọc đường biển (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["in-roma"] ?? 0) / 0.9);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1721, groups: [{ path: [DINH, CANG, [290, -40], [340, -200], XA], count: 2, spread: [5,8], color: NGHIA, size: 1.5, timing: [[0,0],[1,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("in-roma") }));
  { const S: Pt[] = [[290, -40], [320, -120], [340, -200], [365, -270], XA]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.05 + i * 0.17, 0.2 + i * 0.17, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("in-roma") })); }
  // 4. "chinh-ly": đốm vàng sáng dần ở dinh và các làng (từ điển, chữ viết được chỉnh lý); người (son) đi lại giữa các làng (diễn hoạ).
  const p3 = run("chinh-ly", 28);
  { const S: Pt[] = [XOM, LANG, DINH, LANG2]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.1 + i * 0.15, 0.25 + i * 0.15, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("chinh-ly") })); }
  world.add(createCrowd({ size: 5, height: ground, seed: 1751, groups: [{ path: [LANG, [-60, 10], DINH], count: 10, spread: [20,30], color: SON, timing: [[0.05,0],[0.8,1]] }, { path: [XOM, [-80, 100], DINH], count: 10, spread: [20,30], color: SON, timing: [[0.15,0],[0.9,1]] }], progress: p3, visible: () => clock.near("chinh-ly") }));
  // 5. "pho-bien": người (son) từ khắp nơi đổ về các làng và cảng, đốm vàng sáng khắp vùng (diễn hoạ).
  const p4 = run("pho-bien", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1761, groups: [{ path: [[-380, -40], LANG], count: 16, spread: [30,50], color: SON, timing: [[0.03,0],[0.75,1]] }, { path: [[-380, 260], XOM], count: 16, spread: [30,50], color: SON, timing: [[0.06,0],[0.8,1]] }, { path: [[0, -300], LANG2], count: 16, spread: [30,50], color: SON, timing: [[0.1,0],[0.85,1]] }, { path: [[0, 300], DINH], count: 16, spread: [30,50], color: SON, timing: [[0.12,0],[0.9,1]] }], progress: p4, visible: () => clock.near("pho-bien") }));
  { const S: Pt[] = [LANG, XOM, LANG2, DINH, CANG, [-260, 0], [-60, 200], [-20, -200]]; world.add(createGlows({ count: S.length, color: GOLD, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p4(); return 0.8 * smoothstep(0.3 + i * 0.06, 0.44999999999999996 + i * 0.06, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("pho-bien") })); }
};

export default setup;
