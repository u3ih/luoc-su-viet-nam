import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Núi lửa (NUI_LUA) bắc; hang động (HANG) giữa; buôn làng (BUON) nam.
// Hoạt cảnh trong từng phân cảnh: những đốm xanh nhạt (biển cổ, hoá thạch) mờ dần; các miệng núi lửa (lửa) bùng lên ở phía bắc; theo thanh kéo, dòng dung nham (chấm cam) chảy từ núi lửa xuống, nguội đi để lại chuỗi hang (đốm ngà) dưới lòng đất; buôn làng (son) quanh đống lửa; vòng đốm vàng (tiếng đàn đá, cồng chiêng) lan ra; các điểm di sản địa chất (đốm vàng: núi lửa, hang, thác) lần lượt sáng khắp cao nguyên
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "day-bien": { ...shot([0, 0, 100], 80, 260, 150, 1), mood: MOOD.dawn + 0.5 },
    "hang-dong": { ...shot([0, 0, 60], 85, 220, 120, -1), mood: MOOD.sunset + 0.6 },
    "dan-da": { ...shot([-60, 0, -120], 80, 180, 90, 1), mood: MOOD.sunset + 0.65 },
    "ghi-danh": { ...shot([0, 0, 40], 80, 270, 160, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
