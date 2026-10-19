import { MOOD, type SceneConfig, type Vec3 } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ: ngọn núi có mái đá chính ở gần (0, 82), mái đá quay về phía nam (z âm), thềm trước mái đá ở (0, 13, 30), lối mòn thoải
// xuống thung lũng; suối chảy ngang ở z ≈ -112; ngọn núi phía tây có thêm một hang nhỏ ở khoảng (-175, 62). Xem terrain.ts.
// phase: tiến độ qua ba giai đoạn niên đại (0..1) — người xem kéo ở phân cảnh "thoi-gian".
// Hoạt cảnh từng phân cảnh (sương tan, đoàn khảo sát, người đi suối rồi về mái đá, ba nhóm đốm sáng niên đại, lửa, ánh sáng nơi
// yên nghỉ, đốm sáng khắp vùng, di tích) chạy theo đồng hồ phân cảnh — xem scene.ts. Chữ nằm bên phải ở phân cảnh chẵn,
// bên trái ở phân cảnh lẻ, nên `shot()` đẩy `look` để chủ thể `focus` rơi vào nửa màn hình còn lại.
//
// Bầu trời: chỉ dùng dải bình minh (0) ↔ u ám (1) ↔ hoàng hôn (2).

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

const SHELTER: Vec3 = [0, 18, 34];

const config: SceneConfig = {
  params: { phase: 0 },
  keyframes: {
    "mo-dau": { cam: [-100, 48, -245], look: [0, 40, 80], mood: MOOD.dawn },
    "thung-lung": { ...shot([95, 58, -170], [0, 30, 40], "right", 0.28), mood: MOOD.dawn + 0.25, fov: 52 },
    colani: { ...shot([-52, 30, -62], SHELTER, "left", 0.24), mood: MOOD.dawn + 0.5 },
    "cuoi-ghe": { ...shot([-62, 22, -128], [8, 6, -56], "right", 0.26), mood: MOOD.dawn + 0.4 },
    "thoi-gian": { ...shot([120, 62, -200], [0, 38, 70], "left", 0.2), mood: MOOD.dawn + 0.7, params: { phase: 0 } },
    "bua-an": { ...shot([78, 30, -98], [-14, 10, -8], "right", 0.3), mood: MOOD.dawn + 0.2 },
    "mo-tang": { ...shot([38, 26, -22], SHELTER, "left", 0.3), mood: MOOD.overcast },
    "dong-nam-a": { ...shot([-150, 125, -290], [0, 60, 130], "right", 0.22), mood: MOOD.dawn + 0.45 },
    "di-san": { ...shot([70, 60, -170], [-40, 30, 70], "left", 0.3), mood: MOOD.sunset - 0.35 },
  },
};

export default config;
