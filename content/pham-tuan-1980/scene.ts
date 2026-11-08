import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, BE_PHONG } from "./terrain";

type Pt = [number, number];

// Phạm Tuân bay vào vũ trụ — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["phi-cong","phong-tau","thi-nghiem","ve-sau"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[BE_PHONG, 48]];

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
    counts: { trees: 60, bushes: 300, grass: 2600, reeds: 100 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1980,
  });

  // 1. "phi-cong": những chấm sáng (máy bay huấn luyện) lượn vòng trên trời; đốm ngà (học viên) dưới mặt đất (diễn hoạ).
  const p0 = run("phi-cong", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 90, seed: 1990, groups: [{ path: [[200, 0], [162, 118], [62, 190], [-62, 190], [-162, 118], [-200, 0], [-162, -118], [-62, -190], [62, -190], [162, -118], [200, 0]], count: 3, spread: [10,200], color: "#f4f2ea", timing: [[0.02,0],[1,1]] }], progress: p0, visible: () => clock.near("phi-cong") }));
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: NGHIA, size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.1 + i * 0.12, 0.25 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phi-cong") })); }
  // 2. "phong-tau": theo thanh kéo, đốm sáng trắng (tàu Soyuz 37) rời bệ phóng bay vút lên cao, để lại vệt lửa (diễn hoạ).
  const inp1 = (ctx: FrameCtx) => clamp((ctx.inputs["phong-tau"] ?? 0) / 0.9);
  world.add(createFires({ sites: [[0, 0], [6, 4], [-6, 4]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("phong-tau") * smoothstep(0.02, 0.9, inp1(ctx)), size: 3, glow: () => 0.8 }));
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 19, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-tau") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 19, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 19, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.12000000000000001 + i * 0.12, 0.27 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-tau") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 19, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 32, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.19 + i * 0.12, 0.33999999999999997 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-tau") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 19, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 45, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.26 + i * 0.12, 0.41000000000000003 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-tau") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 19, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 58, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.33 + i * 0.12, 0.48 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-tau") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 19, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 71, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-tau") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 19, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 85, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.47000000000000003 + i * 0.12, 0.62 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-tau") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 19, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 98, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.54 + i * 0.12, 0.6900000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-tau") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 19, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 111, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.6100000000000001 + i * 0.12, 0.7600000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-tau") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 19, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 124, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.6800000000000002 + i * 0.12, 0.8300000000000002 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-tau") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 19, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 137, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.7500000000000001 + i * 0.12, 0.9000000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-tau") })); }
  { const S: Pt[] = [[0, 0]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 19, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 150, S[i][1]); const k = inp1(ctx); return 0.8 * smoothstep(0.8200000000000001 + i * 0.12, 0.9700000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("phong-tau") })); }
  // 3. "thi-nghiem": vòng đốm sáng cao trên trời (quỹ đạo, trạm Salyut 6); đốm xanh (bèo hoa dâu) nhỏ bên cạnh (diễn hoạ).
  const p2 = run("thi-nghiem", 28);
  { const S: Pt[] = [[160, 0], [155, 41], [139, 80], [113, 113], [80, 139], [41, 155], [0, 160], [-41, 155], [-80, 139], [-113, 113], [-139, 80], [-155, 41], [-160, 0], [-155, -41], [-139, -80], [-113, -113], [-80, -139], [-41, -155], [0, -160], [41, -155], [80, -139], [113, -113], [139, -80], [155, -41]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 10, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 110, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.03 + i * 0.03, 0.18 + i * 0.03, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-nghiem") })); }
  { const S: Pt[] = [[150, 50]]; world.add(createGlows({ count: S.length, color: "#7fbf6a", size: 19, minPx: 24, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 110, S[i][1]); const k = p2(); return 0.8 * smoothstep(0.5 + i * 0.12, 0.65 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("thi-nghiem") })); }
  // 4. "ve-sau": đốm sáng hạ dần xuống thảo nguyên (Soyuz 36 trở về); người (son) chạy tới đón (diễn hoạ).
  const p3 = run("ve-sau", 28);
  { const S: Pt[] = [[80, 60]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 120, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.03 + i * 0.12, 0.18 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 60]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 103, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.11 + i * 0.12, 0.26 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 60]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 87, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.19 + i * 0.12, 0.33999999999999997 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 60]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 70, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.27 + i * 0.12, 0.42000000000000004 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 60]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 54, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.35 + i * 0.12, 0.5 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 60]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 37, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.43000000000000005 + i * 0.12, 0.5800000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 60]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 21, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.51 + i * 0.12, 0.66 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  { const S: Pt[] = [[80, 60]]; world.add(createGlows({ count: S.length, color: "#fff6dc", size: 16, minPx: 18, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p3(); return 0.8 * smoothstep(0.5900000000000001 + i * 0.12, 0.7400000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ve-sau") })); }
  world.add(createCrowd({ size: 4, height: ground, seed: 2240, groups: [{ path: [[-100, -100], [75, 55]], count: 16, spread: [10,60], color: SON, timing: [[0.6,0],[1,1]] }], progress: p3, visible: () => clock.near("ve-sau") }));
};

export default setup;
