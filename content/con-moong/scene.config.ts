import { MOOD, type SceneConfig, type Vec3 } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ: ngọn núi có hang ở gần (0, 78); cửa hang quay về phía nam (z âm) trên thềm đá ở (0, 33, 24);
// lối mòn dốc từ thềm xuống thung lũng; suối chảy ngang ở z ≈ -118; cột lớp đất minh hoạ ở (-46, -10). Xem terrain.ts.
// layers: số lớp đất đã chồng lên cột (0..1) — người xem kéo ở phân cảnh "dia-tang".
// Hoạt cảnh từng phân cảnh (đoàn khảo sát, đốm sáng đánh dấu, người ra vào hang, sương tan, các di tích) chạy theo
// đồng hồ phân cảnh — xem scene.ts. Chữ nằm bên phải ở phân cảnh chẵn, bên trái ở phân cảnh lẻ, nên `shot()` đẩy
// `look` để chủ thể `focus` rơi vào nửa màn hình còn lại.
//
// Bầu trời: chỉ dùng dải bình minh (0) ↔ u ám (1) — lạnh (1) ở các lớp sâu, ấm dần (về 0) từ phân cảnh khí hậu.

/** Máy quay nhìn vào `focus`, chủ thể lệch sang `side` của màn hình (k ≈ độ lệch theo khoảng cách). */
function shot(cam: Vec3, focus: Vec3, side: "left" | "right", k = 0.3) {
  const fx = focus[0] - cam[0];
  const fz = focus[2] - cam[2];
  const len = Math.hypot(fx, fz) || 1;
  // vectơ phải của máy quay (theo mặt bằng)
  const rx = -fz / len;
  const rz = fx / len;
  const d = len * k * (side === "left" ? 1 : -1);
  return { cam, look: [focus[0] + rx * d, focus[1], focus[2] + rz * d] as Vec3, focus };
}

const CAVE: Vec3 = [0, 38, 30];
const COLUMN: Vec3 = [-46, 10, -10];

const config: SceneConfig = {
  params: { layers: 0 },
  keyframes: {
    "mo-dau": { cam: [-90, 46, -235], look: [0, 56, 70], mood: MOOD.dawn },
    "hang-dong": { ...shot([85, 62, -125], [0, 26, 2], "right", 0.3), mood: MOOD.dawn + 0.25, fov: 52 },
    "dia-tang": { ...shot([-8, 19, -56], COLUMN, "left", 0.22), mood: MOOD.dawn + 0.5, params: { layers: 0 } },
    "lop-sau": { ...shot([-88, 13, -54], [-46, 6, -10], "right"), mood: MOOD.overcast, params: { layers: 1 } },
    "nhuyen-the": { ...shot([70, 32, -112], [0, 18, -12], "left", 0.28), mood: MOOD.overcast - 0.1 },
    "mo-tang": { ...shot([-34, 48, -52], CAVE, "right", 0.34), mood: MOOD.overcast - 0.05 },
    "khi-hau": { ...shot([175, 72, -200], [0, 40, 60], "left", 0.22), mood: MOOD.overcast },
    "lop-tren": { ...shot([-76, 42, -112], [0, 20, -10], "right", 0.28), mood: MOOD.dawn + 0.35 },
    "di-san": { ...shot([110, 120, -270], [0, 45, 70], "left", 0.2), mood: MOOD.dawn + 0.05 },
  },
};

export default config;
