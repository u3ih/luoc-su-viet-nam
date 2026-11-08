import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH, SU_VIEN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Làng Phủ Lý (PHU_LY) tây nam, kinh đô (KINH) đông bắc, Quốc sử viện (SU_VIEN) trong kinh.
// Hoạt cảnh trong từng phân cảnh: ba đốm ngà từ ba phía về kinh đô dự thi; ba đốm vàng sáng lần lượt ở kinh đô (Tam khôi); ba mươi đốm vàng nhỏ (ba mươi quyển sử) lần lượt sáng lên ở Quốc sử viện theo thanh kéo; các đốm ngà (nhân vật được bình) sáng dần ở nhiều nơi trên đất nước; người (son) tụ về kinh đô; các đốm vàng (bộ sử) lịm dần; một dòng chấm xanh nhạt mang đi về phương bắc; về sau một đốm ngà (Ngô Sĩ Liên) sáng lên
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [60,0,60], mood: MOOD.dawn + 0.3 },
    "bang-nhan": { ...shot([-40, 0, -40], 60, 320, 150, 1), mood: MOOD.day },
    "soan-su": { ...shot([SU_VIEN[0], 0, SU_VIEN[1]], 70, 170, 70, -1), mood: MOOD.sunset + 0.6 },
    "loi-binh": { ...shot([0, 0, 40], 80, 340, 170, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([KINH[0], 0, KINH[1]], 80, 260, 120, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
