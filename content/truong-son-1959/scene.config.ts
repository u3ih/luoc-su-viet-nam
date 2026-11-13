import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Khe Hó (KHE_HO) bắc; trạm (TRAM) giữa; cuối tuyến (CUOI) nam.
// Hoạt cảnh trong từng phân cảnh: những người lính đầu tiên (son) từ Khe Hó gùi hàng vào lối mòn xuyên rừng; theo thanh kéo, lối mòn (đốm vàng) nối dài dọc Trường Sơn và toả nhánh sang đông; đoàn người và xe (son, ngà) vẫn đi qua những đoạn đường bị đánh (lửa); công binh (son) sửa đường; mạng đường (đốm ngà, vàng) trải khắp — trục dọc, trục ngang, tuyến ống (đốm vàng nhỏ)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "doan-559": { ...shot([-40, 0, 300], 90, 150, 70, 1), mood: MOOD.dawn + 0.5 },
    "gui-tho": { ...shot([-60, 0, 60], 80, 270, 160, -1), mood: MOOD.sunset + 0.6 },
    "danh-pha": { ...shot([-60, 0, 0], 90, 200, 110, 1), mood: MOOD.overcast + 0.6 },
    "dai-truong-son": { ...shot([-80, 0, -60], 75, 270, 160, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
