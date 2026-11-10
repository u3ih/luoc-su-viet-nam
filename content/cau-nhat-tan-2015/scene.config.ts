import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông Hồng ngang cảnh; cầu theo hướng bắc – nam ở x = 0; năm trụ tháp giữa sông.
// Hoạt cảnh trong từng phân cảnh: thuyền (chấm ngà) trên sông Hồng; người (son) hai bên bờ; theo thanh kéo, năm trụ tháp (cột đốm vàng) lần lượt mọc lên giữa sông, mặt cầu (chuỗi đốm ngà) nối dần; cầu sáng trọn (đốm vàng); xe (chấm xanh nhạt) nối nhau qua cầu; cầu sáng đèn; xe (chấm xanh nhạt) qua lại; thuyền (chấm ngà) dưới gầm
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,120,-280], look: [0,0,0], mood: MOOD.dawn + 0.3 },
    "song-hong": { ...shot([20, 0, 0], 35, 200, 70, 1), mood: MOOD.dawn + 0.5 },
    "thap": { ...shot([0, 0, 0], 30, 200, 70, -1), mood: MOOD.sunset + 0.6 },
    "thong-xe": { ...shot([0, 0, 0], 320, 200, 70, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([0, 0, 0], 40, 230, 90, -1), mood: MOOD.sunset + 0.65 },
  },
};

export default config;
