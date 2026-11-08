import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH, VEN_BIEN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh thành (KINH) tây bắc; bãi bồi ven biển (VEN_BIEN) đông nam; miền núi (MIEN_NUI) tây.
// Hoạt cảnh trong từng phân cảnh: quân triều (son) từ kinh thành lên miền núi; đốm ngà (Tô Hiến Thành) dẫn đầu; nhóm nổi loạn (xanh nhạt) tan, được tha; các toán người (son) khai hoang dàn hàng dọc bờ biển (đê); ruộng mới sáng dần (vàng); một đốm vàng nhỏ (mâm vàng) đến gần rồi lui đi theo thanh kéo; đốm ngà (Tô Hiến Thành) đứng giữa điện; đốm vàng lớn (ấu chúa) sáng dần; đốm ngà lịm dần; một đốm ngà khác (người kế nhiệm) sáng lên; triều thần (son) đứng quanh
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "van-vo": { ...shot([-200, 0, 120], 60, 300, 150, 1), mood: MOOD.overcast + 0.3 },
    "khai-hoang": { ...shot([VEN_BIEN[0], 0, VEN_BIEN[1]], 60, 260, 130, -1), mood: MOOD.day },
    "mam-vang": { ...shot([KINH[0], 0, KINH[1]], 70, 200, 90, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([KINH[0], 0, KINH[1]], 80, 220, 100, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
