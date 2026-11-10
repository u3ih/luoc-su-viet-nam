import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Hậu ngang cảnh; hai trụ tháp (THAP_BAC, THAP_NAM); bờ bắc (BO_BAC) có khu tưởng niệm (TUONG_NIEM).
// Hoạt cảnh trong từng phân cảnh: công nhân (son) hai bên bờ sông Hậu; thuyền (chấm ngà) trên sông; tưởng nhớ những người mất: người (son) đứng lặng bên bờ bắc; đốm ngà (khu tưởng niệm); theo thanh kéo, hai trụ tháp (cột đốm vàng) mọc lên, nhịp chính (chuỗi đốm ngà) vươn ra gặp nhau giữa sông; cầu sáng (đốm vàng), xe (chấm xanh nhạt) qua cầu; khu tưởng niệm (đốm ngà) bên bờ bắc
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,120,-280], look: [0,0,0], mood: MOOD.dawn + 0.3 },
    "khoi-cong": { ...shot([10, 0, 0], 35, 200, 70, 1), mood: MOOD.dawn + 0.5 },
    "su-co": { ...shot([30, 0, 140], 70, 170, 60, -1), mood: MOOD.sunset + 0.55 },
    "thap": { ...shot([0, 0, 0], 40, 210, 80, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([10, 0, 20], 320, 210, 80, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
