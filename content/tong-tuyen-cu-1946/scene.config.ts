import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI) bắc; làng (LANG) giữa; miền Trung (MIEN_TRUNG), Nam Bộ (NAM_BO) nam.
// Hoạt cảnh trong từng phân cảnh: từ Hà Nội (đốm vàng), các đốm ngà (sắc lệnh) toả đi các tỉnh; dân làng (son) tụ quanh các ứng cử viên (ngà) ở sân đình; theo thanh kéo, điểm bỏ phiếu (đốm vàng) khắp ba miền sáng lần lượt từ bắc vào nam; cử tri (son) xếp hàng; các đại biểu (ngà) từ khắp nơi về Hà Nội (đốm vàng)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "sac-lenh": { ...shot([120, 0, 180], 85, 200, 100, 1), mood: MOOD.day },
    "ung-cu": { ...shot([-40, 0, 40], 90, 180, 90, -1), mood: MOOD.day },
    "ngay-bau": { ...shot([20, 0, -20], 85, 290, 160, 1), mood: MOOD.sunset + 0.6 },
    "quoc-hoi": { ...shot([120, 0, 180], 80, 170, 80, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
