import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI) giữa.
// Hoạt cảnh trong từng phân cảnh: năm đốm vàng lần lượt sáng theo hàng (1946, 1959, 1980, 1992, 2013); theo thanh kéo, đốm ngà (ý kiến) từ khắp nơi bay về Hà Nội; nhiều nhóm (ngà, xanh nhạt, son) đứng riêng quanh Hà Nội — những ý kiến khác nhau; đại biểu (ngà) về hội trường (đốm vàng); 120 đốm nhỏ (120 điều) sáng thành vòng
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "nam-hien-phap": { ...shot([20, 0, 40], 85, 200, 100, 1), mood: MOOD.sunset + 0.6 },
    "lay-y-kien": { ...shot([20, 0, 40], 80, 290, 170, -1), mood: MOOD.sunset + 0.6 },
    "tranh-luan": { ...shot([20, 0, 40], 95, 170, 80, 1), mood: MOOD.overcast + 0.6 },
    "thong-qua": { ...shot([20, 0, 40], 90, 170, 80, -1), mood: MOOD.day },
  },
};

export default config;
