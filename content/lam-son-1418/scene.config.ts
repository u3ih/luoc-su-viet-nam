import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CHI_LINH, LAM_SON, LUNG_NHAI } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Chu chảy từ tây sang đông giữa thung lũng; Lam Sơn ở bờ bắc (LAM_SON), núi Chí Linh phía tây
// (CHI_LINH), Lũng Nhai phía tây bắc (LUNG_NHAI); lối đi xuống phía nam là hướng Nghệ An. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (mười chín người họp thề, người kéo về Lam Sơn, vòng vây quanh núi Chí Linh, làm ruộng thời tạm hoà,
// đoàn quân vào Nghệ An, lửa lan từ nam ra bắc, ba đạo quân ra Bắc) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [330, 140, -280], look: [-60, 20, 60], mood: MOOD.dawn },
    "lung-nhai": { ...shot([LUNG_NHAI[0], 22, LUNG_NHAI[1]], 60, 150, 165, 1), mood: MOOD.sunset + 0.5 },
    "dung-co": { ...shot([LAM_SON[0], 5, LAM_SON[1]], 120, 200, 90, -1), mood: MOOD.dawn + 0.5 },
    "chi-linh": { ...shot([CHI_LINH[0], 40, CHI_LINH[1]], 150, 330, 170, 1, 0.25), mood: MOOD.overcast + 0.3 },
    "hoa-hoan": { ...shot([LAM_SON[0] + 30, 5, LAM_SON[1]], 80, 230, 100, -1), mood: MOOD.day },
    "nghe-an": { ...shot([10, 5, -150], 280, 330, 210, 1, 0.2), mood: MOOD.day },
    "mo-rong": { ...shot([0, 0, -80], 90, 440, 300, -1, 0.15), mood: MOOD.sunset },
    "ra-bac": { ...shot([LAM_SON[0], 5, LAM_SON[1] + 120], 80, 420, 260, 1, 0.2), mood: MOOD.dawn + 0.7 },
  },
};

export default config;
