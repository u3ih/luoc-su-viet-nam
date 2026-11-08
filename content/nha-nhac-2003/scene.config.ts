import { shot } from "@/core/shot";
import { MOOD, type SceneConfig } from "@/core/types";
import { KINH, DIEN } from "./terrain";

// Camera + tham số cho từng phân cảnh trong story.md (khớp theo id).
// Toạ độ (xem terrain.ts): +z là hướng bắc. Kinh thành Huế (KINH), điện (DIEN); sông Hương phía nam.
// Hoạt cảnh trong từng phân cảnh: vài đốm ngà (dàn nhạc trên bệ đá chùa Lý) sáng mờ từ xa; rồi đốm vàng (lễ nhạc chúa Nguyễn) ở Phú Xuân; theo thanh kéo, dàn nhạc (đốm vàng, đốm ngà = phe văn, phe võ) đông dần thành hai khối trước điện; lửa ở kinh thành (1885); các đốm nhạc lịm dần, chỉ còn vài đốm; dàn nhạc (đốm vàng) sáng lại đầy đủ; người xem (son) quanh điện
// chạy theo đồng hồ phân cảnh — xem scene.ts.
// Chữ nằm bên phải ở phân cảnh chẵn (0, 2, 4…), bên trái ở phân cảnh lẻ (kể cả "mo-dau" là 0), nên `shot()` đặt chủ thể ở nửa màn hình còn lại.

const config: SceneConfig = {
  params: {},
  keyframes: {
    "mo-dau": { cam: [-320,160,-300], look: [30,0,40], mood: MOOD.dawn + 0.3 },
    "nguon-coi": { ...shot([KINH[0], 0, KINH[1]], 80, 260, 140, 1), mood: MOOD.dawn + 0.5 },
    "thoi-thinh": { ...shot([DIEN[0], 0, DIEN[1]], 80, 140, 50, -1), mood: MOOD.sunset + 0.6 },
    "sa-sut": { ...shot([KINH[0], 0, KINH[1]], 70, 200, 90, 1), mood: MOOD.overcast + 0.5 },
    "ve-sau": { ...shot([DIEN[0], 0, DIEN[1]], 80, 160, 60, -1), mood: MOOD.sunset + 0.7 },
  },
};

export default config;
