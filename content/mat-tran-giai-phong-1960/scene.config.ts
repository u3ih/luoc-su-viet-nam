import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Tân Lập (TAN_LAP) tây bắc; Sài Gòn (SAI_GON_G) đông nam; làng (LANG_G) giữa.
// Hoạt cảnh trong từng phân cảnh: các làng (đốm ngà) rải rác; các toán lính (xanh nhạt) đi lại giữa làng; vài đốm ngà tắt; theo thanh kéo, đại biểu (son) từ nhiều vùng tụ về căn cứ trong rừng Tân Lập; đốm vàng sáng; vòng người (son) quanh đốm vàng ở Tân Lập; từng toán (son) toả đi các vùng; các đốm son lan khắp đồng bằng; đốm vàng ở Tân Lập
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "sau-geneve": { ...shot([30, 0, -30], 90, 250, 140, 1), mood: MOOD.overcast + 0.6 },
    "tan-lap": { ...shot([-40, 0, 60], 70, 170, 90, -1), mood: MOOD.sunset + 0.7 },
    "dai-hoi": { ...shot([-40, 0, 60], 120, 180, 100, 1), mood: MOOD.dawn + 0.6 },
    "chinh-phu": { ...shot([20, 0, -30], 80, 260, 150, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
