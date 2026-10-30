import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { NAM_HAI, PHIEN_NGUNG, CO_LOA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Núi ở phía bắc, biển ở phía đông; Nam Hải (NAM_HAI) tây bắc, Phiên Ngung (PHIEN_NGUNG) phía bắc, Cổ Loa (CO_LOA) giữa châu thổ, Cửu Chân (CUU_CHAN) phía nam. Mọi vị trí là gợi ý.
// Hoạt cảnh trong từng phân cảnh: các nhóm người (son) tụ về Nam Hải, một đốm ngà sáng dần, lửa bật lên; đoàn người (son) đi từ Nam Hải về Phiên Ngung, đốm vàng sáng ở Phiên Ngung, lửa bật dần; đoàn xanh nhạt (quân từ phía bắc) tiến từ Phiên Ngung xuống Cổ Loa theo thanh kéo, người ở Cổ Loa (son) đứng yên; quầng vàng dịu ở Cổ Loa, các nhóm người (son) đến đứng lặng, lửa bật dần
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-330,190,-300], look: [30,0,20], mood: MOOD.dawn + 0.3 },
    "trieu-da": { ...shot([NAM_HAI[0], 0, NAM_HAI[1]], 100, 220, 120, 1), mood: MOOD.day },
    "nam-viet": { ...shot([PHIEN_NGUNG[0], 0, PHIEN_NGUNG[1]], 80, 230, 120, -1), mood: MOOD.day + 0.2 },
    "chiem-au-lac": { ...shot([CO_LOA[0], 0, CO_LOA[1]], 60, 240, 140, 1), mood: MOOD.overcast + 0.6 },
    "ve-sau": { ...shot([CO_LOA[0], 0, CO_LOA[1]], 20, 230, 120, -1), mood: MOOD.sunset },
  },
};

export default config;
