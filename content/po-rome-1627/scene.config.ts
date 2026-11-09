import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { THAP, KINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Đồng Phan Rang; sông; đập (DAP) và kênh; tháp Po Rome (THAP) trên đồi; cao nguyên tây.
// Hoạt cảnh trong từng phân cảnh: đốm ngà (Po Rome) từ cao nguyên phía tây xuống đồng bằng; người (son) đón ở kinh; theo thanh kéo, nước (đốm vàng) từ đập theo kênh chảy vào các cánh đồng; người (son) làm thủy lợi; đoàn đưa dâu (xanh nhạt, chấm ngà) từ phía bắc tới kinh; cột đốm vàng (tháp Po Rome) trên đồi Hậu Sanh; người (son) lên tháp làm lễ
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "len-ngoi": { ...shot([-80, 0, 20], 80, 300, 130, 1), mood: MOOD.dawn + 0.5 },
    "dap-kenh": { ...shot([-40, 0, 40], 80, 260, 120, -1), mood: MOOD.sunset + 0.55 },
    "ngoc-khoa": { ...shot([KINH[0], 0, KINH[1]], 80, 240, 110, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([THAP[0], 0, THAP[1]], 80, 170, 80, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
