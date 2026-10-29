import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { HOAN_CHAU, VAN_AN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông, núi ở phía tây; Hoan Châu (HOAN_CHAU) ở đồng bằng ven sông, Vạn An (VAN_AN) trong vùng đồi phía tây; phía bắc là hướng quân nhà Đường (BAC), phía nam là Lâm Ấp (LAM_AP), tây nam là Chân Lạp (CHAN_LAP). Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) từ làng quanh tụ về Hoan Châu, một đốm ngà sáng dần; đoàn ngà đi từ Hoan Châu lên Vạn An, đốm vàng sáng ở Vạn An; hai đốm xanh nhạt hiện ở phía nam và tây nam (liên minh); đoàn xanh nhạt (quân nhà Đường) từ phía bắc tiến về Vạn An theo thanh kéo, người giữ thành (son) đứng ở Vạn An; quầng vàng dịu ở Hoan Châu, các nhóm người (son) đến đứng lặng, lửa bật dần như ngày hội
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,190,-300], look: [0,0,20], mood: MOOD.dawn + 0.3 },
    "hoan-chau": { ...shot([HOAN_CHAU[0], 0, HOAN_CHAU[1]], 30, 220, 120, -1), mood: MOOD.day },
    "khoi-nghia": { ...shot([VAN_AN[0], 0, VAN_AN[1]], 160, 230, 140, 1), mood: MOOD.overcast + 0.3 },
    "duong-danh": { ...shot([VAN_AN[0], 0, VAN_AN[1]], 200, 260, 150, -1), mood: MOOD.overcast + 0.8 },
    "ve-sau": { ...shot([HOAN_CHAU[0], 0, HOAN_CHAU[1]], 120, 220, 110, 1), mood: MOOD.sunset },
  },
};

export default config;
