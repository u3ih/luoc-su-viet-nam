import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Hồng; các làng Lạc (LANG_*) ven sông; Cổ Loa (CO_LOA) bắc; vùng người Âu (TAY_AU) tây bắc.
// Hoạt cảnh trong từng phân cảnh: ruộng Lạc ven sông (chuỗi đốm vàng) sáng dần theo con nước; Lạc dân (son) ra đồng; các làng (đốm ngà) sáng lên; người Lạc (son) quây quần quanh làng; theo thanh kéo, người Âu (xanh nhạt) từ tây bắc tiến xuống; các Lạc tướng (chấm ngà) từ các làng quy về Cổ Loa (đốm vàng); các làng Lạc (đốm ngà) mờ dần theo thời gian; ruộng ven sông (chuỗi đốm vàng) vẫn còn
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "lac-dien": { ...shot([0, 0, 0], 70, 270, 150, 1), mood: MOOD.dawn + 0.5 },
    "dong-son": { ...shot([20, 0, 20], 80, 270, 130, -1), mood: MOOD.sunset + 0.55 },
    "au-lac": { ...shot([10, 0, 130], 240, 220, 130, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([40, 0, 60], 80, 270, 150, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
