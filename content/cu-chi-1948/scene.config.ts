import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Làng A (LANG_A) tây, làng B (LANG_B) giữa, làng C (LANG_C) nam; Bến Dược (BEN_DUOC) đông bên sông.
// Hoạt cảnh trong từng phân cảnh: dân làng (son) đào những đoạn hầm ngắn quanh làng (đốm ngà sát mặt đất); theo thanh kéo, chuỗi đốm vàng (đường xương sống) nối các làng rồi toả nhánh ra tới sông; ba tầng đốm sáng (ngà, vàng) chồng nhau dưới làng Bến Dược — cách điệu; người (son) lom khom đi trong hầm; khách tham quan (ngà) từ bến sông vào khu di tích (đốm vàng)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ham-dau": { ...shot([-150, 0, 60], 85, 160, 70, 1), mood: MOOD.day },
    "xuong-song": { ...shot([0, 0, 20], 90, 230, 140, -1), mood: MOOD.sunset + 0.6 },
    "ba-tang": { ...shot([140, 0, 20], 95, 140, 50, 1), mood: MOOD.sunset + 0.7 },
    "di-tich": { ...shot([140, 0, 20], 80, 180, 80, -1), mood: MOOD.day },
  },
};

export default config;
