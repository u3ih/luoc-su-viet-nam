import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI_F) bắc; vĩ tuyến 17 giữa; Đà Lạt (DA_LAT_F), Sài Gòn (SAI_GON_F) nam; Élysée (ELYSEE) ký hiệu.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (hiệp định) ở ký hiệu Élysée ngoài khơi; đốm ngà sáng ở Sài Gòn; đốm son vẫn sáng ở vùng Hà Nội; vòng đốm xanh nhạt (các nước công nhận) quanh Sài Gòn; vòng đốm son quanh Hà Nội; đốm vàng ở Đà Lạt; theo thanh kéo, dòng người di cư (ngà) từ phía bắc đi qua vĩ tuyến 17 vào Nam; một nhóm nhỏ (son) đi ngược ra Bắc; vạch đốm vàng dọc vĩ tuyến; đám đông (ngà) ở Sài Gòn; đốm vàng sáng ở giữa; vòng đốm xanh nhạt nhỏ quanh
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,150,-300], look: [20,0,30], mood: MOOD.dawn + 0.3 },
    "elysee": { ...shot([60, 0, 120], 0, 230, 120, 1), mood: MOOD.sunset + 0.65 },
    "hai-khoi": { ...shot([-30, 0, 10], 90, 260, 160, -1), mood: MOOD.sunset + 0.6 },
    "vi-tuyen-17": { ...shot([0, 0, 40], 0, 240, 130, 1), mood: MOOD.dawn + 0.6 },
    "cong-hoa": { ...shot([0, 0, -150], 90, 170, 80, -1), mood: MOOD.day },
  },
};

export default config;
