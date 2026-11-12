import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hải Phòng (HAI_PHONG) đông nam; Hà Nội (HA_NOI) giữa; Lào Cai (LAO_CAI), Vân Nam (VAN_NAM) tây bắc.
// Hoạt cảnh trong từng phân cảnh: thuyền (chấm ngà) ngược sông Hồng chậm chạp nhiều ngày, rồi đoàn người (son) đi bộ lên cao nguyên; theo thanh kéo, chuỗi đốm vàng (đường ray) nối dài từ cảng Hải Phòng qua Hà Nội, Lào Cai lên Vân Nam; thợ (son) dọc tuyến; đoạn đường gần biên giới (đốm vàng) tắt dần (1940), về sau sáng lại (1957); hai tuyến ngày nay (đốm ngà) Hà Nội – Lào Cai và Hà Nội – Hải Phòng; tàu (chấm vàng) chạy
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "truoc-day": { ...shot([-40, 0, 60], 60, 270, 160, 1), mood: MOOD.dawn + 0.5 },
    "khoi-cong": { ...shot([-40, 0, 60], 50, 270, 150, -1), mood: MOOD.sunset + 0.6 },
    "chien-tranh": { ...shot([-200, 0, 220], 55, 200, 120, 1), mood: MOOD.sunset + 0.65 },
    "ngay-nay": { ...shot([60, 0, -40], 60, 250, 140, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
