import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { BO_DE, CHUC_DONG, DONG_QUAN, TOT_DONG } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Hồng chéo phía đông bắc; Đông Quan bên bờ tây (DONG_QUAN), Bồ Đề bên bờ đông (BO_DE);
// đồng lầy Tốt Động, Chúc Động phía tây nam; Cao Bộ xa hơn về tây nam. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (viện binh vào Đông Quan, ba cánh quân Minh tiến xuống, phục binh nằm chờ, phục binh đánh ra, quân Minh
// chạy về thành, vòng vây Đông Quan và sứ giả mang thư) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const field: [number, number, number] = [(TOT_DONG[0] + CHUC_DONG[0]) / 2, 1, (TOT_DONG[1] + CHUC_DONG[1]) / 2];

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330, 140, -330], look: [20, 5, 20], mood: MOOD.dawn + 0.2 },
    "vuong-thong": { ...shot([DONG_QUAN[0], 2, DONG_QUAN[1]], 60, 330, 190, 1, 0.25), mood: MOOD.overcast + 0.3 },
    "ba-canh": { ...shot([40, 0, 60], 230, 440, 280, -1, 0.2), mood: MOOD.overcast },
    "mai-phuc": { ...shot(field, 40, 230, 90, 1), mood: MOOD.dawn + 0.6 },
    "tot-dong": { ...shot(field, 70, 210, 85, -1), mood: MOOD.day },
    "ket-qua": { ...shot([20, 0, 60], 45, 420, 260, 1, 0.2), mood: MOOD.sunset - 0.2 },
    "vay-thanh": { ...shot([(DONG_QUAN[0] + BO_DE[0]) / 2, 2, DONG_QUAN[1]], 160, 340, 200, -1, 0.2), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
