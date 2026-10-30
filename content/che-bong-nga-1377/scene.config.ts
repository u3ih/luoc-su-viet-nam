import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { DO_BAN, THANG_LONG, HAI_TRIEU } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông, núi ở phía tây; Đồ Bàn (DO_BAN) phía nam, Thăng Long (THANG_LONG) phía bắc, sông Hải Triều (HAI_TRIEU) ở giữa. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) tụ về Đồ Bàn, một đốm ngà sáng dần, lửa bật lên; đoàn xanh nhạt từ phía nam tiến lên Thăng Long, đốm vàng sáng ở Thăng Long, lửa bật dần; đoàn xanh nhạt từ phía bắc tiến về Đồ Bàn theo thanh kéo, người giữ thành (son) đứng ở Đồ Bàn; một đoàn (son) đi dọc sông Hải Triều, đốm ngà sáng rồi tắt dần giữa sông, đốm vàng nhỏ ở hai bờ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,190,-300], look: [30,0,20], mood: MOOD.dawn + 0.3 },
    "che-bong-nga": { ...shot([DO_BAN[0], 0, DO_BAN[1]], 160, 220, 120, 1), mood: MOOD.day },
    "thang-long-1371": { ...shot([THANG_LONG[0], 0, THANG_LONG[1]], 80, 230, 130, -1), mood: MOOD.overcast + 0.3 },
    "do-ban-1377": { ...shot([DO_BAN[0], 0, DO_BAN[1]], 200, 240, 130, 1), mood: MOOD.overcast + 0.8 },
    "hai-trieu-1390": { ...shot([HAI_TRIEU[0], 0, HAI_TRIEU[1]], 120, 230, 130, -1), mood: MOOD.sunset },
  },
};

export default config;
