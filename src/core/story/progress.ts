// Tiến độ xem từng chương — chỉ lưu trong localStorage của chính trình duyệt người xem, không gửi đi đâu,
// không định danh ai. Mất dữ liệu (chế độ ẩn danh, xoá dữ liệu trang) thì chỉ mất phần "đã xem", trang vẫn chạy.

const KEY = "lsvn-progress";
const EVENT = "lsvn-progress";

/** Theo slug: phân cảnh xa nhất đã tới (0-based), tổng số phân cảnh, đã xem hết chưa, lần xem gần nhất. */
export type ChapterProgress = { seen: number; total: number; done: boolean; at: number };
export type Progress = Record<string, ChapterProgress>;

export function readProgress(): Progress {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? "{}");
    return v && typeof v === "object" ? (v as Progress) : {};
  } catch {
    return {};
  }
}

/** Ghi nhận người xem đã tới phân cảnh `beat` (trên tổng `total`). Chỉ tiến, không lùi. */
export function markSeen(slug: string, beat: number, total: number) {
  const all = readProgress();
  const prev = all[slug];
  const seen = Math.max(prev?.seen ?? -1, beat);
  const done = (prev?.done ?? false) || seen >= total - 1;
  if (prev && prev.seen === seen && prev.done === done && prev.total === total) return;
  all[slug] = { seen, total, done, at: Date.now() };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // trình duyệt chặn lưu trữ: bỏ qua
  }
}

export function clearProgress() {
  try {
    window.localStorage.removeItem(KEY);
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // bỏ qua
  }
}

/** Đăng ký nghe thay đổi (cùng tab qua sự kiện riêng, tab khác qua "storage"). */
export function subscribeProgress(fn: () => void) {
  const onStorage = (e: StorageEvent) => e.key === KEY && fn();
  window.addEventListener(EVENT, fn);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(EVENT, fn);
    window.removeEventListener("storage", onStorage);
  };
}

/** Tỉ lệ đã xem 0..1. */
export const ratio = (p?: ChapterProgress) => (!p ? 0 : p.done ? 1 : Math.min(1, (p.seen + 1) / Math.max(1, p.total)));
