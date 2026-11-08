import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { BACH_VAN, KINH } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Am Bạch Vân (BACH_VAN), quán Trung Tân (TRUNG_TAN) bên sông Tuyết; kinh đô (KINH) tây.
// Hoạt cảnh trong từng phân cảnh: hai đoàn quân (son, xanh nhạt) giằng co nhiều nơi trên đồng bằng (Nam – Bắc triều); đốm ngà đến kinh đô dự thi; đốm vàng sáng (Trạng nguyên); học trò (son) từ khắp nơi tìm về am Bạch Vân theo thanh kéo; đốm vàng sáng ở quán Trung Tân và hai cây cầu; các đốm vàng nhỏ (bài thơ Bạch Vân) sáng dần quanh am
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "the-ky": { ...shot([-60, 0, 60], 70, 340, 170, 1), mood: MOOD.overcast + 0.4 },
    "trang-nguyen": { ...shot([KINH[0], 0, KINH[1]], 70, 220, 100, -1), mood: MOOD.day },
    "bach-van": { ...shot([BACH_VAN[0], 0, BACH_VAN[1]], 60, 240, 110, 1), mood: MOOD.sunset + 0.4 },
    "ve-sau": { ...shot([BACH_VAN[0], 0, BACH_VAN[1]], 80, 200, 90, -1), mood: MOOD.sunset + 0.6 },
  },
};

export default config;
