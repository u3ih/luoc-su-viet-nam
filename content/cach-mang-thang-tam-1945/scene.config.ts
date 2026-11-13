import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Tân Trào (TAN_TRAO) tây bắc; Nhà hát Lớn (NHA_HAT), Ba Đình (BA_DINH) giữa; Huế (HUE) nam.
// Hoạt cảnh trong từng phân cảnh: các đại biểu (ngà) từ nhiều ngả về đình Tân Trào (đốm vàng); theo thanh kéo, đoàn người (son) từ các ngả phố và các tỉnh lân cận đổ về quảng trường Nhà hát Lớn; đốm vàng ở quảng trường; các tỉnh (đốm ngà) lần lượt sáng; đám đông (son) trước Ngọ Môn (đốm vàng) — ấn kiếm được trao; đám đông (son) đứng kín quảng trường Ba Đình; đốm vàng (lễ đài) sáng phía trước
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "tan-trao": { ...shot([-140, 0, 150], 80, 170, 120, 1), mood: MOOD.dawn + 0.5 },
    "ha-noi": { ...shot([120, 0, 40], 90, 190, 90, -1), mood: MOOD.day },
    "ngo-mon": { ...shot([60, 0, -150], 90, 170, 90, 1), mood: MOOD.dawn + 0.6 },
    "ba-dinh": { ...shot([-20, 0, 60], 90, 180, 80, -1), mood: MOOD.day },
  },
};

export default config;
