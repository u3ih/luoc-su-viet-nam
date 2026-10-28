import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { DAM, PHU_XUAN, THANG_LONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông (x > 285); đầm Thị Nại (DAM) và Quy Nhơn ở phía nam xa; Phú Xuân (PHU_XUAN) ở giữa,
// bên sông nhỏ; Thăng Long (THANG_LONG) ở phía bắc xa, bên sông lớn. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (hai đội thuyền trong đầm và lửa lan, người tụ về Phú Xuân, đoàn người đi ra Bắc, vào Thăng Long, sứ giả
// tới Thăng Long rồi tin về Phú Xuân) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [380, 230, -300], look: [-20, 5, 10], mood: MOOD.dawn + 0.3 },
    "thi-nai": { ...shot([DAM[0] + 20, 0, DAM[1]], 270, 200, 100, 1, 0.25), mood: MOOD.dawn + 0.8 },
    "len-ngoi": { ...shot([PHU_XUAN[0], 4, PHU_XUAN[1]], 90, 170, 85, -1), mood: MOOD.day },
    "ra-bac": { ...shot([-40, 0, 130], 90, 340, 200, 1, 0.2), mood: MOOD.sunset - 0.3 },
    "thang-long": { ...shot([THANG_LONG[0], 4, THANG_LONG[1] - 20], 70, 210, 105, -1), mood: MOOD.dawn + 0.9 },
    "quoc-hieu": { ...shot([THANG_LONG[0] + 10, 4, THANG_LONG[1] - 20], 90, 220, 110, 1), mood: MOOD.sunset + 0.2 },
  },
};

export default config;
