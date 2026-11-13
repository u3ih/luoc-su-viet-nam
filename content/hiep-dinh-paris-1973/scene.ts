import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, HOI_NGHI, BAC, NAM, DONG, TAY } from "./terrain";

type Pt = [number, number];

// Hiệp định Paris — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["ban-tron","hop-kin","ky-ket","rut-quan"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[HOI_NGHI, 56]];

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
    counts: { trees: 420, bushes: 600, grass: 2400, reeds: 700 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1973,
  });

  // 1. "ban-tron": hai phía (son, xanh nhạt) đến trước, rồi thêm hai phía nữa; các đốm vàng xếp thành vòng tròn quanh nơi họp (diễn hoạ).
  const p0 = run("ban-tron", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1983, groups: [{ path: [[0, 220], [0, 80]], count: 8, spread: [2,6], color: SON, timing: [[0.02,0],[0.5,1]] }, { path: [[200, 40], [40, 40]], count: 8, spread: [2,6], color: DICH, timing: [[0.02,0],[0.5,1]] }, { path: [[-200, 40], [-40, 40]], count: 8, spread: [2,6], color: DICH, timing: [[0.3,0],[0.8,1]] }, { path: [[0, -140], [0, 0]], count: 8, spread: [2,6], color: SON, timing: [[0.3,0],[0.8,1]] }], progress: p0, visible: () => clock.near("ban-tron") }));
  { const S: Pt[] = [[28, 40], [24, 54], [14, 64], [0, 68], [-14, 64], [-24, 54], [-28, 40], [-24, 26], [-14, 16], [0, 12], [14, 16], [24, 26]]; world.add(createGlows({ count: S.length, color: GOLD, size: 13, minPx: 14, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 3, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.6 + i * 0.02, 0.75 + i * 0.02, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ban-tron") })); }
  // 2. "hop-kin": hai người (ngà, xanh nhạt) gặp riêng ở một góc; ánh lửa ở phía xa (tháng 12 năm 1972) (diễn hoạ).
  const p1 = run("hop-kin", 28);
  world.add(createCrowd({ size: 8, height: ground, seed: 2003, groups: [{ path: [[-120, 160], [-60, 120]], count: 1, spread: [0,1], color: NGHIA, timing: [[0.02,0],[0.5,1]] }, { path: [[0, 180], [-50, 125]], count: 1, spread: [0,1], color: DICH, timing: [[0.02,0],[0.5,1]] }], progress: p1, visible: () => clock.near("hop-kin") }));
  { const S: Pt[] = [[-55, 122]]; world.add(createGlows({ count: S.length, color: GOLD, size: 18, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 4, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.4 + i * 0.12, 0.55 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("hop-kin") })); }
  world.add(createFires({ sites: [[-300, 260], [-250, 300]].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: () => clock.near("hop-kin") * smoothstep(0.75, 0.9, p1()), size: 3, glow: () => 0.8 }));
  // 3. "ky-ket": theo thanh kéo, bốn phái đoàn (son, xanh nhạt) từ bốn phía tiến vào nơi ký (đốm vàng) (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["ky-ket"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 2033, groups: [{ path: [[0, 220], [0, 70]], count: 10, spread: [2,6], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[0, -140], [0, 10]], count: 10, spread: [2,6], color: SON, timing: [[0.02,0],[0.85,1]] }, { path: [[200, 40], [30, 40]], count: 10, spread: [2,6], color: DICH, timing: [[0.02,0],[0.85,1]] }, { path: [[-200, 40], [-30, 40]], count: 10, spread: [2,6], color: DICH, timing: [[0.02,0],[0.85,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("ky-ket") }));
  { const S: Pt[] = [[0, 40]]; world.add(createGlows({ count: S.length, color: GOLD, size: 26, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = inp2(ctx); return 0.8 * smoothstep(0.8 + i * 0.12, 0.9500000000000001 + i * 0.12, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ky-ket") })); }
  // 4. "rut-quan": đoàn quân (xanh nhạt) rời đi về phía đông tới chân trời; những người trở về (ngà) theo hướng ngược lại (diễn hoạ).
  const p3 = run("rut-quan", 28);
  world.add(createCrowd({ size: 4, height: ground, seed: 2053, groups: [{ path: [[0, 40], [200, 80], [390, 120]], count: 60, spread: [4,14], color: DICH, timing: [[0.02,0],[0.9,1]] }], progress: p3, visible: () => clock.near("rut-quan") }));
  world.add(createCrowd({ size: 4, height: ground, seed: 2063, groups: [{ path: [[390, -40], [200, -20], [60, 20]], count: 20, spread: [3,8], color: NGHIA, timing: [[0.2,0],[0.95,1]] }], progress: p3, visible: () => clock.near("rut-quan") }));
};

export default setup;
