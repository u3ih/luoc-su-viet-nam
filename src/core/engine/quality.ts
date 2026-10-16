// Bậc chất lượng của cảnh 3D. Ba bậc, rẻ dần: high → mid → low.
//
// Ai chọn bậc:
// - `?quality=high|mid|low` trên URL: ghim cứng (để thử giao diện điện thoại ngay trên máy tính), tắt bộ điều tốc.
// - Không ghim: đoán theo thiết bị (màn nhỏ / ít nhân / ít RAM → thấp), rồi hạ thêm nếu lần trước máy không theo kịp.
//   Engine là bộ điều tốc: hạ độ phân giải trước, hết đường hạ thì báo `reportSlow()` — bậc thấp hơn được nhớ
//   7 ngày trong localStorage và áp từ lần mở sau (đổi hình khối giữa chừng sẽ khựng hơn là chịu chậm thêm vài giây).
//   Sau 7 ngày thử lại từ bậc đoán theo thiết bị — một buổi chiều máy nóng không nên làm mất bản đẹp mãi.

export type Tier = "low" | "mid" | "high";

export type Quality = {
  tier: Tier;
  terrainSeg: number;
  waterSeg: number;
  dust: number;
  /** Hệ số mật độ đạo cụ rải (cây, tre…). */
  density: number;
  shadows: boolean;
  antialias: boolean;
  maxDpr: number;
  minDpr: number;
  /** Mọi đạo cụ dùng hình khối lite (model `.lite.glb`, khối procedural thô hơn). */
  lite: boolean;
  /** Ô đạo cụ xa hơn khoảng này (m) đổi sang hình lite; 0 = lite ở mọi khoảng cách. */
  lodDistance: number;
  /** Hệ số tầm vẽ đạo cụ (cỏ, đá, cây) — ô xa hơn tầm vẽ thì ẩn hẳn. */
  drawDistance: number;
  /** Shader rẻ: ít lớp nhiễu cho trời, nước, đất; tắt sương. */
  cheapShaders: boolean;
  /** Số thuyền tối đa có vệt sóng đuôi (mỗi vệt là một vòng lặp trên từng điểm ảnh mặt nước). */
  wakes: number;
  /** Tốc độ khung hình khi cảnh đứng yên (không cuộn, máy quay đã tới chỗ). */
  idleFps: number;
};

const TIERS: Record<Tier, Omit<Quality, "tier">> = {
  high: { terrainSeg: 320, waterSeg: 160, dust: 600, density: 1, shadows: true, antialias: true, maxDpr: 2, minDpr: 1, lite: false, lodDistance: 140, drawDistance: 1, cheapShaders: false, wakes: 36, idleFps: 30 },
  mid: { terrainSeg: 220, waterSeg: 120, dust: 360, density: 0.7, shadows: false, antialias: true, maxDpr: 1.5, minDpr: 1, lite: false, lodDistance: 80, drawDistance: 0.8, cheapShaders: false, wakes: 16, idleFps: 30 },
  low: { terrainSeg: 140, waterSeg: 72, dust: 160, density: 0.45, shadows: false, antialias: false, maxDpr: 1.25, minDpr: 0.7, lite: true, lodDistance: 0, drawDistance: 0.6, cheapShaders: true, wakes: 8, idleFps: 30 },
};
const ORDER: Tier[] = ["high", "mid", "low"];

const STORAGE_KEY = "lsvn-quality";
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function read(): string | null {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function write(value: string) {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // trình duyệt chặn lưu trữ: chỉ mất phần "nhớ", lần này vẫn hạ được
  }
}

const isTier = (v: unknown): v is Tier => typeof v === "string" && (ORDER as string[]).includes(v);

/** Bậc ghim bằng `?quality=` (nếu có). */
export function pinnedTier(): Tier | undefined {
  try {
    const v = new URLSearchParams(window.location.search).get("quality");
    return isTier(v) ? v : undefined;
  } catch {
    return undefined;
  }
}

/** Bậc bộ điều tốc đã hạ xuống lần trước, còn hạn. Dạng lưu: `tier@savedAtMs`. */
function rememberedTier(): Tier | undefined {
  const [tier, at] = (read() ?? "").split("@");
  const age = Date.now() - Number(at);
  return isTier(tier) && age >= 0 && age < TTL_MS ? tier : undefined;
}

function deviceTier(): Tier {
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const small = Math.min(screen.width, screen.height) < 700;
  const cores = navigator.hardwareConcurrency ?? 4;
  const mem = (navigator as { deviceMemory?: number }).deviceMemory ?? 8;
  if (small || cores <= 4 || mem <= 3) return "low";
  if (coarse || cores <= 8) return "mid";
  return "high";
}

const cheaper = (a: Tier, b: Tier) => (ORDER.indexOf(a) >= ORDER.indexOf(b) ? a : b);

export function pickQuality(): Quality {
  const pinned = pinnedTier();
  const remembered = rememberedTier();
  const tier = pinned ?? (remembered ? cheaper(deviceTier(), remembered) : deviceTier());
  return { tier, ...TIERS[tier] };
}

/** Bộ điều tốc có còn đường hạ không (không ghim, chưa ở bậc thấp nhất). */
export function canStepDown(q: Quality) {
  return !pinnedTier() && q.tier !== "low";
}

/** Máy không theo kịp ở bậc này: nhớ bậc thấp hơn (`steps` nấc, mặc định 1) cho lần mở sau. */
export function reportSlow(q: Quality, steps = 1) {
  if (!canStepDown(q)) return;
  const next = ORDER[Math.min(ORDER.length - 1, ORDER.indexOf(q.tier) + steps)];
  const saved = rememberedTier();
  if (saved && ORDER.indexOf(saved) >= ORDER.indexOf(next)) return;
  write(`${next}@${Date.now()}`);
}
