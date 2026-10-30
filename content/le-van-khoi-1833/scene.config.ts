import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { PHIEN_AN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Sông chảy tây bắc – đông nam; Phiên An (PHIEN_AN) bên sông ở giữa, Huế (HUE) phía bắc, Biên Hoà (BIEN_HOA) đông bắc, Định Tường (DINH_TUONG) tây nam. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: một đoàn xanh nhạt từ phía bắc đi vào Phiên An, các nhóm người (son) đứng quanh, lửa bật dần; các nhóm người (son) tụ về quanh thành Phiên An theo thanh kéo, lửa bật dần; các đốm ngà sáng ở Biên Hoà, Định Tường, rồi các đoàn xanh nhạt từ phía bắc và tây tiến về Phiên An; đoàn xanh nhạt vây quanh Phiên An, ánh sáng ngà ở thành mờ dần, rồi một quầng vàng dịu
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,190,-300], look: [30,0,20], mood: MOOD.dawn + 0.3 },
    "boi-canh": { ...shot([PHIEN_AN[0], 0, PHIEN_AN[1]], 20, 230, 120, 1), mood: MOOD.overcast },
    "dem-khoi-su": { ...shot([PHIEN_AN[0], 0, PHIEN_AN[1]], 150, 230, 120, -1), mood: MOOD.sunset - 0.5 },
    "phan-cong": { ...shot([PHIEN_AN[0], 0, PHIEN_AN[1]], 100, 300, 160, 1), mood: MOOD.overcast + 0.6 },
    "thanh-that-thu": { ...shot([PHIEN_AN[0], 0, PHIEN_AN[1]], 40, 240, 130, -1), mood: MOOD.sunset },
  },
};

export default config;
