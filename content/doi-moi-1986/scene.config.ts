import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Chợ (CHO) giữa; ruộng (RUONG) tây; cảng (CANG) đông; Hà Nội (HA_NOI) bắc.
// Hoạt cảnh trong từng phân cảnh: người (son) xếp hàng dài trước cửa hàng (đốm ngà mờ); trên ruộng, từng hộ (son) nhận thửa của mình (đốm vàng nhỏ sáng dần); theo thanh kéo, từ Hà Nội (đốm vàng) ánh sáng lan ra; chợ đông dần (son), ruộng (đốm vàng) và bến cảng (đốm ngà) sáng lên; những chuyến tàu (đốm vàng) chở gạo rời cảng ra biển; người (son) qua lại tấp nập
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "bao-cap": { ...shot([20, 0, -40], 90, 170, 70, 1), mood: MOOD.overcast + 0.7 },
    "pha-rao": { ...shot([-180, 0, -80], 85, 180, 80, -1), mood: MOOD.dawn + 0.5 },
    "dai-hoi-vi": { ...shot([20, 0, 20], 85, 260, 140, 1), mood: MOOD.sunset + 0.6 },
    "khoan-10": { ...shot([60, 0, -40], 80, 250, 130, -1), mood: MOOD.day },
  },
};

export default config;
