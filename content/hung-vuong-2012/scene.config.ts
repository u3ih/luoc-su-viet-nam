import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Núi Nghĩa Lĩnh giữa cảnh; ba đền; các làng quanh núi.
// Hoạt cảnh trong từng phân cảnh: ba đền (đốm ngà) lần lượt sáng từ chân lên đỉnh núi Nghĩa Lĩnh; người giữ đền (son) từ ba làng gần; theo thanh kéo, đoàn rước (son) cùng kiệu (đốm vàng) từ bốn phía tụ về chân núi; ban nghi lễ (chấm ngà) lên đền Thượng dâng hương; khói hương (cột đốm vàng nhạt); các làng quanh vùng và các nơi xa (đốm ngà) cùng sáng; ba đền (đốm vàng)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "nghia-linh": { ...shot([0, 0, 20], 80, 230, 110, 1), mood: MOOD.dawn + 0.5 },
    "gio-to": { ...shot([0, 0, 0], 75, 320, 180, -1), mood: MOOD.sunset + 0.55 },
    "giu-le": { ...shot([0, 0, 30], 95, 200, 110, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([0, 0, 30], 80, 340, 230, -1), mood: MOOD.sunset + 0.75 },
  },
};

export default config;
