import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { THANG_LONG, PHU_XUAN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển phía đông; Thăng Long (THANG_LONG), Nam Dư (NAM_DU), Vị Hoàng (VI_HOANG) bắc; Phú Xuân (PHU_XUAN) nam. Màu: xanh nhạt = quân Trịnh, ngà = quân Tây Sơn (chỉ để phân biệt).
// Hoạt cảnh trong từng phân cảnh: hai nhóm (xanh nhạt) giằng co trong kinh thành Thăng Long; một đốm ngà rời đi về phương nam; người đói (son) lang thang; đêm nước lên, thuyền Tây Sơn (ngà) áp sát thành Phú Xuân, lửa bùng; quân trong thành (xanh nhạt) mở cửa ra đánh rồi tan; đoàn thuyền Tây Sơn (ngà) theo đường biển tiến ra bắc theo thanh kéo, vào Vị Hoàng rồi bến Nam Dư; quân Trịnh (xanh nhạt) tan; lửa bùng ở Vị Hoàng, Nam Dư; đốm ngà (Nguyễn Huệ) vào kinh thành gặp đốm vàng (vua Lê); rồi đoàn thuyền (ngà) rút về phương nam
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "boi-canh": { ...shot([THANG_LONG[0], 0, THANG_LONG[1]], 80, 230, 110, 1), mood: MOOD.overcast + 0.4 },
    "phu-xuan": { ...shot([PHU_XUAN[0], 0, PHU_XUAN[1]], 250, 220, 100, -1), mood: MOOD.sunset + 0.75 },
    "ra-bac": { ...shot([60, 0, 40], 230, 320, 190, 1), mood: MOOD.day },
    "ve-sau": { ...shot([THANG_LONG[0], 0, THANG_LONG[1]], 90, 220, 100, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
