import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thăng Long (THANG_LONG) bắc; Hoàng Giang (HOANG_GIANG) nam; Hải Ấp (HAI_AP) đông.
// Hoạt cảnh trong từng phân cảnh: làng Hải Ấp (đốm ngà); đoàn người (xanh nhạt, thái tử nhà Lý chạy loạn) tìm tới làng; chấm ngà từ Hải Ấp lên kinh thành (đốm vàng); quân họ Trần (son) tụ về kinh; theo thanh kéo, thuyền gia quyến (đốm vàng, ngà) xuôi từ kinh thành về Hoàng Giang; quân Mông Cổ (xanh nhạt) tiến tới kinh thành; cuối cùng các thuyền chở quân khí (đốm son) tụ lại; đền thờ (đốm vàng) ở quê Hải Ấp; người đến lễ (son)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,170,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "hai-ap": { ...shot([200, 0, 80], 85, 210, 90, 1), mood: MOOD.dawn + 0.5 },
    "ly-tran": { ...shot([0, 0, 170], 70, 320, 180, -1), mood: MOOD.sunset + 0.55 },
    "hoang-giang": { ...shot([-20, 0, 30], 80, 340, 200, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([170, 0, 0], 90, 260, 120, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
