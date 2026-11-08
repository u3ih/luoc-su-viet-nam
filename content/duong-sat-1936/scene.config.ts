import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Hà Nội (HA_NOI) tây bắc, Sài Gòn (SAI_GON), Mỹ Tho (MY_THO) đông nam; tuyến đường là diễn hoạ, chiều dài thu ngắn rất nhiều.
// Hoạt cảnh trong từng phân cảnh: những đốm vàng nhỏ (đoạn đường đầu tiên) sáng dần giữa Sài Gòn và Mỹ Tho; người làm đường (son) dàn hàng; các đốm vàng dọc tuyến sáng dần từ hai đầu Hà Nội và Sài Gòn vào giữa theo thanh kéo; các đốm vàng nửa phía nam tuyến lịm dần (đường bị hư hại), rồi sáng lại dần; một chấm ngà (đoàn tàu Thống Nhất) chạy suốt tuyến từ Hà Nội vào Sài Gòn; các đốm vàng dọc tuyến
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,170,-300], look: [20,0,40], mood: MOOD.dawn + 0.3 },
    "doan-dau": { ...shot([200, 0, -320], 270, 220, 110, 1), mood: MOOD.day },
    "noi-lien": { ...shot([0, 0, 0], 60, 400, 230, -1), mood: MOOD.sunset + 0.75 },
    "gian-doan": { ...shot([60, 0, -60], 30, 300, 170, 1), mood: MOOD.overcast + 0.4 },
    "ve-sau": { ...shot([0, 0, 0], 60, 400, 230, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
