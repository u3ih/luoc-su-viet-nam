import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { VAN_KIEP, AN_LAC } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thái ấp Vạn Kiếp (VAN_KIEP) bên sông; kinh đô (KINH) phía tây; vườn An Lạc (AN_LAC).
// Hoạt cảnh trong từng phân cảnh: thái ấp Vạn Kiếp: đốm ngà (Hưng Đạo vương) giữa thái ấp, người (son) làm ruộng quanh đó; đoàn ngự giá (son, đốm vàng dẫn đầu) đi từ kinh đô đến Vạn Kiếp theo thanh kéo; đốm ngà ở thái ấp mờ yếu; đốm vàng (vua) bên đốm ngà; các đốm vàng nhỏ (lời dặn) tỏa ra khắp vùng làng quê; đốm ngà lịm dần ở vườn An Lạc; người khắp nơi (son) tụ về; các đốm vàng (đền thờ) sáng dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "van-kiep": { ...shot([VAN_KIEP[0], 0, VAN_KIEP[1]], 70, 230, 110, 1), mood: MOOD.day },
    "vua-den": { ...shot([-100, 0, 40], 70, 320, 160, -1), mood: MOOD.overcast + 0.4 },
    "khoan-thu": { ...shot([VAN_KIEP[0], 0, VAN_KIEP[1]], 80, 170, 80, 1), mood: MOOD.sunset + 0.6 },
    "ve-sau": { ...shot([AN_LAC[0], 0, AN_LAC[1]], 70, 200, 100, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
