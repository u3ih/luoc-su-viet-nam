import * as THREE from "three";
import { clamp, easeInOut, lerp, mulberry32, smoothstep } from "@/core/engine/math";
import { MOOD } from "@/core/types";
import type { SceneSetup } from "@/core/engine/world";
import { createMist, createRanges, createSmoke } from "@/core/world/atmosphere";
import { createBeatClock } from "@/core/world/beat-clock";
import { createBirds } from "@/core/world/birds";
import { cameraClearance } from "@/core/world/clearance";
import { createCrowd, type CrowdGroup } from "@/core/world/crowd";
import { createDust } from "@/core/world/dust";
import { createFires, type FireSite } from "@/core/world/fire";
import { createFoliage } from "@/core/world/foliage";
import { createGrass } from "@/core/world/grass";
import { createProps, scatter } from "@/core/world/props";
import { createHeightTexture, createTerrain, fbm2 } from "@/core/world/terrain";
import { createWater } from "@/core/world/water";
import { createCanoes } from "./actors/canoes";
import config from "./scene.config";
import { ALTAR, BOUNDS, CAMP, colorize, height, ISLAND, WATER } from "./terrain";

const setup: SceneSetup = async (world) => {
  const q = world.quality;
  const rand = mulberry32(544);
  const { nearCam, clearOfCam } = cameraClearance(config.keyframes);

  // ---- đầm ----
  const heightTex = createHeightTexture(height, BOUNDS, q.lite ? 128 : 256);
  await world.yield();
  world.add(createTerrain({ bounds: BOUNDS, segments: q.terrainSeg, height, colorize, wetLevel: () => WATER, cheap: q.cheapShaders }));
  // nước đầm: sẫm, phẳng lặng, ánh xanh rêu
  world.add(createWater({ heightTex, bounds: BOUNDS, segments: q.waterSeg, level: () => WATER, cheap: q.cheapShaders, sky: () => world.mood, colors: { deep: "#1d3326", shallow: "#4e6440", foam: "#cfc6a0" } }));
  await world.yield();
  world.add(createDust(q.dust, { x: 0, y: 0, z: 0 }, { x: 260, y: 20, z: 260 }));

  // ---- đêm xuống (người xem kéo), rồi thuyền độc mộc đánh úp trại giặc ----
  const BEAT = world.beat("da-trach");
  world.resolve((target, ctx) => {
    const w = clamp(1 - Math.abs(ctx.t - BEAT));
    const night = ctx.inputs.dem ?? 0;
    target.mood = lerp(target.mood, lerp(MOOD.overcast, MOOD.night, night), w);
    target.camp = Math.max(target.camp, lerp(0.5, 0.8, night) * w);
    const done = ctx.completedAt.dem;
    if (done) {
      const since = ctx.now - done;
      const after = smoothstep(BEAT - 0.6, BEAT - 0.1, ctx.t);
      target.raid = Math.max(target.raid, easeInOut(clamp((since - 800) / 12000)) * after);
      target.camp = Math.max(target.camp, (0.8 + smoothstep(4000, 7000, since) * 0.2) * after);
    }
  });
  const from = new THREE.Vector3(ISLAND.x, 0, ISLAND.z);
  const to = new THREE.Vector3(CAMP.x - 30, 0, CAMP.z);
  world.add(createCanoes({ count: q.lite ? 6 : 10, from, to, raid: (ctx) => ctx.params.raid }));

  // trại quân Lương: lửa trại, khói (không dựng lều trại: chưa có tư liệu hình dáng đủ chắc)
  const sites: FireSite[] = [];
  for (let i = 0; sites.length < 16 && i < 400; i++) {
    const x = CAMP.x - 10 + (rand() - 0.5) * 70;
    const z = CAMP.z + (rand() - 0.5) * 90;
    const h = height(x, z);
    if (h < 1.6 || sites.some((s) => (s.x - x) ** 2 + (s.z - z) ** 2 < 100)) continue;
    sites.push({ x, y: h + 0.2, z, order: rand(), size: 1 + rand() * 0.8 });
  }
  world.add(createFires({ sites, lit: (ctx) => ctx.params.camp, size: 1.6, glow: (ctx) => 0.3 + smoothstep(1.5, 3, ctx.params.mood) * 0.7 }));
  const smoke = createSmoke({ sources: sites.slice(0, 6).map((s) => ({ x: s.x, y: s.y + 2, z: s.z })), height: 22, wind: [-0.8, 0.3], color: "#a8a094" });
  world.add({
    object: smoke.object,
    update(ctx) {
      smoke.object!.visible = ctx.params.camp > 0.4;
      if (smoke.object!.visible) smoke.update?.(ctx);
    },
  });

  // ---- hoạt cảnh: mỗi phân cảnh có đồng hồ riêng, diễn trong lúc người xem dừng đọc ----
  // Cả chương dùng chung một bản đồ cách điệu: bờ đông (x > 245) đứng thay cho đất liền Giao Châu, chỗ trại giặc
  // (CAMP) là lỵ sở / thành Long Biên ở các phân cảnh trước và sau Dạ Trạch. Quy ước phía bắc là +z (diễn hoạ,
  // không theo bản đồ thật). Người = chấm dáng người: son là nghĩa quân / quân Vạn Xuân, mực là quân phương Bắc;
  // chấm vàng là Lý Bí (Lý Nam Đế), chấm ngà là Triệu Quang Phục. Không vẽ trang phục, cờ, vũ khí.
  const clock = createBeatClock(world, ["nha-luong", "khoi-nghia", "van-xuan", "phan-cong", "da-trach", "long-bien", "tu-chu", "mong-rong"]);
  const run = (id: string, seconds: number) => () => clamp(clock.elapsed(id) / seconds);
  const INK = "#2a2320";
  const SON = "#a83a24";
  const LY_BI = "#f0c24a";
  const TQP = "#f0e2b8";
  const GOLD = "#ffd27a";

  // Năm trăm năm sau Hai Bà: lửa khởi nghĩa (Bà Triệu, 248) bùng lên ở phía nam, quân phương Bắc từ lỵ sở kéo xuống
  // dập tắt rồi quay về đóng giữ. Vị trí "Cửu Chân" ở phía nam bờ đông là diễn hoạ.
  const NL = 16;
  const nl = run("nha-luong", NL);
  const UPRISING = { x: 300, z: -200 };
  const uprisingSites: FireSite[] = [
    [0, 0],
    [-12, 6],
    [10, 8],
    [-6, -12],
    [14, -8],
    [2, 16],
  ].map(([dx, dz], i) => {
    const x = UPRISING.x + dx;
    const z = UPRISING.z + dz;
    return { x, y: height(x, z) + 0.2, z, order: i * 0.13, size: 1.3 };
  });
  world.add(
    createFires({
      sites: uprisingSites,
      size: 2.2,
      lit: (ctx) => {
        const p = nl() * NL;
        return clock.near("nha-luong") * smoothstep(0.5, 2.5, p) * (1 - smoothstep(7.5, 9.5, p));
      },
    }),
  );
  const south: [number, number][] = [[268, 10], [290, -60], [300, -150], [300, -168]];
  world.add(
    createCrowd({
      size: 8,
      height,
      seed: 61,
      groups: [
        // quân đóng giữ lỵ sở
        { path: [[262, 30], [262, 20]], count: 40, spread: [30, 24], color: INK },
        // quân đi đàn áp: xuống phía nam, ở lại, rồi quay về
        { path: [...south, ...south.slice(0, -1).reverse()], count: 70, spread: [18, 30], color: INK, timing: [[0.08, 0], [0.42, 0.5], [0.62, 0.5], [0.95, 1]] },
        // người khởi nghĩa quanh đống lửa
        { path: [[UPRISING.x, UPRISING.z + 4], [UPRISING.x, UPRISING.z]], count: 30, spread: [22, 18], color: SON, mortal: true },
      ],
      progress: nl,
      fall: () => 0.85 * smoothstep(6.5 / NL, 8.5 / NL, nl()),
      visible: () => clock.near("nha-luong"),
    }),
  );

  // Lý Bí dấy binh: bốn cánh hào kiệt từ nhiều phía (số cánh, hướng đi là diễn hoạ) cùng kéo về lỵ sở, tới nơi
  // hoà làm một màu; quân của Tiêu Tư bỏ thành chạy về phía đông bắc (hướng Quảng Châu), ra khỏi khung hình.
  const KN = 18;
  const kn = run("khoi-nghia", KN);
  const fromSouth: [number, number][] = [[310, -330], [300, -200], [285, -80], [270, 4]];
  world.add(
    createCrowd({
      size: 7,
      height,
      seed: 62,
      groups: [
        { path: fromSouth, count: 45, spread: [16, 26], color: SON, timing: [[0.02, 0], [0.7, 1]] },
        { path: fromSouth, count: 1, color: LY_BI, size: 1.5, timing: [[0.02, 0], [0.7, 1]] },
        { path: [[350, -200], [330, -90], [290, -20], [278, 10]], count: 40, spread: [16, 24], color: "#b85a2a", arrive: SON, timing: [[0.06, 0], [0.72, 1]] },
        { path: [[120, -330], [230, -290], [262, -200], [262, -90], [258, 0]], count: 40, spread: [16, 24], color: "#94402a", arrive: SON, timing: [[0, 0], [0.75, 1]] },
        { path: [[290, 330], [280, 200], [268, 80], [264, 36]], count: 40, spread: [16, 24], color: "#b8503a", arrive: SON, timing: [[0.04, 0], [0.75, 1]] },
        // quân Lương bỏ chạy khi nghĩa quân tới gần
        { path: [[268, 24], [320, 70], [342, 180], [352, 350]], count: 60, spread: [24, 26], color: INK, timing: [[0.3, 0], [0.8, 1]], show: [0, 0.82] },
      ],
      progress: kn,
      visible: () => clock.near("khoi-nghia"),
    }),
  );

  // Nước Vạn Xuân: hai khối người vào xếp hàng trước Lý Bí ở lỵ sở; khi đã đông đủ, một quầng sáng vàng hiện trên
  // chỗ ông đứng — ánh sáng tượng trưng việc xưng đế, không phải vật thể. Diễn một lượt rồi giữ.
  const VX = 14;
  const vx = run("van-xuan", VX);
  const THRONE = { x: 292, z: 20 };
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 63,
      groups: [
        { path: [[THRONE.x, THRONE.z], [THRONE.x + 0.2, THRONE.z]], count: 1, color: LY_BI, size: 1.4 },
        { path: [[305, -160], [262, -70], [248, -10], [248, 8], [278, 8]], count: 50, spread: [16, 22], color: SON, timing: [[0.03, 0], [0.6, 1]] },
        { path: [[335, 80], [300, 52], [248, 50], [248, 34], [278, 34]], count: 50, spread: [16, 22], color: SON, timing: [[0.08, 0], [0.64, 1]] },
      ],
      progress: vx,
      visible: () => clock.near("van-xuan"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 4,
      height: (x, z) => height(x, z) + 8,
      groups: [{ path: [[THRONE.x, THRONE.z], [THRONE.x + 0.2, THRONE.z]], count: 1, color: GOLD, show: [0.66, 2] }],
      progress: vx,
      visible: () => clock.near("van-xuan"),
    }),
  );

  // Nhà Lương phản công: đại quân từ phía bắc kéo xuống, hai lần dồn ép (quân Vạn Xuân ngã từng đợt — "thua nhiều
  // trận"), rồi Lý Nam Đế (chấm vàng) dẫn quân rút về phía nam, ra khỏi khung hình — "lên miền núi"; hướng rút là
  // diễn hoạ. Triệu Quang Phục (chấm ngà) tách một toán nhỏ đi về mép đầm (dẫn sang phân cảnh sau). Quân Lương chiếm lỵ sở.
  const PC = 20;
  const pc = run("phan-cong", PC);
  const retreat: [number, number][] = [[272, 12], [276, -60], [295, -160], [305, -260], [320, -345]];
  const toMarsh: [number, number][] = [[266, 4], [256, -30], [236, -62]];
  world.add(
    createCrowd({
      size: 7,
      height,
      seed: 64,
      groups: [
        {
          path: [[325, 345], [315, 250], [300, 150], [285, 70], [272, 32]],
          count: 160,
          spread: [40, 50],
          color: INK,
          timing: [[0.02, 0], [0.28, 0.78], [0.33, 0.82], [0.45, 0.82], [0.5, 0.86], [0.6, 0.86], [0.88, 1]],
        },
        { path: retreat, count: 90, spread: [30, 26], color: SON, mortal: true, timing: [[0.55, 0], [0.92, 1]], show: [0, 0.95] },
        { path: retreat, count: 1, color: LY_BI, size: 1.4, timing: [[0.55, 0], [0.92, 1]], show: [0, 0.95] },
        { path: toMarsh, count: 30, spread: [12, 14], color: SON, timing: [[0.55, 0], [0.85, 1]], show: [0, 0.9] },
        { path: toMarsh, count: 1, color: TQP, size: 1.4, timing: [[0.55, 0], [0.85, 1]], show: [0, 0.9] },
      ],
      progress: pc,
      fall: () => 0.2 * smoothstep(0.3, 0.36, pc()) + 0.2 * smoothstep(0.45, 0.51, pc()),
      visible: () => clock.near("phan-cong"),
    }),
  );

  // Đầm Dạ Trạch, ban ngày: trên gò giữa đầm nghĩa quân tắt lửa, toả vào lùm tre rồi khuất hẳn — "im lặng như
  // không có người". (Đêm xuống, thuyền độc mộc đánh úp trại giặc: xem createCanoes ở trên.)
  const daTrach = () => clock.elapsed("da-trach");
  world.add(
    createFires({
      sites: [
        [4, 3],
        [-5, -3],
        [1, -6],
        [-3, 6],
      ].map(([dx, dz], i) => {
        const x = ALTAR.x + dx;
        const z = ALTAR.z + dz;
        return { x, y: height(x, z) + 0.15, z, order: i * 0.2, size: 0.8 };
      }),
      size: 1.4,
      lit: () => clock.near("da-trach") * (1 - smoothstep(2.5, 6, daTrach())),
    }),
  );
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 65,
      groups: [
        [-40, -14],
        [-2, -16],
        [-4, 14],
        [-36, 8],
      ].map(([x, z]): CrowdGroup => ({ path: [[ALTAR.x, ALTAR.z], [x, z]], count: 9, spread: [6, 6], color: SON, timing: [[0.2, 0], [0.85, 1]] })),
      progress: () => clamp(daTrach() / 9),
      visible: () => clock.near("da-trach") * (1 - smoothstep(5.5, 8.5, daTrach())),
    }),
  );

  // Giành lại Long Biên: một cánh quân Lương rời thành lên phía bắc (Trần Bá Tiên về nước); rồi quân Triệu Việt Vương
  // (chấm ngà dẫn đầu) đổ bộ từ phía đầm và kéo lên từ phía nam, quân Lương còn lại tan vỡ, nghĩa quân vào thành.
  // Hướng tiến quân và chỗ đổ bộ là diễn hoạ.
  const LB = 18;
  const lb = run("long-bien", LB);
  const landing: [number, number][] = [[228, -2], [244, 6], [262, 14]];
  const landingTiming: [number, number][] = [[0.3, 0], [0.55, 0.75], [0.72, 0.75], [0.88, 1]];
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 66,
      groups: [
        { path: [[268, 40], [290, 120], [318, 240], [345, 350]], count: 60, spread: [20, 30], color: INK, timing: [[0.03, 0], [0.4, 1]], show: [0, 0.42] },
        { path: [[262, 4], [262, 24]], count: 80, spread: [34, 30], color: INK, mortal: true },
        { path: landing, count: 45, spread: [24, 12], color: SON, timing: landingTiming, show: [0.28, 2] },
        { path: landing, count: 1, color: TQP, size: 1.4, timing: landingTiming, show: [0.28, 2] },
        { path: [[300, -170], [290, -90], [272, -20], [264, 6]], count: 45, spread: [20, 20], color: SON, timing: [[0.22, 0], [0.55, 0.8], [0.72, 0.8], [0.88, 1]] },
      ],
      progress: lb,
      fall: () => 0.92 * smoothstep(0.52, 0.7, lb()),
      visible: () => clock.near("long-bien"),
    }),
  );

  // Hơn nửa thế kỷ tự chủ: ba quầng sáng nối nhau ở lỵ sở — ba đời Lý Nam Đế, Triệu Việt Vương, Hậu Lý Nam Đế
  // (tượng trưng, không phải vật thể; vị trí chung một chỗ là diễn hoạ). Quầng cuối tắt khi quân Tùy từ phía bắc
  // kéo tới chiếm (602). Diễn một lượt rồi giữ.
  const TC = 18;
  const tc = run("tu-chu", TC);
  const SEAT: [number, number][] = [[275, 20], [275.2, 20]];
  world.add(
    createCrowd({
      glow: true,
      size: 16,
      height: (x, z) => height(x, z) + 12,
      groups: [
        { path: SEAT, count: 1, color: GOLD, show: [0.03, 0.36] },
        { path: SEAT, count: 1, color: GOLD, show: [0.32, 0.62] },
        { path: SEAT, count: 1, color: GOLD, show: [0.58, 0.84] },
      ],
      progress: tc,
      visible: () => clock.near("tu-chu"),
    }),
  );
  world.add(
    createCrowd({
      size: 7,
      height,
      seed: 67,
      groups: [{ path: [[330, 355], [322, 240], [300, 130], [280, 40]], count: 160, spread: [44, 50], color: INK, timing: [[0.55, 0], [0.85, 1]] }],
      progress: tc,
      visible: () => clock.near("tu-chu"),
    }),
  );

  // Móng rồng (truyền thuyết): Triệu Quang Phục (chấm ngà) đứng ở chỗ lập đàn trên gò giữa đầm; một chuỗi đốm sáng
  // — Chử Đồng Tử cưỡi rồng, thể hiện bằng ánh sáng, không vẽ hình rồng — lượn vòng xoắn từ trên cao xuống, dừng
  // trên đàn, trao một đốm vàng nhỏ (móng rồng) xuống chỗ ông, rồi bay vút lên và tan. Diễn một lượt rồi giữ.
  const MR = 16;
  const mr = run("mong-rong", MR);
  const spiral: [number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    // 24 điểm đầu: xoắn vào (r 65 → 14, 1,25 vòng); phần sau: xoắn ra, bay lên
    const k = i / 24;
    const r = i <= 24 ? lerp(65, 14, k) : lerp(14, 90, (i - 24) / 16);
    const a = 0.6 + (i <= 24 ? k * 2.5 : 2.5 + ((i - 24) / 16) * 1.5) * Math.PI;
    spiral.push([ALTAR.x + Math.cos(a) * r, ALTAR.z + Math.sin(a) * r]);
  }
  const hover = spiral[24];
  // quãng (0..1) ứng với lúc tới điểm dừng trên đàn — đường được lấy mẫu theo chiều dài, không theo số điểm
  let inLen = 0;
  let allLen = 0;
  for (let i = 1; i < spiral.length; i++) {
    const d = Math.hypot(spiral[i][0] - spiral[i - 1][0], spiral[i][1] - spiral[i - 1][1]);
    allLen += d;
    if (i <= 24) inLen += d;
  }
  const atHover = inLen / allLen;
  const fromAltar = (x: number, z: number) => Math.hypot(x - ALTAR.x, z - ALTAR.z);
  const ground = (x: number, z: number) => Math.max(height(x, z), WATER);
  const ride: [number, number][] = [[0.03, 0], [0.4, atHover], [0.64, atHover], [0.95, 1]];
  world.add(
    createCrowd({
      size: 4,
      height,
      seed: 68,
      groups: [{ path: [[ALTAR.x, ALTAR.z], [ALTAR.x + 0.2, ALTAR.z]], count: 1, color: TQP, size: 1.3 }],
      progress: mr,
      visible: () => clock.near("mong-rong"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 3,
      // càng xa đàn càng cao: vòng xoắn hạ dần khi vào gần, vút lên khi bay ra
      height: (x, z) => ground(x, z) + 8 + fromAltar(x, z) * 0.5,
      seed: 69,
      groups: [
        { path: spiral, count: 1, color: GOLD, size: 1.4, timing: ride, show: [0, 0.97] },
        { path: spiral, count: 14, spread: [1.5, 45], color: "#ffe6a8", size: 0.7, timing: ride, show: [0, 0.97] },
      ],
      progress: mr,
      visible: () => clock.near("mong-rong"),
    }),
  );
  world.add(
    createCrowd({
      glow: true,
      size: 2,
      height: (x, z) => ground(x, z) + 2.2 + fromAltar(x, z) * 0.9,
      groups: [{ path: [hover, [ALTAR.x + 1.2, ALTAR.z]], count: 1, color: "#ffcf6a", size: 0.5, timing: [[0.44, 0], [0.6, 1]], show: [0.42, 2] }],
      progress: mr,
      visible: () => clock.near("mong-rong"),
    }),
  );

  // ---- lau sậy: thứ che chở nghĩa quân ----
  await world.yield();
  const marsh = { x0: -330, x1: 330, z0: -330, z1: 330 };
  const reedAt = (minH: number, maxH: number) => (x: number, z: number) => {
    const h = height(x, z);
    if (h < minH || h > maxH || nearCam(x, z, 12)) return null;
    // chừa lạch nước cho thuyền
    if (Math.abs(z - ISLAND.z) < 14 && x > ISLAND.x + 40 && x < CAMP.x - 40) return null;
    return h - 0.1;
  };
  world.add(createGrass({ quality: q, count: Math.round(14000 * q.density), area: marsh, accept: reedAt(-0.9, 1.2), height: [1.8, 3.2], blades: 9, base: "#6e7440", tip: "#e2d39a", sway: 0.06, seed: 101 }));
  world.add(createGrass({ quality: q, count: Math.round(5000 * q.density), area: marsh, accept: reedAt(-1.4, 0.2), height: [1.4, 2.2], blades: 7, base: "#4f6a34", tip: "#a9bb6a", sway: 0.08, seed: 102 }));

  // bãi giữa đầm: tre, chuối, cây; bờ đất: cây rừng
  const isle = (x: number, z: number) => {
    const h = height(x, z);
    // chừa khoảng trống trên gò cao (chỗ đóng quân, chỗ lập đàn) để thấy rõ người và lửa
    const open = (x - ALTAR.x) ** 2 + (z - ALTAR.z) ** 2 < 11 * 11;
    return h > 1.4 && !open && (x - ISLAND.x) ** 2 + (z - ISLAND.z) ** 2 < ISLAND.r ** 2 && clearOfCam(x, z, h) ? h - 0.2 : null;
  };
  const shore = (x: number, z: number) => {
    const h = height(x, z);
    return h > 2 && clearOfCam(x, z, h) && (x - CAMP.x) ** 2 + (z - CAMP.z) ** 2 > 60 * 60 ? h - 0.2 : null;
  };
  await world.yield();
  const actors = await Promise.all([
    createProps("bui_tre", [...scatter(Math.round(30 * q.density) + 8, rand, { x0: -70, x1: 30, z0: -40, z1: 60 }, isle, 6), ...scatter(Math.round(70 * q.density), rand, marsh, shore, 10)], {
      quality: q,
      recenter: true,
      shadow: q.shadows,
      sway: 0.0035,
      tint: 0.25,
      maxDistance: 340,
    }),
    createProps("bui_chuoi", scatter(10, rand, { x0: -70, x1: 30, z0: -40, z1: 60 }, isle, 5), { quality: q, recenter: true, shadow: q.shadows, sway: 0.02, tint: 0.2 }),
  ]);
  for (const a of actors) world.add(a);
  world.add(
    createFoliage({
      quality: q,
      kind: "tree",
      count: Math.round(700 * q.density),
      area: marsh,
      accept: (x, z) => {
        const y = shore(x, z) ?? isle(x, z);
        return y !== null && fbm2(x * 0.03 + 4, z * 0.03 - 2, 3) > 0.45 ? y - 0.1 : null;
      },
      scale: [1.0, 1.8],
      dark: "#18301a",
      light: "#58833a",
      seed: 103,
    }),
  );
  world.add(
    createFoliage({
      quality: q,
      kind: "palm",
      count: Math.round(50 * q.density),
      area: marsh,
      accept: (x, z) => {
        const h = height(x, z);
        return h > 0.3 && h < 1.5 && !nearCam(x, z) ? h - 0.1 : null;
      },
      scale: [0.7, 1.1],
      dark: "#3d5a24",
      light: "#a4b85a",
      seed: 104,
    }),
  );
  // cò trắng bay trên đầm
  world.add(createBirds({ flocks: 3, perFlock: 6, center: { x: 0, y: 0, z: 0 }, radius: 120, altitude: [20, 45], color: "#e8e2d0", seed: 21 }));

  await world.yield();
  if (!q.cheapShaders)
    world.add(
      createMist({
        center: { x: 0, y: 0, z: 0 },
        size: [620, 620],
        // đầm lầy: sương dày cả lúc chiều, đêm
        density: (ctx) => 1 - smoothstep(0.4, 1.6, ctx.params.mood) * 0.45,
        base: () => WATER,
        mood: world.mood,
      }),
    );
  world.add(
    createRanges({
      center: { x: 0, y: 0, z: 0 },
      radius: 500,
      spacing: 150,
      layers: 2,
      mood: world.mood,
      // đồng bằng: chỉ vài dải đồi thấp mờ xa
      profile: (a, l) => Math.pow(fbm2(a * 4 + l * 9.1, l * 2.3, 4), 2) * (30 + l * 40),
    }),
  );
};

export default setup;
