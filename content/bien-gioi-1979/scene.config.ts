import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thị xã biên giới phía bắc (THI_XA_BAC) trên; Ba Chúc (BA_CHUC), Phnôm Pênh (PHNOM_PENH) dưới.
// Hoạt cảnh trong từng phân cảnh: đoàn quân (xanh nhạt) từ phía tây tràn vào làng Ba Chúc; các đốm ngà (dân làng) tắt dần; đốm vàng (nhà mồ) sáng về sau; các mũi quân (son) từ phía đông tiến sang phía tây tới Phnôm Pênh; đốm ngà sáng ở Phnôm Pênh; theo thanh kéo, các mũi quân (xanh nhạt) từ biên giới phía bắc tràn xuống các thị xã; lửa ở các thị xã; các mũi quân rút về; lửa tàn dần ở biên giới phía bắc; các đốm vàng nhỏ (tưởng niệm) sáng ở cả hai miền biên giới
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ba-chuc": { ...shot([80, 0, -150], 80, 170, 90, 1), mood: MOOD.overcast + 0.6 },
    "phnom-penh": { ...shot([-40, 0, -150], 180, 220, 120, -1), mood: MOOD.dawn + 0.6 },
    "ngay-17-2": { ...shot([0, 0, 140], 90, 230, 130, 1), mood: MOOD.sunset + 0.65 },
    "sau-chien-tranh": { ...shot([0, 0, 20], 90, 270, 160, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
