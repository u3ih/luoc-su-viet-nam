import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Bờ đất liền (BO) phía bắc; đảo (DAO_AN_TIEM) giữa biển.
// Hoạt cảnh trong từng phân cảnh: thuyền (chấm ngà, vợ chồng An Tiêm) rời bờ bắc ra hòn đảo giữa biển; theo thanh kéo, đốm vàng (chim mang hạt) bay tới đảo; ruộng dưa (đốm vàng nhỏ) lan dần trên đảo; thuyền (xanh nhạt) từ nhiều phía tìm tới đảo đổi dưa; thuyền (đốm vàng) đưa vợ chồng An Tiêm về đất liền; đốm ngà (đền thờ) dưới chân núi; dân (son) dự hội
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300,150,-320], look: [0,0,-20], mood: MOOD.dawn + 0.3 },
    "bi-day": { ...shot([-60, 0, 80], 75, 300, 120, 1), mood: MOOD.dawn + 0.5 },
    "hat-giong": { ...shot([0, 0, -40], 80, 200, 80, -1), mood: MOOD.sunset + 0.55 },
    "trao-doi": { ...shot([0, 0, -20], 85, 320, 150, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([0, 0, -40], 70, 230, 100, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
