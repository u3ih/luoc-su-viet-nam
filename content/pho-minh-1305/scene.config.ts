import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { CHUA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Thiên Trường (THIEN_TRUONG) bắc; chùa Phổ Minh (CHUA); sông phía nam.
// Hoạt cảnh trong từng phân cảnh: đốm vàng (cung Trùng Quang) ở hành cung; người (son) dựng chùa phía tây cung; theo thanh kéo, cột 14 đốm vàng (14 tầng tháp) lên dần; hai tầng dưới màu ngà (đá), các tầng trên vàng (gạch); đốm ngà (xá lỵ) theo đường từ xa về, nằm vào lòng tháp; đỉnh tháp (đốm trên cùng) lịm đi rồi sáng lại; người (son) sửa tháp
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "chua-pho-minh": { ...shot([40, 0, 80], 80, 220, 100, 1), mood: MOOD.day },
    "dung-thap": { ...shot([CHUA[0], 0, CHUA[1]], 80, 150, 50, -1), mood: MOOD.sunset + 0.55 },
    "xa-ly": { ...shot([CHUA[0], 0, CHUA[1]], 70, 170, 60, 1), mood: MOOD.sunset + 0.7 },
    "ve-sau": { ...shot([CHUA[0], 0, CHUA[1]], 90, 170, 60, -1), mood: MOOD.sunset + 0.5 },
  },
};

export default config;
