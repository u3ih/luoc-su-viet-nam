import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { NHAT_BAN, QUANG_NAM } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc, +x là hướng đông. Bờ Việt Nam ở phía tây (QUANG_NAM), bờ Nhật Bản ở phía đông (NHAT_BAN), biển ở giữa. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh (người tụ về lập hội, ba đốm sáng vượt biển, thanh niên vượt biển theo thanh kéo, hội viên tụ quanh hội, người tản đi và hai đốm gặp nhau giữa biển)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ, nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330, 230, -320], look: [30, 0, 10], mood: MOOD.dawn + 0.3 },
    "duy-tan-hoi": { ...shot([QUANG_NAM[0], 0, QUANG_NAM[1]], 90, 200, 95, 1), mood: MOOD.overcast + 0.3 },
    "sang-nhat": { ...shot([0, 0, 10], 90, 330, 150, -1), mood: MOOD.day },
    "thanh-nien": { ...shot([10, 0, 0], 70, 320, 130, 1), mood: MOOD.sunset - 0.1 },
    "cong-hien-hoi": { ...shot([NHAT_BAN[0], 0, NHAT_BAN[1]], 90, 200, 100, -1), mood: MOOD.dawn + 0.8 },
    "tan-ro": { ...shot([0, 0, 0], 100, 340, 170, 1), mood: MOOD.overcast + 0.7 },
  },
};

export default config;
