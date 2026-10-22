import { clamp, smoothstep } from "@/core/engine/math";
import type { SceneSetup } from "@/core/engine/world";
import { createBeatClock } from "@/core/world/beat-clock";
import { createCrowd } from "@/core/world/crowd";
import { createFires } from "@/core/world/fire";
import { createGlows } from "@/core/world/glows";
import { addLandscape, dawnNightMist } from "@/core/world/landscape";
import { createWalls } from "@/core/world/walls";
import config from "./scene.config";
import { AN_TON, BOUNDS, GATE, MA, QUARRY, WALL, WATER, bankDist, colorize, gatePoint, height, wallDistance } from "./terrain";

type Pt = [number, number];

// Nhà Hồ và thành Tây Đô — cảnh CÁCH ĐIỆU. Người = chấm dáng người, quyền lực / tin lệnh = đốm sáng; không vẽ trang phục, cờ, vũ khí,
// cung điện hay vòm cửa thành (chưa đối chiếu đủ hiện vật). Tường thành chỉ là khối theo mặt bằng gần vuông, bốn cửa, thu nhỏ.
// Phòng tuyến Đa Bang thật ở bờ sông Hồng, sông Đà (rất xa Tây Đô); ở đây đặt một dải quân phía bắc bản đồ để gợi ý — diễn hoạ.
// Son = quân nhà Hồ, mực = quân Minh, chàm = thuyền Chiêm Thành, ngà = triều đình / sứ giả, vàng = quầng sáng tượng trưng.

const INK = "#2a2320";
const SON = "#a83a24";
const CHAM = "#2c4a6a";
const IVORY = "#f0e2b8";
const GOLD = "#ffd27a";

const rev = (pts: Pt[]): Pt[] => [...pts].reverse();
const roundTrip = (pts: Pt[]): Pt[] => [...pts, ...rev(pts).slice(1)];
/** Đi đi về về `n` lượt trên cùng một đường (người khiêng đá). */
const shuttle = (pts: Pt[], n: number): Pt[] => Array.from({ length: n }, () => roundTrip(pts).slice(0, -1)).flat().concat([pts[0]]);
/** Mặt đất; trên hào, trên sông thì nổi lên mặt nước (cầu, thuyền). */
const ground = (x: number, z: number) => Math.max(height(x, z), WATER + 0.2);
/** Điểm trên sông Mã tại x (nội suy theo MA). */
const maZ = (x: number) => {
  for (let i = 0; i < MA.length - 1; i++) {
    if (x <= MA[i + 1][0]) return MA[i][1] + ((MA[i + 1][1] - MA[i][1]) * (x - MA[i][0])) / (MA[i + 1][0] - MA[i][0]);
  }
  return MA[MA.length - 1][1];
};

const N_OUT = gatePoint(GATE.bac, 40);
const N_IN = gatePoint(GATE.bac, -30);
const S_OUT = gatePoint(GATE.nam, 40);
const S_IN = gatePoint(GATE.nam, -30);
const CENTER: Pt = [0, 0];

/** Tám làng quanh thành — nơi sứ giả đưa lệnh cải cách tới (diễn hoạ). */
const VILLAGES: Pt[] = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 + 0.35;
  const r = 270 + (i % 3) * 30;
  return [Math.cos(a) * r, Math.sin(a) * r * 0.9 + 30];
});
/** Cửa gần nhất với mỗi làng — sứ giả đi ra qua cửa ấy. */
const viaGate = (p: Pt): Pt => {
  const a = Math.atan2(p[1], p[0]);
  const g = [GATE.dong, GATE.bac, GATE.tay, GATE.nam].reduce((best, at) => (Math.abs(Math.atan2(Math.sin(a - at), Math.cos(a - at))) < Math.abs(Math.atan2(Math.sin(a - best), Math.cos(a - best))) ? at : best));
  return gatePoint(g, 30);
};

