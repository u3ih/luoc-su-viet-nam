// Trạng thái chạy chung giữa UI (React) và vòng lặp render (Three.js).
// Object mutable thường — vòng lặp đọc mỗi frame, không đi qua React state.

export const story = {
  /** Vị trí liên tục theo phân cảnh (1.5 = giữa phân cảnh 1 và 2). */
  t: 0,
  /** Toạ độ tâm từng phân cảnh trên trang, đo lại khi resize. */
  centers: [] as number[],
  /** Giá trị các tương tác (thanh kéo…) theo key. */
  inputs: {} as Record<string, number>,
  /** Thời điểm (performance.now) từng tương tác hoàn thành. */
  completedAt: {} as Record<string, number>,
  /** Tín hiệu cảnh phát ra cho UI/âm thanh (vd. battle 0..1). */
  signals: {} as Record<string, number>,
  pointer: { x: 0, y: 0 },
};

export function resetStory() {
  story.t = 0;
  story.centers = [];
  story.inputs = {};
  story.completedAt = {};
  story.signals = {};
}

export function computeT(scrollY: number, viewportH: number): number {
  const c = story.centers;
  if (c.length < 2) return 0;
  const y = scrollY + viewportH / 2;
  if (y <= c[0]) return 0;
  for (let i = 0; i < c.length - 1; i++) {
    if (y < c[i + 1]) return i + (y - c[i]) / (c[i + 1] - c[i]);
  }
  return c.length - 1;
}
