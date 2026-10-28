import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { BAI_SAY, TRAI_SON } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đồng bằng thấp nhiều đầm; sông lớn ở phía tây; Hà Nội (HA_NOI) ở tây bắc; Hải Dương (HAI_DUONG) ở đông bắc; căn cứ Bãi Sậy (BAI_SAY) ở giữa;
// Trại Sơn (TRAI_SON) ở phía nam. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (người tụ về từ nhiều ngả, nghĩa quân lan ra các huyện, vượt sông tấn công phía bắc, quân Pháp vây dần Trại Sơn, người tản đi) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [330, 200, -330], look: [-30, 0, 60], mood: MOOD.dawn + 0.3 },
    "mo-quan": { ...shot([BAI_SAY[0] - 20, 0, BAI_SAY[1] + 20], 90, 230, 105, 1), mood: MOOD.overcast + 0.3 },
    "can-cu": { ...shot([BAI_SAY[0], 0, BAI_SAY[1]], 45, 240, 120, -1), mood: MOOD.dawn + 0.8 },
    "tap-kich": { ...shot([-20, 0, 220], 0, 300, 160, 1, 0.2), mood: MOOD.night - 0.2 },
    "tuan-canh": { ...shot([TRAI_SON[0], 0, TRAI_SON[1] + 20], 135, 250, 130, -1), mood: MOOD.sunset - 0.1 },
    "tan-ra": { ...shot([0, 0, -40], 90, 300, 150, 1), mood: MOOD.overcast + 0.6 },
  },
};

export default config;
