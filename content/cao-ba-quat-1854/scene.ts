import { clamp, smoothstep } from "@/core/engine/math";
import type { FrameCtx, SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import config from "./scene.config";
import { BOUNDS, WATER, bankDist, colorize, height, MY_LUONG, QUOC_OAI, UNG_HOA, THANH_OAI, YEN_SON, TRUONG_THI, PHU_THI } from "./terrain";

type Pt = [number, number];

// Cao Bá Quát và cuộc nổi dậy Mỹ Lương — cảnh CÁCH ĐIỆU. Người = chấm dáng người; thuyền = chấm sáng trên mặt nước; các nơi = đốm sáng; không vẽ thành, cờ hiệu, trang phục. Vị trí các nơi là diễn hoạ, khoảng cách bị thu ngắn rất nhiều; số chấm không tương ứng số người.
// Son = người; ngà = nhân vật hoặc nơi được kể đến; xanh nhạt = phía đối diện hoặc từ xa tới; vàng = ánh sáng tượng trưng.

const SON = "#a83a24";
const NGHIA = "#f0e2b8";
const DICH = "#a8c8f0";
const GOLD = "#ffd27a";

const ring = (c: Pt, r: number, a: number): Pt => [c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r];
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
const near = (c: Pt, r: number) => (x: number, z: number) => Math.hypot(x - c[0], z - c[1]) < r;

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["truong-thi","quoc-oai","my-luong","ket-cuc"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const spots: [Pt, number][] = [[QUOC_OAI, 40], [UNG_HOA, 40], [THANH_OAI, 40]];

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
    counts: { trees: 650, bushes: 700, grass: 2000, reeds: 600 },
    forestAt: 0.56,
    birds: { center: { x: 0, y: 0, z: 40 }, radius: 220 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 0.8 },
    seed: 1854,
  });

  // 1. "truong-thi": các đốm vàng nhỏ (bài thi) sáng ở trường thi; đốm ngà ở giữa rồi lịm (bị giam) (diễn hoạ).
  const p0 = run("truong-thi", 28);
  { const S: Pt[] = [[260, -300], [270, -300], [280, -300], [290, -300], [260, -310], [270, -310], [280, -310], [290, -310]]; world.add(createGlows({ count: S.length, color: GOLD, size: 6, minPx: 9, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 2, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.03 + i * 0.04, 0.18 + i * 0.04, k) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("truong-thi") })); }
  { const S: Pt[] = [TRUONG_THI]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p0(); return 0.8 * smoothstep(0.05 + i * 0.12, 0.2 + i * 0.12, k) * (1 - smoothstep(0.55, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("truong-thi") })); }
  // 2. "quoc-oai": đốm ngà đến phủ Quốc Oai, rồi rời đi về quê Phú Thị (diễn hoạ).
  const p1 = run("quoc-oai", 28);
  world.add(createCrowd({ glow: true, size: 5, height: (x, z) => ground(x, z) + 2, seed: 1884, groups: [{ path: [[390, 100], QUOC_OAI, [200, 260], PHU_THI], count: 1, spread: [3,3], color: NGHIA, timing: [[0.02,0],[0.95,1]] }], progress: p1, visible: () => clock.near("quoc-oai") }));
  { const S: Pt[] = [QUOC_OAI]; world.add(createGlows({ count: S.length, color: GOLD, size: 14, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 6, S[i][1]); const k = p1(); return 0.8 * smoothstep(0.2 + i * 0.12, 0.35 + i * 0.12, k) * (1 - smoothstep(0.5, 0.7, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("quoc-oai") })); }
  // 3. "my-luong": các toán người (son) từ núi rừng Mỹ Lương kéo xuống các phủ huyện theo thanh kéo, lửa bùng ở Quốc Oai, Ứng Hòa, Thanh Oai (diễn hoạ).
  const inp2 = (ctx: FrameCtx) => clamp((ctx.inputs["my-luong"] ?? 0) / 0.9);
  world.add(createCrowd({ size: 5, height: ground, seed: 1904, groups: [{ path: [MY_LUONG, [-100, 80], QUOC_OAI], count: 24, spread: [20,60], color: SON, timing: [[0,0],[0.7,1]] }, { path: [MY_LUONG, [-60, -120], UNG_HOA], count: 22, spread: [20,60], color: SON, timing: [[0.1,0],[0.8,1]] }, { path: [MY_LUONG, [0, 0], THANH_OAI], count: 22, spread: [20,60], color: SON, timing: [[0.2,0],[0.95,1]] }], progress: (ctx) => 0.02 + 0.98 * inp2(ctx), visible: () => clock.near("my-luong") }));
  world.add(createFires({ sites: [QUOC_OAI, UNG_HOA, THANH_OAI].map(([x, z], i, a) => ({ x, y: ground(x, z) + 1, z, order: i / a.length, size: 1.1 })), lit: (ctx) => clock.near("my-luong") * smoothstep(0.55, 0.9, inp2(ctx)), size: 4, glow: () => 0.8 }));
  // 4. "ket-cuc": quân triều đình (xanh nhạt) từ đồng bằng tiến lên núi Yên Sơn; người (son) giữ chân núi; đốm ngà lịm dần, lửa bùng (diễn hoạ).
  const p3 = run("ket-cuc", 28);
  world.add(createCrowd({ size: 5, height: ground, seed: 1924, groups: [{ path: [[200, 250], [40, 200]], count: 36, spread: [40,60], color: DICH, timing: [[0.03,0],[0.7,1]] }], progress: p3, visible: () => clock.near("ket-cuc") }));
  world.add(createCrowd({ size: 5, height: ground, seed: 1934, groups: [{ path: [[-120, 120], [-60, 170]], count: 22, spread: [40,30], color: SON, timing: [[0,0],[0.4,1]] }], progress: p3, visible: () => clock.near("ket-cuc") }));
  { const S: Pt[] = [YEN_SON]; world.add(createGlows({ count: S.length, color: NGHIA, size: 16, minPx: 16, place: (i, ctx, out) => { out.set(S[i][0], ground(S[i][0], S[i][1]) + 10, S[i][1]); const k = p3(); return 0.8 * smoothstep(0 + i * 0.12, 0.15 + i * 0.12, k) * (1 - smoothstep(0.55, 0.8, k)) * (0.85 + 0.15 * Math.sin(ctx.time * 1.7 + i)); }, visible: () => clock.near("ket-cuc") })); }
  world.add(createFires({ sites: Array.from({ length: 6 }, (_, i) => { const [x, z] = ring(YEN_SON, 30, (i / 6) * Math.PI * 2 + 0.3); return { x, y: ground(x, z) + 1, z, order: i / 6, size: 1.1 }; }), lit: () => clock.near("ket-cuc") * smoothstep(0.6, 0.9, p3()), size: 3, glow: () => 0.8 }));
};

export default setup;
