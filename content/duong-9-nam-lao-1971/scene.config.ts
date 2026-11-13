import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Khe Sanh (KHE_SANH_N) đông; Lao Bảo (LAO_BAO) giữa; Sê Pôn (SE_PON) tây; căn cứ 31 (CAN_CU_31) bắc.
// Hoạt cảnh trong từng phân cảnh: các đốm ngà dọc đường Trường Sơn (bắc – nam); đoàn người (son) đi dọc đường mòn; đốm vàng ở Sê Pôn (kho hậu cần); đoàn quân (xanh nhạt) theo đường 9 vượt biên giới; các căn cứ trên đồi (đốm xanh nhạt); các mũi quân (son) đánh vào căn cứ 31, lửa bùng; theo thanh kéo, đoàn trực thăng (đốm xanh nhạt, cách điệu) bay dọc đường 9 từ Khe Sanh tới Sê Pôn, đổ quân; đoàn quân (xanh nhạt) rút ngược đường 9 về Khe Sanh; lửa dọc đường; các nhóm (son) trên các đồi hai bên
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "ke-hoach": { ...shot([-40, 0, 0], 90, 260, 150, 1), mood: MOOD.overcast + 0.6 },
    "cao-diem-31": { ...shot([0, 0, 50], 70, 200, 110, -1), mood: MOOD.sunset + 0.7 },
    "se-pon": { ...shot([0, 0, -10], 100, 250, 120, 1), mood: MOOD.day },
    "rut-lui": { ...shot([20, 0, -10], 80, 220, 110, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
