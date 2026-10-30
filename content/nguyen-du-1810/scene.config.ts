import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { TIEN_DIEN, THANG_LONG, QUANG_BINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển ở phía đông, núi ở phía tây; Tiên Điền (TIEN_DIEN) bên sông gần biển, Thăng Long (THANG_LONG) phía bắc, Quảng Bình (QUANG_BINH) phía nam. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) tụ về làng Tiên Điền, một đốm ngà sáng dần, lửa bật lên; một nhóm người (son) đi từ Tiên Điền ra Thăng Long, đốm vàng sáng ở Thăng Long; những đốm sáng ngà hiện dần theo một đường cong phía trước làng theo thanh kéo, tượng trưng độ dài của tác phẩm; một nhóm người (son) đi từ Tiên Điền xuống Quảng Bình, đốm vàng sáng ở Quảng Bình; quầng vàng dịu ở Tiên Điền, các nhóm người (son) về đứng lặng, lửa bật dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,190,-300], look: [30,0,20], mood: MOOD.dawn + 0.3 },
    "tien-dien": { ...shot([TIEN_DIEN[0], 0, TIEN_DIEN[1]], 30, 220, 110, 1), mood: MOOD.day },
    "gio-bui": { ...shot([THANG_LONG[0], 0, THANG_LONG[1]], 70, 240, 130, -1), mood: MOOD.overcast + 0.3 },
    "truyen-kieu": { ...shot([TIEN_DIEN[0], 0, TIEN_DIEN[1]], 150, 260, 140, 1), mood: MOOD.sunset - 0.1 },
    "thoi-diem": { ...shot([QUANG_BINH[0], 0, QUANG_BINH[1]], 250, 230, 120, -1), mood: MOOD.day + 0.1 },
    "ve-sau": { ...shot([TIEN_DIEN[0], 0, TIEN_DIEN[1]], 20, 240, 120, 1), mood: MOOD.sunset },
  },
};

export default config;
