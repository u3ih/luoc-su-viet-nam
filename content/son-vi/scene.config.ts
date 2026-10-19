import { MOOD, type Keyframe, type SceneConfig, type Vec3 } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ: sông chính chảy từ tây sang đông qua gần gốc toạ độ, sông nhánh phía bắc (z dương) và phía nam (z âm) nhập vào;
// gò "Sơn Vi" ở khoảng (-118, 132), chỗ đặt bếp ở khoảng (-72, -85). Cảnh cách điệu — xem terrain.ts.
// water: 0 = nước đầy, 1 = nước cạn (người xem kéo ở phân cảnh "cuoi-song").
// Hoạt cảnh trong từng phân cảnh (dấu mốc, các nhóm người, bãi cuội lộ ra, bếp lửa…) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Khung hình: chữ bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên chủ thể được đặt ở nửa màn hình còn lại;
// `shot()` tính sẵn `look` lệch cho đúng (side = +1: chủ thể nằm bên phải khung hình, -1: bên trái) và ghi `focus` cho màn dọc.

/** Máy quay nhìn về hướng `az` (độ, 0 = +x, 90 = +z), cách chủ thể `dist`, cao `camH`, chủ thể lệch sang `side` của khung hình. */
function shot(focus: Vec3, az: number, dist: number, camH: number, side: 1 | -1, shift = 0.3): Pick<Keyframe, "cam" | "look" | "focus"> {
  const a = (az * Math.PI) / 180;
  const fx = Math.cos(a);
  const fz = Math.sin(a);
  // phải màn hình = (-fz, fx) trên mặt bằng; đẩy điểm nhìn lệch về phía đối diện chủ thể
  const lx = focus[0] + fz * side * dist * shift;
  const lz = focus[2] - fx * side * dist * shift;
  return { cam: [lx - fx * dist, camH, lz - fz * dist], look: [lx, focus[1], lz], focus };
}

const config: SceneConfig = {
  params: { water: 0 },
  keyframes: {
    "mo-dau": { cam: [330, 120, -170], look: [-70, 10, 60], mood: MOOD.dawn + 0.2 },
    "phat-hien": { ...shot([-118, 16, 132], 150, 170, 62, 1), mood: MOOD.dawn + 0.5 },
    "thoi-gian": { ...shot([-200, 3, 150], 25, 130, 48, -1), mood: MOOD.dawn + 0.9 },
    "them-song": { ...shot([-20, 0, 10], 105, 250, 150, 1, 0.25), mood: MOOD.dawn + 0.75 },
    "cuoi-song": { ...shot([-160, -1, 66], 40, 85, 26, -1), mood: MOOD.dawn + 0.8, fov: 46, params: { water: 0 } },
    "kiem-an": { ...shot([-150, 3, 25], 270, 125, 42, 1), mood: MOOD.overcast - 0.4, params: { water: 0.6 } },
    "bep-lua": { ...shot([-72, 7, -85], 215, 90, 28, -1), mood: MOOD.sunset + 0.7, fov: 48 },
    "tiep-noi": { ...shot([-72, 7, -85], 120, 140, 50, 1), mood: MOOD.night + 0.65, params: { water: 0.4 } },
  },
};

export default config;
