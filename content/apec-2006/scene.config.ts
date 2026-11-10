import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI) giữa; Thành phố Hồ Chí Minh (HCM) nam; vòng các thành viên quanh rìa.
// Hoạt cảnh trong từng phân cảnh: tình nguyện viên (son) tụ về Hà Nội; đốm vàng sáng giữa thành phố; hội nghị đầu năm ở Hà Nội (đốm ngà) rồi giữa năm ở Thành phố Hồ Chí Minh (đốm ngà); đoàn đại biểu (chấm sáng) đi lại giữa hai nơi; theo thanh kéo, đoàn đại biểu (chấm sáng) từ vòng 21 đốm (các nền kinh tế thành viên) về Hà Nội; chuỗi đốm vàng nối Hà Nội với vòng các thành viên (Kế hoạch hành động Hà Nội)
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "chuan-bi": { ...shot([0, 0, 60], 80, 210, 120, 1), mood: MOOD.dawn + 0.5 },
    "hoi-nghi": { ...shot([20, 0, -90], 85, 270, 170, -1), mood: MOOD.sunset + 0.55 },
    "cap-cao": { ...shot([0, 0, 40], 80, 270, 190, 1), mood: MOOD.sunset + 0.65 },
    "ve-sau": { ...shot([0, 0, 40], 75, 270, 190, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
