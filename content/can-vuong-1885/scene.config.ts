import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH_THANH, MANG_CA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông (x > 300); sông chảy từ núi phía tây qua kinh thành (KINH_THANH) ra biển; đồn Mang Cá (MANG_CA) ở góc đông
// bắc kinh thành; Toà Khâm sứ (KHAM_SU) bờ nam; Tân Sở (TAN_SO) trong núi phía tây bắc; vùng núi Hương Khê ở phía bắc xa. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (người tụ về kinh thành và hai nhóm khác nhau, đêm hai cánh quân tiến đánh hai nơi, đoàn người rời kinh thành ra Tân Sở, ánh lửa lan từ
// Tân Sở ra khắp bản đồ, những đốm sáng nhỏ dần ở vùng núi) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [380, 220, -330], look: [-60, 5, 90], mood: MOOD.night - 0.1 },
    "boi-canh": { ...shot([KINH_THANH[0], 4, KINH_THANH[1]], 150, 220, 115, 1), mood: MOOD.overcast + 0.3 },
    "dem-hue": { ...shot([(KINH_THANH[0] + MANG_CA[0]) / 2, 2, 20], 90, 250, 125, -1, 0.25), mood: MOOD.night - 0.2 },
    "roi-kinh": { ...shot([-90, 0, 120], 120, 300, 170, 1, 0.2), mood: MOOD.dawn + 0.4 },
    "chieu-can-vuong": { ...shot([-170, 0, 200], 160, 320, 250, -1, 0.15), mood: MOOD.sunset + 0.2 },
    "nguyen-hau": { ...shot([-250, 0, 250], 135, 330, 210, 1, 0.2), mood: MOOD.overcast + 0.6 },
  },
};

export default config;