const setup: SceneSetup = async (world) => {
  const clock = createBeatClock(world, ["cuoi-tran", "xay-thanh", "doi-do", "cai-cach", "quan-minh", "that-thu", "di-san"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);

  // ---- phong cảnh chung ----
  await addLandscape(world, {
    bounds: BOUNDS,
    height,
    colorize,
    level: () => WATER,
    bankDist,
    keyframes: config.keyframes,
    open: (x, z) => wallDistance(x, z) > 34 && Math.hypot(x - QUARRY[0], z - QUARRY[1]) > 30,
    water: { deep: "#2d4a45", shallow: "#7d9478" },
    dust: { center: { x: 0, y: 0, z: 0 }, extent: { x: 300, y: 40, z: 300 } },
    counts: { trees: 480, bushes: 640, grass: 4200, reeds: 1500 },
    birds: { center: { x: AN_TON[0], y: 0, z: AN_TON[1] }, radius: 200 },
    mist: { center: { x: 0, y: 0, z: 0 }, size: [800, 800], density: dawnNightMist },
    ranges: { radius: 560, height: 1.1 },
    seed: 1397,
  });

  // ---- tường thành: người xem kéo để dựng ở "xay-thanh"; về sau giữ nguyên, tới "di-san" thì mòn đi một phần ----
  const BEAT = world.beat("xay-thanh");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - BEAT));
    target.built += ((ctx.inputs.xay ?? 0) - target.built) * w;
  });
  const LOOP = 12;
  world.add(
    createWalls({
      walls: [WALL],
      height,
      quality: world.quality,
      colors: { side: "#9b9480", top: "#7e8c58" },
      built: (_, ctx) => ctx.params.built,
      wear: (ctx) => ctx.params.wear,
      // "di-san": vệt sáng chạy hết một vòng tường cho người xem thấy chu vi thành
      traceHead: () => clamp(((clock.elapsed("di-san") - 1) % LOOP) / 6),
      traceOn: () => clock.near("di-san") * (clock.elapsed("di-san") > 1 ? 1 - smoothstep(8, 10, (clock.elapsed("di-san") - 1) % LOOP) : 0),
    }),
  );

  // 1. "cuoi-tran": thuyền Chiêm Thành (chấm chàm) ngược sông Mã từ phía biển; lửa bùng lên ở mấy làng ven sông — thời loạn, mất mùa.
  //    Phía bắc, triều đình (chấm ngà) tụ lại quanh một quầng sáng lớn dần: quyền hành về tay Hồ Quý Ly (diễn hoạ).
  const CT = 22;
  const ct = run("cuoi-tran", CT);
  world.add(
    createCrowd({
      size: 8,
      height: ground,
      seed: 11,
      groups: [{ path: [[430, maZ(430)], [260, maZ(260)], [80, maZ(80)], [-60, maZ(-60)]], count: 40, spread: [24, 40], color: CHAM, timing: [[0.03, 0], [0.75, 1]] }],
      progress: ct,
      visible: () => clock.near("cuoi-tran"),
    }),
  );
  const riverside: Pt[] = [300, 180, 60, -40].map((x, i) => [x, maZ(x) + (i % 2 ? -52 : 50)]);
  world.add(
    createFires({
      sites: riverside.map(([x, z], i) => ({ x, y: height(x, z) + 1, z, order: i / riverside.length, size: 2.5 })),
      lit: () => clock.near("cuoi-tran") * smoothstep(0.1, 0.6, ct()),
      size: 5,
      glow: () => 0.8,
    }),
  );
  const COURT: Pt = [70, 330];
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 12,
      groups: [{ path: [[COURT[0] + 60, COURT[1] + 40], [COURT[0] + 8, COURT[1] + 4]], count: 30, spread: [30, 20], color: IVORY, timing: [[0.05, 0], [0.5, 1]] }],
      progress: ct,
      visible: () => clock.near("cuoi-tran"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 26,
      minPx: 24,
      place: (_, ctx, out) => {
        out.set(COURT[0], height(COURT[0], COURT[1]) + 8, COURT[1]);
        return smoothstep(0.35, 0.9, ct()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.6));
      },
      visible: () => clock.near("cuoi-tran"),
    }),
  );

  // 2. "xay-thanh": từng toán người đi lại giữa mỏ đá dưới chân An Tôn, bến sông và chân tường — khiêng đá (diễn hoạ; không vẽ dụng cụ).
  const XT = 36;
  const xt = run("xay-thanh", XT);
  const nw = WALL.at((3 * Math.PI) / 4);
  const sw = WALL.at((5 * Math.PI) / 4);
  const nwOut: Pt = [nw[0] * 1.2, nw[1] * 1.2];
  const swOut: Pt = [sw[0] * 1.2, sw[1] * 1.2];
  const landing: Pt = [-90, maZ(-90) + 40];
  world.add(
    createCrowd({
      size: 4,
      height: ground,
      seed: 13,
      groups: [
        { path: shuttle([QUARRY, [QUARRY[0] + 30, QUARRY[1] - 40], nwOut], 3), count: 26, spread: [6, 30], color: SON },
        { path: shuttle([[QUARRY[0] - 20, QUARRY[1] - 10], [-150, 100], [nw[0] * 1.15 - 20, nw[1] * 0.6]], 3), count: 22, spread: [6, 28], color: SON, timing: [[0.08, 0], [1, 1]] },
        { path: shuttle([landing, [-100, -170], swOut], 3), count: 22, spread: [6, 26], color: SON, timing: [[0.04, 0], [1, 1]] },
      ],
      progress: xt,
      visible: () => clock.near("xay-thanh"),
    }),
  );
  // vài người đứng dọc chân tường như đang xếp đá; đông dần theo mức dựng
  world.add(
    createCrowd({
      size: 4,
      height: ground,
      seed: 14,
      groups: [
        { path: [WALL.at(Math.PI * 0.62), WALL.at(Math.PI * 0.88)], count: 24, spread: [8, 4], color: SON, drop: true },
        { path: [WALL.at(Math.PI * 1.12), WALL.at(Math.PI * 1.38)], count: 24, spread: [8, 4], color: SON, drop: true },
      ],
      progress: (ctx) => Math.max(ctx.params.built, smoothstep(0, 10, clock.elapsed("xay-thanh")) * 0.4),
      visible: () => clock.near("xay-thanh"),
    }),
  );

  // 3. "doi-do": đoàn rước (ngà, son) từ phía bắc — hướng Thăng Long — vào cửa Bắc, tới giữa thành; cuối cùng một quầng sáng vàng
  //    hiện giữa thành: Hồ Quý Ly lên ngôi, lập nhà Hồ (diễn hoạ).
  const DD = 26;
  const dd = run("doi-do", DD);
  const procession: Pt[] = [[90, 420], [60, 300], N_OUT, N_IN, [CENTER[0], CENTER[1] + 12]];
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 15,
      groups: [
        { path: procession, count: 12, spread: [6, 30], color: IVORY, timing: [[0.03, 0], [0.7, 1]] },
        { path: procession, count: 50, spread: [12, 80], color: SON, timing: [[0, 0], [0.72, 0.92]] },
      ],
      progress: dd,
      visible: () => clock.near("doi-do"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 30,
      minPx: 26,
      place: (_, ctx, out) => {
        out.set(CENTER[0], height(CENTER[0], CENTER[1]) + 9, CENTER[1]);
        return smoothstep(0.72, 0.9, dd()) * (0.85 + 0.15 * Math.sin(ctx.time * 1.4));
      },
      visible: () => clock.near("doi-do"),
    }),
  );

  // 4. "cai-cach": sứ giả (ngà) từ giữa thành đi ra bốn cửa tới tám làng; tới đâu làng ấy sáng lên — lệnh cải cách ban xuống (diễn hoạ).
  const CC = 20;
  const cc = run("cai-cach", CC);
  const routes = VILLAGES.map((v) => [CENTER, viaGate(v), v] as Pt[]);
  world.add(
    createCrowd({
      size: 5,
      height: ground,
      seed: 16,
      groups: routes.map((path, k) => ({ path, count: 3, spread: [3, 6], color: IVORY, timing: [[0.05 + k * 0.03, 0], [0.6 + k * 0.03, 1]] as [number, number][] })),
      progress: cc,
      visible: () => clock.near("cai-cach"),
    }),
  );
  world.add(
    createGlows({
      count: VILLAGES.length,
      color: GOLD,
      size: 22,
      minPx: 20,
      place: (i, ctx, out) => {
        out.set(VILLAGES[i][0], height(VILLAGES[i][0], VILLAGES[i][1]) + 6, VILLAGES[i][1]);
        const at = (0.6 + i * 0.03) * CC;
        return smoothstep(at, at + 1.2, clock.elapsed("cai-cach")) * (0.75 + 0.15 * Math.sin(ctx.time * 1.8 + i));
      },
      visible: () => clock.near("cai-cach"),
    }),
  );

  // 5. "quan-minh": hai đạo quân Minh (mực) từ tây bắc và đông bắc tiến xuống; quân nhà Hồ (son) dàn thành một dải phòng tuyến chắn ngang
  //    phía bắc — gợi ý phòng tuyến Đa Bang (vị trí thật ở rất xa, bên sông Hồng, sông Đà).
  const QM = 24;
  const qm = run("quan-minh", QM);
  const LINE_Z = 200;
  world.add(
    createCrowd({
      size: 9,
      height,
      seed: 17,
      groups: [
        { path: [[-240, 430], [-170, 330], [-80, LINE_Z + 45]], count: 90, spread: [60, 80], color: INK, timing: [[0.05, 0], [0.85, 1]] },
        { path: [[300, 430], [220, 330], [90, LINE_Z + 45]], count: 90, spread: [60, 80], color: INK, timing: [[0.1, 0], [0.9, 1]] },
        { path: [[0, LINE_Z - 40], [0, LINE_Z]], count: 70, spread: [400, 10], color: SON, timing: [[0, 0], [0.3, 1]] },
      ],
      progress: qm,
      visible: () => clock.near("quan-minh"),
    }),
  );

  // 6. "that-thu": phòng tuyến vỡ (quân son ngã dần), quân Minh tràn xuống, vào cửa Bắc; triều đình nhà Hồ (ngà, son) ra cửa Nam,
  //    vượt sông Mã lui về phía nam. Quầng sáng giữa thành tắt (diễn hoạ).
  const TT = 26;
  const tt = run("that-thu", TT);
  world.add(
    createCrowd({
      size: 9,
      height: ground,
      seed: 18,
      groups: [
        { path: [[0, LINE_Z - 40], [0, LINE_Z]], count: 70, spread: [400, 10], color: SON, mortal: true },
        { path: [[-80, LINE_Z + 45], [-50, 150], N_OUT, N_IN, [0, 20]], count: 90, spread: [40, 90], color: INK, timing: [[0.15, 0], [0.9, 1]] },
        { path: [[90, LINE_Z + 45], [60, 150], N_OUT, N_IN, [10, 30]], count: 80, spread: [40, 90], color: INK, timing: [[0.22, 0], [0.95, 1]] },
      ],
      progress: tt,
      fall: () => 0.6 * smoothstep(0.05, 0.35, tt()),
      visible: () => clock.near("that-thu"),
    }),
  );
  world.add(
    createCrowd({
      size: 7,
      height: ground,
      seed: 19,
      groups: [
        { path: [CENTER, S_IN, S_OUT, [S_OUT[0] + 10, maZ(S_OUT[0])], [S_OUT[0] + 40, -420]], count: 10, spread: [6, 20], color: IVORY, timing: [[0.25, 0], [0.95, 1]] },
        { path: [[-20, 10], S_IN, S_OUT, [S_OUT[0] + 10, maZ(S_OUT[0])], [S_OUT[0] + 40, -420]], count: 40, spread: [20, 60], color: SON, timing: [[0.28, 0], [1, 1]] },
      ],
      progress: tt,
      visible: () => clock.near("that-thu"),
    }),
  );
  world.add(
    createGlows({
      count: 1,
      color: GOLD,
      size: 30,
      minPx: 26,
      place: (_, __, out) => {
        out.set(CENTER[0], height(CENTER[0], CENTER[1]) + 9, CENTER[1]);
        return 1 - smoothstep(0.2, 0.55, tt());
      },
      visible: () => clock.near("that-thu"),
    }),
  );

  // 7. "di-san": khách tham quan (ngà) từ bờ hào đi qua cửa Nam vào trong thành; vệt sáng chạy quanh tường (xem createWalls ở trên).
  const DS = 30;
  const ds = run("di-san", DS);
  world.add(
    createCrowd({
      size: 3,
      height: ground,
      seed: 20,
      groups: [
        { path: [[S_OUT[0] + 30, S_OUT[1] - 50], S_OUT, S_IN, [S_IN[0] - 10, S_IN[1] + 50]], count: 14, spread: [8, 50], color: IVORY },
        { path: [[S_IN[0] + 20, S_IN[1] + 60], S_IN, S_OUT, [S_OUT[0] - 40, S_OUT[1] - 40]], count: 10, spread: [8, 40], color: "#d8c49a", timing: [[0.2, 0], [1, 1]] },
      ],
      progress: ds,
      visible: () => clock.near("di-san"),
    }),
  );
};

export default setup;
