import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { BIEN_HOA } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Biển đông nam; cửa Cần Giờ (CAN_GIO), Soài Rạp (SOAI_RAP); Biên Hòa (BIEN_HOA), cù lao Phố (CU_LAO_PHO) bắc; Mỹ Tho (MY_THO) tây nam.
// Hoạt cảnh trong từng phân cảnh: đoàn thuyền (xanh nhạt) từ biển xa tiến về phía bờ; đoàn thuyền dừng ngoài cửa biển; vài chấm (sứ) lên bờ; đốm vàng (chúa Nguyễn) sáng rồi chấp thuận; hai đoàn thuyền tách ra: một vào cửa Soài Rạp lên Mỹ Tho, một vào cửa Cần Giờ lên Biên Hòa theo thanh kéo; đốm vàng sáng ở hai nơi; phố chợ sáng dần ở cù lao Phố và Mỹ Tho (đốm vàng); thuyền buôn (chấm ngà) qua lại tấp nập
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "roi-que": { ...shot([280, 0, -300], 290, 240, 120, 1), mood: MOOD.overcast + 0.4 },
    "xin-than-phuc": { ...shot([300, 0, -300], 300, 220, 110, -1), mood: MOOD.day },
    "vao-nam": { ...shot([0, 0, -50], 300, 380, 200, 1), mood: MOOD.sunset + 0.5 },
    "ve-sau": { ...shot([BIEN_HOA[0], 0, BIEN_HOA[1]], 70, 220, 110, -1), mood: MOOD.sunset + 0.4 },
  },
};

export default config;
