import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Chiêu Nam Lầu (CHIEU_NAM) gần sông; Mỹ Hoà (MY_HOA) nam; nghĩa trang (NGHIA_TRANG) tây bắc.
// Hoạt cảnh trong từng phân cảnh: tàu (đốm ngà) từ biển ngược sông Sài Gòn cập bến; người đón (son) chờ trên bến; thanh niên (son) tụ về nghe diễn thuyết ở nhà Mỹ Hoà (đốm ngà); theo thanh kéo, đoàn người đưa tang (son, ngà) nối dài từ Chiêu Nam Lầu tới nghĩa trang; đốm vàng (linh cữu) đi đầu; mộ (đốm vàng); lễ truy điệu ở khắp nơi (đốm ngà toả ra xa)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ve-nuoc": { ...shot([220, 0, -80], 70, 240, 110, 1), mood: MOOD.dawn + 0.5 },
    "dien-thuyet": { ...shot([-40, 0, -200], 80, 200, 90, -1), mood: MOOD.sunset + 0.55 },
    "dam-tang": { ...shot([-40, 0, 80], 70, 330, 200, 1), mood: MOOD.dawn + 0.6 },
    "ve-sau": { ...shot([-60, 0, 60], 85, 340, 200, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
