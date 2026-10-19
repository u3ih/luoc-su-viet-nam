import { MOOD, type Keyframe, type SceneConfig, type Vec3 } from "@/core/types";
import { MOUND, MOUND_Y } from "./places";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ: vịnh biển nông mở ra phía đông (x dương), đất liền phía tây; cồn vỏ sò chính ở MOUND ≈ (-110, 25), cách mép nước khoảng 50 m;
// cửa sông chảy ra vịnh ở phía nam cồn. Cảnh cách điệu — xem terrain.ts.
// shell: số tấm cồn vỏ sò đã chồng lên (0..1) — người xem kéo ở phân cảnh "con-so"; mọi phân cảnh khác cồn đầy đủ.
// sea: mức nước biển đã hạ (0..1) — tự diễn ở phân cảnh "hom-nay" theo đồng hồ phân cảnh (xem scene.ts).
// Hoạt cảnh từng phân cảnh (đốm sáng các địa điểm, đoàn khảo sát, người ra bãi nhặt sò, bếp lửa, ánh sáng nơi mộ, ba giai đoạn,
// nước biển lùi) chạy theo đồng hồ phân cảnh — xem scene.ts. Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên
// `shot()` đẩy `look` để chủ thể `focus` rơi vào nửa màn hình còn lại và ghi `focus` cho màn dọc.

/** Máy quay nhìn vào `focus`, chủ thể lệch sang `side` của màn hình (k ≈ độ lệch theo khoảng cách). */
function shot(cam: Vec3, focus: Vec3, side: "left" | "right", k = 0.3): Pick<Keyframe, "cam" | "look" | "focus"> {
  const fx = focus[0] - cam[0];
  const fz = focus[2] - cam[2];
  const len = Math.hypot(fx, fz) || 1;
  // vectơ phải của máy quay (theo mặt bằng)
  const rx = -fz / len;
  const rz = fx / len;
  const d = len * k * (side === "left" ? 1 : -1);
  // màn dọc: khối chữ phủ nửa dưới màn hình nên máy quay nhìn thấp hơn chủ thể một chút → chủ thể nổi lên nửa trên
  return { cam, look: [focus[0] + rx * d, focus[1], focus[2] + rz * d], focus: [focus[0], focus[1] - len * 0.24, focus[2]] };
}

/** Điểm giữa cồn, ở độ cao khoảng nửa cồn. */
const TOP: Vec3 = [MOUND[0], MOUND_Y + 5, MOUND[1]];

const config: SceneConfig = {
  params: { shell: 1, sea: 0 },
  keyframes: {
    "mo-dau": { cam: [330, 54, -150], look: [-20, 4, 25], mood: MOOD.dawn + 0.05 },
    "vinh-xua": { ...shot([-330, 150, 40], [20, 0, 20], "right", 0.2), mood: MOOD.dawn + 0.25, fov: 54 },
    "phat-hien": { ...shot([30, 44, 150], TOP, "left", 0.3), mood: MOOD.dawn + 0.45, fov: 58 },
    "con-so": { ...shot([-30, 36, -100], TOP, "right", 0.32), mood: MOOD.dawn + 0.6, fov: 56, params: { shell: 0 } },
    "nhuyen-the": { ...shot([40, 34, -70], [-66, 4, 33], "left", 0.36), mood: MOOD.dawn + 0.15, fov: 56, params: { shell: 1 } },
    "do-dung": { ...shot([-205, 36, -75], TOP, "right", 0.3), mood: MOOD.sunset - 0.2, fov: 56 },
    "mo-tang": { ...shot([-20, 42, 135], TOP, "left", 0.34), mood: MOOD.overcast + 0.05, fov: 58 },
    "nien-dai": { ...shot([250, 125, 0], [-55, 0, -5], "right", 0.22), mood: MOOD.dawn + 0.3, fov: 56 },
    "hom-nay": { ...shot([120, 38, 92], [-85, 4, 30], "left", 0.3), mood: MOOD.dawn + 0.15, fov: 56 },
  },
};

export default config;
