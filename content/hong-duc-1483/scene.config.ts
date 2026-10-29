import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH, VAN_MIEU } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông lớn ở phía đông; kinh thành (KINH) bên bờ sông; khu Văn Miếu (VAN_MIEU) ở phía tây kinh thành. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (đoàn quan lại tới kinh thành, mười ba đốm thừa tuyên sáng dần quanh kinh thành, đoàn người tụ quanh một đốm sách luật, tám mươi hai đốm bia dựng thành hai hàng, khách thăm vườn bia)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-300, 170, -280], look: [0, 0, 20], mood: MOOD.dawn + 0.3 },
    "vua-le": { ...shot([KINH[0], 0, KINH[1]], 90, 200, 100, 1), mood: MOOD.day },
    "bo-may": { ...shot([40, 0, 20], 45, 330, 230, -1), mood: MOOD.day },
    "bo-luat": { ...shot([KINH[0], 0, KINH[1]], 160, 200, 90, 1), mood: MOOD.overcast + 0.3 },
    "bia-tien-si": { ...shot([VAN_MIEU[0], 0, VAN_MIEU[1]], 0, 210, 95, -1), mood: MOOD.day },
    "ngay-nay": { ...shot([VAN_MIEU[0], 0, VAN_MIEU[1]], 120, 210, 95, 1), mood: MOOD.sunset - 0.2 },
  },
};

export default config;
