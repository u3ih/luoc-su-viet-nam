import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { AI_TU, NORTH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông (x > 285); dải Hoành Sơn chạy ngang ở z ≈ 250 với một chỗ trũng làm đèo (PASS);
// nơi xuất phát ở phía bắc (NORTH, hướng Thanh Hoá); dinh Ái Tử ở bờ bắc con sông phía nam (AI_TU). Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (ánh sáng lụi dần quanh doanh trại, người tụ về quanh Nguyễn Hoàng, đoàn người vượt đèo, dựng dinh Ái Tử,
// ánh lửa lan xuống phía nam) chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [340, 200, 380], look: [-20, 10, 90], mood: MOOD.dawn + 0.3 },
    "nam-trieu": { ...shot([NORTH[0], 5, NORTH[1]], 135, 170, 130, 1), mood: MOOD.overcast + 0.3 },
    "xin-di": { ...shot([NORTH[0] - 20, 5, NORTH[1]], 160, 120, 55, -1), mood: MOOD.sunset - 0.2 },
    "vao-nam": { ...shot([20, 10, 100], 110, 450, 300, 1, 0.15), mood: MOOD.day },
    "ai-tu": { ...shot([AI_TU[0], 4, AI_TU[1]], 150, 150, 75, -1), mood: MOOD.dawn + 0.7 },
    "quang-nam": { ...shot([-60, 0, -200], 180, 330, 190, 1, 0.33), mood: MOOD.sunset + 0.9 },
  },
};

export default config;
